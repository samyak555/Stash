import axios from 'axios';
import { parseString } from 'xml2js';

// Global cache for news (5-10 minutes TTL)
const newsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (as per requirements)

// Request locks to prevent duplicate fetches
const requestLocks = new Map();

/**
 * Get cached news or fetch new
 */
const getCachedOrFetch = async (key, fetchFn) => {
  const cached = newsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  if (requestLocks.has(key)) {
    return requestLocks.get(key);
  }

  const requestPromise = (async () => {
    try {
      const data = await fetchFn();
      // Filter out invalid articles before caching
      const validData = Array.isArray(data) 
        ? data.filter(article => article && article.title && article.url && article.title.length > 5)
        : data;
      newsCache.set(key, { data: validData, timestamp: Date.now() });
      return validData;
    } catch (error) {
      if (cached) {
        console.warn(`News fetch failed for ${key}, using stale cache`);
        return cached.data; // Return cached data directly (already filtered)
      }
      // Return empty array instead of throwing
      console.error(`News fetch failed for ${key} and no cache available:`, error.message);
      return [];
    } finally {
      requestLocks.delete(key);
    }
  })();

  requestLocks.set(key, requestPromise);
  return requestPromise;
};

/**
 * Normalize news article format
 */
const normalizeArticle = (article, source) => {
  // Extract title - must exist and be valid
  const title = (article.title || article.headline || '').trim();
  if (!title || title.length < 5) {
    return null; // Invalid article - no title
  }

  // Extract URL - must exist
  const url = article.url || article.link || '';
  if (!url || url.length < 10) {
    return null; // Invalid article - no URL
  }

  // Extract source name
  let sourceName = 'Unknown';
  if (article.source?.name) {
    sourceName = article.source.name;
  } else if (typeof article.source === 'string') {
    sourceName = article.source;
  } else if (source) {
    sourceName = source;
  }

  // Parse published date - must be valid
  let publishedAt = new Date().toISOString();
  const dateStr = article.publishedAt || article.pubDate;
  if (dateStr) {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        publishedAt = date.toISOString();
      }
    } catch {
      // Use current date if invalid
    }
  }

  return {
    title: title,
    description: (article.description || article.summary || '').trim(),
    source: sourceName,
    url: url,
    publishedAt: publishedAt,
    imageUrl: null, // Don't show images per requirements
    category: article.category || 'general',
  };
};

/**
 * Fetch news from NewsAPI (primary)
 */
const fetchNewsAPI = async (query = 'finance', category = 'business') => {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    throw new Error('NewsAPI key not configured');
  }

  try {
    // Try top headlines first
    const headlinesResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'business',
        country: 'in',
        apiKey: apiKey,
        pageSize: 20,
      },
      timeout: 10000,
    });

    if (headlinesResponse.data && headlinesResponse.data.articles) {
      return headlinesResponse.data.articles.map(article => 
        normalizeArticle(article, 'NewsAPI')
      );
    }

    // Fallback to everything endpoint
    const everythingResponse = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey: apiKey,
      },
      timeout: 10000,
    });

    if (everythingResponse.data && everythingResponse.data.articles) {
      const normalized = everythingResponse.data.articles
        .map(article => normalizeArticle(article, 'NewsAPI'))
        .filter(article => article !== null); // Filter out invalid articles
      return normalized;
    }

    return [];
  } catch (error) {
    console.error('NewsAPI fetch failed:', error.message);
    throw error;
  }
};

/**
 * Parse RSS feed
 */
const parseRSS = async (rssUrl) => {
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

        // Handle different RSS formats
        let items = [];
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

        const articles = items
          .map(item => {
            // Handle both RSS and Atom formats
            const title = item.title?.[0] || item.title?._ || item.title || '';
            const description = item.description?.[0] || item.description?._ || item.description || item.summary?.[0] || item.summary || '';
            const link = item.link?.[0] || item.link?._ || item.link || item.link?.href || '';
            const pubDate = item.pubDate?.[0] || item.pubDate || item.published?.[0] || item.published || new Date().toISOString();
            
            // Validate title and URL
            const validTitle = typeof title === 'string' ? title.trim() : '';
            const validUrl = typeof link === 'string' ? link.trim() : '';
            
            if (!validTitle || validTitle.length < 5 || !validUrl || validUrl.length < 10) {
              return null; // Invalid article
            }
            
            // Parse date
            let publishedAt = new Date().toISOString();
            if (typeof pubDate === 'string') {
              try {
                const date = new Date(pubDate);
                if (!isNaN(date.getTime())) {
                  publishedAt = date.toISOString();
                }
              } catch {
                // Use current date
              }
            }
            
            return {
              title: validTitle,
              description: typeof description === 'string' ? description.trim() : '',
              source: item.source?.[0] || item.source || 'RSS Feed',
              url: validUrl,
              publishedAt: publishedAt,
              imageUrl: null,
              category: 'general',
            };
          })
          .filter(article => article !== null); // Filter out invalid articles

        resolve(articles);
      });
    });
  } catch (error) {
    console.error('RSS fetch/parse failed:', error.message);
    throw error;
  }
};

/**
 * Fetch news from Google News RSS (fallback)
 */
