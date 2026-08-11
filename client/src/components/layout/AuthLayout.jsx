// src/components/layout/AuthLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Typography, Paper, Stack } from "@mui/material";
import { Rocket, Sparkles, CheckCircle2 } from "lucide-react";

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        bgcolor: "#F8FAFC",
      }}
    >
      {/* Left Side Showcase (50% Width on tablet & desktop) */}
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          width: { sm: "50%", md: "50%" },
          minHeight: "100vh",
          background: "linear-gradient(145deg, #090D16 0%, #0F172A 40%, #1E1B4B 100%)",
          color: "white",
          p: { sm: 4, md: 5, lg: 7 },
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
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "white",
              p: 1.2,
              borderRadius: 2.5,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(79, 70, 229, 0.4)",
            }}
          >
            <Rocket size={22} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em" lineHeight={1.1}>
              TaskCraft
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }} fontWeight={500}>
              Project Management Platform
            </Typography>
          </Box>
        </Box>

        {/* Pitch Content */}
        <Box my="auto" maxWidth={480}>
          <Box
            display="inline-flex"
            alignItems="center"
            gap={1}
            px={2}
            py={0.6}
            borderRadius={20}
            bgcolor="rgba(255, 255, 255, 0.08)"
            backdropFilter="blur(10px)"
            mb={3}
            border="1px solid rgba(255, 255, 255, 0.12)"
            sx={{ width: "fit-content" }}
          >
            <Sparkles size={14} color="#FBBF24" />
            <Typography variant="caption" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
              Full Stack MERN SaaS
            </Typography>
          </Box>

          <Typography variant="h3" fontWeight={800} lineHeight={1.25} mb={2} letterSpacing="-0.02em">
            Manage projects, teams & workspaces seamlessly.
          </Typography>

          <Typography variant="body1" sx={{ opacity: 0.8, fontSize: "0.95rem", lineHeight: 1.6 }} mb={4}>
            Centralized task tracking, multi-tenant organization boundaries, role-based access control, and 4-stage Kanban workflows.
          </Typography>

          <Stack spacing={2}>
            {[
              { title: "Multi-Tenant Workspaces", desc: "Complete data isolation for organization units" },
              { title: "Role-Based Access Control", desc: "Granular permissions for Owners, Admins & Members" },
              { title: "Kanban & Task Management", desc: "Status stages with drag-and-drop & comment history" },
            ].map((item, idx) => (
              <Box
                key={idx}
                display="flex"
                alignItems="flex-start"
                gap={2}
                p={2}
                borderRadius={3}
                bgcolor="rgba(255, 255, 255, 0.05)"
                border="1px solid rgba(255, 255, 255, 0.08)"
              >
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    p: 0.8,
                    borderRadius: 2,
                    display: "inline-flex",
                    mt: 0.2,
                  }}
                >
                  <CheckCircle2 size={16} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="white">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          © {new Date().getFullYear()} TaskCraft SaaS. All rights reserved.
        </Typography>
      </Box>

      {/* Right Side Form Container (50% Width on tablet & desktop) */}
      <Box
        sx={{
          width: { xs: "100%", sm: "50%" },
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2.5, sm: 3, md: 6 },
          boxSizing: "border-box",
        }}
      >
        <Box width="100%" maxWidth={400}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
