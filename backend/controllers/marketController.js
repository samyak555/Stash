import {
  getStockPrice,
  getStockPrices,
  getCryptoPrice,
  getCryptoPrices,
  getMetalPrices,
  getMutualFundNAV,
  getMutualFundNAVs,
  getStockChartData,
} from '../services/MarketPriceEngine.js';

/**
 * Get stock price for a symbol
 */
export const getStock = async (req, res) => {
  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ message: 'Symbol parameter is required' });
    }

    const price = await getStockPrice(symbol);
    res.json(price);
  } catch (error) {
    console.error('Error fetching stock price:', error);
    // Return empty response instead of error - let frontend handle gracefully
    res.json({ unavailable: true, message: 'Price temporarily unavailable' });
  }
};

/**
 * Get multiple stock prices
 */
export const getStocks = async (req, res) => {
  try {
    const { symbols } = req.query;

    if (!symbols) {
      return res.status(400).json({ message: 'Symbols parameter is required (comma-separated)' });
    }

    const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase());
    const prices = await getStockPrices(symbolArray);
    res.json(prices);
  } catch (error) {
    console.error('Error fetching stock prices:', error);
    // Return partial results instead of error
    res.json({});
  }
};

/**
 * Get crypto price for a symbol
 */
export const getCrypto = async (req, res) => {
  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ message: 'Symbol parameter is required' });
    }

    const price = await getCryptoPrice(symbol);
    res.json(price);
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    res.json({ unavailable: true, message: 'Price temporarily unavailable' });
  }
};

/**
 * Get multiple crypto prices
 */
export const getCryptos = async (req, res) => {
  try {
    const { symbols } = req.query;

    if (!symbols) {
      return res.status(400).json({ message: 'Symbols parameter is required (comma-separated)' });
    }

    const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase());
    const prices = await getCryptoPrices(symbolArray);
    res.json(prices);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    res.json({});
  }
};

/**
 * Get metal prices (gold and silver)
 */
export const getMetals = async (req, res) => {
  try {
    console.log('[METALS API] Request received for live prices');
    const prices = await getMetalPrices();
    
    // Ensure we always return valid structure
    const result = {
      gold: prices.gold || null,
      silver: prices.silver || null,
    };
    
    if (result.gold && result.silver) {
      console.log('[METALS API] ✅ Returning live prices');
    } else {
      console.warn('[METALS API] ⚠️ Some prices unavailable');
    }
    
    res.json(result);
  } catch (error) {
    console.error('[METALS API] Error:', error.message);
    res.json({ gold: null, silver: null });
  }
};

/**
 * Get mutual fund NAV for a scheme code
 */
export const getMutualFund = async (req, res) => {
  try {
    const { schemeCode } = req.query;

    if (!schemeCode) {
      return res.status(400).json({ message: 'Scheme code parameter is required' });
    }

    const nav = await getMutualFundNAV(schemeCode);
    res.json(nav);
  } catch (error) {
    console.error('Error fetching mutual fund NAV:', error);
    res.json({ unavailable: true, message: 'NAV temporarily unavailable' });
  }
};

/**
 * Get multiple mutual fund NAVs
 */
export const getMutualFunds = async (req, res) => {
  try {
    const { schemeCodes } = req.query;

    if (!schemeCodes) {
      return res.status(400).json({ message: 'Scheme codes parameter is required (comma-separated)' });
    }

    const schemeCodeArray = schemeCodes.split(',').map(s => s.trim());
    const navs = await getMutualFundNAVs(schemeCodeArray);
    res.json(navs);
  } catch (error) {
    console.error('Error fetching mutual fund NAVs:', error);
    res.json({});
  }
};

/**
 * Get stock chart data for a symbol
 */
export const getStockChart = async (req, res) => {
  try {
    const { symbol, range = '1d' } = req.query;

    if (!symbol) {
      return res.status(400).json({ message: 'Symbol parameter is required' });
    }

    const chartData = await getStockChartData(symbol, range);
    res.json(chartData);
  } catch (error) {
    console.error('Error fetching stock chart:', error);
    res.json({ data: [], unavailable: true });
  }
};

