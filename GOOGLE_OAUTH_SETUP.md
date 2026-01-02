# Google OAuth Setup Guide for Stash

## Issue
The error "Google Sign-In is not configured. Please use email login." appears because `VITE_GOOGLE_CLIENT_ID` is not set in Vercel environment variables.

## Step-by-Step Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: **Stash**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Add `email` and `profile`
   - Click **Save and Continue**
   - Test users: Add your email (optional for testing)
   - Click **Save and Continue**
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Stash Web Client**
   - Authorized JavaScript origins:
     - `https://stash-beige.vercel.app`
     - `http://localhost:5173` (for local development)
   - Authorized redirect URIs:
     - `https://stash-backend-4wty.onrender.com/api/auth/google/callback`
     - `http://localhost:5000/api/auth/google/callback` (for local development)
   - Click **Create**
7. Copy the **Client ID** and **Client Secret**

### 2. Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Stash** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:
   - **Name**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Your Google Client ID (e.g., `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Environment**: Production, Preview, Development (select all)
   - Click **Save**
5. **Redeploy** your application:
   - Go to **Deployments**
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**

### 3. Set Environment Variables in Render (Backend)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your **stash-backend** service
3. Go to **Environment** tab
4. Add/Update the following variables:
   - `GOOGLE_CLIENT_ID` = Your Google Client ID
   - `GOOGLE_CLIENT_SECRET` = Your Google Client Secret
   - `FRONTEND_URL` = `https://stash-beige.vercel.app`
   - `BACKEND_URL` = `https://stash-backend-4wty.onrender.com`
5. Click **Save Changes**
6. Render will automatically redeploy

### 4. Verify Setup

1. Wait for both deployments to complete
2. Visit `https://stash-beige.vercel.app/login`
3. Click **Continue with Google**
4. You should see the Google sign-in popup

## Troubleshooting

### Error: "Google Sign-In is not configured"
- **Solution**: Make sure `VITE_GOOGLE_CLIENT_ID` is set in Vercel and you've redeployed

### Error: "Invalid Google token"
- **Solution**: Check that `GOOGLE_CLIENT_ID` in Render matches the one in Vercel

### Error: "Redirect URI mismatch"
- **Solution**: Make sure the redirect URI in Google Console matches exactly:
  - `https://stash-backend-4wty.onrender.com/api/auth/google/callback`

### Google Sign-In popup doesn't appear
- **Solution**: 
  1. Check browser console for errors
  2. Verify Google script is loaded: `https://accounts.google.com/gsi/client`
  3. Clear browser cache and try again

## Environment Variables Summary

### Vercel (Frontend)
```
VITE_GOOGLE_CLIENT_ID=your-client-id-here
VITE_API_URL=https://stash-backend-4wty.onrender.com/api
```

### Render (Backend)
```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
FRONTEND_URL=https://stash-beige.vercel.app
BACKEND_URL=https://stash-backend-4wty.onrender.com
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-uri
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=smtp-stash.auth7@gmail.com
EMAIL_PASS=umqxduuqqjeqdmzp
EMAIL_FROM=Stash <smtp-stash.auth7@gmail.com
```

## Testing

1. **Local Development**:
   - Create `.env` file in `frontend/` directory:
     ```
     VITE_GOOGLE_CLIENT_ID=your-client-id
     VITE_API_URL=http://localhost:5000/api
     ```
   - Create `.env` file in `backend/` directory:
     ```
     GOOGLE_CLIENT_ID=your-client-id
     GOOGLE_CLIENT_SECRET=your-client-secret
     FRONTEND_URL=http://localhost:5173
     BACKEND_URL=http://localhost:5000
     ```

2. **Production**:
   - Follow steps 2 and 3 above
   - Wait for deployments to complete
   - Test on production URL

