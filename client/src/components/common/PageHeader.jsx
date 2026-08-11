// src/components/common/PageHeader.jsx

import React from "react";
import { Box, Typography, Button } from "@mui/material";

const PageHeader = ({
  title,
  subtitle,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  children,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        mb: 3.5,
        width: "100%",
      }}
    >
      <Box flex={1}>
        <Typography
          variant="h4"
          fontWeight={800}
          color="text.primary"
          letterSpacing="-0.02em"
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          startIcon={ActionIcon ? <ActionIcon size={18} /> : null}
          onClick={onAction}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 2.5,
            py: 1.2,
            borderRadius: 2.5,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
          }}
        >
          {actionLabel}
        </Button>
      )}

      {children}
    </Box>
  );
};

export default PageHeader;
