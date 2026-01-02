/**
 * Production-Grade Authentication Controller for Stash
 * Implements secure email + password + OTP authentication
 * Similar to Zomato/Facebook authentication flow
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { validateEmail } from '../utils/emailValidation.js';
import { sendOTPEmail, sendPasswordResetEmail, sendPasswordChangeConfirmation } from '../services/emailService.js';

// Password validation function
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumber) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash token using SHA-256
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Admin email (hardcoded for security)
const ADMIN_EMAIL = 'administrator-stash.auth7@gmail.com';

/**
 * Register new user with mandatory OTP verification
 * POST /api/auth/register
 * - Validates email format
 * - Hashes password with bcrypt (12 rounds)
 * - Generates 6-digit OTP
 * - Stores OTP hashed in DB with 10-minute expiry
 * - Sends OTP via Gmail SMTP
 * - Blocks login until OTP verified
 */
export const register = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const { name, email, password, gender, age, profession } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Validate email format and disposable domains
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Validate age
    if (age !== undefined && (age < 13 || age > 100)) {
      return res.status(400).json({ message: 'Age must be between 13 and 100' });
    }

    // Validate profession
    const validProfessions = ['Student', 'Salaried', 'Business', 'Freelancer', 'Homemaker', 'Retired', 'Other'];
    if (profession && !validProfessions.includes(profession)) {
      return res.status(400).json({ message: 'Invalid profession' });
    }

    // Validate gender
    const validGenders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password with bcrypt (12 rounds - production-ready)
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate 6-digit OTP
    const otp = generateOTP();
    // Hash OTP before storing (using bcrypt for security)
    const otpHash = await bcrypt.hash(otp, 12);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Determine role (admin if email matches)
    const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

    // Create user with emailVerified = false (MANDATORY - cannot login until verified)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      gender,
      age,
      profession,
      emailVerified: false, // MANDATORY - user cannot login until verified
      otpHash,
      otpExpiry,
      authProvider: 'local',
      role,
      onboardingCompleted: false,
    });

    // Send OTP email (MANDATORY - user needs this to verify)
    try {
      await sendOTPEmail(user.email, otp, user.name);
      console.log(`✅ OTP sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError.message);
      // Delete user if OTP email fails (user cannot verify without OTP)
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
    }

    // Return user data (NO TOKEN - user cannot login until verified)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: false,
      message: 'Registration successful! Please check your email for the verification code.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Registration failed' });
  }
};

/**
 * Verify OTP and activate user account
 * POST /api/auth/verify-otp
 * - Compares OTP with stored hash
 * - If correct → delete OTP and mark emailVerified = true
 * - Returns JWT token
 */
export const verifyOTP = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Check if OTP exists
    if (!user.otpHash || !user.otpExpiry) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    // Check if OTP expired
    if (user.otpExpiry < new Date()) {
      user.otpHash = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Verify OTP using bcrypt.compare
    const isOTPValid = await bcrypt.compare(otp, user.otpHash);
    if (!isOTPValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // OTP verified successfully - activate user account
    user.emailVerified = true;
    user.otpHash = null; // Delete OTP after successful verification (one-time use)
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token (user can now login)
    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: true,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      message: 'Email verified successfully! You can now use your account.',
    });
  } catch (error) {
    console.error('OTP verification error:', error.message);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

/**
 * Resend OTP email
 * POST /api/auth/resend-otp
 * - Rate limited (max 3 per hour)
 * - Invalidates previous OTP
 */
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.json({ message: 'If an account exists with this email, a verification code has been sent.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP (invalidate previous)
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 12);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpHash = otpHash;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otp, user.name);
      res.json({ message: 'Verification code sent. Please check your email.' });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      res.status(500).json({ message: 'Failed to send verification code' });
    }
  } catch (error) {
    console.error('Resend OTP error:', error.message);
    res.status(500).json({ message: 'Failed to resend verification code' });
  }
};

/**
 * Login - BLOCKED if email is not verified
 * POST /api/auth/login
 * - Rejects login if emailVerified = false
 * - Returns JWT only after verification
 */
export const login = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // MANDATORY: Block login if email is not verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email address before logging in. Check your inbox for the verification code.',
        emailVerified: false,
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Login failed' });
  }
};

/**
 * Forgot password - generate secure reset token
 * POST /api/auth/forgot-password
 * - Generate one-time reset token (crypto.randomBytes)
 * - Hash token in DB
 * - Expire in 15 minutes
 * - Send reset link via SMTP
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
  }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    // Generate secure reset token using crypto.randomBytes
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetTokenHash = resetTokenHash;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Clear tokens if email fails
      user.resetTokenHash = null;
      user.resetTokenExpiry = null;
      await user.save();
      res.status(500).json({ message: 'Failed to send password reset email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
};

/**
 * Reset password with secure token
 * POST /api/auth/reset-password
 * - Verify token hash + expiry
 * - Allow password reset once
 * - Invalidate token after use
 * - Hash new password using bcrypt
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = hashToken(token);

    // Find user with matching token and not expired
    const user = await User.findOne({
      resetTokenHash,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and invalidate token (one-time use)
    user.passwordHash = passwordHash;
    user.resetTokenHash = null;
    user.resetTokenExpiry = null;
    await user.save();

    // Send password change confirmation email (non-blocking)
    sendPasswordChangeConfirmation(user.email, user.name).catch((emailError) => {
      console.error('Failed to send password change confirmation:', emailError.message);
    });

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Password reset failed' });
  }
};

/**
 * Google OAuth - Real backend verification
 * POST /api/auth/google
 * - Uses Google OAuth 2.0
 * - Backend verification (google-auth-library)
 * - On success: auto mark emailVerified = true
 * - Create account if not exists
 * - No frontend-only fake Google login
 */
export const googleAuth = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID environment variable is not set');
      return res.status(500).json({ message: 'Google OAuth not configured' });
    }

    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }

    // Verify Google ID token (REAL backend verification)
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    let ticket;

    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error('Google token verification error:', verifyError);
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    // Determine role (admin if email matches)
    const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Existing user - update if needed
      if (!user.emailVerified) {
        user.emailVerified = true; // Google emails are pre-verified
      }
      if (user.role !== role) {
        user.role = role; // Update role if changed
      }
      user.authProvider = 'google';
      await user.save();
    } else {
      // New user - create account with emailVerified = true (Google emails are verified)
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12), // Random password (won't be used)
        emailVerified: true, // Google emails are pre-verified
        authProvider: 'google',
        role,
        onboardingCompleted: false,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};
