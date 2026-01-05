/**
 * STASH NEWS CONTROLLER
 * 
 * Always returns 200 OK with JSON array
 * Never throws errors to frontend
 */

import {
  getFinanceNews,
  getCategorizedNews,
  getTopHeadlines,
} from '../services/financeNewsService.js';

/**
 * Get news - SIMPLIFIED ENDPOINT
 * GET /api/news
 * 
 * Response: Always 200 OK, JSON array
 */
export const getNews = async (req, res) => {
  try {
    const news = await getFinanceNews('all');
    
    // FORCE array response
    const newsArray = Array.isArray(news) ? news : [];
    
    console.log(`[STASH NEWS API] Returning ${newsArray.length} articles`);
    
    // ALWAYS return 200 OK with array
    res.status(200).json(newsArray);
  } catch (error) {
    console.error('[STASH NEWS API] Error:', error.message);
    // Return empty array, never error
    res.status(200).json([]);
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
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[STASH NEWS API] Categorized error:', error.message);
    res.status(200).json({
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
    
    const headlinesArray = Array.isArray(headlines) ? headlines : [];
    
    res.status(200).json(headlinesArray);
  } catch (error) {
    console.error('[STASH NEWS API] Headlines error:', error.message);
    res.status(200).json([]);
  }
};
