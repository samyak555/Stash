import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Auth Guard Component
 * Waits for auth state to be resolved before rendering children
 * Prevents blank screens on protected routes
 */
const AuthGuard = ({ children, requireAuth = false }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const guestStatus = localStorage.getItem('isGuest') === 'true';

        if (guestStatus) {
          setIsGuest(true);
          setIsAuthenticated(false);
        } else if (token && user) {
          setIsAuthenticated(true);
          setIsGuest(false);
        } else {
          setIsAuthenticated(false);
          setIsGuest(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsGuest(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth required and not authenticated/guest, redirect to login
  if (requireAuth && !isAuthenticated && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  // If guest mode and auth required, show sign-in prompt
  if (requireAuth && isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4 max-w-md px-4">
          <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
          <p className="text-slate-400">Please sign in with Google to access this page.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthGuard;

