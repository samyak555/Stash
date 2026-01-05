import express from 'express';
import {
  getTopCryptosList,
  getCryptoFundamentalsData,
} from '../controllers/cryptoController.js';

const router = express.Router();

router.get('/top', getTopCryptosList);
router.get('/fundamentals/:coinId', getCryptoFundamentalsData);

export default router;

