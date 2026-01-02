# SendGrid Setup Guide for Stash

## Why SendGrid?

- ✅ Works reliably on Render (no network restrictions)
- ✅ Free tier: 100 emails/day forever
- ✅ Better deliverability than Gmail SMTP
- ✅ Production-ready email service
- ✅ No App Password setup needed

## Step 1: Create SendGrid Account

1. Go to [https://sendgrid.com](https://sendgrid.com)
2. Click "Start for Free"
3. Sign up with your email
4. Verify your email address

## Step 2: Verify Sender Identity

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification** (easiest for testing)
3. Fill in your details:
   - **From Email**: `smtp-stash.auth7@gmail.com` (or your preferred email)
   - **From Name**: `Stash`
   - **Reply To**: Same as From Email
4. Click **Create**
5. **Check your email** and click the verification link

## Step 3: Create API Key

1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it: `Stash Backend`
4. Select **Full Access** (or **Restricted Access** with Mail Send permissions)
5. Click **Create & View**
6. **COPY THE API KEY** - you'll only see it once!
   - It looks like: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 4: Update Render Environment Variables

Go to your Render dashboard → Environment Variables and update:

### Remove/Update these:
- ❌ `EMAIL_HOST`: Change from `smtp.gmail.com` to `smtp.sendgrid.net`
- ❌ `EMAIL_PORT`: Change from `465` to `587`
- ❌ `EMAIL_USER`: Change from `smtp-stash.auth7@gmail.com` to `apikey`
- ❌ `EMAIL_PASS`: Change from Gmail App Password to your SendGrid API Key
- ✅ `EMAIL_FROM`: Keep as `Stash <smtp-stash.auth7@gmail.com>` (must match verified sender)

### New Values:

```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_actual_sendgrid_api_key_here
EMAIL_FROM=Stash <smtp-stash.auth7@gmail.com>
```

**Important Notes:**
- `EMAIL_USER` must be exactly `apikey` (lowercase, no quotes)
- `EMAIL_PASS` is your SendGrid API Key (starts with `SG.`)
- `EMAIL_FROM` must match the email you verified in SendGrid

## Step 5: Save and Deploy

1. Click **Save rebuild and deploy** in Render
2. Wait 2-3 minutes for deployment
3. Test the email service:
   ```
   https://stash-backend-4wty.onrender.com/api/test/email-verify
   ```

## Step 6: Test Email Sending

1. Try signing up with email/password
2. Check your inbox for verification email
3. Emails should arrive within seconds!

## Troubleshooting

### "Authentication failed"
- Make sure `EMAIL_USER` is exactly `apikey` (lowercase)
- Verify API key is correct (starts with `SG.`)
- Check API key has Mail Send permissions

### "Sender not verified"
- Make sure `EMAIL_FROM` email matches the verified sender in SendGrid
- Check SendGrid dashboard → Sender Authentication

### "Connection timeout"
- Try port `587` instead of `465`
- Check Render logs for specific errors

## SendGrid Free Tier Limits

- ✅ 100 emails/day forever
- ✅ Unlimited contacts
- ✅ Email API access
- ✅ Webhooks
- ✅ Analytics

For production, you can upgrade to paid plans for more emails.

## Need Help?

- SendGrid Docs: https://docs.sendgrid.com
- SendGrid Support: Available in dashboard

