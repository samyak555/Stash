/**
 * Production-Grade Authentication Controller for Stash
 * Implements secure email + password + verification token authentication
 * and Google OAuth 2.0 Authorization Code Flow
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { validateEmail } from '../utils/emailValidation.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangeConfirmation } from '../services/emailService.js';

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

// Generate secure verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash token using SHA-256
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Admin email (hardcoded for security)
const ADMIN_EMAIL = 'administrator-stash.auth7@gmail.com';

/**
 * Register new user with email verification
 * POST /api/auth/register
 * - Validates email format
 * - Hashes password with bcrypt (12 rounds)
 * - Creates user with emailVerified=false
 * - Generates secure verification token
 * - Sends welcome + verification email via SMTP
 */
export const register = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const { name, email, password, gender, age, profession } = req.body;
    
    // Validate required fields (confirmPassword is NOT sent to backend)
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

    // Generate secure verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenHash = hashToken(verificationToken); // Hash token before storing
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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
      verificationToken: verificationTokenHash, // Store hashed token
      verificationTokenExpiry,
      authProvider: 'local',
      role,
      onboardingCompleted: false,
    });

    // Send welcome + verification email via SMTP
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken); // Send plain token in email
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError.message);
      console.error('   Error details:', emailError);
      // Delete user if email fails (user cannot verify without email)
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please check your email configuration and try again.',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

    // Return user data (NO TOKEN - user cannot login until verified)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: false,
      message: 'Registration successful! Please check your email to verify your account.',
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
 * Verify email with token
 * GET /api/auth/verify-email?token=...
 * - Verifies token and expiry
 * - Marks emailVerified = true
 * - Returns JWT token
 */
export const verifyEmail = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const { token } = req.query;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    if (!token) {
      const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${FRONTEND_URL}/login?error=no_token`);
    }

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find user with matching verification token (hashed)
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${FRONTEND_URL}/login?error=invalid_or_expired_token`);
    }

    // Mark email as verified and clear token
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Generate JWT token (user can now login)
    const token_jwt = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend auth callback with token and user data (auto-login after verification)
    try {
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''); // Remove trailing slash
      const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
      redirectUrl.searchParams.set('token', token_jwt);
      redirectUrl.searchParams.set('emailVerified', 'true');
      redirectUrl.searchParams.set('name', encodeURIComponent(user.name));
      redirectUrl.searchParams.set('email', encodeURIComponent(user.email));
      redirectUrl.searchParams.set('role', user.role || 'user');
      redirectUrl.searchParams.set('onboardingCompleted', user.onboardingCompleted ? 'true' : 'false');
      redirectUrl.searchParams.set('_id', user._id.toString());
      redirectUrl.searchParams.set('message', 'Email verified successfully!');
      
      res.redirect(redirectUrl.toString());
    } catch (urlError) {
      console.error('Error constructing redirect URL:', urlError);
      // Fallback: redirect to login with token in query
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?token=${token_jwt}&emailVerified=true`);
    }
  } catch (error) {
    console.error('Email verification error:', error.message);
    res.status(500).json({ message: 'Email verification failed' });
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 * - Rate limited (max 3 per hour)
 * - Generates new verification token
 * - Sends verification email
 */
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.json({ message: 'If an account exists with this email, a verification email has been sent.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token (invalidate previous)
    const verificationToken = generateVerificationToken();
    const verificationTokenHash = hashToken(verificationToken); // Hash token before storing
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationTokenHash; // Store hashed token
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      res.json({ message: 'Verification email sent. Please check your inbox.' });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('Resend verification error:', error.message);
    res.status(500).json({ message: 'Failed to resend verification email' });
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
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
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

    // Send password reset email via SMTP
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
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
 * Google OAuth 2.0 - Initiate authorization
 * GET /api/auth/google
 * - Redirects to Google OAuth consent screen
 * - Uses Authorization Code Flow
 */
export const googleAuthInitiate = async (req, res) => {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const BACKEND_URL = process.env.BACKEND_URL || `https://stash-backend-4wty.onrender.com`;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth credentials not configured');
      return res.status(500).json({ message: 'Google OAuth not configured' });
    }

    const oauth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      `${BACKEND_URL}/api/auth/google/callback`
    );

    // Generate authorization URL with proper parameters
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      response_type: 'code',
      prompt: 'consent',
    });

    console.log('Redirecting to Google OAuth:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiate error:', error.message);
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${FRONTEND_URL}/login?error=oauth_init_failed`);
  }
};

/**
 * Google OAuth 2.0 - Callback handler
 * GET /api/auth/google/callback
 * - Exchanges authorization code for tokens
 * - Verifies Google ID token
 * - Creates or logs in user
 * - Issues JWT and redirects to frontend
 */
export const googleAuthCallback = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

    if (!JWT_SECRET || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const { code } = req.query;

    if (!code) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
    }

    const oauth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      `${BACKEND_URL}/api/auth/google/callback`
    );

    // Exchange authorization code for tokens
    let tokens;
    try {
      const { tokens: tokenData } = await oauth2Client.getToken(code);
      tokens = tokenData;
    } catch (error) {
      console.error('Google token exchange error:', error);
      return res.redirect(`${FRONTEND_URL}/login?error=token_exchange_failed`);
    }

    if (!tokens.id_token) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_id_token`);
    }

    // Verify ID token
    let ticket;
    try {
      ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error('Google token verification error:', verifyError);
      return res.redirect(`${FRONTEND_URL}/login?error=token_verification_failed`);
    }

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, email_verified } = payload;

    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_email`);
    }

    // MANDATORY: Only allow login if Google email is verified
    if (!email_verified) {
      return res.redirect(`${FRONTEND_URL}/login?error=email_not_verified`);
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
        user.role = role;
      }
      if (!user.googleId) {
        user.googleId = googleId;
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
        googleId,
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

    // Redirect to frontend with token and user data (include all data to avoid extra API call)
    try {
      const frontendUrl = (FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''); // Remove trailing slash
      const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('emailVerified', 'true');
      redirectUrl.searchParams.set('name', encodeURIComponent(user.name));
      redirectUrl.searchParams.set('email', encodeURIComponent(user.email));
      redirectUrl.searchParams.set('role', user.role || 'user');
      redirectUrl.searchParams.set('onboardingCompleted', user.onboardingCompleted ? 'true' : 'false');
      redirectUrl.searchParams.set('_id', user._id.toString());
      
      console.log(`✅ Google OAuth successful for ${user.email}, redirecting to frontend`);
      res.redirect(redirectUrl.toString());
    } catch (urlError) {
      console.error('Error constructing redirect URL:', urlError);
      // Fallback: redirect to login with token in query
      const frontendUrl = FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?token=${token}&emailVerified=true`);
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error.message);
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
};

/**
 * Google OAuth - Direct ID token verification (for frontend Google Sign-In button)
 * POST /api/auth/google
 * - Accepts Google ID token from frontend
 * - Verifies token on backend
 * - Creates or logs in user
 * - Returns JWT
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
    const { email, name, sub: googleId, email_verified } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    // MANDATORY: Only allow login if Google email is verified
    if (!email_verified) {
      return res.status(403).json({ message: 'Google email is not verified' });
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
        user.role = role;
      }
      if (!user.googleId) {
        user.googleId = googleId;
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
        googleId,
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
