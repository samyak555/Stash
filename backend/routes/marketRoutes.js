import express from 'express';
import {
  getStock,
  getStocks,
  getCrypto,
  getCryptos,
  getMetals,
  getMutualFund,
  getMutualFunds,
} from '../controllers/marketController.js';

const router = express.Router();

// Market data routes (public, but rate-limited by API providers)
router.get('/stocks', getStocks);
router.get('/stock', getStock);
router.get('/crypto', getCrypto);
router.get('/cryptos', getCryptos);
router.get('/metals', getMetals);
router.get('/mutual-funds', getMutualFunds);
router.get('/mutual-fund', getMutualFund);

export default router;

