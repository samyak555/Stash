import { getPortfolioInsights } from '../services/portfolioInsightsService.js';

/**
 * Get portfolio insights for authenticated user
 */
export const getInsights = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const insights = await getPortfolioInsights(req.userId);
    res.json(insights);
  } catch (error) {
    console.error('Error fetching portfolio insights:', error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
};

