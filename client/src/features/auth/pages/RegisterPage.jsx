// src/features/auth/pages/RegisterPage.jsx

import React from "react";
import { Paper } from "@mui/material";
import RegisterForm from "../components/RegisterForm";

const RegisterPage = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3.5, sm: 4.5 },
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.07)",
      }}
    >
      <RegisterForm />
    </Paper>
  );
};

export default RegisterPage;
