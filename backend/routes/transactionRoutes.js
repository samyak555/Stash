import express from 'express';
import { authenticate } from '../middleware/auth.js';
import transactionScheduler from '../services/scheduler.js';
import { handleRazorpayWebhook, handlePaytmWebhook, handleGenericWebhook } from '../services/webhookHandler.js';

const router = express.Router();

// Connect user email for auto-fetching
router.post('/connect-email', authenticate, async (req, res) => {
  try {
    const { email, password, host, port } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    await transactionScheduler.setupUserEmail(req.user._id, {
      email,
      password,
      host: host || 'imap.gmail.com',
      port: port || 993
    });

    res.json({ message: 'Email connected successfully. Transactions will sync automatically.' });
  } catch (error) {
    console.error('Connect email error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to connect email. Please check your credentials.' 
    });
  }
});

// Disconnect email
router.post('/disconnect-email', authenticate, async (req, res) => {
  try {
    await transactionScheduler.removeUserEmail(req.user._id);
    res.json({ message: 'Email disconnected successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trigger manual sync
router.post('/sync-now', authenticate, async (req, res) => {
  try {
    const result = await transactionScheduler.syncUserTransactions(req.user._id);
    
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ 
      message: 'Sync completed',
      transactionsFound: result.count,
      transactions: result.transactions || []
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      message: error.message || 'Sync failed. Please check your email connection.' 
    });
  }
});

// Get sync status
router.get('/sync-status', authenticate, async (req, res) => {
  try {
    const status = await transactionScheduler.getSyncStatus(req.user._id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Webhook endpoints (no auth required - secured by signature verification)
router.post('/webhook/razorpay', handleRazorpayWebhook);
router.post('/webhook/paytm', handlePaytmWebhook);
router.post('/webhook/generic', handleGenericWebhook);

export default router;
