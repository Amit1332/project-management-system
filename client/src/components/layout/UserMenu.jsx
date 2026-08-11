// src/components/layout/UserMenu.jsx

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { User, LogOut, Building, Shield } from "lucide-react";
import { logout } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../features/auth/api/authApi";

const UserMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, currentOrganization } = useSelector((state) => state.auth);
  const [logoutApi] = useLogoutMutation();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await logoutApi().unwrap();
    } catch (e) {
      // Ignore network errors on logout
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
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? "user-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Avatar
          src={user?.avatar || undefined}
          sx={{
            width: 36,
            height: 36,
            bgcolor: "primary.main",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          {getInitials(user?.name)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              width: 240,
              mt: 1,
              p: 1,
              borderRadius: 3,
            },
          },
        }}
      >
        <Box px={1.5} py={1}>
          <Typography variant="subtitle2" fontWeight={700} noWrap color="text.primary">
            {user?.name || "User"}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" noWrap>
            {user?.email}
          </Typography>
        </Box>

        {currentOrganization && (
          <Box
            mx={1}
            my={0.5}
            p={1}
            bgcolor="grey.50"
            borderRadius={2}
            border="1px solid"
            borderColor="divider"
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Active Organization:
            </Typography>
            <Typography variant="body2" fontWeight={600} noWrap color="primary.main">
              {currentOrganization.name}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={() => navigate("/profile")}>
          <ListItemIcon>
            <User size={18} />
          </ListItemIcon>
          <ListItemText primary="Profile & Settings" primaryTypographyProps={{ variant: "body2" }} />
        </MenuItem>

        <MenuItem onClick={() => navigate("/organizations")}>
          <ListItemIcon>
            <Building size={18} />
          </ListItemIcon>
          <ListItemText primary="My Organizations" primaryTypographyProps={{ variant: "body2" }} />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <LogOut size={18} color="#DC2626" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
