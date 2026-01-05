import { getTopCryptos, getCryptoFundamentals, searchCryptos } from '../services/cryptoService.js';

/**
 * Get top cryptocurrencies with fundamentals
 */
export const getTopCryptosList = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const cryptos = await getTopCryptos(parseInt(limit));
    res.json(cryptos);
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    res.json([]);
  }
};

/**
 * Search cryptocurrencies
 */
export const searchCryptosList = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    const cryptos = await searchCryptos(q);
    res.json(cryptos);
  } catch (error) {
    console.error('Error searching cryptos:', error);
    res.json([]);
  }
};

/**
 * Get crypto fundamentals by ID
 */
export const getCryptoFundamentalsData = async (req, res) => {
  try {
    const { coinId } = req.params;
    const fundamentals = await getCryptoFundamentals(coinId);
    
    if (!fundamentals) {
      return res.status(404).json({ message: 'Crypto not found' });
    }
    
    res.json(fundamentals);
  } catch (error) {
    console.error('Error fetching crypto fundamentals:', error);
    res.status(500).json({ message: 'Failed to fetch crypto fundamentals' });
  }
};

