import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { allowGuest, requireAuth, optionalAuth } from '../middleware/guest.js';
import { getAll, create, update, remove } from '../controllers/budgetController.js';

const router = express.Router();

router.use(allowGuest);
router.use(authenticate);

router.get('/', optionalAuth, getAll);
router.post('/', requireAuth, create);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

export default router;


