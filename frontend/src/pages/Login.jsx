import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

/**
 * Login Page - Google OAuth Only
 * - Google Sign-In (production-grade)
 * - Continue as Guest (read-only mode)
 * - Email auth disabled
 */
const Login = ({ setUser }) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check for messages/errors from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    const error = params.get('error');
    
    if (message) {
      toast.success(message);
      // Clean URL
      window.history.replaceState({}, '', '/login');
    }
    if (error) {
      if (error === 'account_deletion_failed') {
        toast.error('Failed to delete account. Please try again.');
      } else {
        toast.error('Authentication failed');
      }
      // Clean URL
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  /**
   * Handle Google Sign-In
   * Redirects to backend OAuth endpoint (Authorization Code Flow)
   */
  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    
    try {
      // Get backend URL
      const API_URL = import.meta.env.VITE_API_URL;
      
      let backendBaseUrl;
      if (API_URL) {
        backendBaseUrl = API_URL.replace('/api', '');
      } else {
        backendBaseUrl = 'https://stash-backend-4wty.onrender.com';
      }
      
      const oauthUrl = `${backendBaseUrl}/api/auth/google`;
      
      console.log('🔐 Redirecting to Google OAuth:', oauthUrl);
      
      // Redirect to backend OAuth endpoint
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      toast.error('Failed to initiate Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  /**
   * Handle Continue as Guest
   * Sets guest mode in localStorage and navigates to app
   */
  const handleGuestMode = () => {
    // Set guest mode with timestamp for auto-expiry
    const guestUser = {
      isGuest: true,
      name: 'Guest',
      email: null,
      emailVerified: false,
      role: 'guest',
    };
    
    localStorage.setItem('isGuest', 'true');
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('guestTimestamp', Date.now().toString()); // Store timestamp for auto-expiry
    setUser(guestUser);
    
    toast.success('Welcome! You\'re browsing in guest mode. Sign in to save your data.', {
      duration: 5000,
      icon: '👋',
    });
    
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Auth Header with Large Logo */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="max-w-7xl mx-auto">
          <Logo authPage={true} showText={true} />
        </div>
      </header>
      
      {/* Full Page Logo Background */}
      <Logo fullPage={true} />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-[400px] space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center animate-slide-up space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text tracking-tight">
              Welcome to Stash
            </h1>
            <p className="text-slate-400 text-base font-normal">
              Sign in to save your data, or continue as guest to explore
            </p>
          </div>
          
          {/* Auth Card */}
          <div className="glass-light p-8 sm:p-10 rounded-2xl space-y-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            {/* Google Sign-In Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white active:bg-gray-50 text-gray-900 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 shadow-lg"
              >
                {googleLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-slate-500">Or</span>
              </div>
            </div>

            {/* Continue as Guest Button */}
            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 active:bg-white/10 border border-white/10 text-white rounded-xl font-semibold text-base transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Continue as Guest</span>
            </button>

            {/* Guest Mode Info */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-amber-200">
                  <p className="font-medium mb-1">Guest Mode</p>
                  <p className="text-amber-300/80">
                    You can explore the app, but your data won't be saved. Sign in with Google to save your progress.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Login;
