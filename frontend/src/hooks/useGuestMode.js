import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Hook to manage guest mode and restrictions
 * Shows modal when guest tries to perform write operations
 * Auto-clears guest data after 15 minutes
 */
export const useGuestMode = () => {
  const [isGuest, setIsGuest] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is in guest mode
    const guestStatus = localStorage.getItem('isGuest') === 'true';
    const userData = localStorage.getItem('user');
    const guestTimestamp = localStorage.getItem('guestTimestamp');
    
    if (guestStatus && userData) {
      try {
        const user = JSON.parse(userData);
        const isGuestUser = user.isGuest === true || user.role === 'guest';
        
        // Check if guest session has expired (15 minutes = 900000 ms)
        if (isGuestUser && guestTimestamp) {
          const timestamp = parseInt(guestTimestamp, 10);
          const now = Date.now();
          const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
          
          if (now - timestamp > fifteenMinutes) {
            // Guest session expired - clear guest data
            localStorage.removeItem('isGuest');
            localStorage.removeItem('user');
            localStorage.removeItem('guestTimestamp');
            setIsGuest(false);
            toast.info('Guest session expired. Please sign in to continue.', { duration: 5000 });
            return;
          }
        }
        
        setIsGuest(isGuestUser);
      } catch (e) {
        setIsGuest(false);
      }
    } else {
      setIsGuest(false);
    }

    // Set up interval to check for expiration every minute
    const checkInterval = setInterval(() => {
      const guestStatus = localStorage.getItem('isGuest') === 'true';
      const guestTimestamp = localStorage.getItem('guestTimestamp');
      
      if (guestStatus && guestTimestamp) {
        const timestamp = parseInt(guestTimestamp, 10);
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;
        
        if (now - timestamp > fifteenMinutes) {
          // Guest session expired
          localStorage.removeItem('isGuest');
          localStorage.removeItem('user');
          localStorage.removeItem('guestTimestamp');
          setIsGuest(false);
          toast.info('Guest session expired. Please sign in to continue.', { duration: 5000 });
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, []);

  /**
   * Check if action requires authentication
   * Shows upgrade modal if guest tries to save
   */
  const requireAuth = (actionName = 'save your data') => {
    if (isGuest) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  /**
   * Handle upgrade to authenticated user
   * Redirects to login page
   */
  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    navigate('/login');
    toast.success('Sign in with Google to save your progress!', {
      duration: 4000,
    });
  };

  /**
   * Close upgrade modal
   */
  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
  };

  return {
    isGuest,
    showUpgradeModal,
    requireAuth,
    handleUpgrade,
    closeUpgradeModal,
  };
};

