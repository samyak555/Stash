import axios from 'axios';

/**
 * PRODUCTION-GRADE MARKET PRICE ENGINE
 * 
 * Centralized price fetching with:
 * - Multi-source fallback strategy
 * - Global shared cache
 * - Asset-specific TTLs
 * - Independent failure handling
 * - Yahoo Finance as PRIMARY for stocks
 */

// Global cache with asset-specific TTLs
const priceCache = new Map();
const CACHE_TTL = {
  stock: 60 * 1000,        // 60 seconds (stocks change frequently)
  crypto: 30 * 1000,       // 30 seconds (crypto very volatile)
  mf: 300 * 1000,          // 5 minutes (NAV updates daily)
  gold: 300 * 1000,        // 5 minutes (metals change slowly)
  silver: 300 * 1000,      // 5 minutes
};

// Request locks to prevent duplicate concurrent requests
const requestLocks = new Map();

// Rate limit tracking for APIs that need it
const rateLimits = {
  alphaVantage: {
    lastRequestTime: 0,
    minInterval: 12000, // 12 seconds
    isRateLimited: false,
    rateLimitUntil: 0,
  },
};

/**
 * Get cached price or fetch new
 */
const getCachedOrFetch = async (cacheKey, assetType, fetchFn) => {
  const cached = priceCache.get(cacheKey);
  const ttl = CACHE_TTL[assetType] || 60 * 1000;
  
  // Return cached if still valid
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  // Check if request is already in progress
  if (requestLocks.has(cacheKey)) {
    return requestLocks.get(cacheKey);
  }

  // Create request promise
  const requestPromise = (async () => {
    try {
      const data = await fetchFn();
      priceCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      // Return stale cache if available
      if (cached) {
        console.warn(`Price fetch failed for ${cacheKey}, using stale cache`);
        return { ...cached.data, stale: true, unavailable: true };
      }
      // If no cache, return null (will be handled by caller)
      throw error;
    } finally {
      requestLocks.delete(cacheKey);
    }
  })();

  requestLocks.set(cacheKey, requestPromise);
  return requestPromise;
};

/**
 * Check Alpha Vantage rate limit
 */
