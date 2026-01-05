import express from 'express';
import {
  getTopCryptosList,
  getCryptoFundamentalsData,
  searchCryptosList,
} from '../controllers/cryptoController.js';

const router = express.Router();

router.get('/top', getTopCryptosList);
router.get('/search', searchCryptosList);
router.get('/fundamentals/:coinId', getCryptoFundamentalsData);

export default router;

