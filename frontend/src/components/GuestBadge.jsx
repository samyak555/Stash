import { useNavigate } from 'react-router-dom';

/**
 * Guest Mode Badge
 * Shows in UI when user is in guest mode
 * Clickable to upgrade to authenticated user
 */
const GuestBadge = () => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/login');
  };

  return (
    <button
      onClick={handleUpgrade}
      className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-sm font-medium transition-colors"
      title="Click to sign in and save your data"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span>Guest Mode</span>
    </button>
  );
};

export default GuestBadge;

