# ✅ Deployment Checklist

Use this checklist to ensure everything is set up correctly before and after deployment.

## 📋 Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] All environment variables are documented
- [ ] `.gitignore` is configured (database.json excluded)
- [ ] Backend and frontend build successfully locally
- [ ] All features tested locally

## 🔧 Backend Deployment (Render)

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Web service created with correct settings:
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Plan: Free
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
- [ ] Persistent disk created:
  - [ ] Name: `stash-data`
  - [ ] Mount Path: `/opt/render/project/src/backend/data`
  - [ ] Size: 1 GB
  - [ ] Disk attached to service
- [ ] Backend URL copied (e.g., `https://stash-backend.onrender.com`)
- [ ] Health check works: `https://YOUR_BACKEND_URL/api/health`

## 🎨 Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project created with correct settings:
  - [ ] Framework: Vite
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Environment variable set:
  - [ ] `VITE_API_URL=https://YOUR_BACKEND_URL.onrender.com/api`
- [ ] Deployment successful
- [ ] Frontend URL accessible

## 🧪 Post-Deployment Testing

- [ ] Frontend loads correctly
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Can add expenses
- [ ] Can add income
- [ ] Dashboard displays data
- [ ] Charts render correctly
- [ ] All pages accessible
- [ ] No console errors

## 🔍 Troubleshooting Checklist

If something doesn't work:

- [ ] Check Render logs for backend errors
- [ ] Check Vercel logs for frontend errors
- [ ] Verify `VITE_API_URL` is correct in Vercel
- [ ] Verify backend URL is accessible
- [ ] Check CORS settings (should be enabled)
- [ ] Verify disk is mounted in Render
- [ ] Check environment variables are set correctly
- [ ] Verify database.json is being created in Render disk

## 📝 Notes

- Render free tier may spin down after 15 min inactivity
- First request after spin-down may take 30-60 seconds
- Database persists on Render's disk storage
- All data is saved in `backend/data/database.json` on Render

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

