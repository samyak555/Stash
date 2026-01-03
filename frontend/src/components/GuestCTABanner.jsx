import { useGuestMode } from '../hooks/useGuestMode';

/**
 * Guest CTA Banner
 * Shows inside guest mode - informational only, NO sign-in button
 * Sign-in is handled by TopNav header (single entry point)
 * Subtle, professional design
 */
const GuestCTABanner = () => {
  const { isGuest } = useGuestMode();

  if (!isGuest) return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-200 mb-0.5">You are in Guest Mode</p>
          <p className="text-xs text-amber-300/80">
            Viewing in read-only mode. Use the "Sign in with Google" button in the header to save your data and unlock full features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestCTABanner;

