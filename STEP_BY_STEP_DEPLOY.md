# 🎯 Step-by-Step Deployment Guide

Follow these exact steps to deploy your Stash Finance Tracker for FREE.

---

## 📦 STEP 1: Prepare Your Code

### 1.1 Run the deployment helper
```powershell
.\deploy.ps1
```

### 1.2 Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `stash-finance` (or any name)
3. Description: "Smart Finance Tracker"
4. **Make it Public** (required for free Vercel/Render)
5. **DO NOT** check "Add a README file" (we already have one)
6. Click **"Create repository"**

### 1.3 Push Code to GitHub

**Copy your repository URL** from GitHub (looks like: `https://github.com/YOUR_USERNAME/stash-finance.git`)

Then run these commands in your project folder:

```powershell
# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Set main branch
git branch -M main

# Add remote (REPLACE WITH YOUR URL)
git remote add origin https://github.com/YOUR_USERNAME/stash-finance.git

# Push to GitHub
git push -u origin main
```

**✅ Step 1 Complete!** Your code is now on GitHub.

---

## 🔧 STEP 2: Deploy Backend to Render

### 2.1 Create Render Account

1. Go to: https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### 2.2 Create Web Service

1. In Render dashboard, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** next to GitHub
4. Authorize Render to access your repositories
5. Select your repository: `stash-finance`

### 2.3 Configure Backend Service

Fill in these **exact** settings:

**Basic Settings:**
- **Name**: `stash-backend`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Select **"Free"**

**Environment Variables:**
Click "Add Environment Variable" and add:
- Key: `NODE_ENV` → Value: `production`
- Key: `PORT` → Value: `10000`

### 2.4 Create Persistent Disk (IMPORTANT!)

1. Scroll down to **"Disks"** section
2. Click **"Create Disk"**
3. Fill in:
   - **Name**: `stash-data`
   - **Mount Path**: `/opt/render/project/src/backend/data`
   - **Size**: `1 GB` (free tier)
4. Click **"Create"**
5. Make sure the disk is **attached** to your service

### 2.5 Deploy

1. Click **"Create Web Service"** at the bottom
2. Wait for deployment (takes 3-5 minutes)
3. **Copy your service URL** (looks like: `https://stash-backend.onrender.com`)

### 2.6 Test Backend

Visit: `https://YOUR_BACKEND_URL.onrender.com/api/health`

You should see: `{"status":"OK","message":"Server is running"}`

**✅ Step 2 Complete!** Backend is live!

---

## 🎨 STEP 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account

1. Go to: https://vercel.com
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended)
4. Authorize Vercel

### 3.2 Import Project

1. In Vercel dashboard, click **"Add New..."**
2. Select **"Project"**
3. Click **"Import"** next to your GitHub repository
4. Select your repository: `stash-finance`

### 3.3 Configure Frontend

**Framework Preset:**
- Select: **"Vite"** (or it auto-detects)

**Project Settings:**
- **Root Directory**: Click "Edit" → Type: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `dist` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

**Environment Variables:**
Click "Add" and add:
- Key: `VITE_API_URL`
- Value: `https://YOUR_BACKEND_URL.onrender.com/api`
  (Replace `YOUR_BACKEND_URL` with your actual Render URL from Step 2)

### 3.4 Deploy

1. Click **"Deploy"** button
2. Wait for deployment (takes 2-3 minutes)
3. **Copy your frontend URL** (looks like: `https://stash-finance.vercel.app`)

**✅ Step 3 Complete!** Frontend is live!

---

## ✅ STEP 4: Test Your Deployment

### 4.1 Test Frontend
1. Visit your Vercel URL
2. Try registering a new account
3. Try logging in
4. Add an expense
5. Check dashboard

### 4.2 Test Backend
1. Visit: `https://YOUR_BACKEND_URL.onrender.com/api/health`
2. Should return: `{"status":"OK","message":"Server is running"}`

---

## 🎉 Congratulations!

Your Stash Finance Tracker is now live and accessible worldwide!

**Frontend URL**: `https://your-app.vercel.app`  
**Backend URL**: `https://your-backend.onrender.com`

---

## 🔧 Troubleshooting

### Backend not working?
- Check Render logs: Dashboard → Your Service → Logs
- Verify disk is mounted: Dashboard → Your Service → Disks
- Check environment variables are set

### Frontend can't connect to backend?
- Verify `VITE_API_URL` in Vercel matches your Render URL
- Make sure it ends with `/api`
- Check CORS is enabled (it should be)

### Database not saving?
- Verify disk is created and mounted in Render
- Check mount path is correct: `/opt/render/project/src/backend/data`
- Check Render logs for errors

---

## 📝 Notes

- **Free Tier Limits:**
  - Render: Service may sleep after 15 min inactivity
  - First request after sleep: 30-60 seconds (wake-up time)
  - Vercel: No sleep, always fast

- **Data Persistence:**
  - Your database is saved on Render's disk
  - Data persists across deployments
  - Backup: You can download `database.json` from Render if needed

---

**Need Help?** Check the logs in both Vercel and Render dashboards for error messages.

