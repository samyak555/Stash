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
    // Ensure we always return an array
    const newsArray = Array.isArray(news) ? news : [];
    res.json(newsArray);
  } catch (error) {
    console.error('Error fetching news:', error);
    // Return empty array instead of error
    res.json([]);
  }
};

/**
 * Get categorized news
 */
export const getCategorized = async (req, res) => {
  try {
    const categorized = await getCategorizedNews();
    // Ensure all categories are arrays
    const result = {
      all: Array.isArray(categorized.all) ? categorized.all : [],
      stocks: Array.isArray(categorized.stocks) ? categorized.stocks : [],
      crypto: Array.isArray(categorized.crypto) ? categorized.crypto : [],
      economy: Array.isArray(categorized.economy) ? categorized.economy : [],
    };
    res.json(result);
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