const fetchGoogleNewsRSS = async (query = 'finance') => {
  try {
    // Use a more reliable Google News RSS URL
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+india&hl=en&gl=IN&ceid=IN:en`;
    const articles = await parseRSS(rssUrl);
    const validArticles = articles
      .filter(article => article && article.title && article.url && article.title.length > 5)
      .map(article => ({
        ...article,
        source: article.source || 'Google News',
      }));
    return validArticles;
  } catch (error) {
    console.error('Google News RSS error:', error.message);
    // Try alternative RSS source
    return await fetchAlternativeRSS(query);
  }
};

/**
 * Alternative RSS source (Yahoo Finance as backup)
 */
const fetchAlternativeRSS = async (query = 'finance') => {
  try {
    const rssUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?region=IN&lang=en-US`;
    const articles = await parseRSS(rssUrl);
    return articles
      .filter(article => article && article.title && article.url && article.title.length > 5)
      .map(article => ({
        ...article,
        source: 'Yahoo Finance',
      }));
  } catch (error) {
    console.error('Alternative RSS error:', error.message);
    return [];
  }
};

/**
 * Fetch news from Yahoo Finance RSS (fallback)
 */
const fetchYahooFinanceRSS = async () => {
  const rssUrl = 'https://feeds.finance.yahoo.com/rss/2.0/headline';
  const articles = await parseRSS(rssUrl);
  return articles.map(article => ({
    ...article,
    source: 'Yahoo Finance',
    category: 'markets',
  }));
};

/**
 * Main news fetching function with fallbacks
 */
export const getFinanceNews = async (category = 'all') => {
  const cacheKey = `news:${category}`;

  return await getCachedOrFetch(cacheKey, async () => {
    let articles = [];

    // Try NewsAPI first (if key is configured)
    if (process.env.NEWS_API_KEY) {
      try {
        const query = category === 'all' ? 'finance' : category;
        articles = await fetchNewsAPI(query, 'business');
        if (articles && articles.length > 0) {
          const valid = articles.filter(a => a && a.title && a.url);
          if (valid.length > 0) {
            return valid;
          }
        }
      } catch (error) {
        console.warn('NewsAPI failed, trying RSS fallbacks:', error.message);
      }
    }

    // Try Google News RSS (always available, no key)
    try {
      const query = category === 'all' ? 'finance' : 
                   category === 'crypto' ? 'cryptocurrency' : 
                   category === 'stocks' ? 'stock market' : category;
      articles = await fetchGoogleNewsRSS(query);
      if (articles && articles.length > 0) {
        // Filter out invalid articles
        const validArticles = articles.filter(a => a && a.title && a.url && a.title.length > 5);
        if (validArticles.length > 0) {
          return validArticles;
        }
      }
    } catch (error) {
      console.warn('Google News RSS failed, trying Yahoo Finance:', error.message);
    }

    // Try Yahoo Finance RSS (always available, no key)
    try {
      articles = await fetchYahooFinanceRSS();
      if (articles && articles.length > 0) {
        // Filter out invalid articles
        const validArticles = articles.filter(a => a && a.title && a.url && a.title.length > 5);
        if (validArticles.length > 0) {
          return validArticles;
        }
      }
    } catch (error) {
      console.warn('Yahoo Finance RSS failed:', error.message);
    }

    // If all fail but we have cached data, return it
    const cached = newsCache.get(cacheKey);
    if (cached) {
      console.warn(`All news sources failed for category: ${category}, using stale cache`);
      return cached.data;
    }

    // Return empty array if all fail and no cache
    console.warn(`All news sources failed for category: ${category}, no cache available`);
    return [];
  });
};

/**
 * Sort articles by latest first
 */
const sortByLatest = (articles) => {
  return articles.sort((a, b) => {
    const dateA = new Date(a.publishedAt);
    const dateB = new Date(b.publishedAt);
    return dateB - dateA; // Latest first
  });
};

/**
 * Get categorized news
 */
export const getCategorizedNews = async () => {
  try {
    const [all, stocks, crypto, economy] = await Promise.allSettled([
      getFinanceNews('all'),
      getFinanceNews('stocks'),
      getFinanceNews('crypto'),
      getFinanceNews('economy'),
    ]);

    return {
      all: all.status === 'fulfilled' ? sortByLatest([...all.value]) : [],
      stocks: stocks.status === 'fulfilled' ? sortByLatest([...stocks.value]) : [],
      crypto: crypto.status === 'fulfilled' ? sortByLatest([...crypto.value]) : [],
      economy: economy.status === 'fulfilled' ? sortByLatest([...economy.value]) : [],
    };
  } catch (error) {
    console.error('Error fetching categorized news:', error);
    return {
      all: [],
      stocks: [],
      crypto: [],
      economy: [],
    };
  }
};

/**
 * Get top headlines (for dashboard)
 */
export const getTopHeadlines = async (limit = 5) => {
  try {
    const news = await getFinanceNews('all');
    const sorted = sortByLatest([...news]);
    return sorted.slice(0, limit);
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    return [];
  }
};

/**
 * Clear news cache
 */
export const clearNewsCache = () => {
  newsCache.clear();
  requestLocks.clear();
};

