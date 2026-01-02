import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { validateEmail } from '../utils/emailValidation.js';
import { sendOTPEmail, sendPasswordResetOTP, sendPasswordChangeConfirmation } from '../utils/emailService.js';

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
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Admin email (hardcoded for security)
const ADMIN_EMAIL = 'administrator-stash.auth7@gmail.com';

/**
 * Register new user with mandatory OTP verification
 * User cannot login until email is verified via OTP
 */
export const register = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const {
      name,
      email,
      password,
      gender,
      age,
      profession,
    } = req.body;

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
    const validProfessions = [
      'Student',
      'Salaried',
      'Business',
      'Freelancer',
      'Homemaker',
      'Retired',
      'Other',
    ];
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

    // Hash password with salt rounds 12 (production-ready)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate 6-digit OTP
    const otp = generateOTP();
    // Hash OTP before storing (using bcrypt for security)
    const hashedOTP = await bcrypt.hash(otp, 12);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Determine role (admin if email matches)
    const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

    // Create user with emailVerified = false (MANDATORY - cannot login until verified)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      gender,
      age,
      profession,
      emailVerified: false, // MANDATORY - user cannot login until verified
      otp: hashedOTP,
      otpExpires,
      otpAttempts: 0,
      authProvider: 'email',
      role,
      onboardingCompleted: false,
    });

    // Send OTP email (MANDATORY - user needs this to verify)
    try {
      await sendOTPEmail(user.email, otp, user.name);
      console.log(`✅ OTP sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError.message);
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
    if (process.env.NODE_ENV === 'production') {
      console.error('Registration error:', error.message);
      res.status(500).json({ message: 'Registration failed' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message || 'Registration failed' });
    }
  }
};

/**
 * Verify OTP and activate user account
 * Maximum 3 attempts, OTP expires in 5 minutes
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
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    // Check if OTP expired
    if (user.otpExpires < new Date()) {
      user.otp = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Check attempt limit (maximum 3 attempts)
    if (user.otpAttempts >= 3) {
      // Reset OTP after max attempts
      user.otp = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new code.' });
    }

    // Verify OTP using bcrypt.compare
    const isOTPValid = await bcrypt.compare(otp, user.otp);
    if (!isOTPValid) {
      user.otpAttempts += 1;
      await user.save();
      const remainingAttempts = 3 - user.otpAttempts;
      return res.status(400).json({ 
        message: `Invalid verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Maximum attempts exceeded.'}` 
      });
    }

    // OTP verified successfully - activate user account
    user.emailVerified = true;
    user.otp = null; // Delete OTP after successful verification
    user.otpExpires = null;
    user.otpAttempts = 0;
    // Sync isVerified for backward compatibility
    user.isVerified = true;
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
 */
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If an account exists with this email, a verification code has been sent.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 12);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = hashedOTP;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0; // Reset attempts
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
 * Users MUST verify email via OTP before login
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
    const isPasswordValid = await bcrypt.compare(password, user.password);
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
 * Forgot password - send OTP instead of reset link
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
      return res.json({ message: 'If an account exists with this email, a password reset code has been sent.' });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 12);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = hashedOTP;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0;
    await user.save();

    // Send password reset OTP email
    try {
      await sendPasswordResetOTP(user.email, otp);
      res.json({ message: 'If an account exists with this email, a password reset code has been sent.' });
    } catch (emailError) {
      console.error('Failed to send password reset OTP:', emailError);
      // Clear OTP if email fails
      user.otp = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      res.status(500).json({ message: 'Failed to send password reset code' });
    }
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
};

/**
 * Reset password with OTP verification
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and password are required' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP exists
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'No password reset code found. Please request a new one.' });
    }

    // Check if OTP expired
    if (user.otpExpires < new Date()) {
      user.otp = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Password reset code has expired. Please request a new one.' });
    }

    // Check attempt limit
    if (user.otpAttempts >= 3) {
      user.otp = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new code.' });
    }

    // Verify OTP
    const isOTPValid = await bcrypt.compare(otp, user.otp);
    if (!isOTPValid) {
      user.otpAttempts += 1;
      await user.save();
      const remainingAttempts = 3 - user.otpAttempts;
      return res.status(400).json({ 
        message: `Invalid verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Maximum attempts exceeded.'}` 
      });
    }

    // OTP verified - reset password
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.otp = null; // Delete OTP after use
    user.otpExpires = null;
    user.otpAttempts = 0;
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
 * Google OAuth - Skip OTP (Google emails are pre-verified)
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

    // Verify Google ID token
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
        user.isVerified = true; // Sync for backward compatibility
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
        password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12), // Random password (won't be used)
        emailVerified: true, // Google emails are pre-verified
        isVerified: true, // Sync for backward compatibility
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
