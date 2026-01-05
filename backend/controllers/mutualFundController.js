import { getTopIndianMFs, getMFFundamentals, searchMutualFunds } from '../services/mutualFundService.js';

/**
 * Get top Indian Mutual Funds
 */
export const getTopMFs = async (req, res) => {
  try {
    const mfs = await getTopIndianMFs();
    res.json(mfs);
  } catch (error) {
    console.error('Error fetching top MFs:', error);
    res.json([]);
  }
};

/**
 * Search mutual funds
 */
export const searchMFs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    const mfs = await searchMutualFunds(q);
    res.json(mfs);
  } catch (error) {
    console.error('Error searching MFs:', error);
    res.json([]);
  }
};

/**
 * Get MF fundamentals by scheme code
 */
export const getMFFundamentalsData = async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const fundamentals = await getMFFundamentals(schemeCode);
    
    if (!fundamentals) {
      return res.status(404).json({ message: 'Mutual Fund not found' });
    }
    
    res.json(fundamentals);
  } catch (error) {
    console.error('Error fetching MF fundamentals:', error);
    res.status(500).json({ message: 'Failed to fetch MF fundamentals' });
  }
};

