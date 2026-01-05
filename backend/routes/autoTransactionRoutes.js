import express from 'express';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from '../controllers/autoTransactionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/stats', getTransactionStats);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;

