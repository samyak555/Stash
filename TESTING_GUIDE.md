# 🧪 Testing Guide - Auto Transaction Sync

This guide will help you test the automatic transaction syncing feature.

## ✅ Prerequisites

1. **Both servers are running:**
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`

2. **You have a Gmail account** (or any email that receives transaction notifications)

## 📋 Step-by-Step Testing

### Step 1: Login/Register

1. Open `http://localhost:3000` in your browser
2. Login to your account (or register if new)
3. You should see the Dashboard

### Step 2: Go to Settings

1. Click on **"Settings"** in the navigation menu (gear icon)
2. You should see the "Auto-Fetch Transactions" section

### Step 3: Connect Your Email

#### For Gmail Users:

1. **Get Gmail App Password:**
   - Go to: https://myaccount.google.com/security
   - Enable **2-Step Verification** (if not already enabled)
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter name: "Stash Finance"
   - Click "Generate"
   - **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

2. **Connect in Settings:**
   - Email: Your Gmail address (e.g., `yourname@gmail.com`)
   - App Password: Paste the 16-character password (remove spaces)
   - IMAP Host: `imap.gmail.com` (default)
   - Port: `993` (default)
   - Click **"Connect Email"**

3. **Expected Result:**
   - Green status indicator showing "Connected"
   - Your email address displayed
   - "Last Sync" timestamp
   - "Sync Now" and "Disconnect" buttons appear

### Step 4: Test Manual Sync

1. Click **"Sync Now"** button
2. **Expected Result:**
   - Button shows "Syncing..." with spinner
   - Toast notification: "Found X new transaction(s)!" or "No new transactions found"
   - If transactions found, page refreshes after 1 second
   - Check "Last Sync" time updates

### Step 5: Verify Transactions in Expenses

1. Go to **"Expenses"** page from navigation
2. **Check for:**
   - New transactions with `autoDetected: true` (shown in description or source)
   - Correct amounts, dates, and categories
   - Source indicators (Paytm, PhonePe, etc.)

### Step 6: Test Transaction Parsing

#### Option A: Test with Real Emails

**If you have transaction emails in your inbox:**

1. Make sure you have recent transaction emails from:
   - Paytm
   - PhonePe
   - Banks
   - MakeMyTrip
   - Zomato/Swiggy
   - Uber/Ola

2. Click "Sync Now" in Settings
3. Check Expenses page for new transactions

#### Option B: Test with Sample Email (Advanced)

**To test without real emails, you can:**

1. Send yourself a test email with transaction-like content:
   - Subject: "Paytm Payment"
   - Body: "You paid Rs. 500 to Merchant Name on 15/01/2024"

2. Click "Sync Now"
3. Check if transaction appears in Expenses

### Step 7: Check Dashboard Sync Status

1. Go to **Dashboard** page
2. **Look for:**
   - Green banner at top showing "Auto-Sync Active"
   - Your email address
   - Last sync timestamp
   - Link to Settings

### Step 8: Test Auto-Sync (5 Minute Interval)

1. Note the current time
2. Wait 5 minutes (or trigger manually)
3. The system automatically checks for new emails every 5 minutes
4. Check backend console for logs: `🔍 Auto-syncing transactions...`

### Step 9: Test Different Transaction Types

**Supported Transaction Types:**

| Service | How to Test |
|---------|-------------|
| **Paytm** | Have Paytm payment emails in inbox |
| **PhonePe** | Have PhonePe payment emails in inbox |
| **MakeMyTrip** | Have booking confirmation emails |
| **Bank** | Have bank debit/credit alert emails |
| **Zomato/Swiggy** | Have food delivery order emails |
| **Uber/Ola** | Have ride booking confirmation emails |
| **BookMyShow** | Have movie ticket booking emails |

### Step 10: Test Duplicate Prevention

1. Click "Sync Now" multiple times
2. **Expected Result:**
   - Same transactions should NOT be added twice
   - System prevents duplicates based on amount, description, and time

### Step 11: Test Disconnect

1. Go to Settings
2. Click **"Disconnect"** button
3. **Expected Result:**
   - Email connection removed
   - "Connect Email" form appears again
   - Dashboard sync status banner disappears

## 🐛 Troubleshooting Tests

### Test 1: Check Backend Logs

**Backend Console should show:**
```
✅ Transaction scheduler started (checking every 5 minutes)
✅ Email connected: your-email@gmail.com
✅ Auto-added: Paytm - Merchant Name - ₹500
```

### Test 2: Check Frontend Console

**Open Browser DevTools (F12) → Console:**
- Should NOT see CORS errors
- Should NOT see 401/403 errors
- API calls should return 200 status

### Test 3: Test API Endpoints Directly

**Open Browser Console (F12) and run:**

```javascript
// Test health endpoint
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log);

// Test sync status (requires login token)
fetch('http://localhost:5000/api/transactions/sync-status', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
  .then(r => r.json())
  .then(console.log);
```

### Test 4: Check Database

**Check if transactions are saved:**
- File: `backend/data/database.json`
- Look for expenses with `"autoDetected": true`
- Check `source` field (paytm, phonepe, etc.)

## 📊 Expected Results Summary

| Feature | Expected Behavior |
|---------|------------------|
| **Email Connection** | Green status, email displayed, last sync time |
| **Manual Sync** | Toast notification, transactions added, page refresh |
| **Auto Sync** | Runs every 5 minutes automatically |
| **Transaction Parsing** | Amount, date, merchant, category extracted correctly |
| **Category Detection** | Transactions categorized (food, travel, entertainment, etc.) |
| **Duplicate Prevention** | Same transaction not added twice |
| **Dashboard Status** | Sync banner shows connection status |
| **Disconnect** | Email removed, form reappears |

## 🎯 Quick Test Checklist

- [ ] Settings page loads
- [ ] Can connect email successfully
- [ ] Sync status shows "Connected"
- [ ] Manual sync works
- [ ] Transactions appear in Expenses page
- [ ] Transactions have correct category
- [ ] Duplicate prevention works
- [ ] Dashboard shows sync status banner
- [ ] Disconnect works
- [ ] Backend logs show sync activity

## 💡 Tips for Testing

1. **Use Real Email:** Best results with actual transaction emails
2. **Check Both Views:** Verify in both Expenses page and Dashboard
3. **Monitor Console:** Check browser console and backend terminal for errors
4. **Test Edge Cases:** Try syncing multiple times, disconnect/reconnect
5. **Verify Data:** Check database.json to see raw data structure

## 🔍 Common Issues During Testing

| Issue | Solution |
|-------|----------|
| "Failed to connect email" | Check app password, ensure 2FA enabled |
| "No transactions found" | Make sure you have unread transaction emails |
| "Duplicate transactions" | Check if same email processed multiple times |
| "Wrong category" | Category detection is automatic, can edit manually |
| "Sync not working" | Check backend logs, verify email credentials |

---

**Happy Testing! 🚀**

If you encounter any issues, check:
1. Backend terminal for error messages
2. Browser console (F12) for frontend errors
3. Database file for saved transactions








