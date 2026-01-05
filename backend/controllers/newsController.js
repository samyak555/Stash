import {
  getFinanceNews,
  getCategorizedNews,
  getTopHeadlines,
} from '../services/financeNewsService.js';

/**
 * Get finance news by category
 */
export const getNews = async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    const news = await getFinanceNews(category);
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ 
      message: 'Failed to fetch news',
      news: [] // Return empty array instead of error
    });
  }
};

/**
 * Get categorized news
 */
export const getCategorized = async (req, res) => {
  try {
    const categorized = await getCategorizedNews();
    res.json(categorized);
  } catch (error) {
    console.error('Error fetching categorized news:', error);
    res.json({
      all: [],
      stocks: [],
      crypto: [],
      economy: [],
    });
  }
};

/**
 * Get top headlines (for dashboard)
 */
export const getHeadlines = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const headlines = await getTopHeadlines(parseInt(limit));
    res.json(headlines);
  } catch (error) {
    console.error('Error fetching headlines:', error);
    res.json([]); // Return empty array
  }
};

