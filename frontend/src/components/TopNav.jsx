import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestMode } from '../hooks/useGuestMode';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Logo from './Logo';
import iconSrc from '../assets/logo/icon.png';

/**
 * Top Navigation Bar
 * - Shows Stash branding (logo + text) on LEFT
 * - Shows auth buttons/profile dropdown on RIGHT
 * - Premium SaaS-level design
 */
const TopNav = ({ user, setUser }) => {
  const navigate = useNavigate();
  const { isGuest } = useGuestMode();
  const [showDropdown, setShowDropdown] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  /**
   * Handle Google Sign-In - Directly trigger OAuth
   * Reuses the same Google OAuth flow from Login page
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

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isGuest');
      setUser(null);
      setShowDropdown(false);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  // Guest mode - show branding on left, sign in button on right
  if (isGuest) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sidebar-bg/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Stash Branding - Large logo + text on LEFT */}
            <div className="flex items-center gap-3 md:gap-4">
              <img
                src={iconSrc}
                alt="Stash"
                className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
                style={{ background: 'transparent', border: 'none', borderRadius: '0', boxShadow: 'none' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="text-xl md:text-2xl font-bold text-gradient-brand tracking-tight">
                Stash
              </span>
            </div>

            {/* Sign In Button - on RIGHT */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="px-4 py-2 text-sm md:text-base font-semibold text-white bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/20 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated user - show branding on left, profile dropdown on right
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-sidebar-bg/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Stash Branding - Large logo + text on LEFT */}
          <div className="flex items-center gap-3 md:gap-4">
            <img
              src={iconSrc}
              alt="Stash"
              className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
              style={{ background: 'transparent', border: 'none', borderRadius: '0', boxShadow: 'none' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="text-xl md:text-2xl font-bold text-gradient-brand tracking-tight">
              Stash
            </span>
          </div>

          {/* Profile Dropdown - on RIGHT */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-card-bg border border-border flex items-center justify-center">
                  <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <span className="hidden sm:inline text-sm font-medium text-text-primary truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <svg
                className={`w-4 h-4 text-text-secondary transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-card-bg border border-border rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-text-primary">{user?.name || 'User'}</p>
                    <p className="text-xs text-text-secondary truncate">{user?.email || ''}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;

