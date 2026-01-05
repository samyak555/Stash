import express from 'express';
import {
  getTopMFs,
  getMFFundamentalsData,
  searchMFs,
} from '../controllers/mutualFundController.js';

const router = express.Router();

router.get('/top', getTopMFs);
router.get('/search', searchMFs);
router.get('/fundamentals/:schemeCode', getMFFundamentalsData);

export default router;

