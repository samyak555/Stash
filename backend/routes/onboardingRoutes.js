import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAuth } from '../middleware/guest.js';
import { completeOnboarding } from '../controllers/onboardingController.js';

const router = express.Router();

// All onboarding routes require authentication
router.use(authenticate);
router.use(requireAuth); // Block guest users

// Complete onboarding
router.post('/', completeOnboarding);

export default router;

