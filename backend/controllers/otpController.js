/**
 * OTP Controller for Stash
 * Handles OTP generation, storage (in-memory), and verification
 */

import { sendOTPEmail } from '../services/emailService.js';

// In-memory storage for OTPs
// Structure: { email: { otp: '123456', expiresAt: Date, attempts: 0 } }
const otpStore = new Map();

// OTP configuration
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

/**
 * Generate 6-digit OTP
 * @returns {string} - 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Clean expired OTPs from memory
 * Runs periodically to prevent memory leaks
 */
const cleanExpiredOTPs = () => {
  const now = new Date();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
      console.log(`🧹 Cleaned expired OTP for ${email}`);
    }
  }
};

// Clean expired OTPs every minute
setInterval(cleanExpiredOTPs, 60 * 1000);

/**
 * Send OTP to email
 * POST /api/auth/send-otp
 * Body: { email: string }
 */
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP in memory
    otpStore.set(email.toLowerCase(), {
      otp: otp,
      expiresAt: expiresAt,
      attempts: 0,
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      
      console.log(`✅ OTP sent to ${email} (expires in ${OTP_EXPIRY_MINUTES} minutes)`);
      
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: OTP_EXPIRY_MINUTES, // minutes
      });
    } catch (emailError) {
      // Remove OTP from store if email fails
      otpStore.delete(email.toLowerCase());
      
      console.error('Failed to send OTP email:', emailError.message);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }
  } catch (error) {
    console.error('Error in sendOTP:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 * Body: { email: string, otp: string }
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const emailLower = email.toLowerCase();
    const storedData = otpStore.get(emailLower);

    // Check if OTP exists
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this email. Please request a new one.',
      });
    }

    // Check if OTP expired
    if (storedData.expiresAt < new Date()) {
      otpStore.delete(emailLower);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Check attempt limit
    if (storedData.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(emailLower);
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      const remainingAttempts = MAX_ATTEMPTS - storedData.attempts;
      
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Maximum attempts exceeded.'}`,
        remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0,
      });
    }

    // OTP verified successfully - delete from store
    otpStore.delete(emailLower);
    
    console.log(`✅ OTP verified successfully for ${email}`);
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Error in verifyOTP:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get OTP statistics (for debugging/admin)
 * Returns count of active OTPs in memory
 */
export const getOTPStats = () => {
  return {
    activeOTPs: otpStore.size,
    maxAttempts: MAX_ATTEMPTS,
    expiryMinutes: OTP_EXPIRY_MINUTES,
  };
};

