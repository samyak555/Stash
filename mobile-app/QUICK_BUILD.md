# 🚀 Quick APK Build - One Command

## ⚡ FASTEST WAY TO GET YOUR APK

### Windows (PowerShell):
```powershell
cd mobile-app; npm install -g eas-cli; eas login; eas build --platform android --profile preview
```

### Mac/Linux:
```bash
cd mobile-app && npm install -g eas-cli && eas login && eas build --platform android --profile preview
```

---

## 📋 Step-by-Step (If Above Doesn't Work)

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```
👉 Create free account at https://expo.dev if needed

### 3. Navigate to Mobile App
```bash
cd mobile-app
```

### 4. Configure (First Time Only)
```bash
eas build:configure
```

### 5. Build APK
```bash
eas build --platform android --profile preview
```

### 6. Wait & Get Link
- ⏳ Wait 5-15 minutes
- 📱 You'll get download link in terminal
- 🔗 Or check: https://expo.dev → Your Project → Builds

---

## 📥 After Build Completes

You'll see:
```
✅ Build finished
📱 Download: https://expo.dev/artifacts/...
```

**Click the link to download APK!**

---

## 📲 Install on Phone

1. Enable "Install from Unknown Sources" in Android settings
2. Download APK from link
3. Tap to install

---

## ⚠️ Important

- **First build:** Takes 10-15 minutes
- **Free Expo account:** Required (100% free)
- **Internet:** Must be connected during build

---

## 🆘 Troubleshooting

**"eas: command not found"**
→ Run: `npm install -g eas-cli`

**"Not logged in"**
→ Run: `eas login` (create account if needed)

**Build fails?**
→ Check: `eas build:list` for error details

---

## ✅ That's It!

Run the command, wait 10 minutes, get your APK link! 🎉

