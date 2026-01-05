import axios from 'axios';

// Global in-memory cache for market data (5 minutes TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Request locks to prevent duplicate concurrent requests for the same symbol
const requestLocks = new Map();

// Alpha Vantage rate limit tracking
const alphaVantageRateLimit = {
  lastRequestTime: 0,
  minInterval: 12000, // 12 seconds between requests (5 requests per minute = 12s interval)
  isRateLimited: false,
  rateLimitUntil: 0,
};

/**
 * Get cached data or fetch new data with request deduplication
 */
const getCachedOrFetch = async (key, fetchFn) => {
  // Check cache first
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Check if there's already a pending request for this key
  if (requestLocks.has(key)) {
    // Wait for the existing request to complete
    return requestLocks.get(key);
  }

  // Create a promise for this request
  const requestPromise = (async () => {
    try {
      const data = await fetchFn();
      cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      // Return stale cache if available, even if expired
      if (cached) {
        console.warn(`Market data fetch failed for ${key}, using stale cache`);
        return { ...cached.data, stale: true };
      }
      throw error;
    } finally {
      // Remove lock after request completes
      requestLocks.delete(key);
    }
  })();

  // Store the promise as a lock
  requestLocks.set(key, requestPromise);
  return requestPromise;
};

/**
 * Check and enforce Alpha Vantage rate limit
 */
const checkAlphaVantageRateLimit = async () => {
  const now = Date.now();

  // If we're currently rate limited, wait until the limit expires
  if (alphaVantageRateLimit.isRateLimited) {
    if (now < alphaVantageRateLimit.rateLimitUntil) {
      const waitTime = alphaVantageRateLimit.rateLimitUntil - now;
      console.warn(`Alpha Vantage rate limited. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      alphaVantageRateLimit.isRateLimited = false;
    } else {
      alphaVantageRateLimit.isRateLimited = false;
    }
  }

  // Enforce minimum interval between requests
  const timeSinceLastRequest = now - alphaVantageRateLimit.lastRequestTime;
  if (timeSinceLastRequest < alphaVantageRateLimit.minInterval) {
    const waitTime = alphaVantageRateLimit.minInterval - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  alphaVantageRateLimit.lastRequestTime = Date.now();
};

/**
 * Fetch stock price from Alpha Vantage (primary)
 */
const fetchStockPriceAlphaVantage = async (symbol, apiKey) => {
  await checkAlphaVantageRateLimit();

  const response = await axios.get('https://www.alphavantage.co/query', {
    params: {
      function: 'GLOBAL_QUOTE',
      symbol: symbol,
      apikey: apiKey,
    },
    timeout: 10000,
  });

  // Check for rate limit error
  if (response.data['Note']) {
    console.warn(`Alpha Vantage rate limit hit for ${symbol}`);
    alphaVantageRateLimit.isRateLimited = true;
    alphaVantageRateLimit.rateLimitUntil = Date.now() + (5 * 60 * 1000); // 5 minutes
    throw new Error('API call frequency limit reached');
  }

  if (response.data['Error Message']) {
    throw new Error(response.data['Error Message']);
  }

  const quote = response.data['Global Quote'];
  if (!quote || !quote['05. price']) {
    throw new Error(`No price data found for symbol: ${symbol}`);
  }

  return {
    symbol: quote['01. symbol'],
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change'] || 0),
    changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || 0),
    volume: parseInt(quote['06. volume'] || 0),
    lastUpdated: new Date().toISOString(),
    source: 'alphavantage',
  };
};

/**
 * Fetch stock price from Yahoo Finance (free fallback - no API key needed)
 */
const fetchStockPriceYahoo = async (symbol) => {
  try {
    // Yahoo Finance API (free, no key required)
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      params: {
        interval: '1d',
        range: '1d',
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.data || !response.data.chart || !response.data.chart.result || response.data.chart.result.length === 0) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const result = response.data.chart.result[0];
    const meta = result.meta;
    const regularMarketPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose || regularMarketPrice;

    return {
      symbol: meta.symbol,
      price: regularMarketPrice,
      change: regularMarketPrice - previousClose,
      changePercent: previousClose > 0 ? ((regularMarketPrice - previousClose) / previousClose) * 100 : 0,
      volume: meta.regularMarketVolume || 0,
      lastUpdated: new Date().toISOString(),
      source: 'yahoo',
    };
  } catch (error) {
    console.error(`Yahoo Finance fetch failed for ${symbol}:`, error.message);
    throw error;
  }
};

/**
 * Fetch stock price from Finnhub (free tier - requires API key)
 */
const fetchStockPriceFinnhub = async (symbol, apiKey) => {
  try {
    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol: symbol,
        token: apiKey,
      },
      timeout: 10000,
    });

    if (!response.data || response.data.c === 0) {
      throw new Error(`No price data found for symbol: ${symbol}`);
    }

    const data = response.data;
    const currentPrice = data.c; // current price
    const previousClose = data.pc; // previous close
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol: symbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: data.v || 0,
      lastUpdated: new Date().toISOString(),
      source: 'finnhub',
    };
  } catch (error) {
    console.error(`Finnhub fetch failed for ${symbol}:`, error.message);
    throw error;
  }
};

/**
 * Stock market data using multiple free APIs with fallback
 */
export const getStockPrice = async (symbol) => {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `stock:${normalizedSymbol}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    const finnhubKey = process.env.FINNHUB_API_KEY;

    // Try Alpha Vantage first (if key is configured)
    if (alphaVantageKey) {
      try {
        return await fetchStockPriceAlphaVantage(normalizedSymbol, alphaVantageKey);
      } catch (error) {
        console.warn(`Alpha Vantage failed for ${normalizedSymbol}, trying fallback:`, error.message);
        // Continue to fallback
      }
    }

    // Try Finnhub (if key is configured)
    if (finnhubKey) {
      try {
        return await fetchStockPriceFinnhub(normalizedSymbol, finnhubKey);
      } catch (error) {
        console.warn(`Finnhub failed for ${normalizedSymbol}, trying fallback:`, error.message);
        // Continue to fallback
      }
    }

    // Try Yahoo Finance (free, no key required)
    try {
      return await fetchStockPriceYahoo(normalizedSymbol);
    } catch (error) {
      console.error(`All stock price APIs failed for ${normalizedSymbol}:`, error.message);
      
      // Return cached value if available
      const cached = cache.get(cacheKey);
      if (cached) {
        console.warn(`Using cached price for ${normalizedSymbol} due to all API failures`);
        return { ...cached.data, stale: true, unavailable: true, note: 'All APIs unavailable' };
      }
      
      throw new Error(`Unable to fetch stock price for ${normalizedSymbol}. All APIs failed.`);
    }
  });
};

/**
 * Get multiple stock prices (optimized - fetches unique symbols only)
 */
export const getStockPrices = async (symbols) => {
  // Deduplicate symbols
  const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase()))];
  
  const prices = {};
  for (const symbol of uniqueSymbols) {
    try {
      prices[symbol] = await getStockPrice(symbol);
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error.message);
      // Return cached value if available
      const cached = cache.get(`stock:${symbol}`);
      if (cached) {
        prices[symbol] = { ...cached.data, unavailable: true };
      } else {
        prices[symbol] = null;
      }
    }
  }
  
  // Map back to original symbol array (case-insensitive)
  const result = {};
  symbols.forEach(symbol => {
    const upperSymbol = symbol.toUpperCase();
    result[symbol] = prices[upperSymbol] || null;
  });
  
  return result;
};

