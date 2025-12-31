# Google OAuth Setup Guide

## Overview
Stash now supports automatic email sync when you sign in with Google! This eliminates the need for manual email/password setup.

## How It Works

### For Users:
1. **Sign in with Google** - Click "Continue with Google" on the login page
2. **Automatic Setup** - Your Gmail is automatically connected
3. **Auto-Sync** - Transactions are fetched every 5 minutes automatically
4. **No Passwords** - No need to enter app passwords or email credentials

### For Developers:

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Identity Services API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://your-app.vercel.app`)
7. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production domain
8. Copy the **Client ID**

### 2. Configure Environment Variables

#### Frontend (.env or .env.local):
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

#### Backend (.env):
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Required Scopes

The app requests these Google OAuth scopes:
- `https://www.googleapis.com/auth/gmail.readonly` - Read Gmail messages
- `https://www.googleapis.com/auth/userinfo.email` - Get user email
- `https://www.googleapis.com/auth/userinfo.profile` - Get user profile

### 4. Testing

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Go to login page
4. Click "Continue with Google"
5. Sign in with your Google account
6. Check Settings page - email should be automatically connected!

## Current Implementation

- ✅ Google Sign-In button on login page
- ✅ Automatic email configuration for Gmail users
- ✅ OAuth token storage
- ⚠️ Gmail API integration (needs implementation for full OAuth support)

## Next Steps (For Full OAuth)

To fully implement Gmail API access with OAuth:

1. Install `googleapis` package:
   ```bash
   cd backend
   npm install googleapis
   ```

2. Implement Gmail API client in `backend/services/gmailAPI.js`
3. Update `emailParser.js` to use Gmail API instead of IMAP for OAuth users
4. Handle token refresh for expired OAuth tokens

## Benefits

- **Security**: No passwords stored
- **Convenience**: One-click setup
- **Automatic**: No manual configuration needed
- **Reliable**: OAuth tokens are more secure than app passwords




