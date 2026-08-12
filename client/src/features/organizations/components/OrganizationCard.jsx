// src/features/organizations/components/OrganizationCard.jsx

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
} from "@mui/material";
import { Building, ArrowRight, CheckCircle2 } from "lucide-react";
import StatusChip from "../../../components/common/StatusChip";
import { setCurrentOrganization } from "../../auth/authSlice";

const OrganizationCard = ({ item }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, currentOrganization } = useSelector((state) => state.auth);

  const org = item.organization || item;
  const role = item.role || "MEMBER";

  const isSelected = currentOrganization?._id === org._id;

  // Show Manage button for all roles EXCEPT when role is strictly MEMBER
  const isMemberRole = role === "MEMBER" && user?.systemRole !== "SUPER_ADMIN";
  const canManageOrg = !isMemberRole;

  const handleSelect = () => {
    dispatch(setCurrentOrganization(org));
  };

  const handleManage = () => {
    dispatch(setCurrentOrganization(org));
    navigate(`/organizations/${org._id}`);
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 3.5,
        border: "1px solid",
        borderColor: isSelected ? "primary.main" : "divider",
        bgcolor: isSelected ? "primary.50" : "background.paper",
        transition: "all 0.25s ease-in-out",
        boxShadow: isSelected ? "0 8px 24px -4px rgba(79, 70, 229, 0.15)" : "none",
        "&:hover": {
          boxShadow: "0 12px 28px -4px rgba(15, 23, 42, 0.1)",
          borderColor: "primary.light",
        },
      }}
    >
      <CardContent sx={{ p: 3, pb: 1.5 }}>
        {/* Top Header: Avatar + Org Name on Left, Role Chip Locked at Top-Right Corner */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            width: "100%",
            marginBottom: "16px",
          }}
        >
          {/* Left: Avatar + Org Name + Created Date */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
            <Avatar
              sx={{
                bgcolor: isSelected ? "primary.main" : "grey.100",
                color: isSelected ? "white" : "primary.main",
                width: 46,
                height: 46,
                borderRadius: 2.5,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              <Building size={22} />
            </Avatar>

            <div style={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={800} color="text.primary" noWrap letterSpacing="-0.02em">
                {org.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Created {new Date(org.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
            </div>
          </div>

          {/* Right: Role Chip locked at far top-right corner */}
          <div style={{ flexShrink: 0 }}>
            <StatusChip label={role} />
          </div>
        </div>

        {/* Org Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minHeight: 40,
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1,
          }}
        >
          {org.description || "No description provided."}
        </Typography>
      </CardContent>

      {/* Bottom Action Bar */}
      <Box
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {isSelected ? (
          <Chip
            icon={<CheckCircle2 size={15} color="#16A34A" />}
            label="Active Workspace"
            size="small"
            sx={{ bgcolor: "#DCFCE7", color: "#15803D", fontWeight: 700, fontSize: "0.72rem" }}
          />
        ) : (
          <Button
            size="small"
            variant="text"
            color="primary"
            onClick={handleSelect}
            sx={{ textTransform: "none", fontWeight: 700, px: 1 }}
          >
            Select Workspace
          </Button>
        )}

        {/* Hide Manage button ONLY if role in organization is MEMBER */}
        {canManageOrg && (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={handleManage}
            endIcon={<ArrowRight size={16} />}
            sx={{ textTransform: "none", borderRadius: 2.5, fontWeight: 700, px: 2 }}
          >
            Manage
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default OrganizationCard;
