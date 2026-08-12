// src/features/auth/pages/LoginPage.jsx

import React from "react";
import { Paper } from "@mui/material";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, sm: 5 },
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.08)",
      }}
    >
      <LoginForm />
    </Paper>
  );
};

export default LoginPage;
