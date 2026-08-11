// src/components/common/EmptyState.jsx

import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { FolderPlus } from "lucide-react";

const EmptyState = ({
  icon: Icon = FolderPlus,
  title = "No items found",
  description = "Get started by creating your first item.",
  actionLabel,
  onAction,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 5,
        textAlign: "center",
        borderRadius: 3,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: "primary.50",
          color: "primary.main",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Icon size={28} />
      </Box>

      <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        maxWidth={400}
        mx="auto"
        mb={actionLabel && onAction ? 3 : 0}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          sx={{ textTransform: "none", px: 3 }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
