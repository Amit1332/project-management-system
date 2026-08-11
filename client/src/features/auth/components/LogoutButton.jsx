// src/features/auth/components/LogoutButton.jsx

import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { LogOut } from "lucide-react";
import { logout } from "../authSlice";
import { useLogoutMutation } from "../api/authApi";

const LogoutButton = ({ variant = "text", color = "error", size = "small" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      // Ignore network errors
    } finally {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      startIcon={<LogOut size={16} />}
      sx={{ textTransform: "none" }}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default LogoutButton;
