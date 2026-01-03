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
      // Set a maximum timeout to ensure initialization always completes
      const timeoutId = setTimeout(() => {
        console.warn('App initialization timeout - forcing completion');
        setLoading(false);
      }, 3000); // 3 second maximum timeout

      try {
        setError(null);
        
        // Handle OAuth token from URL query params (redirect from backend)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const statusFromUrl = urlParams.get('status');
        
        if (tokenFromUrl) {
          // OAuth redirect - save token and user data from URL params
          try {
            localStorage.setItem('token', tokenFromUrl);
            
            // Get user data from URL params
            const name = urlParams.get('name');
            const email = urlParams.get('email');
            const role = urlParams.get('role') || 'user';
            const onboardingCompleted = urlParams.get('onboardingCompleted') === 'true';
            const userId = urlParams.get('_id');
            const emailVerified = urlParams.get('emailVerified') === 'true';
            const age = urlParams.get('age');
            const profession = urlParams.get('profession');
            const needsOnboarding = urlParams.get('needsOnboarding') === 'true';
            const isNewUser = urlParams.get('isNewUser') === 'true';
            
            // Clear guest mode when signing in
            localStorage.removeItem('isGuest');
            localStorage.removeItem('guestTimestamp');
            
            // Construct user data
            const userData = {
              _id: userId || '',
              name: name ? decodeURIComponent(name) : (email ? email.split('@')[0] : 'User'),
              email: email ? decodeURIComponent(email) : '',
              emailVerified: emailVerified,
              role: role,
              onboardingCompleted: onboardingCompleted,
              age: age ? parseInt(age, 10) : null,
              profession: profession ? decodeURIComponent(profession) : null,
            };
            
            // Validate user data
            if (userData.email) {
              localStorage.setItem('user', JSON.stringify(userData));
              
              // Sync onboardingCompleted
              if (userData.onboardingCompleted) {
                localStorage.setItem('onboardingCompleted', 'true');
              } else {
                localStorage.removeItem('onboardingCompleted');
              }
              
              // Set user state
              setUser(userData);
              
              // Clean URL - remove query params
              window.history.replaceState({}, '', '/');
              
              // Show success message if available
              const message = urlParams.get('message');
              if (message) {
                toast.success(decodeURIComponent(message));
              } else {
                toast.success('Signed in successfully!');
              }
              
              // Navigation will be handled by React Router based on user state
              // No need to navigate here - let the app render normally
            }
          } catch (tokenError) {
            console.error('Error handling OAuth token:', tokenError);
            // Clean URL even on error
            window.history.replaceState({}, '', '/');
          }
        }
        
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        
        if (isGuest && userData) {
          // Guest mode - no token needed
          try {
            const parsedUser = JSON.parse(userData);
            // Normalize guest user object with safe defaults
            const normalizedUser = {
              _id: parsedUser._id || '',
              name: parsedUser.name || 'Guest',
              email: parsedUser.email || '',
              emailVerified: false,
              role: 'guest',
              onboardingCompleted: false,
              age: parsedUser.age || null,
              profession: parsedUser.profession || null,
            };
            setUser(normalizedUser);
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            localStorage.removeItem('isGuest');
            localStorage.removeItem('user');
            localStorage.removeItem('guestTimestamp');
            setUser(null);
          }
        } else if (token && userData) {
          // Authenticated user - verify token is still valid
          try {
            const parsedUser = JSON.parse(userData);
            // Clear guest mode if user is authenticated
            localStorage.removeItem('isGuest');
            localStorage.removeItem('guestTimestamp');
            
            // Verify user object has required fields and normalize
            if (parsedUser && parsedUser.email) {
              // Normalize user object with safe defaults to prevent blank screen
              const normalizedUser = {
                _id: parsedUser._id || '',
                name: parsedUser.name || parsedUser.email.split('@')[0] || 'User',
                email: parsedUser.email,
                emailVerified: parsedUser.emailVerified === true,
                role: parsedUser.role || 'user',
                onboardingCompleted: parsedUser.onboardingCompleted === true, // Always boolean
                age: parsedUser.age || null,
                profession: parsedUser.profession || null,
              };
              setUser(normalizedUser);
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
        // Always clear timeout and set loading to false
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  // Hard failsafe - ensure loading never stays true forever
  useEffect(() => {
    const failsafeTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Failsafe: Forcing loading to false after 5 seconds');
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(failsafeTimeout);
  }, [loading]);

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

  // CRITICAL: Do not render routes while loading - prevents blank screen
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
                {/* Legal Pages */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/data-deletion" element={<DataDeletionPolicy />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute user={user}>
                      <Layout user={user} setUser={setUser}>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cards"
                  element={
                    <ProtectedRoute user={user}>
                      <Layout user={user} setUser={setUser}>
                        <Cards />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute user={user}>
                      <Layout user={user} setUser={setUser}>
                        <Transactions />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute user={user}>
                      <Layout user={user} setUser={setUser}>
                        <Expenses />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/income"
                  element={
                    <ProtectedRoute user={user}>
                      <Layout user={user} setUser={setUser}>
                        <Income />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/budgets"
                  element={
                    <ProtectedRoute user={user}>
                      <Layout user={user} setUser={setUser}>
                        <Budgets />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <ProtectedRoute user={user}>
                      <Layout user={user} setUser={setUser}>
                        <Goals />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insights"
                  element={
                    <ProtectedRoute user={user}>
                      <Layout user={user} setUser={setUser}>
                        <Insights />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/family"
                  element={
                    <ProtectedRoute user={user}>
                      <Layout user={user} setUser={setUser}>
                        <Family />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute user={user}>
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


