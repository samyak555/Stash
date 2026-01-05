import {
  getStockPrice,
  getStockPrices,
  getCryptoPrice,
  getCryptoPrices,
  getMetalPrices,
  getMutualFundNAV,
  getMutualFundNAVs,
} from '../services/marketDataService.js';

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
    res.status(500).json({ message: error.message || 'Failed to fetch stock price' });
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
    res.status(500).json({ message: error.message || 'Failed to fetch stock prices' });
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
    res.status(500).json({ message: error.message || 'Failed to fetch crypto price' });
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
    res.status(500).json({ message: error.message || 'Failed to fetch crypto prices' });
  }
};

/**
 * Get metal prices (gold and silver)
 */
export const getMetals = async (req, res) => {
  try {
    const prices = await getMetalPrices();
    res.json(prices);
  } catch (error) {
    console.error('Error fetching metal prices:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch metal prices' });
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
    res.status(500).json({ message: error.message || 'Failed to fetch mutual fund NAV' });
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
    res.status(500).json({ message: error.message || 'Failed to fetch mutual fund NAVs' });
  }
};

