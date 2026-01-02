# 🚀 Quick Deploy Guide - Render & Vercel

Your code is already pushed to GitHub! Follow these steps:

## ✅ Step 1: Deploy Backend to Render

1. **Go to**: https://dashboard.render.com
2. **Click**: "New +" → "Web Service"
3. **Connect GitHub** (if not already connected)
4. **Select Repository**: `samyak555/Stash`
5. **Configure**:
   - **Name**: `stash-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. **Environment Variables** (Add these):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FRONTEND_URL=https://your-vercel-url.vercel.app
   BACKEND_URL=https://stash-backend.onrender.com
   ```
7. **Click**: "Create Web Service"
8. **Wait** for deployment (2-3 minutes)
9. **Copy** your backend URL (e.g., `https://stash-backend.onrender.com`)

---

## ✅ Step 2: Deploy Frontend to Vercel

1. **Go to**: https://vercel.com
2. **Sign in** with GitHub
3. **Click**: "Add New Project"
4. **Select Repository**: `samyak555/Stash`
5. **Configure**:
   - **Root Directory**: `frontend` (click "Edit" and set to `frontend`)
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `dist` (auto)
6. **Environment Variables** (Add this):
   ```
   VITE_API_URL=https://stash-backend.onrender.com/api
   ```
   *(Replace with your actual Render backend URL from Step 1)*
7. **Click**: "Deploy"
8. **Wait** for deployment (1-2 minutes)
9. **Your app is live!** 🎉

---

## ✅ Step 3: Update Backend with Frontend URL

After Vercel deployment:

1. **Go back to Render Dashboard**
2. **Edit** your backend service
3. **Update Environment Variable**:
   - `FRONTEND_URL` = Your Vercel URL (e.g., `https://stash-finance.vercel.app`)
4. **Save** and wait for redeploy

---

## 🔄 Auto-Deploy

Once set up:
- **Push to GitHub** → Auto-deploys to both Render & Vercel
- No manual deployment needed!

---

## 📝 Important URLs

- **GitHub**: https://github.com/samyak555/Stash
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🆘 Troubleshooting

### Backend not starting?
- Check Render logs
- Verify all environment variables are set
- Make sure MongoDB URI is correct

### Frontend can't connect?
- Verify `VITE_API_URL` matches your Render URL
- Check CORS settings in backend
- Ensure backend URL ends with `/api`

### Need to update?
- Just `git push` - auto-deploys!

---

**That's it! Your app will be live in ~5 minutes! 🚀**

