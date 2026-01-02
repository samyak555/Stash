import { Navigate } from 'react-router-dom';

/**
 * Protected Route - Allows authenticated users and guests
 * Redirects to login if neither authenticated nor guest
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const isGuest = localStorage.getItem('isGuest') === 'true';

  // Allow access if authenticated OR in guest mode
  if ((!token || !user) && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
