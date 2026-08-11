// src/routes/RoleRoute.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // No roles specified
  if (!allowedRoles.length) {
    return <Outlet />;
  }

  // Check user's role
  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;