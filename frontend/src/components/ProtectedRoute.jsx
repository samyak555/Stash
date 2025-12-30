import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  } catch (error) {
    console.error('ProtectedRoute error:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;


