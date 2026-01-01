# MongoDB Connection Setup

## Connection String

Your MongoDB Atlas connection string is:

```
mongodb+srv://sam718ind:<db_password>@stash-0.eb6ytxe.mongodb.net/stash?appName=Stash-0
```

## Setup Instructions

### 1. Update `.env` file

1. Open `backend/.env` file
2. Replace `<db_password>` with your actual MongoDB Atlas password
3. The connection string should look like:
   ```
   MONGODB_URI=mongodb+srv://sam718ind:YOUR_ACTUAL_PASSWORD@stash-0.eb6ytxe.mongodb.net/stash?appName=Stash-0
   ```

### 2. Password Encoding

If your password contains special characters, you need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`
- `&` becomes `%26`
- `+` becomes `%2B`
- `=` becomes `%3D`
- `?` becomes `%3F`
- `/` becomes `%2F`

Example: If your password is `P@ssw0rd#123`, it should be `P%40ssw0rd%23123`

### 3. Test Connection

Run your backend:
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: stash-0.eb6ytxe.mongodb.net
📦 Database: stash
```

### 4. Network Access

Make sure your IP is whitelisted in MongoDB Atlas:
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. For development: Add your current IP
4. For production (Render): Add `0.0.0.0/0` (allow all IPs)

### 5. Database User

The database user is: `sam718ind`
- Make sure this user exists in MongoDB Atlas
- Go to Database Access → Users to verify

## Current Configuration

- **Cluster**: stash-0.eb6ytxe.mongodb.net
- **Database Name**: stash
- **Username**: sam718ind
- **App Name**: Stash-0

## Troubleshooting

### Connection timeout
- Check Network Access whitelist
- Verify password is correct
- Check if password needs URL encoding

### Authentication failed
- Verify username: `sam718ind`
- Verify password is correct (URL-encoded if needed)
- Check database user exists in MongoDB Atlas

### Cannot find database
- The database `stash` will be created automatically on first use
- Make sure the user has write permissions

