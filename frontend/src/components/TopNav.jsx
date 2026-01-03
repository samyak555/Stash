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

  // Guest mode - show branding only
  if (isGuest) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sidebar-bg/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Stash Branding - Large logo + text on LEFT */}
            <div className="flex items-center gap-4 md:gap-5">
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
          <div className="flex items-center gap-4 md:gap-5">
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

