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

// Global cache with asset-specific TTLs (15 seconds for live data)
const priceCache = new Map();
const CACHE_TTL = {
  stock: 15 * 1000,        // 15 seconds (LIVE market data)
  crypto: 15 * 1000,       // 15 seconds (LIVE crypto data)
  mf: 24 * 60 * 60 * 1000, // 24 hours (NAV updates daily)
  gold: 15 * 1000,         // 15 seconds (LIVE spot price)
  silver: 15 * 1000,       // 15 seconds (LIVE spot price)
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
 * Returns comprehensive market data including fundamentals
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
      name: meta.longName || meta.shortName || symbol,
      price: regularMarketPrice,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || 0,
      open: meta.regularMarketOpen || regularMarketPrice,
      high: meta.regularMarketDayHigh || regularMarketPrice,
      low: meta.regularMarketDayLow || regularMarketPrice,
      previousClose: previousClose,
      marketCap: meta.marketCap || null,
      peRatio: meta.trailingPE || null,
      eps: meta.trailingEPS || null,
      currency: meta.currency || 'USD',
      exchange: meta.exchangeName || '',
      lastUpdated: new Date().toISOString(),
      source: 'yahoo',
    };
  } catch (error) {
    console.error(`Yahoo Finance fetch failed for ${symbol}:`, error.message);
    throw error;
  }
};

/**
 * Fetch stock chart data from Yahoo Finance for different time ranges
 */
export const getStockChartData = async (symbol, range = '1d') => {
  const cacheKey = `chart:${symbol.toUpperCase()}:${range}`;
  const ttl = 15 * 1000; // 15 seconds for chart data

  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  try {
    const intervalMap = {
      '1d': '5m',
      '5d': '15m',
      '1mo': '1h',
      '3mo': '1d',
      '6mo': '1d',
      '1y': '1d',
      '5y': '1wk',
    };

    const interval = intervalMap[range] || '1d';

    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}`, {
      params: {
        interval: interval,
        range: range,
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.data || !response.data.chart || !response.data.chart.result || response.data.chart.result.length === 0) {
      throw new Error(`No chart data found for symbol: ${symbol}`);
    }

    const result = response.data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const closes = quotes.close || [];

    const chartData = timestamps.map((timestamp, index) => ({
      time: timestamp * 1000, // Convert to milliseconds
      price: closes[index] || null,
    })).filter(point => point.price !== null);

    const chartResult = {
      symbol: symbol.toUpperCase(),
      range: range,
      data: chartData,
      lastUpdated: new Date().toISOString(),
    };

    priceCache.set(cacheKey, { data: chartResult, timestamp: Date.now() });
    return chartResult;
  } catch (error) {
    console.error(`Chart fetch failed for ${symbol}:`, error.message);
    // Return cached if available
    if (cached) {
      return cached.data;
    }
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
 * Get USD to INR exchange rate
 */
const getUSDToINR = async () => {
  const cacheKey = 'usd_inr_rate';
  const cached = priceCache.get(cacheKey);
  
  // Cache exchange rate for 1 hour
  if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
    return cached.data;
  }

  try {
    // Try multiple sources for USD/INR rate
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 10000,
    });
    
    const inrRate = response.data?.rates?.INR || 83.0; // Fallback to approximate rate
    priceCache.set(cacheKey, { data: inrRate, timestamp: Date.now() });
    return inrRate;
  } catch (error) {
    console.warn('Failed to fetch USD/INR rate, using fallback:', error.message);
    // Use cached or fallback rate
    if (cached) {
      return cached.data;
    }
    return 83.0; // Approximate fallback rate
  }
};

/**
 * Get metal price (gold or silver) in INR
 * Uses new multi-source service for REAL live prices
 */
export const getMetalPrice = async (metal) => {
  const cacheKey = `metal:${metal.toLowerCase()}`;
  const assetType = metal.toLowerCase() === 'gold' ? 'gold' : 'silver';

  return getCachedOrFetch(cacheKey, assetType, async () => {
    try {
      // Use new multi-source service
      const { getLiveGoldPrice, getLiveSilverPrice } = await import('./metalsPriceService.js');
      
      const price = metal.toLowerCase() === 'gold' 
        ? await getLiveGoldPrice()
        : await getLiveSilverPrice();
      
      if (!price || price.unavailable) {
        throw new Error('Price unavailable from all sources');
      }
      
      return price;
    } catch (error) {
      console.error(`[METALS] Error fetching ${metal} price:`, error.message);
      
      // Last resort: Try metals.live directly
      try {
        const response = await axios.get('https://api.metals.live/v1/spot', {
          timeout: 10000,
        });

        const metalLower = metal.toLowerCase();
        let usdPrice = response.data?.[metalLower] || response.data?.[metalLower.toUpperCase()];
        
        if (usdPrice && usdPrice > 0) {
          const usdToInr = await getUSDToINR();
          const pricePerGramINR = (usdPrice * usdToInr) / 31.1035;
          
          return {
            symbol: metal.toUpperCase(),
            price: usdPrice,
            priceINR: pricePerGramINR,
            pricePer10GramINR: pricePerGramINR * 10,
            pricePerOunceINR: usdPrice * usdToInr,
            usdToInrRate: usdToInr,
            lastUpdated: new Date().toISOString(),
            source: 'metals.live',
            currency: 'INR',
            unavailable: false,
          };
        }
      } catch (fallbackError) {
        console.error(`[METALS] Fallback also failed:`, fallbackError.message);
      }
      
      throw error; // Re-throw if all sources fail
    }
  });
};

/**
 * Get gold and silver prices - Uses new multi-source service
 */
export const getMetalPrices = async () => {
  try {
    console.log('[METALS] Fetching LIVE gold and silver prices...');
    
    // Use new multi-source service
    const { getLiveMetalPrices } = await import('./metalsPriceService.js');
    const result = await getLiveMetalPrices();
    
    // If new service fails, fall back to old method
    if (!result.gold || !result.silver) {
      console.log('[METALS] New service partial failure, using fallback...');
      const [gold, silver] = await Promise.allSettled([
        getMetalPrice('gold'),
        getMetalPrice('silver'),
      ]);
      
      return {
        gold: gold.status === 'fulfilled' ? gold.value : result.gold,
        silver: silver.status === 'fulfilled' ? silver.value : result.silver,
      };
    }
    
    console.log('[METALS] ✅ Live prices fetched successfully');
    console.log(`[METALS] Gold: ₹${result.gold.pricePer10GramINR?.toFixed(2)} per 10g`);
    console.log(`[METALS] Silver: ₹${result.silver.pricePer10GramINR?.toFixed(2)} per 10g`);
    
    return result;
  } catch (error) {
    console.error('[METALS] Error fetching metal prices:', error.message);
    
    // Last resort: Try individual fetches
    try {
      const [gold, silver] = await Promise.allSettled([
        getMetalPrice('gold'),
        getMetalPrice('silver'),
      ]);
      
      return {
        gold: gold.status === 'fulfilled' ? gold.value : null,
        silver: silver.status === 'fulfilled' ? silver.value : null,
      };
    } catch (fallbackError) {
      console.error('[METALS] All methods failed:', fallbackError.message);
      return { gold: null, silver: null };
    }
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

