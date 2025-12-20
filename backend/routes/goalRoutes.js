import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAll, create, update } from '../controllers/goalController.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);

export default router;

