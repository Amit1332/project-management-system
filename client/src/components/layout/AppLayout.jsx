// src/components/layout/AppLayout.jsx

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Container } from "@mui/material";

import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import PageLoader from "../common/PageLoader";

import { useGetMeQuery } from "../../features/auth/api/authApi";
import { useGetMyOrganizationsQuery } from "../../features/organizations/api/organizationApi";
import { setAuthUser, setCurrentOrganization } from "../../features/auth/authSlice";

import { initSocket, disconnectSocket, joinRoom } from "../../services/socket";

const AppLayout = () => {
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { token, currentOrganization } = useSelector((state) => state.auth);

  // Initialize socket on token change
  useEffect(() => {
    if (token) {
      const socket = initSocket(token);
      return () => {
        disconnectSocket();
      };
    }
  }, [token]);

  // Join organization room on currentOrganization change
  useEffect(() => {
    if (currentOrganization?._id) {
      joinRoom("organization", currentOrganization._id);
    }
  }, [currentOrganization]);

  // Sync auth user profile
  const { data: userData, isLoading: userLoading } = useGetMeQuery(undefined, {
    skip: !token,
  });

  // Fetch organizations to auto-select if needed
  const { data: orgsData } = useGetMyOrganizationsQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (userData?.data) {
      dispatch(setAuthUser(userData.data));
    }
  }, [userData, dispatch]);

  useEffect(() => {
    const orgs = orgsData?.data || [];
    if (orgs.length > 0 && !currentOrganization) {
      const defaultOrg = orgs[0].organization || orgs[0];
      dispatch(setCurrentOrganization(defaultOrg));
    }
  }, [orgsData, currentOrganization, dispatch]);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  if (userLoading) {
    return <PageLoader label="Loading workspace..." />;
  }

  return (
    <Box display="flex" minHeight="100vh" bgcolor="#F8FAFC">
      {/* Desktop Fixed Sidebar */}
      <Box
        sx={{
          display: { xs: "none", lg: "block" },
          width: 260,
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </Box>

      {/* Mobile Drawer */}
      <MobileSidebar open={mobileOpen} onClose={handleDrawerToggle} />

      {/* Main Content Area Offset by 260px */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { lg: "260px" },
          width: { xs: "100%", lg: "calc(100% - 260px)" },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header onMobileMenuOpen={handleDrawerToggle} />

        <Container
          maxWidth="xl"
          sx={{
            flexGrow: 1,
            py: { xs: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
