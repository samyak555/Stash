import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAll, create } from '../controllers/groupController.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getAll);
router.post('/', create);

export default router;

