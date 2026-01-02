import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Modal shown when guest tries to perform write operations
 * Prompts user to sign in with Google
 */
const GuestUpgradeModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    navigate('/login');
    toast.success('Sign in with Google to save your progress!', {
      duration: 4000,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 animate-scale-in">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-white">
            Sign In Required
          </h3>
          <p className="text-slate-400 text-base">
            You're currently browsing in guest mode. Sign in with Google to save your data and access all features.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSignIn}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25"
          >
            Sign in with Google
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
          >
            Continue as Guest
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-center text-slate-500">
          Your data will only be saved locally while in guest mode
        </p>
      </div>
    </div>
  );
};

export default GuestUpgradeModal;

