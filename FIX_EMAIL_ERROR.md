# Fix "Failed to send verification code" Error

## Problem
The registration is failing with "Failed to send verification code. Please try again."

## Root Cause
The email service (Gmail SMTP) is not properly configured on Render.

## Solution: Configure Email Environment Variables on Render

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Select your **Stash-backend** service

### Step 2: Add Environment Variables
Go to **Environment** tab and add these variables:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=smtp-stash.auth7@gmail.com
EMAIL_PASS=ytmhnqiggpwkrqrj
EMAIL_FROM=Stash <smtp-stash.auth7@gmail.com>
```

### Step 3: Verify Gmail App Password
The `EMAIL_PASS` must be a **Gmail App Password**, not your regular Gmail password.

**To get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Sign in with `smtp-stash.auth7@gmail.com`
3. Select "Mail" and "Other (Custom name)"
4. Enter "Stash Backend"
5. Click "Generate"
6. Copy the 16-character password
7. Use it as `EMAIL_PASS` in Render

### Step 4: Redeploy
After adding environment variables:
1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for deployment to complete
3. Check logs to see: `✅ Gmail SMTP connection verified successfully`

### Step 5: Test Registration
1. Try registering a new user
2. Check your email inbox for the 6-digit OTP code
3. If still failing, check Render logs for specific error messages

## Common Errors

### Error: "EAUTH" (Authentication failed)
- **Fix:** Check `EMAIL_USER` and `EMAIL_PASS` are correct
- **Fix:** Ensure you're using Gmail App Password, not regular password

### Error: "ECONNECTION" or "ETIMEDOUT"
- **Fix:** Check `EMAIL_HOST` is `smtp.gmail.com`
- **Fix:** Check `EMAIL_PORT` is `587`
- **Fix:** Verify network connectivity (should work on Render)

### Error: "Email service not configured"
- **Fix:** Ensure all EMAIL_* variables are set in Render
- **Fix:** Redeploy after adding variables

## Verify Email Service is Working

After deployment, check Render logs for:
```
✅ Gmail SMTP connection verified successfully
   Host: smtp.gmail.com:587
   From: Stash <smtp-stash.auth7@gmail.com>
   ✅ Ready to send emails
```

If you see this, email service is working! ✅

## Still Not Working?

1. **Check Render Logs:**
   - Go to Render dashboard → Your service → Logs
   - Look for email-related errors

2. **Test Email Configuration:**
   - The server will log detailed error messages
   - Check for specific error codes (EAUTH, ECONNECTION, etc.)

3. **Verify Gmail Settings:**
   - Ensure 2-Step Verification is enabled on Gmail account
   - App Passwords only work with 2-Step Verification enabled

