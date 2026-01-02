import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { allowGuest, requireAuth, optionalAuth } from '../middleware/guest.js';
import { getAll, create } from '../controllers/budgetController.js';

const router = express.Router();

router.use(allowGuest);
router.use(authenticate);

router.get('/', optionalAuth, getAll);
router.post('/', requireAuth, create);

export default router;


