# How to Access Stash App

## 🌐 Web Application

### Option 1: Production URL (If Deployed)
If the app is deployed on a hosting service (like Render, Vercel, Netlify, etc.), you can access it via:
- **Frontend URL**: Check your deployment service dashboard
- **Backend URL**: Check your deployment service dashboard

### Option 2: Local Development

#### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

#### Steps to Run Locally

1. **Clone the Repository** (if not already done)
```bash
git clone <your-repo-url>
cd gullak_sam
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Configure Environment Variables**
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. **Start Backend Server**
```bash
npm run dev
# or
npm start
```
Backend will run on: `http://localhost:5000`

5. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
```

6. **Configure Frontend API URL**
Update `frontend/.env` or `frontend/src/services/api.js`:
```env
VITE_API_URL=http://localhost:5000/api
```

7. **Start Frontend Server**
```bash
npm run dev
# or
npm start
```
Frontend will run on: `http://localhost:3000` (or port shown in terminal)

8. **Access the App**
Open your browser and go to:
```
http://localhost:3000
```

## 📱 Mobile Application

### Prerequisites
- Node.js
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Steps to Run Mobile App

1. **Navigate to Mobile App Directory**
```bash
cd mobile-app
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure API URL**
Update `mobile-app/src/config/api.js`:
```javascript
const API_URL = 'http://localhost:5000/api'; // or your backend URL
```

4. **Start Expo**
```bash
npx expo start
```

5. **Run on Device**
- Scan QR code with Expo Go app (Android/iOS)
- Or press `a` for Android emulator
- Or press `i` for iOS simulator

## 🔑 Default Access

### Create Account
1. Go to Sign Up page
2. Enter email, password, and other details
3. Verify email (if email verification is enabled)

### Guest Mode
Some features may be available in guest mode without login.

## 🚀 Quick Start (All-in-One)

If you want to run everything at once:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Terminal 3: Mobile (optional)
cd mobile-app
npm install
npx expo start
```

## 📝 Important Notes

1. **MongoDB Connection**: Make sure MongoDB is running and accessible
2. **CORS**: Backend CORS is configured to allow frontend origin
3. **API Keys**: Some features require API keys (NewsAPI, etc.) - check `.env` file
4. **Ports**: Default ports are 5000 (backend) and 3000 (frontend) - change if needed

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify `.env` file exists
- Check if port 5000 is available

### Frontend can't connect to backend
- Verify backend is running
- Check API URL in frontend config
- Check CORS settings in backend

### News not loading
- Check internet connection
- Verify Google News RSS is accessible
- Check browser console for errors

## 📞 Support

For issues or questions, check:
- Backend logs: `backend` terminal output
- Frontend logs: Browser console (F12)
- Mobile logs: Expo terminal output

