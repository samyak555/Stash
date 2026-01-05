import express from 'express';
import { getInsights } from '../controllers/portfolioInsightsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getInsights);

export default router;

