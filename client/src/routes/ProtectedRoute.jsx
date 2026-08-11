// src/routes/ProtectedRoute.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const location = useLocation();

  const { token, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const hasToken = isAuthenticated || Boolean(token) || Boolean(localStorage.getItem("token"));

  if (!hasToken) {
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