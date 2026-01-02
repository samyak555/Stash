import { Navigate } from 'react-router-dom';

/**
 * Protected Route - Allows both authenticated users and guests
 * Guests can view but cannot save data (handled by useGuestMode hook)
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const isGuest = localStorage.getItem('isGuest') === 'true';

  // Allow access if user is authenticated OR in guest mode
  if ((!token || !user) && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
