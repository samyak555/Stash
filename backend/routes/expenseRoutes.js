import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { allowGuest, requireAuth, optionalAuth } from '../middleware/guest.js';
import { getAll, create, update, remove } from '../controllers/expenseController.js';

const router = express.Router();

// Allow guests for read operations, require auth for writes
router.use(allowGuest); // Check for guest mode
router.use(authenticate); // Verify token if present

// Read operations - allow guests
router.get('/', optionalAuth, getAll);

// Write operations - require authentication
router.post('/', requireAuth, create);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

export default router;


