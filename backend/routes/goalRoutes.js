import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { allowGuest, requireAuth, optionalAuth } from '../middleware/guest.js';
import { getAll, create, update } from '../controllers/goalController.js';

const router = express.Router();

router.use(allowGuest);
router.use(authenticate);

router.get('/', optionalAuth, getAll);
router.post('/', requireAuth, create);
router.put('/:id', requireAuth, update);

export default router;


