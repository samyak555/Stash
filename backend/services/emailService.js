/**
 * Production-Grade Email Service for Stash
 * Uses nodemailer with Gmail SMTP (Port 465 SSL)
 * 
 * Environment Variables Required:
 * - EMAIL_HOST (default: smtp.gmail.com)
 * - EMAIL_PORT (default: 465)
 * - EMAIL_USER (Gmail address)
 * - EMAIL_PASS (Gmail App Password)
 * - EMAIL_FROM (optional, defaults to EMAIL_USER)
 */

import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Initialize email transporter
 * Creates a reusable transporter instance
 */
const initializeTransporter = () => {
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '465');
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Validate required environment variables
  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
  }

  // Determine if using SSL (port 465) or TLS (port 587)
  const useSSL = emailPort === 465 || process.env.EMAIL_SECURE === 'true';
  
  // Create transporter with production-ready configuration
  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: useSSL, // true for port 465 (SSL), false for port 587 (TLS)
    requireTLS: !useSSL, // Only require TLS if not using SSL
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 30000, // 30 seconds for Render
    greetingTimeout: 30000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
    pool: true, // Use connection pooling
    maxConnections: 1,
    maxMessages: 3,
    logger: false,
    debug: false,
  });

  return transporter;
};

/**
 * Get or create email transporter
 */
const getTransporter = () => {
  if (!transporter) {
    try {
      transporter = initializeTransporter();
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error.message);
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }
  }
  return transporter;
};

/**
 * Send email with OTP
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User name (optional)
 * @param {string} subject - Email subject (optional)
 * @returns {Promise} - Nodemailer sendMail result
 */
export const sendOTPEmail = async (to, otp, name = '', subject = 'Your Stash verification code') => {
  try {
    const mailTransporter = getTransporter();
    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const mailOptions = {
      from: emailFrom,
      to: to,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0E1116; color: #E5E7EB; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #181D26; border-radius: 16px; padding: 40px; border: 1px solid #2A2F3A;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #5EEAD4; font-size: 32px; margin: 0;">Stash</h1>
                <p style="color: #9CA3AF; font-size: 14px; margin-top: 8px;">Secure. Grow. Succeed.</p>
              </div>
              
              <h2 style="color: #E5E7EB; font-size: 24px; margin-bottom: 20px;">Your verification code</h2>
              
              <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                ${name ? `Hi ${name},<br><br>` : ''}Use this code to verify your email address:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #5EEAD4 0%, #2563EB 50%, #6EE7B7 100%); padding: 20px 40px; border-radius: 12px;">
                  <div style="font-size: 36px; font-weight: 700; color: #0E1116; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${otp}
                  </div>
                </div>
              </div>
              
              <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              
              <div style="background-color: #1F2530; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #E5E7EB; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>Security notice:</strong> Never share this code with anyone. Stash will never ask for your verification code.
                </p>
              </div>
              
              <p style="color: #6B7280; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #2A2F3A;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Your Stash verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   → Authentication failed - check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('   → Connection failed - check EMAIL_HOST and EMAIL_PORT');
    }
    throw error;
  }
};

/**
 * Send password reset link email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Secure reset token
 * @returns {Promise} - Nodemailer sendMail result
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const mailTransporter = getTransporter();
    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: emailFrom,
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
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0E1116; color: #E5E7EB; padding: 20px;">
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
      text: `Reset your Stash password by visiting: ${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request a password reset, please ignore this email.`,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to ${email}`);
    console.log(`   Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    throw error;
  }
};

/**
 * Send password change confirmation email
 * @param {string} email - Recipient email address
 * @param {string} name - User name
 * @returns {Promise} - Nodemailer sendMail result
 */
export const sendPasswordChangeConfirmation = async (email, name) => {
  try {
    const mailTransporter = getTransporter();
    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const mailOptions = {
      from: emailFrom,
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
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0E1116; color: #E5E7EB; padding: 20px;">
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
    console.log(`✅ Password change confirmation email sent to ${email}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending password change confirmation:', error.message);
    return null; // Non-blocking
  }
};

/**
 * Verify email service configuration
 * @returns {Promise<{success: boolean, error?: string, details?: any}>} - Verification result with details
 */
export const verifyEmailService = async () => {
  try {
    // Check if environment variables are set
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = process.env.EMAIL_PORT || '465';

    if (!emailUser || !emailPass) {
      return {
        success: false,
        error: 'EMAIL_USER and EMAIL_PASS environment variables are not set',
        details: {
          EMAIL_USER: emailUser ? 'set' : 'not set',
          EMAIL_PASS: emailPass ? 'set' : 'not set',
          EMAIL_HOST: emailHost,
          EMAIL_PORT: emailPort,
        },
      };
    }

    // Get or create transporter
    let mailTransporter;
    try {
      mailTransporter = getTransporter();
    } catch (transporterError) {
      return {
        success: false,
        error: 'Failed to create email transporter: ' + transporterError.message,
        details: {
          EMAIL_USER: 'set',
          EMAIL_PASS: 'set',
          EMAIL_HOST: emailHost,
          EMAIL_PORT: emailPort,
        },
      };
    }

    // Verify SMTP connection with retry logic
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Attempting SMTP verification (attempt ${attempt}/3)...`);
        await mailTransporter.verify();
        console.log('✅ Email service verified successfully');
        return {
          success: true,
          details: {
            EMAIL_HOST: emailHost,
            EMAIL_PORT: emailPort,
            EMAIL_USER: emailUser,
            EMAIL_FROM: process.env.EMAIL_FROM || emailUser,
            attempts: attempt,
          },
        };
      } catch (verifyError) {
        lastError = verifyError;
        console.error(`Attempt ${attempt} failed:`, verifyError.message);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }

    // All attempts failed
    throw lastError;
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message);
    console.error('   Error code:', error.code);

    let errorMessage = 'Email service verification failed';
    let errorDetails = {};

    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed - check EMAIL_USER and EMAIL_PASS';
      errorDetails = {
        issue: 'Authentication failed',
        solution: 'Verify EMAIL_PASS is a Gmail App Password (16 characters), not regular password',
        help: 'Get App Password: https://myaccount.google.com/apppasswords',
        errorCode: error.code,
      };
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      errorMessage = 'SMTP connection failed - network or firewall issue';
      errorDetails = {
        issue: 'Connection failed',
        solution: 'This may be a temporary network issue. Try again in a few minutes.',
        troubleshooting: [
          'Check if Gmail is blocking connections from Render',
          'Verify Render service is not in sleep mode',
          'Try using port 465 with secure: true instead',
          'Check Render logs for more details',
        ],
        EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
        EMAIL_PORT: process.env.EMAIL_PORT || '465',
        errorCode: error.code,
        errorMessage: error.message,
      };
    } else {
      errorDetails = {
        errorCode: error.code,
        errorMessage: error.message,
        fullError: error.toString(),
      };
    }

    return {
      success: false,
      error: errorMessage,
      details: errorDetails,
    };
  }
};
