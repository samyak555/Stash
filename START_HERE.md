# 🚀 START HERE - Deploy Your Stash App

I've prepared everything for you! Just follow these simple steps.

## ⚡ Quick Start (15 minutes)

### Step 1: Push to GitHub (5 min)

1. **Create GitHub Repository:**
   - Go to: https://github.com/new
   - Name: `stash-finance`
   - Make it **Public**
   - **Don't** add README (we have one)
   - Click "Create repository"

2. **Push Your Code:**
   ```powershell
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/stash-finance.git
   git push -u origin main
   ```
   *(Replace YOUR_USERNAME with your GitHub username)*

### Step 2: Deploy Backend to Render (5 min)

1. Go to: https://render.com → Sign up (free)
2. Click "New +" → "Web Service"
3. Connect GitHub → Select your repo
4. **Settings:**
   - Name: `stash-backend`
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Plan: **Free**
5. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
6. **Create Disk:**
   - Name: `stash-data`
   - Mount: `/opt/render/project/src/backend/data`
   - Size: `1 GB`
7. Click "Create Web Service"
8. **Copy your backend URL** (e.g., `https://stash-backend.onrender.com`)

### Step 3: Deploy Frontend to Vercel (5 min)

1. Go to: https://vercel.com → Sign up (free)
2. Click "Add New Project"
3. Import your GitHub repo
4. **Settings:**
   - Root Directory: `frontend`
   - Framework: Vite (auto-detected)
5. **Environment Variable:**
   - Key: `VITE_API_URL`
   - Value: `https://YOUR_BACKEND_URL.onrender.com/api`
   *(Use your Render URL from Step 2)*
6. Click "Deploy"

## ✅ Done!

Your app is now live! Visit your Vercel URL to see it.

---

## 📚 Need More Details?

- **Quick Guide**: See `QUICK_DEPLOY.md`
- **Detailed Guide**: See `STEP_BY_STEP_DEPLOY.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`

---

## 🆘 Help

If something doesn't work:
1. Check the logs in Render/Vercel dashboards
2. Verify environment variables are set correctly
3. Make sure backend URL is accessible

**That's it! You're ready to deploy! 🎉**

