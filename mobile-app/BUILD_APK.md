# How to Build APK for Stash Mobile App

## Option 1: EAS Build (Recommended - Cloud Build)

### Prerequisites
1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```

2. Login to Expo account:
```bash
eas login
```
(If you don't have an account, create one at https://expo.dev)

### Build APK

1. Navigate to mobile-app directory:
```bash
cd mobile-app
```

2. Configure EAS (first time only):
```bash
eas build:configure
```

3. Build APK for Android:
```bash
eas build --platform android --profile preview
```

4. Wait for build to complete (5-15 minutes)

5. Download APK:
   - Build will provide a download link
   - Or check: https://expo.dev/accounts/[your-username]/projects/stash-mobile/builds

### Build Production APK
```bash
eas build --platform android --profile production
```

---

## Option 2: Local Build (Advanced)

### Prerequisites
- Android Studio installed
- Android SDK configured
- Java JDK installed

### Steps

1. Install dependencies:
```bash
cd mobile-app
npm install
```

2. Install Expo CLI:
```bash
npm install -g expo-cli
```

3. Build APK locally:
```bash
expo build:android -t apk
```

---

## Option 3: Quick Test Build (Expo Go)

For quick testing without building APK:

1. Start development server:
```bash
cd mobile-app
npm start
```

2. Install Expo Go app on your phone:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

3. Scan QR code with Expo Go app

---

## After Building

### Install APK on Phone

1. **Enable Unknown Sources:**
   - Go to Settings → Security → Enable "Install from Unknown Sources"

2. **Transfer APK:**
   - Download APK to your phone
   - Or transfer via USB/email/cloud

3. **Install:**
   - Tap the APK file
   - Follow installation prompts

---

## Important Notes

1. **API URL Configuration:**
   - Make sure `mobile-app/src/config/api.js` has correct backend URL
   - For production, use your deployed backend URL

2. **Build Time:**
   - First build: 10-15 minutes
   - Subsequent builds: 5-10 minutes

3. **APK Size:**
   - Preview build: ~30-50 MB
   - Production build: ~20-40 MB (optimized)

---

## Troubleshooting

### Build Fails
- Check internet connection
- Ensure Expo account is logged in
- Verify app.json configuration

### APK Won't Install
- Enable "Install from Unknown Sources"
- Check Android version compatibility (Android 6.0+)

### App Crashes
- Check backend API URL is correct
- Verify backend is running and accessible
- Check console logs for errors

---

## Quick Command Reference

```bash
# Login to Expo
eas login

# Build APK (preview)
eas build --platform android --profile preview

# Build APK (production)
eas build --platform android --profile production

# Check build status
eas build:list

# Download build
eas build:download
```

---

## Need Help?

- Expo Docs: https://docs.expo.dev/build/introduction/
- EAS Build: https://docs.expo.dev/build/eas-json/
- Support: Check Expo Discord or forums

