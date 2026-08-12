// src/features/organizations/pages/OrganizationDetailsPage.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Building,
  Edit3,
  UserPlus,
  ArrowLeft,
  Calendar,
  Shield,
  Users,
} from "lucide-react";

import { useGetOrganizationQuery } from "../api/organizationApi";
import OrganizationMembersList from "../components/OrganizationMembersList";
import EditOrganizationDialog from "../components/EditOrganizationDialog";
import AddMemberDialog from "../components/AddMemberDialog";
import StatusChip from "../../../components/common/StatusChip";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import { formatError } from "../../../utils/formatError";
import { formatDate } from "../../../utils/formatDate";

const OrganizationDetailsPage = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetOrganizationQuery(organizationId, {
    skip: !organizationId,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const { user: currentUser } = useSelector((state) => state.auth);

  const orgDetail = data?.data || {};
  const org = orgDetail.organization || orgDetail;
  const isOwnerByDoc =
    org.ownerId === currentUser?._id ||
    org.ownerId?._id === currentUser?._id ||
    org.ownerId === currentUser?.id;

  const currentUserRole =
    orgDetail.role || (isOwnerByDoc ? "OWNER" : "MEMBER");

  const isOwnerOrAdmin = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  if (isLoading) {
    return <LoadingSpinner label="Fetching organization details..." py={8} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load organization"
        message={formatError(error)}
        onRetry={refetch}
      />
    );
  }

  return (
    <Box>
      {/* Breadcrumb Navigation */}
      <Box mb={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/organizations");
            }}
            sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.875rem" }}
          >
            <ArrowLeft size={16} /> Organizations
          </Link>
          <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
            {org.name || "Organization Details"}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          {/* Left Side: Icon + Org Name + Description */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px", flex: 1, minWidth: "280px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#eb4634",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
              }}
            >
              <Building size={24} color="#FFFFFF" />
            </div>

            <div>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
                  {org.name}
                </Typography>
                <StatusChip label={currentUserRole} />
              </div>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {org.description || "No description provided for this organization."}
              </Typography>
            </div>
          </div>

          {/* Right Side: Edit Details Button Only */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px", flexShrink: 0 }}>
            {isOwnerOrAdmin && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Edit3 size={18} />}
                onClick={() => setIsEditOpen(true)}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2.5, px: 2.5, py: 1 }}
              >
                Edit Details
              </Button>
            )}
          </div>
        </div>

        <Divider sx={{ my: 3 }} />

        {/* Key Metrics */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Calendar size={20} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formatDate(org.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Shield size={20} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Your Role
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {currentUserRole}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Users size={20} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Workspace Status
                </Typography>
                <Typography variant="body2" fontWeight={700} color="success.main">
                  Active
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Team Members Section Header - Title on Left, Add Member Button on Far Right */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        <Typography variant="h5" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
          Team Members
        </Typography>

        {isOwnerOrAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<UserPlus size={18} />}
            onClick={() => setIsAddMemberOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              py: 1.2,
              borderRadius: 2.5,
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
              whiteSpace: "nowrap",
            }}
          >
            Add Member
          </Button>
        )}
      </div>

      <OrganizationMembersList
        organizationId={organizationId}
        currentUserRole={currentUserRole}
      />

      {/* Edit Organization Dialog */}
      {isOwnerOrAdmin && (
        <EditOrganizationDialog
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          organization={org}
        />
      )}

      {/* Add Member Dialog */}
      {isOwnerOrAdmin && (
        <AddMemberDialog
          open={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          organizationId={organizationId}
        />
      )}
    </Box>
  );
};

export default OrganizationDetailsPage;
