// src/features/organizations/components/OrganizationMembersList.jsx

import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Alert,
  Tooltip,
} from "@mui/material";
import { Trash2, UserX } from "lucide-react";

import {
  useGetMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} from "../api/organizationApi";
import SearchInput from "../../../components/common/SearchInput";
import StatusChip from "../../../components/common/StatusChip";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { formatError } from "../../../utils/formatError";

const OrganizationMembersList = ({ organizationId, currentUserRole }) => {
  const { user: currentUser } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");

  const {
    data: membersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMembersQuery(organizationId, {
    skip: !organizationId,
  });

  const [updateMemberRole, { isLoading: isRoleUpdating }] = useUpdateMemberRoleMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();

  const [actionError, setActionError] = useState("");
  const [memberToRemove, setMemberToRemove] = useState(null);

  const members = membersData?.data || [];

  const filteredMembers = members.filter((m) => {
    const u = m.userId || {};
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q))
    );
  });

  const isOwner = currentUserRole === "OWNER";
  const isAdmin = currentUserRole === "ADMIN" || isOwner;

  const handleRoleChange = async (memberUserId, newRole) => {
    setActionError("");
    try {
      await updateMemberRole({
        organizationId,
        userId: memberUserId,
        role: newRole,
      }).unwrap();
    } catch (err) {
      setActionError(formatError(err));
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setActionError("");
    try {
      await removeMember({
        organizationId,
        userId: memberToRemove.userId._id || memberToRemove.userId,
      }).unwrap();
      setMemberToRemove(null);
    } catch (err) {
      setActionError(formatError(err));
      setMemberToRemove(null);
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
    return <LoadingSpinner label="Loading organization members..." />;
  }

  if (isError) {
    return <ErrorState message={formatError(error)} onRetry={refetch} />;
  }

  return (
    <Box>
      {actionError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      {/* Member Search Bar */}
      {members.length > 0 && (
        <Box mb={2.5} maxWidth={400}>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            placeholder="Search members by name or email..."
            size="medium"
          />
        </Box>
      )}

      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={UserX}
          title={search ? "No matching members found" : "No members found"}
          description={
            search
              ? `No organization member matched "${search}".`
              : "There are no active members in this organization."
          }
        />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Member</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                {isAdmin && <TableCell align="right" sx={{ fontWeight: 700, color: "#475569" }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.map((member) => {
                const memberUser = member.userId || {};
                const isSelf = memberUser._id === currentUser?.id || memberUser._id === currentUser?._id;
                const isMemberOwner = member.role === "OWNER";

                return (
                  <TableRow key={member._id || memberUser._id} hover>
                    <TableCell>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "#eb4634",
                            fontWeight: 700,
                            width: 36,
                            height: 36,
                            fontSize: "0.85rem",
                            borderRadius: "8px",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(memberUser.name)}
                        </Avatar>

                        <div style={{ whiteSpace: "nowrap" }}>
                          <Typography variant="subtitle2" fontWeight={700} color="text.primary" component="span">
                            {memberUser.name || "User"}
                          </Typography>
                          {isSelf && (
                            <Typography component="span" variant="caption" color="primary.main" fontWeight={700} sx={{ ml: 0.8 }}>
                              (You)
                            </Typography>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {memberUser.email || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {isOwner && !isMemberOwner && !isSelf ? (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={member.role}
                            onChange={(e) => handleRoleChange(memberUser._id, e.target.value)}
                            disabled={isRoleUpdating}
                            sx={{
                              height: 34,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              borderRadius: 2,
                            }}
                          >
                            <MenuItem value="MEMBER">MEMBER</MenuItem>
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <StatusChip label={member.role} />
                      )}
                    </TableCell>

                    <TableCell>
                      <StatusChip label={member.status || "ACTIVE"} />
                    </TableCell>

                    {isAdmin && (
                      <TableCell align="right">
                        {!isMemberOwner && !isSelf ? (
                          <Tooltip title="Remove Member">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setMemberToRemove(member)}
                              disabled={isRemoving}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirm Remove Member Dialog */}
      <ConfirmDialog
        open={Boolean(memberToRemove)}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.userId?.name || "this user"} from the organization?`}
        confirmLabel="Remove"
        confirmColor="error"
        isLoading={isRemoving}
        onConfirm={handleConfirmRemove}
        onClose={() => setMemberToRemove(null)}
      />
    </Box>
  );
};

export default OrganizationMembersList;
