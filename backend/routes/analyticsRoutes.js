import express from 'express';
import {
  getFinancialHealth,
  getExpenseAnalyticsData,
  getBudgetAnalyticsData,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/health', getFinancialHealth);
router.get('/expenses', getExpenseAnalyticsData);
router.get('/budgets', getBudgetAnalyticsData);

export default router;

