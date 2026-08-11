// src/routes/PublicRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = () => {
  const { token, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const hasToken = (isAuthenticated && Boolean(token)) || Boolean(localStorage.getItem("token"));

  if (hasToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;