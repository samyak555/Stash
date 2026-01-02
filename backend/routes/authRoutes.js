import express from 'express';
import { register, login, verifyOTP, resendOTP, forgotPassword, resetPassword, googleAuth } from '../controllers/authController.js';
import { sendOTP, verifyOTP as verifyOTPController } from '../controllers/otpController.js';
import { authRateLimiter, passwordResetRateLimiter, otpRateLimiter } from '../utils/rateLimiter.js';

const router = express.Router();

// Registration - sends OTP (no token returned until verified)
router.post('/register', authRateLimiter, register);

// OTP Verification - activates account and returns token
router.post('/verify-otp', otpRateLimiter, verifyOTP);

// Resend OTP
router.post('/resend-otp', otpRateLimiter, resendOTP);

// Login - BLOCKED if email not verified
router.post('/login', authRateLimiter, login);

// Password reset (uses OTP)
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, resetPassword);

// Google OAuth (skips OTP)
router.post('/google', authRateLimiter, googleAuth);

// Standalone OTP endpoints (in-memory storage)
router.post('/send-otp', otpRateLimiter, sendOTP);
router.post('/verify-otp', otpRateLimiter, verifyOTPController);

export default router;
