/**
 * Test routes for verifying email service configuration
 * These endpoints help verify that email service is working
 */

import express from 'express';
import { sendOTPEmail, verifyEmailService } from '../services/emailService.js';

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
    const isVerified = await verifyEmailService();
    
    if (isVerified) {
      res.json({
        success: true,
        message: 'Email service is working correctly!',
        status: 'verified',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Email service verification failed. Check server logs for details.',
        status: 'failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email service error: ' + error.message,
      status: 'error',
    });
  }
});

/**
 * Test send OTP email (for testing only)
 * POST /api/test/send-test-otp
 * Body: { email: "test@example.com" }
 */
router.post('/send-test-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const testOTP = '123456';
    await sendOTPEmail(email, testOTP, 'Test OTP from Stash');

    res.json({
      success: true,
      message: `Test OTP email sent to ${email}`,
      otp: testOTP, // Only for testing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test email: ' + error.message,
    });
  }
});

export default router;

