import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Invest from './pages/Invest';
import FinanceNews from './pages/FinanceNews';
import StockDetail from './pages/StockDetail';
import PortfolioInsights from './pages/PortfolioInsights';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DataDeletionPolicy from './pages/DataDeletionPolicy';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Inner component that can use useLocation hook
function AppContent({ setUser: setUserProp }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Process OAuth callback from URL
  useEffect(() => {
    const processOAuthCallback = () => {
      const urlParams = new URLSearchParams(location.search);
      const tokenFromUrl = urlParams.get('token');
      const errorFromUrl = urlParams.get('error');

      console.log('🔍 Processing OAuth callback:', {
        pathname: location.pathname,
        search: location.search,
        hasToken: !!tokenFromUrl,
        hasError: !!errorFromUrl
      });

      if (errorFromUrl) {
        console.error('❌ Error in URL params:', errorFromUrl, urlParams.get('message'));
        return;
      }

      if (tokenFromUrl) {
        console.log('🔐 OAuth token found in URL');
        try {
          // Get all user data from URL params
          const name = urlParams.get('name');
          const email = urlParams.get('email');
          const role = urlParams.get('role') || 'user';
          const onboardingCompleted = urlParams.get('onboardingCompleted') === 'true';
          const userId = urlParams.get('_id');
          const emailVerified = urlParams.get('emailVerified') === 'true';
          const age = urlParams.get('age');
          const profession = urlParams.get('profession');

          console.log('📋 Extracted data:', { email, userId, hasEmail: !!email, hasId: !!userId });

          // Clear guest mode
          localStorage.removeItem('isGuest');
          localStorage.removeItem('guestTimestamp');

          // Construct user data - decode if needed
          const userData = {
            _id: userId || '',
            name: name ? decodeURIComponent(name) : (email ? decodeURIComponent(email).split('@')[0] : 'User'),
            email: email ? decodeURIComponent(email) : '',
            emailVerified: emailVerified,
            role: role,
            onboardingCompleted: onboardingCompleted,
            age: age ? parseInt(age, 10) : null,
            profession: profession ? decodeURIComponent(profession) : null,
          };

          console.log('📋 Processed user data:', { 
            email: userData.email, 
            _id: userData._id, 
            hasEmail: !!userData.email, 
            hasId: !!userData._id 
          });

          // Validate - must have email and _id
          if (userData.email && userData._id) {
            // Save to localStorage FIRST
            localStorage.setItem('token', tokenFromUrl);
            localStorage.setItem('user', JSON.stringify(userData));
            
            if (userData.onboardingCompleted) {
              localStorage.setItem('onboardingCompleted', 'true');
            } else {
              localStorage.removeItem('onboardingCompleted');
            }

            console.log('✅ Saved to localStorage, setting user state');
            
            // Set user state
            setUser(userData);
            setUserProp(userData);

            // Clean URL
            window.history.replaceState({}, '', '/');

            // Show success
            toast.success('Signed in successfully!', { duration: 2000 });
            console.log('✅ OAuth login complete');

            // Automatic page refresh after 1 second to ensure everything loads correctly
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            console.error('❌ Missing required data:', { email: userData.email, _id: userData._id });
            toast.error('Failed to sign in. Missing user data.');
            window.history.replaceState({}, '', '/login');
          }
        } catch (error) {
          console.error('❌ Error processing OAuth callback:', error);
          toast.error('Failed to process sign-in.');
          window.history.replaceState({}, '', '/login');
        }
      }
    };

    processOAuthCallback();
  }, [location.search, location.pathname, setUserProp]);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeUser = () => {
      try {
        const token = localStorage.getItem('token');
        const userDataStr = localStorage.getItem('user');
        const isGuest = localStorage.getItem('isGuest') === 'true';

        if (isGuest && userDataStr) {
          const parsedUser = JSON.parse(userDataStr);
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
          setUserProp(normalizedUser);
        } else if (token && userDataStr) {
          const parsedUser = JSON.parse(userDataStr);
          if (parsedUser && parsedUser.email) {
            const normalizedUser = {
              _id: parsedUser._id || '',
              name: parsedUser.name || parsedUser.email.split('@')[0] || 'User',
              email: parsedUser.email,
              emailVerified: parsedUser.emailVerified === true,
              role: parsedUser.role || 'user',
              onboardingCompleted: parsedUser.onboardingCompleted === true,
              age: parsedUser.age || null,
              profession: parsedUser.profession || null,
            };
            setUser(normalizedUser);
            setUserProp(normalizedUser);
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only initialize from localStorage if no token in URL
    const urlParams = new URLSearchParams(location.search);
    if (!urlParams.get('token')) {
      initializeUser();
    } else {
      setLoading(false);
    }
  }, [location.search, setUserProp]);

  // Failsafe timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Failsafe: Forcing loading to false');
        setLoading(false);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <>
      <Toaster position="top-right" />
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-lg">Loading...</p>
          </div>
        </div>
      )}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login setUser={(u) => { setUser(u); setUserProp(u); }} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register setUser={(u) => { setUser(u); setUserProp(u); }} />}
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
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/data-deletion" element={<DataDeletionPolicy />} />
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Cards />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Expenses />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/income"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Income />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Budgets />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Goals />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Insights />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Family />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invest"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <Invest />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/news"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <FinanceNews />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stocks/:symbol"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <StockDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/net-worth"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <NetWorth />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio-insights"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={(u) => { setUser(u); setUserProp(u); }}>
                <PortfolioInsights />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <ErrorBoundary>
      <ExpenseProvider>
        <CardsProvider>
          <Router>
            <AppContent setUser={setUser} />
          </Router>
        </CardsProvider>
      </ExpenseProvider>
    </ErrorBoundary>
  );
}

export default App;
