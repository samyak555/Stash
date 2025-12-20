# ⚡ Quick Deployment Guide

## 🎯 5-Minute Deployment

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/stash-finance.git
git push -u origin main
```

### Step 2: Deploy Backend (Render)

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select your repo
4. **Settings:**
   - Name: `stash-backend`
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Plan: **Free**
5. **Environment:**
   - `NODE_ENV=production`
   - `PORT=10000`
6. **Create Disk:**
   - Name: `stash-data`
   - Mount: `/opt/render/project/src/backend/data`
   - Size: `1 GB`
7. Click **"Create Web Service"**
8. **Copy your backend URL** (e.g., `https://stash-backend.onrender.com`)

### Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click **"Add New Project"**
3. Import your GitHub repo
4. **Settings:**
   - Framework: `Vite`
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Output: `dist`
5. **Environment Variable:**
   - Key: `VITE_API_URL`
   - Value: `https://YOUR_BACKEND_URL.onrender.com/api`
6. Click **"Deploy"**

### Step 4: Test

- Frontend: Visit your Vercel URL
- Backend: Visit `https://YOUR_BACKEND_URL.onrender.com/api/health`

## ✅ Done!

Your app is now live! 🎉

---

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.


