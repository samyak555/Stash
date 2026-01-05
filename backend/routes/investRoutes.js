import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createHolding,
  getHoldings,
  getPortfolio,
  getPortfolioSummaryController,
  updateHolding,
  deleteHolding,
} from '../controllers/investController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Portfolio routes
router.get('/portfolio', getPortfolio);
router.get('/portfolio/summary', getPortfolioSummaryController);
router.get('/holdings', getHoldings);

// Holding CRUD
router.post('/holding', createHolding);
router.put('/holding/:id', updateHolding);
router.delete('/holding/:id', deleteHolding);

export default router;

