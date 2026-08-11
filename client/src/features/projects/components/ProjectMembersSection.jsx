// src/features/projects/components/ProjectMembersSection.jsx

import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import { UserPlus, MoreVertical, Shield, Trash2, Users } from "lucide-react";
import {
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useUpdateProjectMemberRoleMutation,
  useRemoveProjectMemberMutation,
} from "../api/projectApi";
import { useGetMembersQuery } from "../../organizations/api/organizationApi";
import StatusChip from "../../../components/common/StatusChip";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import { formatError } from "../../../utils/formatError";

const ProjectMembersSection = ({ projectId }) => {
  const { currentOrganization } = useSelector((state) => state.auth);

  const {
    data: projectMembersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectMembersQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId }
  );

  const { data: orgMembersData } = useGetMembersQuery(currentOrganization?._id, {
    skip: !currentOrganization?._id,
  });

  const [addProjectMember, { isLoading: isAdding }] = useAddProjectMemberMutation();
  const [updateMemberRole] = useUpdateProjectMemberRoleMutation();
  const [removeMember] = useRemoveProjectMemberMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("MEMBER");
  const [actionError, setActionError] = useState("");

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const projectMembers = projectMembersData?.data || [];
  const orgMembers = orgMembersData?.data || [];

  // Filter out org members who are already in the project
  const availableUsers = orgMembers.filter((m) => {
    const userId = m.userId?._id || m.userId;
    return !projectMembers.some((pm) => (pm.userId?._id || pm.userId) === userId);
  });

  const handleOpenMenu = (e, member) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedMember(member);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedMember(null);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setActionError("");

    try {
      await addProjectMember({
        projectId,
        userId: selectedUserId,
        role: selectedRole,
        organizationId: currentOrganization?._id,
      }).unwrap();
      setIsAddOpen(false);
      setSelectedUserId("");
      setSelectedRole("MEMBER");
    } catch (err) {
      setActionError(formatError(err));
    }
  };

  const handleRoleChange = async (newRole) => {
    if (!selectedMember) return;
    handleCloseMenu();
    try {
      await updateMemberRole({
        projectId,
        userId: selectedMember.userId?._id || selectedMember.userId,
        role: newRole,
        organizationId: currentOrganization?._id,
      }).unwrap();
    } catch (err) {
      setActionError(formatError(err));
    }
  };

  const handleRemove = async () => {
    if (!selectedMember) return;
    handleCloseMenu();
    try {
      await removeMember({
        projectId,
        userId: selectedMember.userId?._id || selectedMember.userId,
        organizationId: currentOrganization?._id,
      }).unwrap();
    } catch (err) {
      setActionError(formatError(err));
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading project members..." py={4} />;
  }

  if (isError) {
    return <ErrorState message={formatError(error)} onRetry={refetch} />;
  }

  return (
    <Box>
      {/* Section Header */}
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
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          <Users size={20} color="#4F46E5" style={{ flexShrink: 0 }} />
          <Typography variant="h6" fontWeight={800} color="text.primary" letterSpacing="-0.02em" noWrap>
            Project Members & Roles ({projectMembers.length})
          </Typography>
        </div>

        <Button
          variant="contained"
          color="primary"
          startIcon={<UserPlus size={16} />}
          onClick={() => setIsAddOpen(true)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 2.5,
            py: 1,
            borderRadius: 2.5,
            whiteSpace: "nowrap",
            flexShrink: 0,
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
          }}
        >
          Add Project Member
        </Button>
      </div>

      {actionError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 3.5, border: "1px solid", borderColor: "divider" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#F8FAFC" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Member</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Project Role</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: "#475569" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectMembers.map((member) => {
              const u = member.userId || {};
              return (
                <TableRow key={member._id || u._id} hover>
                  <TableCell>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>
                      <Avatar
                        src={u.avatar}
                        sx={{ width: 34, height: 34, bgcolor: "#4F46E5", fontSize: "0.8rem", fontWeight: 700, borderRadius: "8px", flexShrink: 0 }}
                      >
                        {getInitials(u.name)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={700} color="text.primary">
                        {u.name || "User"}
                      </Typography>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {u.email}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <StatusChip label={member.role || "MEMBER"} />
                  </TableCell>

                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, member)}>
                      <MoreVertical size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleRoleChange("MANAGER")}>
          Set Role as MANAGER
        </MenuItem>
        <MenuItem onClick={() => handleRoleChange("MEMBER")}>
          Set Role as MEMBER
        </MenuItem>
        <MenuItem onClick={handleRemove} sx={{ color: "error.main" }}>
          Remove from Project
        </MenuItem>
      </Menu>

      {/* Add Member Modal - Medium Field Size & Explicit mb: 3 Spacing */}
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pt: 3, px: 3, pb: 1, fontSize: "1.25rem" }}>
          Add Member to Project
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, py: 3.5 }}>
          <Box component="form" id="add-project-member-form" onSubmit={handleAddMember} display="flex" flexDirection="column">
            <FormControl fullWidth size="medium" sx={{ mb: 3 }}>
              <InputLabel>Select Team Member</InputLabel>
              <Select
                value={selectedUserId}
                label="Select Team Member"
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                size="medium"
              >
                {availableUsers.map((m) => {
                  const u = m.userId || {};
                  return (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth size="medium">
              <InputLabel>Project Role</InputLabel>
              <Select
                value={selectedRole}
                label="Project Role"
                onChange={(e) => setSelectedRole(e.target.value)}
                size="medium"
              >
                <MenuItem value="MANAGER">MANAGER (Full control over project tasks & settings)</MenuItem>
                <MenuItem value="MEMBER">MEMBER (Can view tasks, create & comment)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button onClick={() => setIsAddOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-project-member-form"
            variant="contained"
            disabled={isAdding || !selectedUserId}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              py: 1,
              borderRadius: 2.5,
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
            }}
          >
            {isAdding ? "Adding..." : "Add Member"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectMembersSection;
