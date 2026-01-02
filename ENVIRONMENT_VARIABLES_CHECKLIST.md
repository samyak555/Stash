# Environment Variables Checklist for Stash Backend

## ✅ Required Environment Variables

### Email Configuration (Gmail SMTP)
- ✅ **EMAIL_HOST**: `smtp.gmail.com` ✓ Correct
- ✅ **EMAIL_PORT**: `465` ✓ Correct (SSL port)
- ✅ **EMAIL_USER**: `smtp-stash.auth7@gmail.com` ✓ Correct
- ✅ **EMAIL_PASS**: `wvxsnrktlomcxisd` ✓ Updated (16 characters, no spaces)
- ✅ **EMAIL_FROM**: `Stash <smtp-stash.auth7@gmail.com>` ✓ Correct

### Google OAuth Configuration
- ✅ **GOOGLE_CLIENT_ID**: `31441351352-tgp0f66dg6chhg1s7cqeqcu39cq8vfst.apps.googleusercontent.com` ✓ Set
- ✅ **GOOGLE_CLIENT_SECRET**: `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` ✓ Set

### Backend Configuration
- ⚠️ **BACKEND_URL**: `https://stash-backend-4wty.onrender.com` ⚠️ **MISSING - Should be added**
  - This is used for Google OAuth callback URL
  - Without it, defaults to the hardcoded value, but explicit is better

### Frontend Configuration
- ✅ **FRONTEND_URL**: `https://stash-beige.vercel.app` ✓ Correct

### Database Configuration
- ✅ **MONGODB_URI**: `mongodb+srv://sam718ind:StashMongosamyak123@stash-0.eb6ytxe.mongodb.net/stash?appName=Stash-0` ✓ Set

### Security Configuration
- ✅ **JWT_SECRET**: Set ✓ (Long random string)
- ✅ **NODE_ENV**: `production` ✓ Correct

### Server Configuration
- ✅ **PORT**: `10000` ✓ Set (Render default)

## 🔍 Verification Checklist

### Email Service
1. ✅ EMAIL_USER matches the Gmail account
2. ✅ EMAIL_PASS is a Gmail App Password (16 characters, no spaces)
3. ✅ EMAIL_PORT is 465 (SSL) or 587 (TLS) - Currently 465 ✓
4. ✅ EMAIL_HOST is smtp.gmail.com ✓

### Google OAuth
1. ✅ GOOGLE_CLIENT_ID is set
2. ✅ GOOGLE_CLIENT_SECRET is set
3. ⚠️ BACKEND_URL should be set to: `https://stash-backend-4wty.onrender.com`
4. ⚠️ Google OAuth Console should have redirect URI: `https://stash-backend-4wty.onrender.com/api/auth/google/callback`

## 🚨 Issues Found

1. **MISSING BACKEND_URL**: Add this environment variable:
   - Key: `BACKEND_URL`
   - Value: `https://stash-backend-4wty.onrender.com`

2. **Google OAuth Redirect URI**: Make sure in Google Cloud Console, the authorized redirect URI includes:
   - `https://stash-backend-4wty.onrender.com/api/auth/google/callback`

## ✅ All Other Variables Look Correct!

Your email configuration looks good with the updated password. The main thing missing is BACKEND_URL for proper Google OAuth callback handling.

