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
 */
const fetchGoogleNewsRSS = async () => {
  const rssUrl = 'https://news.google.com/rss/search?q=finance&hl=en-IN&gl=IN&ceid=IN:en';
  
  try {
    const response = await axios.get(rssUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.data) {
      throw new Error('Empty RSS response');
    }

    return new Promise((resolve, reject) => {
      parseString(response.data, { 
        explicitArray: false,
        mergeAttrs: true,
        trim: true,
      }, (err, result) => {
        if (err) {
          console.error('RSS parsing error:', err.message);
          reject(err);
          return;
        }

        // Extract items from RSS
        let items = [];
        if (result?.rss?.channel?.item) {
          items = Array.isArray(result.rss.channel.item) 
            ? result.rss.channel.item 
            : [result.rss.channel.item];
        }

        // Transform to our format
        const articles = items
          .map(item => {
            // Extract title - handle various formats
            const title = item.title?.[0] || item.title?._ || item.title || '';
            const link = item.link?.[0] || item.link?._ || item.link || '';
            const pubDate = item.pubDate?.[0] || item.pubDate || item.published?.[0] || item.published || '';
            const source = item.source?.[0] || item.source || 'Google News';
            
            // Validate required fields
            const validTitle = typeof title === 'string' ? title.trim() : '';
            const validLink = typeof link === 'string' ? link.trim() : '';
            
            if (!validTitle || validTitle.length < 5 || !validLink || validLink.length < 10) {
              return null; // Invalid article
            }
            
            // Parse date
            let publishedAt = new Date().toISOString();
            if (typeof pubDate === 'string' && pubDate.length > 0) {
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
              link: validLink,
              publishedAt: publishedAt,
              source: typeof source === 'string' ? source : 'Google News',
            };
          })
          .filter(article => article !== null); // Filter out invalid articles

        // TEMP DEBUG LOG
        console.log(`[STASH NEWS] Fetched ${articles.length} articles from Google News RSS`);
        
        resolve(articles);
      });
    });
  } catch (error) {
    console.error('[STASH NEWS] RSS fetch failed:', error.message);
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
      
      newsCache.set(key, { data: validData, timestamp: Date.now() });
      console.log(`[STASH NEWS] Cached ${validData.length} articles`);
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
