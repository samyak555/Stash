import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Hook to manage guest mode and restrictions
 * Shows modal when guest tries to perform write operations
 */
export const useGuestMode = () => {
  const [isGuest, setIsGuest] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is in guest mode
    const guestStatus = localStorage.getItem('isGuest') === 'true';
    const userData = localStorage.getItem('user');
    
    if (guestStatus && userData) {
      try {
        const user = JSON.parse(userData);
        setIsGuest(user.isGuest === true || user.role === 'guest');
      } catch (e) {
        setIsGuest(false);
      }
    } else {
      setIsGuest(false);
    }
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

