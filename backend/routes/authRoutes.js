import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleAuthInitiate,
  googleAuthCallback,
} from '../controllers/authController.js';
import { authRateLimiter, passwordResetRateLimiter, resendOTPRateLimiter } from '../utils/rateLimiter.js';

const router = express.Router();

// ============================================
// EMAIL AUTHENTICATION ROUTES
// ============================================

// Registration - sends verification email (no token returned until verified)
router.post('/register', authRateLimiter, register);

// Email verification - GET endpoint for email link
router.get('/verify-email', verifyEmail);

// Resend verification email (rate limited: max 3 per hour)
router.post('/resend-verification', resendOTPRateLimiter, resendVerification);

// Login - BLOCKED if email not verified
router.post('/login', authRateLimiter, login);

// Password reset (secure token flow)
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, resetPassword);

// ============================================
// GOOGLE OAUTH 2.0 ROUTES
// ============================================

// Google OAuth 2.0 Authorization Code Flow
router.get('/google', googleAuthInitiate);
router.get('/google/callback', googleAuthCallback);

// Google OAuth - Direct ID token verification (for frontend button)
router.post('/google', authRateLimiter, googleAuth);

export default router;
