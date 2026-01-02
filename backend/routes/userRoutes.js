import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAllUsers, updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getAllUsers);
router.patch('/profile', updateProfile);

export default router;


