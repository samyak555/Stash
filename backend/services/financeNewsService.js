import axios from 'axios';
import { parseString } from 'xml2js';

// Global cache for news (10 minutes TTL)
const newsCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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
      newsCache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      if (cached) {
        console.warn(`News fetch failed for ${key}, using stale cache`);
        return { ...cached.data, stale: true };
      }
      throw error;
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
  return {
    title: article.title || article.headline || '',
    description: article.description || article.summary || '',
    source: article.source?.name || source || 'Unknown',
    url: article.url || article.link || '',
    publishedAt: article.publishedAt || article.pubDate || new Date().toISOString(),
    imageUrl: article.urlToImage || article.image || null,
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
      return everythingResponse.data.articles.map(article => 
        normalizeArticle(article, 'NewsAPI')
      );
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
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    return new Promise((resolve, reject) => {
      parseString(response.data, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const items = result?.rss?.channel?.[0]?.item || [];
        const articles = items.map(item => ({
          title: item.title?.[0] || '',
          description: item.description?.[0] || '',
          source: item.source?.[0] || 'RSS Feed',
          url: item.link?.[0] || '',
          publishedAt: item.pubDate?.[0] || new Date().toISOString(),
          imageUrl: null,
          category: 'general',
        }));

        resolve(articles);
      });
    });
  } catch (error) {
    console.error('RSS parse failed:', error.message);
    throw error;
  }
};

/**
 * Fetch news from Google News RSS (fallback)
 */
const fetchGoogleNewsRSS = async (query = 'finance') => {
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
  const articles = await parseRSS(rssUrl);
  return articles.map(article => ({
    ...article,
    source: 'Google News',
  }));
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

  return getCachedOrFetch(cacheKey, async () => {
    let articles = [];

    // Try NewsAPI first (if key is configured)
    if (process.env.NEWS_API_KEY) {
      try {
        const query = category === 'all' ? 'finance' : category;
        articles = await fetchNewsAPI(query, 'business');
        if (articles.length > 0) {
          return articles;
        }
      } catch (error) {
        console.warn('NewsAPI failed, trying RSS fallbacks:', error.message);
      }
    }

    // Try Google News RSS
    try {
      const query = category === 'all' ? 'finance' : 
                   category === 'crypto' ? 'cryptocurrency' : 
                   category === 'stocks' ? 'stock market' : category;
      articles = await fetchGoogleNewsRSS(query);
      if (articles.length > 0) {
        return articles;
      }
    } catch (error) {
      console.warn('Google News RSS failed, trying Yahoo Finance:', error.message);
    }

    // Try Yahoo Finance RSS
    try {
      articles = await fetchYahooFinanceRSS();
      if (articles.length > 0) {
        return articles;
      }
    } catch (error) {
      console.warn('Yahoo Finance RSS failed:', error.message);
    }

    // Return empty array if all fail
    return [];
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
      all: all.status === 'fulfilled' ? all.value : [],
      stocks: stocks.status === 'fulfilled' ? stocks.value : [],
      crypto: crypto.status === 'fulfilled' ? crypto.value : [],
      economy: economy.status === 'fulfilled' ? economy.value : [],
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
    return news.slice(0, limit);
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

