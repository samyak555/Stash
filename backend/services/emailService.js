/**
 * Production-Grade Email Service for Stash
 * Supports both SendGrid (recommended) and Gmail SMTP
 * 
 * Environment Variables Required:
 * 
 * For SendGrid (Recommended):
 * - EMAIL_HOST: smtp.sendgrid.net
 * - EMAIL_PORT: 587 (TLS) or 465 (SSL)
 * - EMAIL_USER: apikey
 * - EMAIL_PASS: Your SendGrid API Key
 * - EMAIL_FROM: Your verified sender email (e.g., noreply@yourdomain.com)
 * 
 * For Gmail (Alternative):
 * - EMAIL_HOST: smtp.gmail.com
 * - EMAIL_PORT: 465 (SSL) or 587 (TLS)
 * - EMAIL_USER: Your Gmail address
 * - EMAIL_PASS: Gmail App Password
 * - EMAIL_FROM: Your Gmail address or formatted name
 * 
 * Common:
 * - FRONTEND_URL (for verification links)
 */

import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Initialize email transporter
 * Creates a reusable transporter instance
 */
const initializeTransporter = () => {
  const emailHost = process.env.EMAIL_HOST || 'smtp.sendgrid.net';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Validate required environment variables
  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
  }

  // Determine if using SSL (port 465) or TLS (port 587)
  const useSSL = emailPort === 465 || process.env.EMAIL_SECURE === 'true';
  
  // Detect if using SendGrid (username is 'apikey')
  const isSendGrid = emailHost.includes('sendgrid.net') || emailUser === 'apikey';
  
  // Create transporter with production-ready configuration
  // Optimized for both SendGrid and Gmail
  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: useSSL, // true for port 465 (SSL), false for port 587 (TLS)
    requireTLS: !useSSL, // Only require TLS if not using SSL
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: isSendGrid ? 30000 : 60000, // SendGrid is faster
    greetingTimeout: 30000,
    socketTimeout: isSendGrid ? 30000 : 60000, // SendGrid is faster
    tls: {
      rejectUnauthorized: true, // SendGrid uses valid certificates
      ciphers: isSendGrid ? undefined : 'SSLv3', // Let SendGrid choose
    },
    pool: false, // Disable pooling for better reliability on Render
    maxConnections: 1,
    maxMessages: 1,
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
 * Send welcome email with verification link
 * @param {string} to - Recipient email address
 * @param {string} name - User name
 * @param {string} verificationToken - Verification token
 * @returns {Promise} - Nodemailer sendMail result
 */
export const sendVerificationEmail = async (to, name, verificationToken) => {
  try {
    let mailTransporter;
    try {
      mailTransporter = getTransporter();
    } catch (transporterError) {
      console.error('❌ Failed to get email transporter:', transporterError.message);
      throw new Error('Email service not configured. Please check EMAIL_USER and EMAIL_PASS.');
    }
    
    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: emailFrom,
      to: to,
      subject: 'Welcome to Stash - Verify your email',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0E1116; color: #E5E7EB; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #181D26; border-radius: 16px; padding: 40px; border: 1px solid #2A2F3A;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #5EEAD4; font-size: 32px; margin: 0;">Stash</h1>
                <p style="color: #9CA3AF; font-size: 14px; margin-top: 8px;">Secure. Grow. Succeed.</p>
              </div>
              
              <h2 style="color: #E5E7EB; font-size: 24px; margin-bottom: 20px;">Welcome to Stash, ${name}!</h2>
              
              <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Thank you for signing up! To complete your registration and start managing your finances, please verify your email address by clicking the button below.
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
                This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Welcome to Stash, ${name}!\n\nPlease verify your email address by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Secure reset token
 * @param {string} name - User name
 * @returns {Promise} - Nodemailer sendMail result
 */
export const sendPasswordResetEmail = async (email, resetToken, name = 'there') => {
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
                Hi ${name},<br><br>
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
      text: `Hi ${name},\n\nReset your Stash password by visiting: ${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request a password reset, please ignore this email.`,
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
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST || 'smtp.sendgrid.net';
    const emailPort = process.env.EMAIL_PORT || '587';

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

    // Verify SMTP connection with timeout handling
    let lastError = null;
    const portsToTry = emailPort === 465 ? [465, 587] : [emailPort, 465]; // Try both ports
    
    for (const testPort of portsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`Attempting SMTP verification on port ${testPort} (attempt ${attempt}/2)...`);
          
          // Create a new transporter for this port if different
          let testTransporter = mailTransporter;
          if (testPort !== emailPort) {
            const useSSL = testPort === 465;
            testTransporter = nodemailer.createTransport({
              host: emailHost,
              port: testPort,
              secure: useSSL,
              requireTLS: !useSSL,
              auth: {
                user: emailUser,
                pass: emailPass,
              },
              connectionTimeout: 60000,
              greetingTimeout: 30000,
              socketTimeout: 60000,
              tls: {
                rejectUnauthorized: false,
              },
            });
          }
          
          // Verify with timeout
          const verifyPromise = testTransporter.verify();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Verification timeout after 60 seconds')), 60000)
          );
          
          await Promise.race([verifyPromise, timeoutPromise]);
          
          console.log(`✅ Email service verified successfully on port ${testPort}`);
          return {
            success: true,
            details: {
              EMAIL_HOST: emailHost,
              EMAIL_PORT: testPort,
              EMAIL_USER: emailUser,
              EMAIL_FROM: process.env.EMAIL_FROM || emailUser,
              attempts: attempt,
              note: testPort !== emailPort ? `Using port ${testPort} instead of ${emailPort}` : undefined,
            },
          };
        } catch (verifyError) {
          lastError = verifyError;
          console.error(`Port ${testPort}, attempt ${attempt} failed:`, verifyError.message);
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message);
    
    // Provide helpful error messages
    let errorMessage = error.message || 'Email service verification failed';
    let suggestion = '';
    
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      errorMessage = 'Connection timeout - Render free tier may block SMTP connections';
      suggestion = 'SendGrid works better on Render. Switch to SendGrid: 1) Sign up at sendgrid.com, 2) Create API key, 3) Update EMAIL_HOST=smtp.sendgrid.net, EMAIL_USER=apikey, EMAIL_PASS=your_api_key';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused - Check EMAIL_HOST and EMAIL_PORT';
      suggestion = emailHost.includes('sendgrid') 
        ? 'Verify SendGrid SMTP settings: smtp.sendgrid.net:587'
        : 'Verify SMTP settings are correct (SendGrid recommended)';
    } else if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed - Check EMAIL_USER and EMAIL_PASS';
      suggestion = emailHost.includes('sendgrid')
        ? 'Verify SendGrid API key is correct (EMAIL_USER should be "apikey")'
        : 'Verify Gmail App Password is correct and has no spaces';
    }
    
    return {
      success: false,
      error: errorMessage,
      details: {
        errorCode: error.code,
        errorMessage: error.message,
        suggestion: suggestion,
        troubleshooting: 'Email sending may still work even if verification fails. Try sending a test email.',
      },
    };
  }
};
