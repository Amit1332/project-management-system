// src/components/layout/UserMenu.jsx

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, IconButton, Tooltip } from "@mui/material";

const UserMenu = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Tooltip title={user?.name || "View Profile"}>
      <IconButton
        onClick={() => navigate("/profile")}
        size="small"
        sx={{ p: 0.5 }}
      >
        <Avatar
          src={user?.avatar || undefined}
          sx={{
            width: 36,
            height: 36,
            bgcolor: "primary.main",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "transform 0.15s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        >
          {getInitials(user?.name)}
        </Avatar>
      </IconButton>
    </Tooltip>
  );
};

export default UserMenu;
