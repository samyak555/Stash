import nodemailer from 'nodemailer';

// Production-grade Gmail SMTP Email Service
let transporter = null;
let isConfigured = false;
let isVerified = false;

/**
 * Initialize Gmail SMTP transporter with proper configuration
 * Uses TLS on port 587 (Gmail standard)
 */
const initializeTransporter = async () => {
  // Read credentials from environment variables
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS; // Gmail App Password (16 characters)
  const emailFrom = process.env.EMAIL_FROM || emailUser;

  // Production environment: Fail if email is not configured
  if (process.env.NODE_ENV === 'production') {
    if (!emailUser || !emailPass) {
      console.error('❌ Email service REQUIRED in production but not configured');
      console.error('   Set EMAIL_USER and EMAIL_PASS environment variables');
      console.error('   For Gmail: Use App Password from https://myaccount.google.com/apppasswords');
      throw new Error('Email service not configured - required in production');
    }
  }

  // Development: Warn but continue
  if (!emailUser || !emailPass) {
    console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
    console.warn('   For Gmail: Use App Password (not regular password)');
    console.warn('   Get App Password: https://myaccount.google.com/apppasswords');
    isConfigured = false;
    return null;
  }

  // Create transporter with Gmail SMTP settings (production-ready)
  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: false, // Use TLS (port 587)
    requireTLS: true, // Require TLS encryption
    auth: {
      user: emailUser,
      pass: emailPass, // Gmail App Password
    },
    connectionTimeout: 15000, // 15 seconds connection timeout
    greetingTimeout: 15000, // 15 seconds greeting timeout
    socketTimeout: 15000, // 15 seconds socket timeout
    tls: {
      rejectUnauthorized: true, // Reject unauthorized certificates in production
      ciphers: 'SSLv3',
    },
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
  });

  isConfigured = true;
  return transporter;
};

/**
 * Verify SMTP connection (called on startup)
 * This ensures emails will actually work before accepting requests
 */
export const verifySMTPConnection = async () => {
  try {
    if (!transporter) {
      transporter = await initializeTransporter();
    }

    if (!transporter || !isConfigured) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Email service not configured - cannot start in production');
      }
      console.warn('⚠️  Email service not configured - emails will be skipped');
      return false;
    }

    // Verify SMTP connection
    await transporter.verify();
    
    console.log('✅ Gmail SMTP connection verified successfully');
    console.log(`   Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}:${process.env.EMAIL_PORT || '587'}`);
    console.log(`   From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
    console.log('   ✅ Ready to send emails');
    
    isVerified = true;
    return true;
  } catch (error) {
    console.error('❌ SMTP connection verification FAILED:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('   🔐 Authentication failed');
      console.error('   → Check EMAIL_USER and EMAIL_PASS are correct');
      console.error('   → For Gmail: Use App Password (16 chars), not regular password');
      console.error('   → Get App Password: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('   🌐 Connection failed');
      console.error('   → Check EMAIL_HOST and EMAIL_PORT');
      console.error('   → Verify network connectivity to smtp.gmail.com:587');
      console.error('   → Check firewall/security group settings');
    } else if (error.code === 'EENVELOPE') {
      console.error('   📧 Email configuration error');
      console.error('   → Check EMAIL_FROM format');
    } else {
      console.error('   Error code:', error.code);
      console.error('   Error details:', error.message);
    }

    isVerified = false;
    
    // In production, fail startup if email is required
    if (process.env.NODE_ENV === 'production') {
      console.error('   ❌ Cannot start in production without working email service');
      throw error;
    }
    
    return false;
  }
};

// Initialize transporter on module load
transporter = initializeTransporter().catch((error) => {
  console.error('Failed to initialize email transporter:', error.message);
  transporter = null;
});

// Get transporter (ensure it's initialized)
const getTransporter = async () => {
  if (!transporter) {
    transporter = await initializeTransporter();
  }
  if (!transporter || !isConfigured) {
    throw new Error('Email service not configured');
  }
  return transporter;
};

/**
 * Send welcome email on user registration (non-blocking)
 * This is the registration confirmation email - does NOT block login
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const mailTransporter = await getTransporter();
    
    if (!isVerified) {
      console.warn('⚠️  Welcome email skipped - SMTP not verified');
      return null;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Stash! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Stash</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0E1116; color: #E5E7EB; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #181D26; border-radius: 16px; padding: 40px; border: 1px solid #2A2F3A;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #5EEAD4; font-size: 32px; margin: 0;">Stash</h1>
                <p style="color: #9CA3AF; font-size: 14px; margin-top: 8px;">Secure. Grow. Succeed.</p>
              </div>
              
              <h2 style="color: #E5E7EB; font-size: 24px; margin-bottom: 20px;">Welcome to Stash, ${name || 'there'}! 🎉</h2>
              
              <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Thank you for joining Stash! We're excited to help you take control of your finances.
              </p>
              
              <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                You can now log in and start tracking your income, expenses, and financial goals.
              </p>
              
              <div style="background-color: #1F2530; border-left: 4px solid #5EEAD4; padding: 16px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #E5E7EB; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>Get started:</strong><br>
                  1. Log in to your account<br>
                  2. Complete the quick onboarding<br>
                  3. Start tracking your finances!
                </p>
              </div>
              
              <p style="color: #6B7280; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #2A2F3A;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Welcome to Stash, ${name || 'there'}! You can now log in and start tracking your finances.`,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${email}`);
    return info;
  } catch (error) {
    // Log error but don't throw - welcome email is non-blocking
    console.error('❌ Error sending welcome email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed - check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('   Connection failed - check network connectivity');
    }
    // Never expose email errors to frontend
    return null;
  }
};

/**
 * Send email verification email (non-blocking)
 * Note: Verification does NOT block login in this implementation
 */
export const sendVerificationEmail = async (email, token) => {
  try {
    const mailTransporter = await getTransporter();
    
    if (!isVerified) {
      throw new Error('Email service not verified');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Stash account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your Stash account</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0E1116; color: #E5E7EB; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #181D26; border-radius: 16px; padding: 40px; border: 1px solid #2A2F3A;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #5EEAD4; font-size: 32px; margin: 0;">Stash</h1>
                <p style="color: #9CA3AF; font-size: 14px; margin-top: 8px;">Secure. Grow. Succeed.</p>
              </div>
              
              <h2 style="color: #E5E7EB; font-size: 24px; margin-bottom: 20px;">Verify your email address</h2>
              
              <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Thanks for signing up for Stash! Please verify your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #5EEAD4 0%, #2563EB 50%, #6EE7B7 100%); color: #0E1116; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #5EEAD4; font-size: 12px; word-break: break-all; margin-top: 10px;">
                ${verificationUrl}
              </p>
              
              <p style="color: #6B7280; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #2A2F3A;">
                This verification link will expire in 24 hours. If you didn't create a Stash account, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Verify your Stash account by visiting: ${verificationUrl}`,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${email}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed - check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('   Connection failed - check EMAIL_HOST and EMAIL_PORT');
    }
    throw error;
  }
};

