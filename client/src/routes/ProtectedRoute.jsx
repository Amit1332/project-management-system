// src/routes/ProtectedRoute.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const location = useLocation();

  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;