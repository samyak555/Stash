import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAll, create, update, remove } from '../controllers/expenseController.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;


