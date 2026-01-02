/**
 * Test routes for verifying email service configuration
 * These endpoints help verify that email service is working
 */

import express from 'express';
import { verifyEmailService, sendVerificationEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * Test email service configuration
 * GET /api/test/email-config
 */
router.get('/email-config', (req, res) => {
  const config = {
    EMAIL_HOST: process.env.EMAIL_HOST || 'not set',
    EMAIL_PORT: process.env.EMAIL_PORT || 'not set',
    EMAIL_USER: process.env.EMAIL_USER ? '***configured***' : 'not set',
    EMAIL_PASS: process.env.EMAIL_PASS ? '***configured***' : 'not set',
    EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set',
  };

  const isConfigured = 
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS;

  res.json({
    configured: isConfigured,
    config: config,
    message: isConfigured 
      ? 'Email service is configured. Use /api/test/email-verify to test connection.'
      : 'Email service is not fully configured. Set EMAIL_USER and EMAIL_PASS.',
  });
});

/**
 * Verify email service connection
 * GET /api/test/email-verify
 */
router.get('/email-verify', async (req, res) => {
  try {
    const result = await verifyEmailService();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Email service is working correctly!',
        status: 'verified',
        details: result.details,
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Email service verification failed',
        status: 'failed',
        details: result.details,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email service error: ' + error.message,
      status: 'error',
      error: error.message,
    });
  }
});

/**
 * Test send verification email (for testing only)
 * POST /api/test/send-test-email
 * Body: { email: "test@example.com" }
 */
router.post('/send-test-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Generate a test verification token
    const testToken = 'test-token-' + Date.now();
    await sendVerificationEmail(email, 'Test User', testToken);

    res.json({
      success: true,
      message: `Test verification email sent to ${email}`,
      token: testToken, // Only for testing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test email: ' + error.message,
    });
  }
});

export default router;

