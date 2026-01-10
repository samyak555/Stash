import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAuth } from '../middleware/guest.js';
import {
    getStats,
    givePoints,
    giveBadge,
    checkIn,
    getAllBadges,
    getLeaderboard,
} from '../controllers/gamificationController.js';

const router = express.Router();

router.use(authenticate);

// Public routes (authenticated users)
router.get('/stats', requireAuth, getStats);
router.get('/badges', requireAuth, getAllBadges);
router.get('/leaderboard', requireAuth, getLeaderboard);
router.post('/checkin', requireAuth, checkIn);

// Internal routes (for awarding points/badges from other controllers)
router.post('/points', requireAuth, givePoints);
router.post('/badge', requireAuth, giveBadge);

export default router;
