# MongoDB Setup Guide for Stash

## ✅ What's Done

All code has been migrated from file-based storage to MongoDB! The backend now uses MongoDB with Mongoose ODM.

## 📋 Setup Steps

### 1. Get MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in with: **sam718ind@gmail.com**
3. Organization: **STASH-DRASHTI**
4. Project: **Stash**
5. Click "Connect" on your cluster
6. Choose "Connect your application"
7. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/stash`)

### 2. Update Environment Variables

Create or update `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stash
JWT_SECRET=your-secret-key-change-in-production
ENCRYPTION_KEY=your-encryption-key-change-in-production
PORT=5000
```

**Important**: Replace `username` and `password` in the connection string with your actual MongoDB Atlas credentials!

### 3. Network Access

Make sure your IP is whitelisted in MongoDB Atlas:
1. Go to "Network Access" in MongoDB Atlas
2. Click "Add IP Address"
3. For development: Add your current IP
4. For production (Render): Add `0.0.0.0/0` (allow all IPs) or Render's IP ranges

### 4. Database User

Create a database user in MongoDB Atlas:
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username and password
5. Set privileges to "Atlas admin" or custom permissions
6. Update the connection string with these credentials

### 5. Test the Connection

Run your backend:

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📦 Database: stash
```

## 📦 Models Created

All MongoDB models are in `backend/models/`:
- `User.js` - User accounts with email config
- `Expense.js` - Expense transactions
- `Income.js` - Income records
- `Budget.js` - Budget plans
- `Goal.js` - Financial goals
- `Group.js` - Family/group management

## 🔄 Migration Notes

- All controllers updated to use MongoDB
- All services (scheduler, emailParser, webhookHandler) updated
- File-based database (`backend/data/database.json`) is no longer used
- Old data will need to be migrated manually if needed

## 🚀 Deployment

### Render (Production)

1. Add `MONGODB_URI` environment variable in Render dashboard
2. The connection string should be your MongoDB Atlas URI
3. Deploy!

Your data will now persist permanently in MongoDB Atlas! 🎉

