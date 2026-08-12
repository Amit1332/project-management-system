// src/features/auth/components/LoginForm.jsx

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff, LogIn, Rocket } from "lucide-react";

import { useLoginMutation } from "../api/authApi";
import { setCredentials } from "../authSlice";
import { formatError } from "../../../utils/formatError";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginApi, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      const response = await loginApi(formData).unwrap();
      if (response.success && response.data) {
        dispatch(
          setCredentials({
            user: response.data.user,
            accessToken: response.data.accessToken,
          })
        );
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage(formatError(err));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {/* Brand Icon Header */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            backgroundColor: "#4F46E5",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(79, 70, 229, 0.3)",
          }}
        >
          <Rocket size={22} color="#FFFFFF" />
        </div>
        <Typography variant="h6" fontWeight={800} color="#0F172A">
          TaskCraft
        </Typography>
      </div>

      {/* Main Form Title - Generous 32px Bottom Margin */}
      <div style={{ marginBottom: "32px" }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A" letterSpacing="-0.02em">
          Sign in to TaskCraft
        </Typography>
      </div>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Form Fields & Spacing - Explicit 24px Vertical Gap */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <TextField
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          autoFocus
          placeholder="name@example.com"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={18} color="#64748B" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
            },
          }}
        />

        <TextField
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          required
          fullWidth
          placeholder="••••••••"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={18} color="#64748B" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <LogIn size={20} />
            )
          }
          sx={{
            py: 1.4,
            borderRadius: 2.5,
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
          }}
        >
          {isLoading ? "Signing in..." : "Sign In to Workspace"}
        </Button>
      </div>

      <Box textAlign="center" mt={4}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{" "}
          <Link
            component={RouterLink}
            to="/register"
            fontWeight={700}
            color="primary.main"
            underline="hover"
          >
            Create free account
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
