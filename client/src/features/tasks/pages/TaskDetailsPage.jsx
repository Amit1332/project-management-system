// src/features/tasks/pages/TaskDetailsPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Breadcrumbs,
  Link,
  Divider,
  MenuItem,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckSquare,
  ArrowLeft,
  Calendar,
  Columns3,
  Edit3,
} from "lucide-react";

import {
  useGetTaskQuery,
  useUpdateTaskStatusMutation,
  useUpdateTaskPriorityMutation,
  useUpdateTaskAssigneeMutation,
} from "../api/taskApi";
import { useGetProjectMembersQuery } from "../../projects/api/projectApi";
import { useGetMyOrganizationsQuery } from "../../organizations/api/organizationApi";
import TaskCommentsSection from "../../comments/components/TaskCommentsSection";
import EditTaskDialog from "../components/EditTaskDialog";
import StatusChip from "../../../components/common/StatusChip";
import PriorityChip from "../../../components/common/PriorityChip";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import { formatDate } from "../../../utils/formatDate";
import { formatError } from "../../../utils/formatError";

import { joinRoom, leaveRoom, onSocketEvent } from "../../../services/socket";

const TaskDetailsPage = () => {
  const { taskId, projectId: routeProjectId } = useParams();
  const navigate = useNavigate();
  const { user, currentOrganization } = useSelector((state) => state.auth);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: taskData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTaskQuery(
    { taskId, organizationId: currentOrganization?._id, projectId: routeProjectId },
    { skip: !taskId }
  );

  const task = taskData?.data || {};
  const projectId = task.projectId?._id || task.projectId || routeProjectId;

  // Real-time socket updates for Task details & status changes
  useEffect(() => {
    if (projectId) joinRoom("project", projectId);
    if (taskId) joinRoom("task", taskId);

    const handleTaskUpdate = () => {
      refetch();
    };

    const unsubs = [
      onSocketEvent("task:status_changed", handleTaskUpdate),
      onSocketEvent("task:updated", handleTaskUpdate),
      onSocketEvent("task:priority_changed", handleTaskUpdate),
      onSocketEvent("task:assignee_changed", handleTaskUpdate),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub && unsub());
      if (projectId) leaveRoom("project", projectId);
      if (taskId) leaveRoom("task", taskId);
    };
  }, [projectId, taskId, refetch]);

  const { data: projectMembersData } = useGetProjectMembersQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId }
  );

  const { data: orgData } = useGetMyOrganizationsQuery();
  const orgs = orgData?.data || [];
  const currentOrgItem = orgs.find((item) => {
    const orgId = item.organization?._id || item.organization || item._id;
    return orgId === currentOrganization?._id;
  });

  const projectMembers = projectMembersData?.data || [];

  // Determine user role permissions for Priority, Assignee & Edit Task
  const userMember = projectMembers.find(
    (m) => (m.userId?._id || m.userId || m._id) === user?._id
  );
  const projectRole = userMember?.role;
  const orgRole = currentOrgItem?.role || currentOrganization?.role || user?.role;

  const isOrgAdminOrOwner =
    orgRole === "OWNER" ||
    orgRole === "ADMIN" ||
    user?.systemRole === "SUPER_ADMIN";

  const canManageTask = isOrgAdminOrOwner || projectRole === "MANAGER";

  const [updateTaskStatus, { isLoading: isStatusUpdating }] = useUpdateTaskStatusMutation();
  const [updateTaskPriority, { isLoading: isPriorityUpdating }] = useUpdateTaskPriorityMutation();
  const [updateTaskAssignee, { isLoading: isAssigneeUpdating }] = useUpdateTaskAssigneeMutation();

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTaskStatus({
        taskId,
        status: newStatus,
        organizationId: currentOrganization?._id,
        projectId,
      }).unwrap();
    } catch (e) {}
  };

  const handlePriorityChange = async (newPriority) => {
    if (!canManageTask) return;
    try {
      await updateTaskPriority({
        taskId,
        priority: newPriority,
        organizationId: currentOrganization?._id,
        projectId,
      }).unwrap();
    } catch (e) {}
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    if (!canManageTask) return;
    try {
      await updateTaskAssignee({
        taskId,
        assigneeId: newAssigneeId || null,
        organizationId: currentOrganization?._id,
        projectId,
      }).unwrap();
    } catch (e) {}
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading task details..." py={8} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load task details"
        message={formatError(error)}
        onRetry={refetch}
      />
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Box mb={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/projects");
            }}
            sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.875rem" }}
          >
            <ArrowLeft size={16} /> Projects
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/projects/${projectId}`);
            }}
            sx={{ fontSize: "0.875rem" }}
          >
            Project Details
          </Link>
          <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
            {task.title || "Task"}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Task Overview Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3, md: 3.5 },
          mb: 4,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "relative",
        }}
      >
        {/* Action Buttons Top-Right */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 16, md: 20 },
            right: { xs: 16, md: 24 },
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
            zIndex: 2,
          }}
        >
          <Tooltip title="Kanban Board">
            <IconButton
              onClick={() => navigate(`/projects/${projectId}/board`)}
              sx={{
                border: "1px solid",
                borderColor: "#C7D2FE",
                bgcolor: "#EEF2FF",
                color: "#eb4634",
                "&:hover": { bgcolor: "#E0E7FF" },
                borderRadius: 2,
                p: 0.8,
                mr: 0.5,
              }}
            >
              <Columns3 size={18} color="#eb4634" />
            </IconButton>
          </Tooltip>

          {/* Hide Edit Task button for regular MEMBER role */}
          {canManageTask && (
            <Tooltip title="Edit Task">
              <IconButton
                onClick={() => setIsEditOpen(true)}
                sx={{
                  bgcolor: "#eb4634",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "#C23525" },
                  borderRadius: 2,
                  p: 0.8,
                  boxShadow: "0 4px 12px rgba(235, 70, 52, 0.3)",
                }}
              >
                <Edit3 size={18} color="#FFFFFF" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Task Icon + Title Row */}
        <Box display="flex" alignItems="center" gap={2} mb={2.5} pr={{ xs: "95px", md: "450px" }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              bgcolor: "#eb4634",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
            }}
          >
            <CheckSquare size={22} color="#FFFFFF" />
          </Box>

          <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
            {task.title}
          </Typography>
        </Box>

        {/* Task Description & Labels */}
        {(task.description || (task.labels && task.labels.length > 0)) && (
          <Box pr={{ xs: 0, md: "150px" }} mt={2} mb={3}>
            {task.description && (
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2, fontSize: "0.95rem" }}>
                {task.description}
              </Typography>
            )}

            {task.labels && task.labels.length > 0 && (
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mt={2}>
                {task.labels.map((label, idx) => (
                  <Chip
                    key={idx}
                    label={label}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      bgcolor: "#F1F5F9",
                      color: "#475569",
                      borderRadius: 1.5,
                      px: 0.5,
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Controls Bar: Status Select, Priority Select, Assignee Select */}
        <Grid container spacing={2.5} alignItems="center">
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              select
              size="medium"
              fullWidth
              label="Status"
              value={task.status || "TODO"}
              disabled={isStatusUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
            >
              <MenuItem value="TODO">TODO</MenuItem>
              <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
              <MenuItem value="IN_REVIEW">IN_REVIEW</MenuItem>
              <MenuItem value="DONE">DONE</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Tooltip title={!canManageTask ? "Only Managers & Admins can change priority" : ""}>
              <TextField
                select
                size="medium"
                fullWidth
                label="Priority"
                value={task.priority || "MEDIUM"}
                disabled={!canManageTask || isPriorityUpdating}
                onChange={(e) => handlePriorityChange(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              >
                <MenuItem value="LOW">LOW</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="CRITICAL">CRITICAL</MenuItem>
              </TextField>
            </Tooltip>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 3.5 }}>
            <Tooltip title={!canManageTask ? "Only Managers & Admins can reassign tasks" : ""}>
              <TextField
                select
                size="medium"
                fullWidth
                label="Assignee"
                value={task.assigneeId?._id || task.assigneeId || ""}
                disabled={!canManageTask || isAssigneeUpdating}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {projectMembers.map((m) => {
                  const u = m.userId || {};
                  return (
                    <MenuItem key={u._id || m._id} value={u._id}>
                      {u.name || u.email}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Tooltip>
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 2.5 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Calendar size={18} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Due Date
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {formatDate(task.dueDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Task Comments Section Card (Full Width) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <TaskCommentsSection projectId={projectId} taskId={taskId} />
      </Paper>

      {/* Edit Modal */}
      {canManageTask && (
        <EditTaskDialog
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          task={task}
          projectId={projectId}
          canManageTask={canManageTask}
          onSuccess={refetch}
        />
      )}
    </Box>
  );
};

export default TaskDetailsPage;
