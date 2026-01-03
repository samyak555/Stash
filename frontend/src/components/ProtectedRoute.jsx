import { Navigate } from 'react-router-dom';

/**
 * Protected Route - Allows authenticated users and guests
 * Redirects to login if neither authenticated nor guest
 * NEVER returns null - always renders something
 */
const ProtectedRoute = ({ children, user }) => {
  // Check user prop first (from App.jsx), then fallback to localStorage
  const isGuest = user?.role === 'guest' || user?.isGuest === true || localStorage.getItem('isGuest') === 'true';
  const hasUser = user !== null && user !== undefined;
  const token = localStorage.getItem('token');
  const localStorageUser = localStorage.getItem('user');

  // Allow access if:
  // 1. User prop exists (authenticated or guest), OR
  // 2. Guest mode in localStorage, OR
  // 3. Token and user in localStorage (authenticated)
  if (hasUser || isGuest || (token && localStorageUser)) {
    return children;
  }

  // No user and not guest - redirect to login
  // NEVER return null - always render Navigate
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
