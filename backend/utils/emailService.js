import nodemailer from 'nodemailer';

// Create reusable transporter with Gmail SMTP configuration
let transporter = null;
let isConfigured = false;

const initializeTransporter = () => {
  // Read credentials from environment variables
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS; // Gmail App Password
  const emailFrom = process.env.EMAIL_FROM || emailUser;

  // Check if email service is configured
  if (!emailUser || !emailPass) {
    console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
    console.warn('   For Gmail: Use App Password (not regular password)');
    isConfigured = false;
    return null;
  }

  // Create transporter with Gmail SMTP settings
  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: false, // Use TLS (port 587)
    requireTLS: true, // Require TLS
    auth: {
      user: emailUser,
      pass: emailPass, // Gmail App Password
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates (for development)
    },
  });

  // Verify SMTP connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP connection failed:', error.message);
      console.error('   Check your EMAIL_USER and EMAIL_PASS environment variables');
      console.error('   For Gmail: Ensure you\'re using an App Password, not your regular password');
      isConfigured = false;
    } else {
      console.log('✅ SMTP connection verified successfully');
      console.log(`   Host: ${emailHost}:${emailPort}`);
      console.log(`   From: ${emailFrom}`);
      isConfigured = true;
    }
  });

  return transporter;
};

// Initialize transporter on module load
transporter = initializeTransporter();

// Get or create transporter
const getTransporter = () => {
  if (!transporter) {
    transporter = initializeTransporter();
  }
  return transporter;
};

// Send welcome email (non-blocking)
export const sendWelcomeEmail = async (email, name) => {
  const mailTransporter = getTransporter();
  
  if (!mailTransporter || !isConfigured) {
    console.warn('⚠️  Welcome email skipped - email service not configured');
    return null; // Don't throw error, just skip
  }

  const mailOptions = {
    from: `"Stash" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
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
              To get started, please verify your email address by checking your inbox for a verification link.
            </p>
            
            <div style="background-color: #1F2530; border-left: 4px solid #5EEAD4; padding: 16px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #E5E7EB; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>Next steps:</strong><br>
                1. Check your inbox for the verification email<br>
                2. Click the verification link<br>
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
    text: `Welcome to Stash, ${name || 'there'}! Please verify your email address to get started.`,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    // Log error but don't throw - welcome email is non-blocking
    console.error('❌ Error sending welcome email:', error.message);
    console.error('   This will not block user registration');
    return null;
  }
};

// Send verification email
export const sendVerificationEmail = async (email, token) => {
  const mailTransporter = getTransporter();
  
  if (!mailTransporter || !isConfigured) {
    throw new Error('Email service not configured');
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Stash" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
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

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    console.log(`   To: ${email}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed - check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION') {
      console.error('   Connection failed - check EMAIL_HOST and EMAIL_PORT');
    }
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  const mailTransporter = getTransporter();
  
  if (!mailTransporter || !isConfigured) {
    throw new Error('Email service not configured');
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Stash" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
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

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    console.log(`   To: ${email}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed - check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION') {
      console.error('   Connection failed - check EMAIL_HOST and EMAIL_PORT');
    }
    throw error;
  }
};

// Export transporter status for health checks
export const isEmailConfigured = () => isConfigured;
