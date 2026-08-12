// src/components/layout/AuthLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Typography, Stack } from "@mui/material";
import { Rocket, CheckCircle2 } from "lucide-react";

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#F8FAFC",
      }}
    >
      {/* Left Side Showcase (50% Width) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "50%",
          minHeight: "100vh",
          background: "linear-gradient(145deg, #4e0e03fb 0%, #050101 40%, #280d0a 100%)",
          color: "white",
          p: { md: 6, lg: 8 },
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Ambient Glow */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        {/* Brand Header */}
        <Box display="inline-flex" alignItems="center" gap={1.5} sx={{ width: "fit-content" }}>
         <div
  style={{
    width: "44px",
    height: "44px",
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
          <Box>
            <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em" lineHeight={1.1}>
              Sunday
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }} fontWeight={500}>
              Project Management Platform
            </Typography>
          </Box>
        </Box>

        {/* Pitch Content */}
        <Box my="auto" maxWidth={480}>
          <Typography variant="h3" fontWeight={800} lineHeight={1.25} mb={2.5} letterSpacing="-0.02em">
            Manage projects, teams & workspaces seamlessly.
          </Typography>

          {/* Description Text - Explicit 36px Bottom Margin */}
          <Typography variant="body1" sx={{ opacity: 0.8, fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "36px" }}>
            Centralized task tracking, multi-tenant organization boundaries, role-based access control, and 4-stage Kanban workflows.
          </Typography>

          <Stack spacing={2.5}>
            {[
              { title: "Multi-Tenant Workspaces", desc: "Complete data isolation for organization units" },
              { title: "Role-Based Access Control", desc: "Granular permissions for Owners, Admins & Members" },
              { title: "Kanban & Task Management", desc: "Status stages with drag-and-drop & comment history" },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "#ec5544",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={18} color="#FFFFFF" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="white" lineHeight={1.2}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    {item.desc}
                  </Typography>
                </div>
              </div>
            ))}
          </Stack>
        </Box>

        <div />
      </Box>

      {/* Right Side Form Container */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 4, md: 6 },
          boxSizing: "border-box",
        }}
      >
        <Box width="100%" maxWidth={420}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
