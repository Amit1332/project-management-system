// src/components/common/LoadingSpinner.jsx

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingSpinner = ({ label = "Loading...", size = 40, py = 4 }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={py}
      gap={2}
    >
      <CircularProgress size={size} thickness={4} color="primary" />
      {label && (
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
