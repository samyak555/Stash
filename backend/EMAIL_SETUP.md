# Email Service Configuration Guide

## Gmail SMTP Setup

The Stash backend uses Gmail SMTP for sending emails (verification, password reset, welcome emails).

### Required Environment Variables

Add these to your `.env` file or Render/Vercel environment variables:

```env
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
EMAIL_FROM=your-email@gmail.com

# Frontend URL (for email links)
FRONTEND_URL=https://your-frontend-domain.com
```

### Getting a Gmail App Password

1. **Enable 2-Step Verification** on your Google Account:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "Stash Backend" as the name
   - Click "Generate"
   - Copy the 16-character password (no spaces)

3. **Set Environment Variable**:
   - Use the generated App Password as `EMAIL_PASS`
   - **DO NOT** use your regular Gmail password

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_HOST` | No | `smtp.gmail.com` | SMTP server hostname |
| `EMAIL_PORT` | No | `587` | SMTP port (587 for TLS) |
| `EMAIL_USER` | **Yes** | - | Gmail address |
| `EMAIL_PASS` | **Yes** | - | Gmail App Password (16 chars) |
| `EMAIL_FROM` | No | `EMAIL_USER` | From address (display name) |
| `FRONTEND_URL` | No | `http://localhost:5173` | Frontend URL for email links |

### Email Features

1. **Welcome Email** (non-blocking):
   - Sent on user signup
   - Does NOT block registration if it fails
   - Fire-and-forget

2. **Verification Email** (non-blocking):
   - Sent on user signup
   - Does NOT block registration if it fails
   - Contains verification link (24h expiry)

3. **Password Reset Email** (blocking):
   - Sent on forgot-password request
   - Returns error if email fails
   - Contains reset link (15min expiry)

### SMTP Connection Verification

On server startup, the email service will:
- ✅ Verify SMTP connection
- ✅ Log connection status
- ✅ Show configuration details (host, port, from address)

### Error Handling

- **Welcome/Verification emails**: Failures are logged but don't block user registration
- **Password reset emails**: Failures return proper error response (no fake success)
- **Connection errors**: Clear error messages with troubleshooting hints

### Security Notes

- ✅ Tokens are hashed before storing in database
- ✅ No plaintext tokens in logs
- ✅ Environment variables are never exposed
- ✅ TLS encryption for all SMTP connections

### Testing

To test email configuration:

1. Set all environment variables
2. Start the server
3. Check console for: `✅ SMTP connection verified successfully`
4. Register a new user
5. Check inbox for welcome + verification emails

### Troubleshooting

**"SMTP connection failed"**
- Check `EMAIL_USER` and `EMAIL_PASS` are set
- Ensure you're using App Password, not regular password
- Verify 2-Step Verification is enabled

**"Authentication failed"**
- Regenerate App Password
- Ensure no extra spaces in `EMAIL_PASS`
- Check App Password hasn't been revoked

**"Connection failed"**
- Check `EMAIL_HOST` and `EMAIL_PORT`
- Verify firewall allows outbound SMTP (port 587)
- Check network connectivity

