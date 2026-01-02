import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAuth } from '../middleware/guest.js';
import { getAllUsers, getProfile, updateProfile, deleteAccount } from '../controllers/userController.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getAllUsers);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.delete('/account', requireAuth, deleteAccount); // Only authenticated users can delete

export default router;


