// src/features/auth/components/RegisterForm.jsx

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Rocket } from "lucide-react";

import { useRegisterMutation } from "../api/authApi";
import { setCredentials } from "../authSlice";
import { formatError } from "../../../utils/formatError";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [registerApi, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await registerApi(formData).unwrap();
      if (response.success && response.data) {
        dispatch(
          setCredentials({
            user: response.data.user,
            accessToken: response.data.accessToken,
          })
        );
        navigate("/dashboard", { replace: true });
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
          Create an Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Join TaskCraft to collaborate on workspace projects & tasks
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
            Full Name
          </Typography>
          <TextField
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
            autoFocus
            placeholder="Amitesh Patel"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={18} color="#64748B" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

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
            placeholder="Password@123"
            helperText="At least 6 characters"
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
              <UserPlus size={20} />
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
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </Box>

      <Box textAlign="center" mt={3.5}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Link
            component={RouterLink}
            to="/login"
            fontWeight={700}
            color="primary.main"
            underline="hover"
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;
