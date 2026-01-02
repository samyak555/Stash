import { Navigate } from 'react-router-dom';

/**
 * Protected Route - Only allows authenticated users
 * Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // Only allow authenticated users (require token and user)
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
