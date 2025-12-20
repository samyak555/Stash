# 🚀 DEPLOY NOW - Step by Step

Your code is on GitHub! Now let's deploy it.

## ✅ Step 1: Deploy Backend to Render (5 minutes)

1. **Go to Render**: https://render.com
   - Sign up/login (free account)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select repository: `samyak555/Stash`

3. **Configure Service**:
   - **Name**: `stash-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Add Environment Variables**:
   - Click "Environment" tab (or scroll down to Environment Variables section)
   - Add:
     - `NODE_ENV` = `production`
     - `PORT` = `10000`

5. **Deploy**:
   - **Note**: Persistent disks are not available on Render's free tier. Your app will work fine - data will persist while the service is running. For production, consider upgrading to a paid plan for persistent storage.
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - **Copy your backend URL** (e.g., `https://stash-backend.onrender.com`)

---

## ✅ Step 2: Deploy Frontend to Vercel (5 minutes)

1. **Go to Vercel**: https://vercel.com
   - Sign up/login (free account)
   - Use GitHub to sign in

2. **Import Project**:
   - Click "Add New Project"
   - Select repository: `samyak555/Stash`

3. **Configure Project**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://YOUR_BACKEND_URL.onrender.com/api`
     - *(Replace YOUR_BACKEND_URL with your actual Render URL from Step 1)*
   - Click "Save"

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment (1-2 minutes)
   - **Your app is live!** 🎉

---

## ✅ Step 3: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://stash-finance.vercel.app`)
2. Try logging in or registering
3. If you see errors, check:
   - Backend URL is correct in Vercel environment variables
   - Backend is running (check Render dashboard)
   - CORS is enabled (should be in your backend code)

---

## 🆘 Troubleshooting

### Backend not working?
- Check Render logs: Go to your service → "Logs" tab
- Verify environment variables are set
- Make sure the service is running (status should be "Live")

### Frontend can't connect to backend?
- Verify `VITE_API_URL` in Vercel matches your Render URL
- Check backend CORS settings
- Make sure backend URL ends with `/api`

### Need to update code?
- Just push to GitHub: `git push`
- Vercel and Render will auto-deploy!

---

## 📝 Quick Reference

- **GitHub Repo**: https://github.com/samyak555/Stash
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard

**That's it! Your app should be live now! 🚀**

