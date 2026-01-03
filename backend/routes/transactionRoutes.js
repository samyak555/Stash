import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAuth } from '../middleware/guest.js';

const router = express.Router();

// All transaction routes require authentication
router.use(authenticate);

/**
 * Get sync status
 * GET /api/transactions/sync-status
 */
router.get('/sync-status', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // TODO: Implement actual sync status from database
    // For now, return default status
    res.json({
      connected: false,
      email: null,
      lastSync: null,
    });
  } catch (error) {
    console.error('Get sync status error:', error);
    res.status(500).json({ message: 'Failed to get sync status' });
  }
});

/**
 * Connect email for transaction sync
 * POST /api/transactions/connect-email
 */
router.post('/connect-email', requireAuth, async (req, res) => {
  try {
    const { email, password, host, port } = req.body;
    const userId = req.userId;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // TODO: Implement actual email connection logic
    // For now, return success
    res.json({ 
      message: 'Email connected successfully',
      email: email,
    });
  } catch (error) {
    console.error('Connect email error:', error);
    res.status(500).json({ message: 'Failed to connect email' });
  }
});

/**
 * Disconnect email
 * POST /api/transactions/disconnect-email
 */
router.post('/disconnect-email', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // TODO: Implement actual email disconnection logic
    res.json({ message: 'Email disconnected successfully' });
  } catch (error) {
    console.error('Disconnect email error:', error);
    res.status(500).json({ message: 'Failed to disconnect email' });
  }
});

/**
 * Sync transactions now
 * POST /api/transactions/sync-now
 */
router.post('/sync-now', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // TODO: Implement actual sync logic
    res.json({ 
      message: 'Sync completed',
      transactionsFound: 0,
    });
  } catch (error) {
    console.error('Sync now error:', error);
    res.status(500).json({ message: 'Failed to sync transactions' });
  }
});

export default router;

