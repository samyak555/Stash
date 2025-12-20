import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAllUsers } from '../controllers/userController.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getAllUsers);

export default router;

