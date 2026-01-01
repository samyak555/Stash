# 🚀 Auto-Transaction Sync Guide

Your Stash Finance app now supports **automatic transaction fetching** from emails, payment apps, and banks!

## ✨ Features

### 1. **Email-Based Transaction Parsing**
- Automatically reads transaction emails from your inbox
- Extracts transaction details (amount, merchant, date)
- Categorizes transactions automatically
- Works with:
  - **Paytm** - UPI and wallet transactions
  - **PhonePe** - Payment transactions
  - **MakeMyTrip** - Travel bookings
  - **Bank Transactions** - Debit/credit alerts
  - **Zomato/Swiggy** - Food delivery
  - **Uber/Ola** - Ride bookings
  - **BookMyShow** - Entertainment tickets

### 2. **Automatic Syncing**
- Syncs every 5 minutes automatically
- Manual sync available anytime
- Duplicate prevention
- Secure password encryption

### 3. **Webhook Support**
- Razorpay webhooks
- Paytm webhooks
- Generic webhook endpoint for custom integrations

## 🎯 How to Use

### Step 1: Connect Your Email

1. Go to **Settings** page (from navigation menu)
2. Enter your email address
3. Enter your **App Password** (not your regular password)

#### For Gmail Users:
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Scroll down to **App Passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Use this password in Settings (not your regular Gmail password)

#### For Other Email Providers:
- **Outlook/Hotmail**: Use IMAP settings with app password
- **Yahoo**: Enable "Less secure app access" or use app password
- **Custom IMAP**: Enter your IMAP host and port in Settings

### Step 2: Wait for Auto-Sync

- Transactions sync automatically every 5 minutes
- You'll see new transactions appear in your Expenses page
- Check the Dashboard for sync status indicator

### Step 3: Manual Sync (Optional)

- Click **"Sync Now"** button in Settings to trigger immediate sync
- Useful when you want to fetch transactions right away

## 📊 Supported Transaction Types

### Payment Apps
- ✅ Paytm payments
- ✅ PhonePe payments
- ✅ Any UPI transaction emails

### Travel & Transport
- ✅ MakeMyTrip bookings
- ✅ Uber rides
- ✅ Ola rides
- ✅ Flight/hotel bookings

### Food & Entertainment
- ✅ Zomato orders
- ✅ Swiggy orders
- ✅ BookMyShow tickets

### Banking
- ✅ Debit transactions
- ✅ Credit card payments
- ✅ Bank alerts

## 🔒 Security

- **Encrypted Storage**: Passwords are encrypted before storing
- **Secure IMAP**: All email connections use TLS/SSL
- **No Email Content Stored**: Only transaction data is extracted and saved
- **Token-Based Auth**: Webhook endpoints use signature verification

## ⚙️ Configuration

### Environment Variables (Backend)

Add to your `.env` file:

```env
# Encryption key for storing email passwords (change in production!)
ENCRYPTION_KEY=your-secret-encryption-key-change-this

# Webhook secrets (optional, for payment gateways)
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### IMAP Settings

Default settings work for Gmail. For other providers:

| Provider | Host | Port |
|----------|------|------|
| Gmail | imap.gmail.com | 993 |
| Outlook | outlook.office365.com | 993 |
| Yahoo | imap.mail.yahoo.com | 993 |
| Custom | Your IMAP server | 993 (or 143 for non-SSL) |

## 🐛 Troubleshooting

### Email Connection Fails
- ✅ Check your app password is correct
- ✅ Verify 2-Step Verification is enabled (for Gmail)
- ✅ Check IMAP is enabled in your email settings
- ✅ Try different IMAP host/port

### No Transactions Found
- ✅ Make sure you receive transaction emails in that inbox
- ✅ Check if emails are in "Inbox" folder (not Promotions/Spam)
- ✅ Try manual sync first
- ✅ Check sync status shows "Connected"

### Duplicate Transactions
- The system prevents duplicates automatically
- If duplicates appear, they may have different amounts or dates
- You can delete duplicates manually from Expenses page

## 🔌 Webhook Integration

### Razorpay Webhook

Configure webhook URL in Razorpay dashboard:
```
https://your-backend-url.com/api/transactions/webhook/razorpay
```

### Generic Webhook

Send POST request to:
```
POST /api/transactions/webhook/generic
Content-Type: application/json

{
  "userId": "user_id_here",
  "amount": 1000,
  "description": "Payment description",
  "category": "food",
  "date": "2024-01-15T10:30:00.000Z",
  "source": "custom_source"
}
```

## 📈 What Gets Synced

- ✅ Transaction amount
- ✅ Merchant/description
- ✅ Transaction date
- ✅ Category (auto-detected)
- ✅ Source (Paytm, PhonePe, etc.)

## 🎨 UI Features

- **Sync Status Banner** on Dashboard when email is connected
- **Last Sync Time** displayed in Settings
- **Manual Sync Button** for on-demand syncing
- **Connection Status Indicator** (green dot when connected)

## 🚀 Next Steps

1. Connect your email in Settings
2. Wait 5 minutes for first auto-sync
3. Or click "Sync Now" for immediate sync
4. Check Expenses page for new transactions
5. Enjoy automatic expense tracking! 🎉

---

**Note**: The system only reads **unread** emails from the last 7 days to prevent duplicate processing.








