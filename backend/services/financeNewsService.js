/**
 * STASH NEWS SERVICE
 * 
 * FORCED TO USE GOOGLE NEWS RSS ONLY
 * Fail-safe implementation with caching
 */

import axios from 'axios';
import { parseString } from 'xml2js';

// Global cache for news (5 minutes TTL)
const newsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Request locks to prevent duplicate fetches
const requestLocks = new Map();

/**
 * Fetch Google News RSS - FORCED PRIMARY SOURCE
 * Improved parsing for Google News format
 */
const fetchGoogleNewsRSS = async () => {
  const rssUrl = 'https://news.google.com/rss/search?q=finance+india&hl=en-IN&gl=IN&ceid=IN:en';
  
  try {
    console.log('[STASH NEWS] Fetching from Google News RSS...');
    const response = await axios.get(rssUrl, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.data) {
      throw new Error('Empty RSS response');
    }

    console.log('[STASH NEWS] RSS response received, parsing...');

    return new Promise((resolve, reject) => {
      parseString(response.data, { 
        explicitArray: false,
        mergeAttrs: true,
        trim: true,
        ignoreAttrs: false,
      }, (err, result) => {
        if (err) {
          console.error('[STASH NEWS] RSS parsing error:', err.message);
          reject(err);
          return;
        }

        // Extract items from RSS - Google News format
        let items = [];
        
        // Try different possible structures
        if (result?.rss?.channel?.item) {
          items = Array.isArray(result.rss.channel.item) 
            ? result.rss.channel.item 
            : [result.rss.channel.item];
        } else if (result?.feed?.entry) {
          // Atom feed format
          items = Array.isArray(result.feed.entry)
            ? result.feed.entry
            : [result.feed.entry];
        }

        console.log(`[STASH NEWS] Found ${items.length} items in RSS`);

        // Transform to our format
        const articles = items
          .map((item, index) => {
            try {
              // Extract title - handle various formats
              let title = '';
              if (item.title) {
                if (typeof item.title === 'string') {
                  title = item.title;
                } else if (item.title._) {
                  title = item.title._;
                } else if (Array.isArray(item.title) && item.title[0]) {
                  title = typeof item.title[0] === 'string' ? item.title[0] : item.title[0]._ || '';
                }
              }
              
              // Extract link - Google News uses different structure
              let link = '';
              if (item.link) {
                if (typeof item.link === 'string') {
                  link = item.link;
                } else if (item.link.href) {
                  link = item.link.href;
                } else if (item.link._) {
                  link = item.link._;
                } else if (Array.isArray(item.link) && item.link[0]) {
                  const firstLink = item.link[0];
                  link = typeof firstLink === 'string' ? firstLink : firstLink.href || firstLink._ || '';
                }
              }
              
              // If no direct link, try to construct from Google News URL
              if (!link && item.guid) {
                const guid = typeof item.guid === 'string' ? item.guid : (item.guid._ || item.guid['#'] || '');
                if (guid.includes('articles')) {
                  link = guid;
                }
              }
              
              // Extract pubDate
              let pubDate = '';
              if (item.pubDate) {
                pubDate = typeof item.pubDate === 'string' ? item.pubDate : (item.pubDate._ || item.pubDate['#'] || '');
              } else if (item.published) {
                pubDate = typeof item.published === 'string' ? item.published : (item.published._ || item.published['#'] || '');
              }
              
              // Extract source
              let source = 'Google News';
              if (item.source) {
                source = typeof item.source === 'string' ? item.source : (item.source.name || item.source._ || 'Google News');
              }
              
              // Validate required fields
              const validTitle = title.trim();
              const validLink = link.trim();
              
              if (!validTitle || validTitle.length < 5) {
                return null; // Invalid article
              }
              
              // If no valid link, try to create one from title (Google News pattern)
              let finalLink = validLink;
              if (!finalLink || finalLink.length < 10) {
                // Google News articles can be accessed via search
                finalLink = `https://news.google.com/rss/search?q=${encodeURIComponent(validTitle)}&hl=en-IN&gl=IN&ceid=IN:en`;
              }
              
              // Parse date
              let publishedAt = new Date().toISOString();
              if (pubDate && pubDate.length > 0) {
                try {
                  const date = new Date(pubDate);
                  if (!isNaN(date.getTime())) {
                    publishedAt = date.toISOString();
                  }
                } catch {
                  // Use current date if invalid
                }
              }
              
              return {
                title: validTitle,
                link: finalLink,
                publishedAt: publishedAt,
                source: source,
              };
            } catch (itemError) {
              console.error(`[STASH NEWS] Error processing item ${index}:`, itemError.message);
              return null;
            }
          })
          .filter(article => article !== null); // Filter out invalid articles

        // Sort articles by publishedAt (most recent first)
        articles.sort((a, b) => {
          const dateA = new Date(a.publishedAt);
          const dateB = new Date(b.publishedAt);
          return dateB - dateA; // Descending order (newest first)
        });
        
        console.log(`[STASH NEWS] Successfully parsed ${articles.length} articles from Google News RSS (sorted by time)`);
        
        if (articles.length === 0) {
          console.warn('[STASH NEWS] No valid articles found after parsing');
        }
        
        resolve(articles);
      });
    });
  } catch (error) {
    console.error('[STASH NEWS] RSS fetch failed:', error.message);
    if (error.response) {
      console.error('[STASH NEWS] Response status:', error.response.status);
      console.error('[STASH NEWS] Response data:', error.response.data?.substring(0, 200));
    }
    throw error;
  }
};

