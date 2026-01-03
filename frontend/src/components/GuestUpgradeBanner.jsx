import { useNavigate } from 'react-router-dom';
import { useGuestMode } from '../hooks/useGuestMode';

/**
 * Persistent Guest Mode Upgrade Banner
 * Shows at top of app when user is in guest mode
 * Prompts sign-in with Google
 */
const GuestUpgradeBanner = () => {
  const navigate = useNavigate();
  const { isGuest } = useGuestMode();

  if (!isGuest) return null;

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 px-3 py-1.5 backdrop-blur-sm">
      <div className="max-w-full mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[10px] md:text-xs text-amber-200 truncate">
            <span className="font-medium">Guest</span> - Sign in to save
          </p>
        </div>
        <button
          onClick={handleSignIn}
          className="px-2 py-1 bg-white active:bg-gray-50 text-gray-900 rounded text-[10px] md:text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="hidden sm:inline">Sign in</span>
        </button>
      </div>
    </div>
  );
};

export default GuestUpgradeBanner;

