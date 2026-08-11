// src/pages/UnauthorizedPage.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Button } from "@mui/material";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      p={3}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          maxWidth: 480,
          textAlign: "center",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "error.50",
            color: "error.main",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <ShieldAlert size={32} />
        </Box>

        <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
          Access Denied
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={4}>
          You do not have permission to view this page or perform this operation. Please contact your organization owner or administrator.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate("/dashboard")}
          sx={{ textTransform: "none" }}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default UnauthorizedPage;