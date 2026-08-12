// src/components/layout/Sidebar.jsx

import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  LayoutDashboard,
  Building,
  FolderKanban,
  CheckSquare,
  User,
  Rocket,
  ChevronsUpDown,
  Plus,
  LogOut,
  X,
} from "lucide-react";
import { useGetMyOrganizationsQuery } from "../../features/organizations/api/organizationApi";
import { setCurrentOrganization, logout } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../features/auth/api/authApi";

export const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Organizations", path: "/organizations", icon: Building },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Tasks", path: "/tasks", icon: CheckSquare },
  { label: "Profile", path: "/profile", icon: User },
];

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, currentOrganization } = useSelector((state) => state.auth);
  const { data: orgData } = useGetMyOrganizationsQuery();
  const [logoutApi] = useLogoutMutation();

  const [orgMenuAnchor, setOrgMenuAnchor] = useState(null);
  const isOrgMenuOpen = Boolean(orgMenuAnchor);

  const orgs = orgData?.data || [];

  const handleOrgClick = (e) => {
    setOrgMenuAnchor(e.currentTarget);
  };

  const handleOrgClose = () => {
    setOrgMenuAnchor(null);
  };

  const handleSelectOrg = (org) => {
    dispatch(setCurrentOrganization(org));
    handleOrgClose();
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      // Ignore
    } finally {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

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
    <div
      style={{
        width: "260px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #E2E8F0",
        position: onClose ? "relative" : "fixed",
        top: 0,
        left: 0,
        zIndex: 1100,
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      {/* 1. Top Brand Logo Header - STRICTLY HORIZONTAL */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 20px 16px 20px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>
        
<div
  style={{
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  }}
>
  <img
    src="/favicon.png"
    alt="Sunday logo"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "contain",
    }}
  />
</div>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#0F172A",
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            Sunday
          </span>
        </div>

        {onClose && (
          <IconButton onClick={onClose} size="small" sx={{ color: "#64748B" }}>
            <X size={20} />
          </IconButton>
        )}
      </div>

      <div style={{ height: "1px", backgroundColor: "#F1F5F9", margin: "0 20px 16px 20px" }} />

      {/* 2. Workspace Selector Card */}
      <div style={{ padding: "0 16px", marginBottom: "20px" }}>
        <div
          onClick={handleOrgClick}
          style={{
            padding: "12px",
            borderRadius: "12px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            cursor: "pointer",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#eb4634",
                fontSize: "0.78rem",
                fontWeight: 700,
                borderRadius: "8px",
                flexShrink: 0,
              }}
            >
              {currentOrganization ? getInitials(currentOrganization.name) : "O"}
            </Avatar>
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  display: "block",
                  lineHeight: 1,
                  marginBottom: "3px",
                }}
              >
                Workspace
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentOrganization?.name || "Select Workspace"}
              </span>
            </div>
          </div>
          <ChevronsUpDown size={16} color="#64748B" style={{ flexShrink: 0 }} />
        </div>

        {/* Workspace Dropdown Menu */}
        <Menu
          anchorEl={orgMenuAnchor}
          open={isOrgMenuOpen}
          onClose={handleOrgClose}
          slotProps={{
            paper: {
              sx: {
                width: 220,
                mt: 1,
                borderRadius: 2.5,
                boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12)",
                border: "1px solid #E2E8F0",
              },
            },
          }}
        >
          <Box px={2} py={1}>
            <Typography variant="caption" color="#64748B" fontWeight={700} textTransform="uppercase">
              Your Workspaces
            </Typography>
          </Box>

          <Divider />

          {orgs.length === 0 ? (
            <MenuItem disabled>No Workspaces Available</MenuItem>
          ) : (
            orgs.map((item) => {
              const org = item.organization || item;
              const isSelected = currentOrganization?._id === org._id;
              return (
                <MenuItem
                  key={org._id}
                  onClick={() => handleSelectOrg(org)}
                  selected={isSelected}
                  sx={{ py: 1 }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Typography variant="body2" fontWeight={isSelected ? 700 : 500} noWrap color="#0F172A">
                      {org.name}
                    </Typography>
                    {item.role && (
                      <Chip
                        label={item.role}
                        size="small"
                        sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, ml: 1 }}
                      />
                    )}
                  </Box>
                </MenuItem>
              );
            })
          )}

          <Divider />

          <MenuItem
            onClick={() => {
              handleOrgClose();
              navigate("/organizations");
            }}
            sx={{ color: "#eb4634", fontWeight: 700, py: 1 }}
          >
            <Plus size={16} style={{ marginRight: 8 }} />
            Create / Manage All
          </MenuItem>
        </Menu>
      </div>

      {/* 3. Main Navigation Links (No "Main Menu" text label!) */}
      <div style={{ flex: 1, padding: "0 16px" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                marginBottom: "6px",
                borderRadius: "10px",
                textDecoration: "none",
                backgroundColor: isActive ? "#EEF2FF" : "transparent",
                color: isActive ? "#eb4634" : "#64748B",
                fontWeight: isActive ? 700 : 600,
                fontSize: "0.9rem",
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Icon size={19} color={isActive ? "#eb4634" : "#64748B"} style={{ flexShrink: 0 }} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* 4. Bottom User Profile Card - STRICTLY HORIZONTAL & ABSOLUTE BOTTOM */}
      <div style={{ marginTop: "auto", padding: "16px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            padding: "12px",
            borderRadius: "12px",
            backgroundColor: "#F0F4FF",
            border: "1px solid #C7D2FE",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#eb4634",
                fontSize: "0.85rem",
                fontWeight: 700,
                borderRadius: "8px",
                flexShrink: 0,
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                }}
              >
                {user?.name || "User"}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#475569",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: "2px",
                }}
              >
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <LogOut size={16} color="#DC2626" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