/**
 * Crypto market data using CoinGecko API (free, no key required)
 */
export const getCryptoPrice = async (symbol) => {
  const cacheKey = `crypto:${symbol.toUpperCase()}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      // CoinGecko uses coin IDs, but we'll support common symbols
      const symbolMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDT': 'tether',
        'BNB': 'binancecoin',
        'SOL': 'solana',
        'XRP': 'ripple',
        'ADA': 'cardano',
        'DOGE': 'dogecoin',
        'DOT': 'polkadot',
        'MATIC': 'matic-network',
        'AVAX': 'avalanche-2',
        'LINK': 'chainlink',
        'UNI': 'uniswap',
        'ATOM': 'cosmos',
        'LTC': 'litecoin',
      };

      const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
      
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
          include_24hr_change: true,
        },
        timeout: 10000,
      });

      if (!response.data[coinId]) {
        throw new Error(`Cryptocurrency not found: ${symbol}`);
      }

      const data = response.data[coinId];
      return {
        symbol: symbol.toUpperCase(),
        price: data.usd,
        change: data.usd_24h_change || 0,
        changePercent: data.usd_24h_change || 0,
        lastUpdated: new Date().toISOString(),
        source: 'coingecko',
      };
    } catch (error) {
      console.error(`Error fetching crypto price for ${symbol}:`, error.message);
      
      // Return cached value if available
      const cached = cache.get(cacheKey);
      if (cached) {
        console.warn(`Using cached price for ${symbol} due to error`);
        return { ...cached.data, stale: true, unavailable: true, note: error.message };
      }
      
      throw error;
    }
  });
};

/**
 * Get multiple crypto prices (optimized - fetches unique symbols only)
 */
export const getCryptoPrices = async (symbols) => {
  // Deduplicate symbols
  const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase()))];
  
  const prices = {};
  for (const symbol of uniqueSymbols) {
    try {
      prices[symbol] = await getCryptoPrice(symbol);
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error.message);
      // Return cached value if available
      const cached = cache.get(`crypto:${symbol}`);
      if (cached) {
        prices[symbol] = { ...cached.data, unavailable: true };
      } else {
        prices[symbol] = null;
      }
    }
  }
  
  // Map back to original symbol array
  const result = {};
  symbols.forEach(symbol => {
    const upperSymbol = symbol.toUpperCase();
    result[symbol] = prices[upperSymbol] || null;
  });
  
  return result;
};

/**
 * Gold and Silver prices using metals.live API (free, no key required)
 */
export const getMetalPrice = async (metal) => {
  const cacheKey = `metal:${metal.toLowerCase()}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      // metals.live API endpoint
      const response = await axios.get('https://api.metals.live/v1/spot', {
        timeout: 10000,
      });

      if (!response.data || !response.data[metal.toLowerCase()]) {
        throw new Error(`Metal price not found: ${metal}`);
      }

      const data = response.data[metal.toLowerCase()];
      return {
        symbol: metal.toUpperCase(),
        price: parseFloat(data),
        lastUpdated: new Date().toISOString(),
        source: 'metals.live',
      };
    } catch (error) {
      console.error(`Error fetching metal price for ${metal}:`, error.message);
      
      // Return cached value if available
      const cached = cache.get(cacheKey);
      if (cached) {
        console.warn(`Using cached price for ${metal} due to error`);
        return { ...cached.data, stale: true, unavailable: true, note: error.message };
      }
      
      // Fallback: use approximate prices if API fails and no cache
      const fallbackPrices = {
        gold: 2000, // Approximate USD per ounce
        silver: 25, // Approximate USD per ounce
      };
      return {
        symbol: metal.toUpperCase(),
        price: fallbackPrices[metal.toLowerCase()] || 0,
        lastUpdated: new Date().toISOString(),
        note: 'Using fallback price - API unavailable',
        unavailable: true,
        source: 'fallback',
      };
    }
  });
};

