import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../utils/roleUtils';

/**
 * ProtectedRoute – Wraps routes that require authentication.
 * - No `role`/`roles` prop: any logged-in user may view it (used for
 *   pages like /internships that must not be visible pre-login, but
 *   aren't restricted to a single role).
 * - `role="STUDENT"`: only that single role may view it.
 * - `roles={["COMPANY", "PLACEMENT_OFFICER", "ADMIN"]}`: any of the
 *   listed roles may view it.
 */
const ProtectedRoute = ({ children, role, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <span className="loading-spinner" style={{ width: 40, height: 40 }}></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = roles || (role ? [role] : null);

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to the correct dashboard for their actual role
    return <Navigate to={dashboardPathForRole(user?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
