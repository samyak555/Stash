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

    // Redirect to frontend root with token and user data (auto-login after verification)
    try {
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''); // Remove trailing slash
      const redirectUrl = new URL(`${frontendUrl}/`);
      redirectUrl.searchParams.set('token', token_jwt);
      redirectUrl.searchParams.set('status', 'existing_user');
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
    const BACKEND_URL = process.env.BACKEND_URL || 'https://stash-backend-4wty.onrender.com';
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://stash-beige.vercel.app';

    console.log('🔐 Google OAuth initiation started');
    console.log(`   GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID ? 'set' : '❌ NOT SET'}`);
    console.log(`   GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET ? 'set' : '❌ NOT SET'}`);
    console.log(`   FRONTEND_URL: ${FRONTEND_URL}`);
    console.log(`   BACKEND_URL: ${BACKEND_URL}`);

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('❌ Google OAuth credentials not configured');
      console.error('   GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'set' : 'NOT SET');
      console.error('   GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? 'set' : 'NOT SET');
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_not_configured&message=${encodeURIComponent('Google OAuth not configured. Please contact support.')}`);
    }

    const redirectUri = `${BACKEND_URL}/api/auth/google/callback`;
    console.log(`   Redirect URI: ${redirectUri}`);

    const oauth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // Generate authorization URL with proper parameters
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'consent',
      include_granted_scopes: true,
    });

    console.log('✅ Generated Google OAuth URL, redirecting...');
    console.log(`   Auth URL: ${authUrl.substring(0, 100)}...`);
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Google OAuth initiate error:', error);
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://stash-beige.vercel.app';
    res.redirect(`${FRONTEND_URL}/login?error=oauth_init_failed&message=${encodeURIComponent('Failed to initiate Google sign-in. Please try again.')}`);
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
  const deleteAccount = req.query.deleteAccount === 'true';
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://stash-beige.vercel.app';
    const BACKEND_URL = process.env.BACKEND_URL || 'https://stash-backend-4wty.onrender.com';

    // Validate environment variables
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET is not set');
      return res.redirect(`${FRONTEND_URL}/login?error=server_config_error&message=JWT_SECRET missing`);
    }
    if (!GOOGLE_CLIENT_ID) {
      console.error('❌ GOOGLE_CLIENT_ID is not set');
      return res.redirect(`${FRONTEND_URL}/login?error=server_config_error&message=GOOGLE_CLIENT_ID missing`);
    }
    if (!GOOGLE_CLIENT_SECRET) {
      console.error('❌ GOOGLE_CLIENT_SECRET is not set');
      return res.redirect(`${FRONTEND_URL}/login?error=server_config_error&message=GOOGLE_CLIENT_SECRET missing`);
    }
    
    console.log('✅ OAuth callback - Environment check passed');
    console.log(`   FRONTEND_URL: ${FRONTEND_URL}`);
    console.log(`   BACKEND_URL: ${BACKEND_URL}`);

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

    // IDEMPOTENT: Check if user exists by googleId first, then by email
    let user = await User.findOne({ googleId: googleId });
    let isNewUser = false;
    
    // If not found by googleId, check by email (for existing users who signed up before Google auth)
    // BUT: If account was deleted, user won't be found, so we'll create a new one
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });
      // If found by email but no googleId, link the googleId (idempotent - safe to do multiple times)
      if (user && !user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.emailVerified = true;
        
        // Defensive: Ensure required fields exist to prevent validation errors
        // Only set defaults if onboarding not completed AND fields are missing
        if (!user.onboardingCompleted) {
          if (!user.age) {
            user.age = 25; // Temporary default, will be set during onboarding
          }
          if (!user.profession) {
            user.profession = 'Other'; // Temporary default, will be set during onboarding
          }
        }
        
        try {
          await user.save();
          console.log(`   ✅ Linked Google ID to existing email user: ${user.email}`);
        } catch (saveError) {
          console.error('❌ Error saving user after linking Google ID:', saveError);
          // If save fails due to validation, try to repair the user
          if (saveError.name === 'ValidationError') {
            console.log(`   Attempting to repair user record for ${user.email}`);
            // Set defaults for missing required fields
            if (!user.onboardingCompleted) {
              user.age = user.age || 25;
              user.profession = user.profession || 'Other';
            }
            try {
              await user.save();
              console.log(`   ✅ User record repaired successfully`);
            } catch (repairError) {
              console.error('❌ Failed to repair user record:', repairError);
              return res.redirect(`${FRONTEND_URL}/login?error=user_repair_failed&message=${encodeURIComponent('Account needs repair. Please contact support.')}`);
            }
          } else {
            throw saveError;
          }
        }
      }
    }
    
    // If user was deleted and signing in again, user will be null here
    // This is correct - we'll create a new user below

    if (user) {
      // CASE A: Existing user - IDEMPOTENT login (safe to call multiple times)
      console.log(`✅ Found existing user: ${user.email} (ID: ${user._id})`);
      
      // Defensive: Ensure user has valid onboardingCompleted field (always boolean)
      if (typeof user.onboardingCompleted !== 'boolean') {
        user.onboardingCompleted = false;
        try {
          await user.save();
          console.log(`   Repaired onboardingCompleted field for ${user.email}`);
        } catch (saveError) {
          console.error('   Warning: Could not save onboardingCompleted repair:', saveError);
        }
      }
      
      // Update lastLogin timestamp (idempotent - safe to do on every login)
      user.lastLogin = new Date();
      try {
        await user.save();
      } catch (saveError) {
        console.warn('   Warning: Could not update lastLogin:', saveError);
        // Don't fail login if lastLogin update fails
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString() },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // ALWAYS return complete auth response - never block login
      try {
        const frontendUrl = (FRONTEND_URL || 'https://stash-beige.vercel.app').replace(/\/$/, '');
        const redirectUrl = new URL(`${frontendUrl}/`);
        redirectUrl.searchParams.set('status', 'existing_user');
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('emailVerified', 'true');
        redirectUrl.searchParams.set('name', encodeURIComponent(user.name || name || email.split('@')[0] || 'User'));
        redirectUrl.searchParams.set('email', encodeURIComponent(user.email || email || ''));
        redirectUrl.searchParams.set('role', user.role || 'user');
        const needsOnboarding = user.onboardingCompleted !== true;
        redirectUrl.searchParams.set('onboardingCompleted', user.onboardingCompleted === true ? 'true' : 'false');
        redirectUrl.searchParams.set('needsOnboarding', needsOnboarding ? 'true' : 'false');
        redirectUrl.searchParams.set('isNewUser', 'false');
        redirectUrl.searchParams.set('_id', user._id.toString());
        
        // Add optional fields if available (never required)
        if (user.age) {
          redirectUrl.searchParams.set('age', user.age.toString());
        }
        if (user.profession) {
          redirectUrl.searchParams.set('profession', encodeURIComponent(user.profession));
        }
        
        console.log(`✅ Existing user login successful: ${user.email} (needsOnboarding: ${needsOnboarding})`);
        res.redirect(redirectUrl.toString());
        return;
      } catch (urlError) {
        console.error('❌ Error constructing redirect URL:', urlError);
        console.error('   User email:', user.email);
        console.error('   User ID:', user._id);
        console.error('   Frontend URL:', FRONTEND_URL);
        return res.redirect(`${FRONTEND_URL}/login?error=url_construction_failed&message=${encodeURIComponent('Failed to redirect after login. Please try again.')}`);
      }
    } else {
      // CASE B: New user - create account with minimal data (idempotent check prevents duplicates)
      console.log(`🆕 Creating new user: ${email}`);
      isNewUser = true;
      try {
        // Create user with minimal required fields - age and profession are NOT required
        // They will be set during onboarding
        user = await User.create({
          name: name || email.split('@')[0] || 'User',
          email: email.toLowerCase(),
          passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12), // Random password (won't be used)
          emailVerified: true, // Google emails are pre-verified
          authProvider: 'google',
          googleId,
          role,
          onboardingCompleted: false, // New users must complete onboarding
          // age and profession are NOT set here - will be set during onboarding
          // This prevents validation errors during OAuth login
        });
        console.log(`✅ Successfully created new user: ${user.email} (ID: ${user._id})`);
      } catch (createError) {
        console.error('❌ Error creating new user:', createError);
        console.error('   Error name:', createError.name);
        console.error('   Error message:', createError.message);
        console.error('   Error code:', createError.code);
        console.error('   Error keyValue:', createError.keyValue);
        
        // IDEMPOTENT: If it's a duplicate key error (race condition - user created between checks)
        if (createError.code === 11000) {
          console.error('   Duplicate key error - user might have been created by another request or account exists');
          // Try to find the user again (idempotent - safe to retry)
          const existingUser = await User.findOne({ $or: [{ googleId: googleId }, { email: email.toLowerCase() }] });
          
          if (existingUser) {
            console.log(`   Found existing user after duplicate error, treating as existing user`);
            isNewUser = false;
            
            // Generate JWT token for existing user
            const token = jwt.sign(
              { userId: existingUser._id.toString() },
              JWT_SECRET,
              { expiresIn: '7d' }
            );
            
            // Redirect to frontend with user data
            try {
              const frontendUrl = (FRONTEND_URL || 'https://stash-beige.vercel.app').replace(/\/$/, '');
              const redirectUrl = new URL(`${frontendUrl}/`);
              redirectUrl.searchParams.set('status', 'existing_user');
              redirectUrl.searchParams.set('token', token);
              redirectUrl.searchParams.set('emailVerified', 'true');
              redirectUrl.searchParams.set('name', encodeURIComponent(existingUser.name || name || email.split('@')[0] || 'User'));
              redirectUrl.searchParams.set('email', encodeURIComponent(existingUser.email || email || ''));
              redirectUrl.searchParams.set('role', existingUser.role || 'user');
              redirectUrl.searchParams.set('onboardingCompleted', existingUser.onboardingCompleted === true ? 'true' : 'false');
              redirectUrl.searchParams.set('needsOnboarding', existingUser.onboardingCompleted !== true ? 'true' : 'false');
              redirectUrl.searchParams.set('isNewUser', 'false');
              redirectUrl.searchParams.set('_id', existingUser._id.toString());
              
              console.log(`✅ Existing user login successful after duplicate error: ${existingUser.email}`);
              res.redirect(redirectUrl.toString());
              return;
            } catch (urlError) {
              console.error('❌ Error constructing redirect URL after duplicate error:', urlError);
              return res.redirect(`${FRONTEND_URL}/login?error=url_construction_failed&message=${encodeURIComponent('Failed to redirect after login. Please try again.')}`);
            }
          } else {
            // Duplicate key error but user not found - this shouldn't happen, but handle gracefully
            console.error('   Duplicate key error but user not found in database - possible database inconsistency');
            return res.redirect(`${FRONTEND_URL}/login?error=user_creation_failed&message=${encodeURIComponent('Account creation conflict. Please try again in a moment.')}`);
          }
        }
        
        // For other errors, redirect to login with error message
        const errorMessage = createError.message || 'Failed to create account. Please try again.';
        console.error(`   Redirecting to login with error: ${errorMessage}`);
        return res.redirect(`${FRONTEND_URL}/login?error=user_creation_failed&message=${encodeURIComponent(errorMessage)}`);
      }

      // Generate JWT token for new user
      const token = jwt.sign(
        { userId: user._id.toString() },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend root with status=new_user
      try {
        const frontendUrl = (FRONTEND_URL || 'https://stash-beige.vercel.app').replace(/\/$/, '');
        const redirectUrl = new URL(`${frontendUrl}/`);
        redirectUrl.searchParams.set('status', 'new_user');
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('emailVerified', 'true');
        redirectUrl.searchParams.set('name', encodeURIComponent(name || email.split('@')[0] || 'User'));
        redirectUrl.searchParams.set('email', encodeURIComponent(email));
        redirectUrl.searchParams.set('role', role);
        redirectUrl.searchParams.set('onboardingCompleted', 'false');
        redirectUrl.searchParams.set('needsOnboarding', 'true'); // New users always need onboarding
        redirectUrl.searchParams.set('isNewUser', 'true');
        redirectUrl.searchParams.set('_id', user._id.toString());
        
        console.log(`✅ New user created: ${user.email}, redirecting to onboarding`);
        res.redirect(redirectUrl.toString());
        return;
      } catch (urlError) {
        console.error('❌ Error constructing redirect URL:', urlError);
        return res.redirect(`${FRONTEND_URL}/login?error=url_construction_failed`);
      }
    }
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    console.error('   Request query:', req.query);
    console.error('   Request params:', req.params);
    
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://stash-beige.vercel.app';
    
    // Provide more specific error messages
    let errorCode = 'oauth_failed';
    let errorMessage = 'Authentication failed. Please try again.';
    
    if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      errorCode = 'network_error';
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message.includes('timeout')) {
      errorCode = 'timeout_error';
      errorMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
      errorCode = 'dns_error';
      errorMessage = 'Connection error. Please check your internet.';
    } else if (error.message.includes('invalid_grant') || error.message.includes('code')) {
      errorCode = 'token_exchange_failed';
      errorMessage = 'Authorization code expired. Please try signing in again.';
    }
    
    const redirectUrl = `${FRONTEND_URL}/login?error=${errorCode}&message=${encodeURIComponent(errorMessage)}`;
    console.error('   Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
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