/**
 * Get gold and silver prices
 */
export const getMetalPrices = async () => {
  try {
    const [gold, silver] = await Promise.all([
      getMetalPrice('gold'),
      getMetalPrice('silver'),
    ]);
    return { gold, silver };
  } catch (error) {
    console.error('Error fetching metal prices:', error.message);
    // Return cached values if available
    const goldCached = cache.get('metal:gold');
    const silverCached = cache.get('metal:silver');
    return {
      gold: goldCached ? { ...goldCached.data, unavailable: true } : { symbol: 'GOLD', price: 2000, unavailable: true, source: 'fallback' },
      silver: silverCached ? { ...silverCached.data, unavailable: true } : { symbol: 'SILVER', price: 25, unavailable: true, source: 'fallback' },
    };
  }
};

/**
 * Mutual Fund NAV using mfapi.in (free, no key required)
 */
export const getMutualFundNAV = async (schemeCode) => {
  const cacheKey = `mf:${schemeCode}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      const response = await axios.get(`https://api.mfapi.in/mf/${schemeCode}`, {
        timeout: 10000,
      });

      if (!response.data || !response.data.data || response.data.data.length === 0) {
        throw new Error(`Mutual fund NAV not found for scheme code: ${schemeCode}`);
      }

      // Get latest NAV (first entry in data array)
      const latest = response.data.data[0];
      const nav = parseFloat(latest.nav);
      const date = latest.date;

      // Calculate change if previous day data exists
      let change = 0;
      let changePercent = 0;
      if (response.data.data.length > 1) {
        const previous = response.data.data[1];
        const previousNav = parseFloat(previous.nav);
        change = nav - previousNav;
        changePercent = previousNav > 0 ? ((change / previousNav) * 100) : 0;
      }

      return {
        schemeCode: schemeCode,
        nav: nav,
        change: change,
        changePercent: changePercent,
        date: date,
        lastUpdated: new Date().toISOString(),
        source: 'mfapi.in',
      };
    } catch (error) {
      console.error(`Error fetching MF NAV for ${schemeCode}:`, error.message);
      
      // Return cached value if available
      const cached = cache.get(cacheKey);
      if (cached) {
        console.warn(`Using cached NAV for ${schemeCode} due to error`);
        return { ...cached.data, stale: true, unavailable: true, note: error.message };
      }
      
      throw error;
    }
  });
};

/**
 * Get multiple mutual fund NAVs (optimized - fetches unique scheme codes only)
 */
export const getMutualFundNAVs = async (schemeCodes) => {
  // Deduplicate scheme codes
  const uniqueCodes = [...new Set(schemeCodes)];
  
  const navs = {};
  for (const schemeCode of uniqueCodes) {
    try {
      navs[schemeCode] = await getMutualFundNAV(schemeCode);
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to fetch NAV for ${schemeCode}:`, error.message);
      // Return cached value if available
      const cached = cache.get(`mf:${schemeCode}`);
      if (cached) {
        navs[schemeCode] = { ...cached.data, unavailable: true };
      } else {
        navs[schemeCode] = null;
      }
    }
  }
  
  // Map back to original array
  const result = {};
  schemeCodes.forEach(code => {
    result[code] = navs[code] || null;
  });
  
  return result;
};

/**
 * Clear cache (useful for testing or manual refresh)
 */
export const clearCache = () => {
  cache.clear();
  requestLocks.clear();
};
