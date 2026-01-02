import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { allowGuest, optionalAuth } from '../middleware/guest.js';
import { getDashboard } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(allowGuest);
router.use(authenticate);
router.get('/', optionalAuth, getDashboard);

export default router;


