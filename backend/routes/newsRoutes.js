import express from 'express';
import {
  getNews,
  getCategorized,
  getHeadlines,
} from '../controllers/newsController.js';

const router = express.Router();

// Public routes (no auth required for news)
router.get('/', getNews);
router.get('/categorized', getCategorized);
router.get('/headlines', getHeadlines);

export default router;

