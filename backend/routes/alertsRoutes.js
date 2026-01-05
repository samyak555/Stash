import express from 'express';
import {
  getAlerts,
  createAlert,
  markRead,
  markAllRead,
  removeAlert,
  checkAlerts,
} from '../controllers/alertsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAlerts);
router.post('/', createAlert);
router.post('/:id/read', markRead);
router.post('/read-all', markAllRead);
router.delete('/:id', removeAlert);
router.post('/check', checkAlerts);

export default router;

