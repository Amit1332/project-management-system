// client/src/components/layout/Header.jsx

import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Chip,
} from "@mui/material";
import { Menu as MenuIcon, Building, Sparkles } from "lucide-react";
import UserMenu from "./UserMenu";
import NotificationDropdown from "../../features/notifications/components/NotificationDropdown";

const pageTitles = {
  "/dashboard": "Dashboard Overview",
  "/organizations": "Organizations Management",
  "/projects": "Project Workspaces",
  "/tasks": "Tasks & Activities",
  "/profile": "Account Profile",
};

const Header = ({ onMobileMenuOpen }) => {
  const location = useLocation();
  const { currentOrganization } = useSelector((state) => state.auth);

  const currentTitle = pageTitles[location.pathname] || "Workspace";

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        top: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer - 1,
        bgcolor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        height: 64,
        justifyContent: "center",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
        {/* Left Side: Mobile Drawer Trigger & Page Context Header - Strictly Horizontal Row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <IconButton
            onClick={onMobileMenuOpen}
            edge="start"
            size="small"
            sx={{ display: { lg: "none" }, border: "1px solid", borderColor: "divider" }}
          >
            <MenuIcon size={20} />
          </IconButton>

          <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ lineHeight: 1, whiteSpace: "nowrap" }}>
            {currentTitle}
          </Typography>
        </div>

        {/* Right Side: Active Workspace Badge, Notification Dropdown & User Menu strictly horizontal row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {currentOrganization ? (
            <Chip
              icon={<Sparkles size={14} color="#4F46E5" />}
              label={currentOrganization.name}
              size="small"
              sx={{
                bgcolor: "primary.50",
                color: "primary.main",
                fontWeight: 700,
                fontSize: "0.75rem",
                display: { xs: "none", sm: "inline-flex" },
                border: "1px solid",
                borderColor: "primary.light",
              }}
            />
          ) : (
            <Chip
              label="No Active Workspace"
              size="small"
              sx={{
                bgcolor: "warning.50",
                color: "warning.dark",
                fontWeight: 600,
                fontSize: "0.75rem",
                display: { xs: "none", sm: "inline-flex" },
              }}
            />
          )}

          <NotificationDropdown />
          <UserMenu />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
