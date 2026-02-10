import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLES } from '../../utils/constants';

/**
 * ProtectedRoute component for role-based access control
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {boolean} props.requireAuth - Whether authentication is required
 * @param {string} props.redirectTo - Where to redirect if not authorized
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show loading state if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F05537]"></div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user's role
    if (user?.role === ROLES.ADMIN) {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === ROLES.ORGANIZER) {
      return <Navigate to="/organizer" replace />;
    } else if (user?.role === ROLES.ATTENDEE) {
      return <Navigate to="/attendee" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
