# Clear Database Script

## How to Clear All Users from Database

### Option 1: Using the Script (Local)

1. Make sure you have `MONGODB_URI` set in your environment:
   ```bash
   # In backend/.env or root .env file:
   MONGODB_URI=mongodb+srv://...
   ```

2. Run the script:
   ```bash
   node backend/scripts/clearUserEmails.js
   ```

### Option 2: Using Environment Variable Directly

```bash
MONGODB_URI="your-mongodb-connection-string" node backend/scripts/clearUserEmails.js
```

### Option 3: Using MongoDB Atlas UI

1. Go to MongoDB Atlas Dashboard
2. Navigate to your cluster
3. Click "Browse Collections"
4. Select your database
5. Select "users" collection
6. Click "Delete" and confirm deletion of all documents

### Option 4: Using MongoDB Shell

```bash
mongosh "your-connection-string"
use your-database-name
db.users.deleteMany({})
```

## What the Script Does

- Connects to MongoDB using `MONGODB_URI`
- Finds all users in the database
- Deletes all user documents
- Disconnects from MongoDB

## Warning

⚠️ **This action is irreversible!** All user data will be permanently deleted.

