import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getInsights } from '../controllers/aiController.js';

const router = express.Router();

router.use(authenticate);
router.get('/insights', getInsights);

export default router;

