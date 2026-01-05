# Stash Mobile App

React Native mobile application for the Stash fintech platform.

## Features

- 📊 Dashboard with financial overview
- 💰 Expense & Income tracking
- 📈 Investment portfolio tracking
- 📰 Finance news
- 📊 Analytics & insights
- 🔐 Secure authentication

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (for Mac) or Android Studio (for Android)

### Installation

1. Navigate to the mobile-app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/config/api.js`:
```javascript
const API_URL = 'YOUR_BACKEND_URL/api';
```

4. Start the development server:
```bash
npm start
```

5. Run on your device:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── services/         # API services
│   ├── context/         # React Context providers
│   └── config/          # Configuration files
├── assets/              # Images and icons
├── App.js              # Main app component
└── package.json        # Dependencies
```

## Features Implemented

- ✅ Authentication (Login/Register)
- ✅ Dashboard with financial summary
- ✅ Expense tracking
- ✅ Income tracking
- ✅ Investment portfolio
- ✅ Finance news
- ✅ Analytics
- ✅ Stock details
- ✅ Settings

## API Integration

The app connects to your existing MERN backend. Make sure:
1. Backend is deployed and accessible
2. CORS is configured for mobile app
3. API endpoints match the service definitions

## Development

- Hot reload is enabled
- Use React Native Debugger for debugging
- Check Expo documentation for platform-specific features

## License

Same as main Stash project

