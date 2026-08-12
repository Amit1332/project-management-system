// src/components/common/LoadingSpinner.jsx

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingSpinner = ({ label = "Loading...", size = 44, py = 6, minHeight = "50vh" }) => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: py,
        gap: 2,
      }}
    >
      <CircularProgress size={size} thickness={4} color="primary" />
      {label && (
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
