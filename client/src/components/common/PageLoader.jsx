// src/components/common/PageLoader.jsx

import React from "react";
import { Box } from "@mui/material";
import LoadingSpinner from "./LoadingSpinner";

const PageLoader = ({ label = "Loading application..." }) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F8FAFC",
        zIndex: 9999,
      }}
    >
      <LoadingSpinner label={label} size={48} />
    </Box>
  );
};

export default PageLoader;
