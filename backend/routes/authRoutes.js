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
// EMAIL AUTHENTICATION ROUTES (DISABLED)
// ============================================
// Email/password auth temporarily disabled - using Google OAuth only

// Registration - DISABLED
router.post('/register', (req, res) => {
  res.status(403).json({ message: 'Email registration is currently disabled. Please use Google Sign-In.' });
});

// Email verification - DISABLED
router.get('/verify-email', (req, res) => {
  res.status(403).json({ message: 'Email verification is currently disabled. Please use Google Sign-In.' });
});

// Resend verification - DISABLED
router.post('/resend-verification', (req, res) => {
  res.status(403).json({ message: 'Email verification is currently disabled. Please use Google Sign-In.' });
});

// Login - DISABLED
router.post('/login', (req, res) => {
  res.status(403).json({ message: 'Email login is currently disabled. Please use Google Sign-In.' });
});

// Password reset - DISABLED
router.post('/forgot-password', (req, res) => {
  res.status(403).json({ message: 'Password reset is currently disabled. Please use Google Sign-In.' });
});
router.post('/reset-password', (req, res) => {
  res.status(403).json({ message: 'Password reset is currently disabled. Please use Google Sign-In.' });
});

// ============================================
// GOOGLE OAUTH 2.0 ROUTES
// ============================================

// Google OAuth 2.0 Authorization Code Flow
router.get('/google', googleAuthInitiate);
router.get('/google/callback', googleAuthCallback);

// Google OAuth - Direct ID token verification (for frontend button)
router.post('/google', authRateLimiter, googleAuth);

export default router;
