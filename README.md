# 💰 Stash - Smart Finance Tracker

A modern, full-stack personal finance tracking application built with React and Node.js.

## ✨ Features

- 📊 **Dashboard** - Comprehensive financial overview with charts and analytics
- 💸 **Expense Tracking** - Track and categorize your expenses
- 💰 **Income Management** - Record and monitor income sources
- 📈 **Budget Planning** - Set and track monthly budgets
- 🎯 **Financial Goals** - Create and monitor savings goals
- 👨‍👩‍👧‍👦 **Family Groups** - Share expenses with family and friends
- 🤖 **AI Insights** - Get smart financial recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/stash-finance.git
cd stash-finance
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Start Backend Server**
```bash
cd ../backend
npm run dev
```
Backend runs on `http://localhost:5000`

5. **Start Frontend Development Server**
```bash
cd ../frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

## 📁 Project Structure

```
stash-finance/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── data/            # Database file (JSON)
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main app component
│   └── public/          # Static assets
└── logo/                # Logo files
```

## 🌐 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick Deploy:**
- **Frontend**: Deploy to [Vercel](https://vercel.com) (Free)
- **Backend**: Deploy to [Render](https://render.com) (Free tier)

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Recharts
- React Router
- Axios

**Backend:**
- Node.js
- Express.js
- JWT Authentication
- File-based JSON Database

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
```

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Samyak Jain**
- Email: sam718ind@gmail.com

---

Made with ❤️ for better financial management


