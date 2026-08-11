// src/components/common/ErrorState.jsx

import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ErrorState = ({
  title = "Something went wrong",
  message = "Failed to load data. Please check your network connection and try again.",
  onRetry,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: "center",
        borderRadius: 3,
        border: "1px border",
        borderColor: "error.light",
        bgcolor: "error.50",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: "error.light",
          color: "error.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
          opacity: 0.15,
        }}
      >
        <AlertTriangle size={28} />
      </Box>

      <Typography variant="h6" color="error.dark" fontWeight={600} gutterBottom>
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        maxWidth={460}
        mx="auto"
        mb={3}
      >
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="outlined"
          color="error"
          startIcon={<RefreshCw size={16} />}
          onClick={onRetry}
          size="small"
        >
          Try Again
        </Button>
      )}
    </Paper>
  );
};

export default ErrorState;
