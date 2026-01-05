import { getTopCryptos, getCryptoFundamentals } from '../services/cryptoService.js';

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

