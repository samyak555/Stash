import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { clearAllUsers, getDatabaseStats } from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Clear all users from database
router.delete('/users', clearAllUsers);

// Get database statistics
router.get('/stats', getDatabaseStats);

export default router;