/**
 * Send password reset email (CRITICAL - must work)
 * Returns error if fails (no fake success)
 */
export const sendPasswordResetEmail = async (email, token) => {
  try {
    const mailTransporter = await getTransporter();
    
    if (!isVerified) {
      throw new Error('Email service not verified - cannot send password reset email');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your Stash password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your Stash password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0E1116; color: #E5E7EB; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #181D26; border-radius: 16px; padding: 40px; border: 1px solid #2A2F3A;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #5EEAD4; font-size: 32px; margin: 0;">Stash</h1>
                <p style="color: #9CA3AF; font-size: 14px; margin-top: 8px;">Secure. Grow. Succeed.</p>
              </div>
              
              <h2 style="color: #E5E7EB; font-size: 24px; margin-bottom: 20px;">Reset your password</h2>
              
              <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #5EEAD4 0%, #2563EB 50%, #6EE7B7 100%); color: #0E1116; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #5EEAD4; font-size: 12px; word-break: break-all; margin-top: 10px;">
                ${resetUrl}
              </p>
              
              <p style="color: #6B7280; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #2A2F3A;">
                This password reset link will expire in 15 minutes. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Reset your Stash password by visiting: ${resetUrl}`,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${email}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed - check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('   Connection failed - check EMAIL_HOST and EMAIL_PORT');
    }
    // Throw error - password reset email failure must be reported
    throw error;
  }
};

/**
 * Send password change confirmation email (non-blocking)
 */
export const sendPasswordChangeConfirmation = async (email, name) => {
  try {
    const mailTransporter = await getTransporter();
    
    if (!isVerified) {
      console.warn('⚠️  Password change confirmation email skipped - SMTP not verified');
      return null;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Password changed successfully',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password changed successfully</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0E1116; color: #E5E7EB; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #181D26; border-radius: 16px; padding: 40px; border: 1px solid #2A2F3A;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #5EEAD4; font-size: 32px; margin: 0;">Stash</h1>
                <p style="color: #9CA3AF; font-size: 14px; margin-top: 8px;">Secure. Grow. Succeed.</p>
              </div>
              
              <h2 style="color: #E5E7EB; font-size: 24px; margin-bottom: 20px;">Password changed successfully</h2>
              
              <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Hi ${name || 'there'},
              </p>
              
              <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Your Stash account password has been changed successfully. You can now log in with your new password.
              </p>
              
              <div style="background-color: #1F2530; border-left: 4px solid #5EEAD4; padding: 16px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #E5E7EB; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>Security tip:</strong> If you didn't make this change, please contact our support team immediately.
                </p>
              </div>
              
              <p style="color: #6B7280; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #2A2F3A;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Your Stash account password has been changed successfully. If you didn't make this change, please contact support immediately.`,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log('✅ Password change confirmation email sent successfully');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${email}`);
    return info;
  } catch (error) {
    // Log error but don't throw - confirmation email is non-blocking
    console.error('❌ Error sending password change confirmation email:', error.message);
    return null;
  }
};

// Export status for health checks
export const isEmailConfigured = () => isConfigured;
export const isEmailVerified = () => isVerified;
