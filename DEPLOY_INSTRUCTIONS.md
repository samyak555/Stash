# 🚀 Deploy Stash to Production

Your code is pushed to GitHub! Now deploy it.

## ✅ Step 1: Deploy Backend to Render

### 1.1 Go to Render Dashboard
- Visit: https://dashboard.render.com
- Sign in/up (free account)

### 1.2 Create New Web Service
- Click **"New +"** → **"Web Service"**
- Connect GitHub account (if not already connected)
- Select repository: `samyak555/Stash`

### 1.3 Configure Service
- **Name**: `stash-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free`

### 1.4 Add Environment Variables (CRITICAL!)
Click **"Environment"** tab and add:

```
MONGODB_URI=mongodb+srv://sam718ind:StashMongosamyak123@stash-0.eb6ytxe.mongodb.net/stash?appName=Stash-0
JWT_SECRET=your-secret-key-change-in-production
ENCRYPTION_KEY=your-encryption-key-change-in-production
NODE_ENV=production
PORT=10000
```

**Important**: 
- Copy the exact MONGODB_URI with your password
- Change JWT_SECRET and ENCRYPTION_KEY to strong random strings for production

### 1.5 Deploy
- Click **"Create Web Service"**
- Wait for deployment (2-3 minutes)
- **Copy your backend URL** (e.g., `https://stash-backend.onrender.com`)

---

## ✅ Step 2: Deploy Frontend to Vercel

### 2.1 Go to Vercel
- Visit: https://vercel.com
- Sign in/up (free account)
- Use GitHub to sign in

### 2.2 Import Project
- Click **"Add New Project"**
- Select repository: `samyak555/Stash`

### 2.3 Configure Project
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite` (auto-detected)
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `dist` (auto-filled)

### 2.4 Add Environment Variable
Click **"Environment Variables"** and add:

- **Key**: `VITE_API_URL`
- **Value**: `https://YOUR_BACKEND_URL.onrender.com/api`
  - Replace `YOUR_BACKEND_URL` with your actual Render backend URL from Step 1.5

### 2.5 Deploy
- Click **"Deploy"**
- Wait for deployment (1-2 minutes)
- **Your app is live!** 🎉

---

## ✅ Step 3: MongoDB Atlas Network Access

Make sure your MongoDB Atlas allows connections from Render:

1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add `0.0.0.0/0`)
4. Click **"Confirm"**

This allows Render servers to connect to your MongoDB.

---

## 🧪 Step 4: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://stash-finance.vercel.app`)
2. Try registering/logging in
3. Check if data is saving (check MongoDB Atlas → Collections)

---

## 🔍 Troubleshooting

### Backend not working?
- Check Render logs: Service → **"Logs"** tab
- Verify `MONGODB_URI` is set correctly in Render environment variables
- Check MongoDB Atlas Network Access (must allow `0.0.0.0/0`)

### Frontend can't connect to backend?
- Verify `VITE_API_URL` in Vercel matches your Render backend URL
- Make sure backend URL ends with `/api`
- Check backend CORS settings (should be enabled)

### Database connection errors?
- Verify MongoDB password in Render environment variables
- Check MongoDB Atlas Network Access
- Verify database user `sam718ind` exists

---

## 📝 Quick Reference

- **GitHub Repo**: https://github.com/samyak555/Stash
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com

---

## 🎉 After Deployment

Your Stash app will be:
- ✅ Running 24/7 on Render (backend)
- ✅ Fast and global on Vercel (frontend)
- ✅ Data stored permanently in MongoDB Atlas
- ✅ Automatic deployments on every git push!

**Your website is ready to go live!** 🚀

