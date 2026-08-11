// src/features/profile/pages/ProfilePage.jsx

import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Divider,
  Chip,
} from "@mui/material";
import { User, Mail, Calendar, ShieldCheck, CheckCircle } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import LogoutButton from "../../auth/components/LogoutButton";
import { formatDate } from "../../../utils/formatDate";

const ProfilePage = () => {
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
    <Box>
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your personal account profile and credentials"
      />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {/* Top Header Card - Strictly Horizontal (Avatar + User Info on Left, Logout Button on Far Right) */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            width: "100%",
            marginBottom: "24px",
          }}
        >
          {/* Left Side: Avatar (68x68px) + Name + Active Chip + Email */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "20px", flex: 1, minWidth: 0 }}>
            <Avatar
              src={user?.avatar || undefined}
              sx={{
                width: 68,
                height: 68,
                bgcolor: "#4F46E5",
                fontSize: "1.5rem",
                fontWeight: 700,
                borderRadius: "16px",
                flexShrink: 0,
                boxShadow: "0 6px 16px rgba(79, 70, 229, 0.25)",
              }}
            >
              {getInitials(user?.name)}
            </Avatar>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
                  {user?.name || "User"}
                </Typography>

                <Chip
                  icon={<CheckCircle size={14} color="#16A34A" />}
                  label={user?.isActive ? "Active Account" : "Inactive"}
                  size="small"
                  sx={{ bgcolor: "#DCFCE7", color: "#15803D", fontWeight: 700, fontSize: "0.75rem" }}
                />
              </div>

              <Typography variant="body1" color="text.secondary" mt={0.5}>
                {user?.email}
              </Typography>
            </div>
          </div>

          {/* Right Side: Logout Button on Far Right */}
          <div style={{ flexShrink: 0 }}>
            <LogoutButton variant="outlined" color="error" size="medium" />
          </div>
        </div>

        <Divider sx={{ my: 3 }} />

        {/* Detailed User Attributes */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={2} p={2.5} bgcolor="#F8FAFC" borderRadius={3} border="1px solid #E2E8F0">
              <User color="#4F46E5" size={22} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Full Name
                </Typography>
                <Typography variant="body1" fontWeight={700} color="text.primary">
                  {user?.name || "-"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={2} p={2.5} bgcolor="#F8FAFC" borderRadius={3} border="1px solid #E2E8F0">
              <Mail color="#4F46E5" size={22} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Email Address
                </Typography>
                <Typography variant="body1" fontWeight={700} color="text.primary">
                  {user?.email || "-"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={2} p={2.5} bgcolor="#F8FAFC" borderRadius={3} border="1px solid #E2E8F0">
              <Calendar color="#4F46E5" size={22} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Member Since
                </Typography>
                <Typography variant="body1" fontWeight={700} color="text.primary">
                  {formatDate(user?.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={2} p={2.5} bgcolor="#F8FAFC" borderRadius={3} border="1px solid #E2E8F0">
              <ShieldCheck color="#4F46E5" size={22} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Authentication Status
                </Typography>
                <Typography variant="body1" fontWeight={700} color="text.primary">
                  JWT Authenticated
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
