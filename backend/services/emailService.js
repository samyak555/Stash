/**
 * Reusable Email Service for Stash
 * Uses nodemailer with Gmail SMTP
 * 
 * Environment Variables Required:
 * - EMAIL_HOST (default: smtp.gmail.com)
 * - EMAIL_PORT (default: 587)
 * - EMAIL_USER (Gmail address)
 * - EMAIL_PASS (Gmail App Password)
 */

import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Initialize email transporter
 * Creates a reusable transporter instance
 */
const initializeTransporter = () => {
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Validate required environment variables
  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
  }

  // Create transporter
  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: false, // Use TLS (port 587)
    requireTLS: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

/**
 * Get or create email transporter
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = initializeTransporter();
  }
  return transporter;
};

/**
 * Send email with OTP
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} subject - Email subject (optional)
 * @returns {Promise} - Nodemailer sendMail result
 */
export const sendOTPEmail = async (to, otp, subject = 'Your Stash verification code') => {
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
                Use this code to verify your email address:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #5EEAD4 0%, #2563EB 50%, #6EE7B7 100%); padding: 20px 40px; border-radius: 12px;">
                  <div style="font-size: 36px; font-weight: 700; color: #0E1116; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${otp}
                  </div>
                </div>
              </div>
              
              <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                This code will expire in <strong>5 minutes</strong>.
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
      text: `Your Stash verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
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
 * Verify email service configuration
 * @returns {Promise<boolean>} - True if service is configured and working
 */
export const verifyEmailService = async () => {
  try {
    const mailTransporter = getTransporter();
    await mailTransporter.verify();
    console.log('✅ Email service verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message);
    return false;
  }
};

