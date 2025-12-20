# 🚀 Free Deployment Guide for Stash Finance Tracker

This guide will help you deploy your Stash application for free using:
- **Frontend**: Vercel (Free)
- **Backend**: Render (Free tier)

---

## 📋 Prerequisites

1. GitHub account
2. Vercel account (free) - Sign up at [vercel.com](https://vercel.com)
3. Render account (free) - Sign up at [render.com](https://render.com)

---

## 🔧 Step 1: Prepare Your Code

### 1.1 Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Create a repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/stash-finance.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository

### 2.2 Configure Backend Service

**Settings:**
- **Name**: `stash-backend`
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Plan**: `Free`

### 2.3 Environment Variables

Add these in Render dashboard under "Environment":
```
NODE_ENV=production
PORT=10000
```

### 2.4 Enable Persistent Disk (Important!)

1. Go to **"Disks"** section
2. Click **"Create Disk"**
3. Name: `stash-data`
4. Mount Path: `/opt/render/project/src/backend/data`
5. Size: `1 GB` (free tier)
6. Click **"Create"**

**Note**: This ensures your database file persists across deployments.

### 2.5 Deploy

Click **"Create Web Service"** and wait for deployment.

**Copy your backend URL** (e.g., `https://stash-backend.onrender.com`)

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create New Project on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select your repository

### 3.2 Configure Frontend

**Settings:**
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Environment Variables

Add this in Vercel dashboard under "Environment Variables":
```
VITE_API_URL=https://YOUR_BACKEND_URL.onrender.com/api
```

Replace `YOUR_BACKEND_URL` with your actual Render backend URL.

### 3.4 Deploy

Click **"Deploy"** and wait for deployment.

---

## ✅ Step 4: Update Frontend API URL

After deployment, update the frontend environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` with your Render backend URL
3. Redeploy (Vercel will auto-redeploy)

---

## 🔍 Step 5: Verify Deployment

### Backend Health Check
Visit: `https://YOUR_BACKEND_URL.onrender.com/api/health`

Should return: `{"status":"OK","message":"Server is running"}`

### Frontend
Visit your Vercel URL and test the application.

---

## 📝 Important Notes

### Free Tier Limitations

**Render (Backend):**
- Service may spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 750 hours/month free
- Persistent disk: 1 GB free

**Vercel (Frontend):**
- Unlimited deployments
- 100 GB bandwidth/month
- No sleep/wake issues

### Database Persistence

The file-based database (`backend/data/database.json`) will persist on Render's disk storage. Your data will be saved even after deployments.

### CORS Configuration

The backend already has CORS enabled, so it should work with your Vercel frontend.

---

## 🐛 Troubleshooting

### Backend not responding
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set
- Check if disk is mounted correctly

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check CORS settings in backend
- Verify backend URL is accessible

### Database not persisting
- Ensure disk is created and mounted in Render
- Check mount path matches: `/opt/render/project/src/backend/data`
- Verify disk is attached to your service

---

## 🔄 Updating Your Deployment

### To update backend:
1. Push changes to GitHub
2. Render will auto-deploy (or manually trigger in dashboard)

### To update frontend:
1. Push changes to GitHub
2. Vercel will auto-deploy

---

## 📞 Support

If you encounter issues:
1. Check deployment logs in both platforms
2. Verify all environment variables are set
3. Ensure GitHub repository is properly connected

---

**🎉 Congratulations! Your Stash Finance Tracker is now live!**