const checkAlphaVantageRateLimit = async () => {
  const now = Date.now();
  const limit = rateLimits.alphaVantage;

  if (limit.isRateLimited && now < limit.rateLimitUntil) {
    const waitTime = limit.rateLimitUntil - now;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    limit.isRateLimited = false;
  }

  const timeSinceLastRequest = now - limit.lastRequestTime;
  if (timeSinceLastRequest < limit.minInterval) {
    const waitTime = limit.minInterval - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  limit.lastRequestTime = Date.now();
};

// ============================================
// STOCKS - YAHOO FINANCE PRIMARY
// ============================================

/**
 * Fetch stock price from Yahoo Finance (PRIMARY - NO KEY REQUIRED)
 */
const fetchStockYahooFinance = async (symbol) => {
  try {
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
    const change = regularMarketPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol: meta.symbol,
      price: regularMarketPrice,
      change: change,
      changePercent: changePercent,
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
 * Fetch stock price from Alpha Vantage (OPTIONAL FALLBACK)
 */
const fetchStockAlphaVantage = async (symbol, apiKey) => {
  await checkAlphaVantageRateLimit();

  const response = await axios.get('https://www.alphavantage.co/query', {
    params: {
      function: 'GLOBAL_QUOTE',
      symbol: symbol,
      apikey: apiKey,
    },
    timeout: 10000,
  });

  if (response.data['Note']) {
    rateLimits.alphaVantage.isRateLimited = true;
    rateLimits.alphaVantage.rateLimitUntil = Date.now() + (5 * 60 * 1000);
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
 * Fetch stock price from Finnhub (OPTIONAL FALLBACK)
 */
const fetchStockFinnhub = async (symbol, apiKey) => {
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
    const currentPrice = data.c;
    const previousClose = data.pc;
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
 * Get stock price with multi-source fallback
 * PRIMARY: Yahoo Finance (always tried first)
 * FALLBACKS: Alpha Vantage, Finnhub (if keys configured)
 */
export const getStockPrice = async (symbol) => {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `stock:${normalizedSymbol}`;

  return getCachedOrFetch(cacheKey, 'stock', async () => {
    // PRIMARY: Yahoo Finance (NO KEY REQUIRED)
    try {
      return await fetchStockYahooFinance(normalizedSymbol);
    } catch (error) {
      console.warn(`Yahoo Finance failed for ${normalizedSymbol}, trying fallbacks:`, error.message);
    }

    // FALLBACK 1: Alpha Vantage (if key configured)
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (alphaVantageKey) {
      try {
        return await fetchStockAlphaVantage(normalizedSymbol, alphaVantageKey);
      } catch (error) {
        console.warn(`Alpha Vantage failed for ${normalizedSymbol}:`, error.message);
      }
    }

    // FALLBACK 2: Finnhub (if key configured)
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (finnhubKey) {
      try {
        return await fetchStockFinnhub(normalizedSymbol, finnhubKey);
      } catch (error) {
        console.warn(`Finnhub failed for ${normalizedSymbol}:`, error.message);
      }
    }

    // All sources failed - throw error (will be caught and cached value returned if available)
    throw new Error(`All stock price sources failed for ${normalizedSymbol}`);
  });
};

/**
 * Get multiple stock prices (optimized - deduplicates symbols)
 */
export const getStockPrices = async (symbols) => {
  const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase()))];
  const prices = {};

  for (const symbol of uniqueSymbols) {
    try {
      prices[symbol] = await getStockPrice(symbol);
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error.message);
      const cached = priceCache.get(`stock:${symbol}`);
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

// ============================================
// CRYPTO - COINGECKO (NO KEY REQUIRED)
// ============================================

/**
 * Get crypto price from CoinGecko
 */
export const getCryptoPrice = async (symbol) => {
  const cacheKey = `crypto:${symbol.toUpperCase()}`;

  return getCachedOrFetch(cacheKey, 'crypto', async () => {
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
  });
};

/**
 * Get multiple crypto prices
 */
export const getCryptoPrices = async (symbols) => {
  const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase()))];
  const prices = {};

  for (const symbol of uniqueSymbols) {
    try {
      prices[symbol] = await getCryptoPrice(symbol);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit protection
    } catch (error) {
      console.error(`Failed to fetch crypto price for ${symbol}:`, error.message);
      const cached = priceCache.get(`crypto:${symbol}`);
      if (cached) {
        prices[symbol] = { ...cached.data, unavailable: true };
      } else {
        prices[symbol] = null;
      }
    }
  }

  const result = {};
  symbols.forEach(symbol => {
    const upperSymbol = symbol.toUpperCase();
    result[symbol] = prices[upperSymbol] || null;
  });

  return result;
};

// ============================================
// MUTUAL FUNDS - MFAPI.IN (NO KEY REQUIRED)
// ============================================

/**
 * Get Mutual Fund NAV
 */
export const getMutualFundNAV = async (schemeCode) => {
  const cacheKey = `mf:${schemeCode}`;

  return getCachedOrFetch(cacheKey, 'mf', async () => {
    const response = await axios.get(`https://api.mfapi.in/mf/${schemeCode}`, {
      timeout: 10000,
    });

    if (!response.data || !response.data.data || response.data.data.length === 0) {
      throw new Error(`Mutual fund NAV not found for scheme code: ${schemeCode}`);
    }

    const latest = response.data.data[0];
    const nav = parseFloat(latest.nav);
    const date = latest.date;

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
      price: nav, // Alias for consistency
      change: change,
      changePercent: changePercent,
      date: date,
      lastUpdated: new Date().toISOString(),
      source: 'mfapi.in',
    };
  });
};

/**
 * Get multiple Mutual Fund NAVs
 */
export const getMutualFundNAVs = async (schemeCodes) => {
  const uniqueCodes = [...new Set(schemeCodes)];
  const navs = {};

  for (const schemeCode of uniqueCodes) {
    try {
      navs[schemeCode] = await getMutualFundNAV(schemeCode);
      await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit protection
    } catch (error) {
      console.error(`Failed to fetch NAV for ${schemeCode}:`, error.message);
      const cached = priceCache.get(`mf:${schemeCode}`);
      if (cached) {
        navs[schemeCode] = { ...cached.data, unavailable: true };
      } else {
        navs[schemeCode] = null;
      }
    }
  }

  const result = {};
  schemeCodes.forEach(code => {
    result[code] = navs[code] || null;
  });

  return result;
};

// ============================================
// METALS - METALS.LIVE (NO KEY REQUIRED)
// ============================================

/**
 * Get metal price (gold or silver)
 */
export const getMetalPrice = async (metal) => {
  const cacheKey = `metal:${metal.toLowerCase()}`;
  const assetType = metal.toLowerCase() === 'gold' ? 'gold' : 'silver';

  return getCachedOrFetch(cacheKey, assetType, async () => {
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
    const goldCached = priceCache.get('metal:gold');
    const silverCached = priceCache.get('metal:silver');
    return {
      gold: goldCached ? { ...goldCached.data, unavailable: true } : { symbol: 'GOLD', price: 2000, unavailable: true, source: 'fallback' },
      silver: silverCached ? { ...silverCached.data, unavailable: true } : { symbol: 'SILVER', price: 25, unavailable: true, source: 'fallback' },
    };
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear price cache
 */
export const clearPriceCache = () => {
  priceCache.clear();
  requestLocks.clear();
};

/**
 * Get cache stats (for debugging)
 */
export const getCacheStats = () => {
  return {
    size: priceCache.size,
    entries: Array.from(priceCache.keys()),
  };
};

