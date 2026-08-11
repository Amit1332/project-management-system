// src/components/common/PriorityChip.jsx

import React from "react";
import { Chip } from "@mui/material";

const priorityConfig = {
  LOW: { bg: "#F1F5F9", text: "#475569" },
  MEDIUM: { bg: "#E0F2FE", text: "#0369A1" },
  HIGH: { bg: "#FEF3C7", text: "#B45309" },
  CRITICAL: { bg: "#FEE2E2", text: "#B91C1C" },
};

const PriorityChip = ({ priority = "MEDIUM", size = "small" }) => {
  const normalizedKey = (priority || "").toUpperCase();
  const config = priorityConfig[normalizedKey] || priorityConfig.MEDIUM;

  return (
    <Chip
      label={priority}
      size={size}
      sx={{
        bgcolor: config.bg,
        color: config.text,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 24,
      }}
    />
  );
};

export default PriorityChip;
