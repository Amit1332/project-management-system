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
      {/* Mobile Logo Brand */}
      <Box
        display={{ xs: "inline-flex", md: "none" }}
        alignItems="center"
        gap={1.5}
        mb={3}
        sx={{ width: "fit-content" }}
      >
        <Box sx={{ bgcolor: "primary.main", color: "white", p: 1, borderRadius: 2, display: "inline-flex" }}>
          <Rocket size={20} />
        </Box>
        <Typography variant="h6" fontWeight={800} color="text.primary">
          TaskCraft
        </Typography>
      </Box>

      {/* Title */}
      <Box mb={3.5}>
        <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em" gutterBottom>
          Sign in to TaskCraft
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your email address and password to access your workspace
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={2.5}>
        <Box>
          <Typography variant="caption" fontWeight={700} color="text.primary" mb={0.8} display="block">
            Email Address
          </Typography>
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
          />
        </Box>

        <Box>
          <Typography variant="caption" fontWeight={700} color="text.primary" mb={0.8} display="block">
            Password
          </Typography>
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
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

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
            mt: 1,
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
      </Box>

      <Box textAlign="center" mt={3.5}>
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
