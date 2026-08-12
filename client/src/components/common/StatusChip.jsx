// src/components/common/StatusChip.jsx

import React from "react";
import { Chip } from "@mui/material";

const roleColors = {
  OWNER: { bg: "#EEF2FF", text: "#eb4634", border: "#C7D2FE" },
  ADMIN: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
  MANAGER: { bg: "#E0F2FE", text: "#0284C7", border: "#BAE6FD" },
  MEMBER: { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" },
};

const statusColors = {
  ACTIVE: { bg: "#DCFCE7", text: "#15803D", border: "#BBF7D0" },
  PLANNING: { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" },
  ON_HOLD: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
  COMPLETED: { bg: "#DCFCE7", text: "#15803D", border: "#BBF7D0" },
  ARCHIVED: { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0" },
  TODO: { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" },
  IN_PROGRESS: { bg: "#E0F2FE", text: "#0284C7", border: "#BAE6FD" },
  IN_REVIEW: { bg: "#F3E8FF", text: "#7E22CE", border: "#E9D5FF" },
};

const StatusChip = ({ label, size = "small" }) => {
  const normalizedKey = (label || "").toUpperCase();
  const config =
    roleColors[normalizedKey] ||
    statusColors[normalizedKey] || {
      bg: "#F1F5F9",
      text: "#475569",
      border: "#E2E8F0",
    };

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        bgcolor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 24,
      }}
    />
  );
};

export default StatusChip;