/**
 * Get cached news or fetch new
 */
const getCachedOrFetch = async (key, fetchFn) => {
  const cached = newsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[STASH NEWS] Returning cached data (${cached.data.length} articles)`);
    return cached.data;
  }

  if (requestLocks.has(key)) {
    console.log('[STASH NEWS] Request already in progress, waiting...');
    return requestLocks.get(key);
  }

  const requestPromise = (async () => {
    try {
      const data = await fetchFn();
      // Ensure it's an array
      const validData = Array.isArray(data) 
        ? data.filter(article => article && article.title && article.link && article.title.length > 5)
        : [];
      
      // Sort by publishedAt (most recent first)
      validData.sort((a, b) => {
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        return dateB - dateA; // Descending order (newest first)
      });
      
      newsCache.set(key, { data: validData, timestamp: Date.now() });
      console.log(`[STASH NEWS] Cached ${validData.length} articles (sorted by time)`);
      return validData;
    } catch (error) {
      console.error(`[STASH NEWS] Fetch failed for ${key}:`, error.message);
      
      // Return cached data if available
      if (cached) {
        console.log(`[STASH NEWS] Using stale cache (${cached.data.length} articles)`);
        return cached.data;
      }
      
      // Return empty array instead of throwing
      console.warn(`[STASH NEWS] No cache available, returning empty array`);
      return [];
    } finally {
      requestLocks.delete(key);
    }
  })();

  requestLocks.set(key, requestPromise);
  return requestPromise;
};

/**
 * Get finance news - FORCED TO GOOGLE NEWS RSS
 */
export const getFinanceNews = async (category = 'all') => {
  const cacheKey = 'stash_news_all';
  
  return await getCachedOrFetch(cacheKey, async () => {
    // FORCE Google News RSS only
    const articles = await fetchGoogleNewsRSS();
    return articles;
  });
};

/**
 * Get categorized news (simplified - all from same source)
 */
export const getCategorizedNews = async () => {
  const cacheKey = 'stash_news_categorized';
  
  return await getCachedOrFetch(cacheKey, async () => {
    const articles = await fetchGoogleNewsRSS();
    
    // Return same articles for all categories (simplified)
    return {
      all: articles,
      stocks: articles.slice(0, 10), // First 10 for stocks
      crypto: articles.slice(0, 10), // First 10 for crypto
      economy: articles.slice(0, 10), // First 10 for economy
    };
  });
};

/**
 * Get top headlines
 */
export const getTopHeadlines = async (limit = 5) => {
  const cacheKey = 'stash_news_headlines';
  
  return await getCachedOrFetch(cacheKey, async () => {
    const articles = await fetchGoogleNewsRSS();
    return articles.slice(0, limit);
  });
};
