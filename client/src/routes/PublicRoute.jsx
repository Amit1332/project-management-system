// src/routes/PublicRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = () => {
  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;