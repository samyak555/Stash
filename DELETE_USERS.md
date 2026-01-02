# Delete All Users - Quick Guide

## Option 1: Using Admin API Endpoint (Recommended)

1. **Login as admin:**
   - Email: `administrator-stash.auth7@gmail.com`
   - Register/login to get admin role

2. **Get your JWT token** from the login response

3. **Call the API:**
   ```bash
   DELETE https://stash-backend-4wty.onrender.com/api/admin/users
   Headers: Authorization: Bearer YOUR_JWT_TOKEN
   ```

   Or use this curl command:
   ```bash
   curl -X DELETE https://stash-backend-4wty.onrender.com/api/admin/users \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Option 2: Using Script

Run the script with your MongoDB URI:

```bash
node backend/scripts/deleteUsers.js "mongodb+srv://username:password@cluster.mongodb.net/database"
```

Or set MONGODB_URI environment variable:
```bash
export MONGODB_URI="mongodb+srv://..."
node backend/scripts/deleteUsers.js
```

## Option 3: MongoDB Atlas UI

1. Go to MongoDB Atlas Dashboard
2. Click "Browse Collections"
3. Select your database → "users" collection
4. Click "Delete" → "Delete All Documents"

---

⚠️ **WARNING: This action is irreversible!**

