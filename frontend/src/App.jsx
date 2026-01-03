import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { CardsProvider } from './contexts/CardsContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Cards from './pages/Cards';
import Transactions from './pages/Transactions';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Insights from './pages/Insights';
import Family from './pages/Family';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DataDeletionPolicy from './pages/DataDeletionPolicy';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        
        if (isGuest && userData) {
          // Guest mode - no token needed
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            localStorage.removeItem('isGuest');
            localStorage.removeItem('user');
            localStorage.removeItem('guestTimestamp');
            // Don't set error - just clear invalid data
          }
        } else if (token && userData) {
          // Authenticated user - verify token is still valid
          try {
            const parsedUser = JSON.parse(userData);
            // Clear guest mode if user is authenticated
            localStorage.removeItem('isGuest');
            localStorage.removeItem('guestTimestamp');
            
            // Verify user object has required fields
            if (parsedUser && parsedUser.email) {
              setUser(parsedUser);
            } else {
              // Invalid user data - force logout
              console.warn('Invalid user data, forcing logout');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            // Force logout on parse error
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isGuest');
            localStorage.removeItem('guestTimestamp');
            setUser(null);
          }
        } else {
          // No auth data - ensure clean state
          setUser(null);
        }
      } catch (err) {
        console.error('App initialization error:', err);
        setError(err.message || 'Failed to initialize app');
        // Force logout on critical error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isGuest');
        setUser(null);
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };
    
    // Add a timeout to ensure loading state doesn't persist forever
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('App initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, 5000); // 5 second timeout
    
    initializeApp();
    
    return () => clearTimeout(timeout);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white p-8">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-lg">Loading Stash...</p>
        </div>
      </div>
    );
  }

  // Always render something - even if user is null, show login
  // Wrap everything in ErrorBoundary for global safety
  return (
    <ErrorBoundary>
      <ExpenseProvider>
        <CardsProvider>
          <Router>
            <Toaster position="top-right" />
            <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register setUser={setUser} />}
        />
        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/" replace /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={user ? <Navigate to="/" replace /> : <ResetPassword />}
        />
        <Route
          path="/auth/callback"
          element={<AuthCallback setUser={setUser} />}
        />
        {/* Legal Pages */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/data-deletion" element={<DataDeletionPolicy />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout user={user} setUser={setUser}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards"
          element={
            <ProtectedRoute>
              <Layout user={user} setUser={setUser}>
                <Cards />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Layout user={user} setUser={setUser}>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Layout user={user} setUser={setUser}>
                <Expenses />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/income"
          element={
            <ProtectedRoute>
              <Layout user={user} setUser={setUser}>
                <Income />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <Layout user={user} setUser={setUser}>
                <Budgets />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Layout user={user} setUser={setUser}>
                <Goals />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Layout user={user} setUser={setUser}>
                <Insights />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute>
              <Layout user={user} setUser={setUser}>
                <Family />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout user={user} setUser={setUser}>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </CardsProvider>
      </ExpenseProvider>
    </ErrorBoundary>
  );
}

export default App;


