# 📱 Build APK for Stash Mobile App

## 🚀 Quick Start (EAS Build - Recommended)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
Create account at https://expo.dev if needed (FREE)

### Step 3: Navigate to Mobile App
```bash
cd mobile-app
```

### Step 4: Configure EAS (First Time Only)
```bash
eas build:configure
```

### Step 5: Build APK
```bash
eas build --platform android --profile preview
```

### Step 6: Wait & Download
- Build takes 5-15 minutes
- You'll get a download link
- Or check: https://expo.dev → Your Project → Builds

---

## 📥 Download APK

After build completes, you'll get:
- **Direct Download Link** in terminal
- **QR Code** to scan with phone
- **Build Page URL** to check status

---

## 📲 Install on Phone

1. **Enable Unknown Sources:**
   - Settings → Security → Install Unknown Apps → Enable

2. **Download APK:**
   - Click download link from build
   - Or scan QR code

3. **Install:**
   - Tap downloaded APK
   - Follow prompts

---

## ⚙️ Configure Backend URL

Before building, update API URL:

**File:** `mobile-app/src/config/api.js`

```javascript
const API_URL = 'https://your-backend-url.com/api';
// Or for local testing: 'http://your-ip:5000/api'
```

---

## 🔧 Alternative: Local Build

If you have Android Studio:

```bash
cd mobile-app
npm install
npx expo install expo-dev-client
npx expo prebuild
cd android
./gradlew assembleRelease
```

APK will be in: `android/app/build/outputs/apk/release/`

---

## 📋 Build Profiles

- **Preview:** APK for testing (faster, larger)
- **Production:** Optimized APK (smaller, optimized)

---

## ⚡ Quick Test (No Build Needed)

Use Expo Go app:

1. Install Expo Go from Play Store
2. Run: `cd mobile-app && npm start`
3. Scan QR code with Expo Go

---

## 🆘 Troubleshooting

**Build Fails?**
- Check internet connection
- Verify Expo login: `eas whoami`
- Check app.json is valid

**APK Won't Install?**
- Enable "Install from Unknown Sources"
- Check Android version (needs 6.0+)

**App Crashes?**
- Verify backend URL in `src/config/api.js`
- Check backend is running
- Check backend CORS allows mobile app

---

## 📞 Need Help?

- Expo Docs: https://docs.expo.dev/build/introduction/
- EAS Build Guide: https://docs.expo.dev/build/eas-json/

---

## 🎯 Current Status

The mobile app is ready to build! Just run:

```bash
cd mobile-app
eas build --platform android --profile preview
```

You'll get your APK download link in 5-15 minutes! 🚀

