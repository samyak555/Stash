import express from 'express';
import {
  getNetWorth,
  addCashBalance,
  updateCashBalance,
  deleteCashBalance,
  addLiability,
  updateLiability,
  deleteLiability,
} from '../controllers/netWorthController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Net worth
router.get('/', getNetWorth);

// Cash balances
router.post('/cash', addCashBalance);
router.put('/cash/:id', updateCashBalance);
router.delete('/cash/:id', deleteCashBalance);

// Liabilities
router.post('/liability', addLiability);
router.put('/liability/:id', updateLiability);
router.delete('/liability/:id', deleteLiability);

export default router;

