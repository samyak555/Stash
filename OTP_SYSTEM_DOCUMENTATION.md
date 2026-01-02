# Email OTP System Documentation

## Overview
A complete, standalone email OTP (One-Time Password) system for Stash backend. This system uses in-memory storage for OTPs and a reusable email service.

## Files Created

### 1. `/backend/services/emailService.js`
**Purpose:** Reusable email service using nodemailer

**Features:**
- Uses environment variables for configuration (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS)
- Creates reusable transporter instance
- Sends OTP emails with beautiful HTML templates
- Handles errors gracefully with detailed logging
- Never exposes credentials in code

**Exports:**
- `sendOTPEmail(to, otp, subject)` - Send OTP email
- `verifyEmailService()` - Verify email service configuration

**Environment Variables Required:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Stash <your-email@gmail.com> (optional)
```

### 2. `/backend/controllers/otpController.js`
**Purpose:** Handles OTP generation, storage, and verification

**Features:**
- Generates 6-digit OTP codes
- Stores OTPs in memory (Map data structure)
- Automatic cleanup of expired OTPs
- Attempt limiting (max 3 attempts per OTP)
- 5-minute OTP expiry

**Functions:**
- `sendOTP(req, res)` - Generate and send OTP
- `verifyOTP(req, res)` - Verify OTP code
- `getOTPStats()` - Get OTP statistics (for debugging)

**In-Memory Storage:**
```javascript
{
  "email@example.com": {
    otp: "123456",
    expiresAt: Date,
    attempts: 0
  }
}
```

### 3. Updated `/backend/routes/authRoutes.js`
**Purpose:** Wire OTP endpoints to Express router

**New Routes:**
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP code

**Rate Limiting:**
- Both endpoints use `otpRateLimiter` (3 requests per 15 minutes)

## API Endpoints

### 1. Send OTP
**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 5
}
```

**Error Responses:**
- `400` - Invalid email format or missing email
- `500` - Email service error or internal server error

### 2. Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Error Responses:**
- `400` - Invalid OTP, expired OTP, or max attempts exceeded
- `500` - Internal server error

## Usage Example

### Frontend Integration

```javascript
// Send OTP
const sendOTP = async (email) => {
  const response = await fetch('https://your-api.com/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

// Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch('https://your-api.com/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  return response.json();
};
```

## Security Features

1. **Rate Limiting:** Prevents abuse (3 requests per 15 minutes)
2. **Attempt Limiting:** Maximum 3 verification attempts per OTP
3. **OTP Expiry:** OTPs expire after 5 minutes
4. **Automatic Cleanup:** Expired OTPs are automatically removed
5. **No Credential Exposure:** All credentials use environment variables

## Error Handling

All endpoints use try/catch blocks and return appropriate HTTP status codes:
- `400` - Client errors (invalid input, expired OTP, etc.)
- `500` - Server errors (email service failures, internal errors)

## Memory Management

- OTPs are stored in a Map for fast lookups
- Expired OTPs are cleaned up every minute
- Memory usage is minimal (only active OTPs are stored)

## Production Considerations

1. **Environment Variables:** Must be set in Render/production environment
2. **Email Service:** Requires Gmail App Password (not regular password)
3. **Rate Limiting:** Already implemented to prevent abuse
4. **Monitoring:** Check server logs for email service status

## Testing

```bash
# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

## Notes

- OTPs are stored in memory (lost on server restart)
- For production, consider using Redis for OTP storage
- Email service must be configured before use
- All credentials are read from environment variables only

