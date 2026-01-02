import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // Use environment variables for email configuration
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');
  const emailSecure = process.env.EMAIL_SECURE === 'true';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM || emailUser;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

export const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter();
  if (!transporter) {
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
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  const transporter = createTransporter();
  if (!transporter) {
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
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

