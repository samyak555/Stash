import express from 'express';
import { 
  register, 
  login, 
  verifyEmail, 
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  googleAuth,
} from '../controllers/authController.js';
import { authRateLimiter, passwordResetRateLimiter } from '../utils/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', authRateLimiter, resendVerificationEmail);
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, resetPassword);
router.post('/google', authRateLimiter, googleAuth);

export default router;


