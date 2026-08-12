// src/features/tasks/pages/TaskDetailsPage.jsx

import React, { useState, useMemo, useCallback } from "react";
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
  Chip,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  CheckSquare,
  Columns3,
  ArrowLeft,
  MessageSquare,
  Activity,
  Edit3,
} from "lucide-react";

import {
  useGetTaskQuery,
  useUpdateTaskStatusMutation,
  useUpdateTaskPriorityMutation,
  useUpdateTaskAssigneeMutation,
} from "../api/taskApi";
import { useGetMembersQuery } from "../../organizations/api/organizationApi";
import { useGetProjectMembersQuery } from "../../projects/api/projectApi";
import TaskCommentsSection from "../../comments/components/TaskCommentsSection";
import ActivityTimeline from "../../activity/components/ActivityTimeline";
import EditTaskDialog from "../components/EditTaskDialog";
import StatusChip from "../../../components/common/StatusChip";
import PriorityChip from "../../../components/common/PriorityChip";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import { formatError } from "../../../utils/formatError";

import { joinRoom, leaveRoom, onSocketEvent } from "../../../services/socket";

const TaskDetailsPage = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const { currentOrganization } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: taskData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTaskQuery(
    { projectId, taskId, organizationId: currentOrganization?._id },
    { skip: !projectId || !taskId }
  );

  // Real-time Socket.io listeners using bulletproof onSocketEvent
  React.useEffect(() => {
    if (taskId) {
      joinRoom("task", taskId);
    }
    if (projectId) {
      joinRoom("project", projectId);
    }

    const handleSocketUpdate = () => {
      refetch();
    };

    const unsubs = [
      onSocketEvent("comment:created", handleSocketUpdate),
      onSocketEvent("task:updated", handleSocketUpdate),
      onSocketEvent("task:status_changed", handleSocketUpdate),
      onSocketEvent("task:priority_changed", handleSocketUpdate),
      onSocketEvent("task:assigned", handleSocketUpdate),
      onSocketEvent("activity:created", handleSocketUpdate),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub && unsub());
      if (taskId) leaveRoom("task", taskId);
      if (projectId) leaveRoom("project", projectId);
    };
  }, [taskId, projectId, refetch]);

  const { data: membersData } = useGetMembersQuery(currentOrganization?._id, {
    skip: !currentOrganization?._id,
  });

  const { data: projectMembersData } = useGetProjectMembersQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId }
  );

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateTaskPriority] = useUpdateTaskPriorityMutation();
  const [updateTaskAssignee] = useUpdateTaskAssigneeMutation();

  const task = taskData?.data || {};
  const members = membersData?.data || [];
  const projectMembers = projectMembersData?.data || [];
  const assignee = task.assigneeId || task.assignee || {};

  // Permission evaluation memoized to prevent recalculation on every render
  const canManageTask = useMemo(() => {
    const myOrgMember = members.find(
      (m) => (m.userId?._id || m.userId) === currentUser?._id
    );
    const myProjectMember = projectMembers.find(
      (m) => (m.userId?._id || m.userId) === currentUser?._id
    );

    const isOrgAdminOrOwner =
      myOrgMember?.role === "OWNER" ||
      myOrgMember?.role === "ADMIN" ||
      currentUser?.role === "OWNER" ||
      currentUser?.role === "ADMIN";

    const isProjectManager = myProjectMember?.role === "MANAGER";
    return Boolean(isOrgAdminOrOwner || isProjectManager);
  }, [members, projectMembers, currentUser]);

  const handleStatusChange = async (e) => {
    try {
      await updateTaskStatus({
        projectId,
        taskId,
        status: e.target.value,
        organizationId: currentOrganization?._id,
      }).unwrap();
      refetch();
    } catch (err) {}
  };

  const handlePriorityChange = async (e) => {
    try {
      await updateTaskPriority({
        projectId,
        taskId,
        priority: e.target.value,
        organizationId: currentOrganization?._id,
      }).unwrap();
      refetch();
    } catch (err) {}
  };

  const handleAssigneeChange = async (e) => {
    try {
      await updateTaskAssignee({
        projectId,
        taskId,
        assigneeId: e.target.value || null,
        organizationId: currentOrganization?._id,
      }).unwrap();
      refetch();
    } catch (err) {}
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
        {/* Top-Right Absolute Positioned Action Icon Buttons (Mobile & Desktop) */}
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

          <Tooltip title={!canManageTask ? "Only Managers & Admins can edit task details" : "Edit Task"}>
            <span>
              <IconButton
                disabled={!canManageTask}
                onClick={() => setIsEditOpen(true)}
                sx={{
                  bgcolor: "#eb4634",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "#4338CA" },
                  "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
                  borderRadius: 2,
                  p: 0.8,
                }}
              >
                <Edit3 size={18} color="#FFFFFF" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Left Side Main Content: Icon & Title in Row */}
        <Box display="flex" alignItems="center" gap={2} mb={2} pr={{ xs: "95px", md: "450px" }}>
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

          <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em" noWrap>
            {task.title}
          </Typography>
        </Box>

        {/* Task Description & Labels */}
        {(task.description || (task.labels && task.labels.length > 0)) && (
          <Box pr={{ xs: 0, md: "150px" }} mt={1}>
            {task.description && (
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                {task.description}
              </Typography>
            )}

            {task.labels && task.labels.length > 0 && (
              <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap" mt={1}>
                {task.labels.map((label, idx) => (
                  <Chip
                    key={idx}
                    label={label}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      bgcolor: "#F1F5F9",
                      color: "#475569",
                      borderRadius: 1.5,
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2.5 }} />

        {/* Bottom Section: Select Fields (Status, Priority, Assignee) */}
        <Box display="flex" alignItems="center" flexWrap="wrap">
          {/* Status Select */}
          <TextField
            select
            size="small"
            label="Status"
            value={task.status || "TODO"}
            onChange={handleStatusChange}
            sx={{
              minWidth: 130,
              mx: 1.5,
              my: 0.5,
              "& .MuiInputBase-root": { fontSize: "0.82rem", height: 36 },
              "& .MuiInputLabel-root": { fontSize: "0.78rem" },
            }}
          >
            <MenuItem value="TODO">TODO</MenuItem>
            <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
            <MenuItem value="IN_REVIEW">IN_REVIEW</MenuItem>
            <MenuItem value="DONE">DONE</MenuItem>
          </TextField>

          {/* Priority Select */}
          <Tooltip title={!canManageTask ? "Only Managers & Admins can change priority" : ""}>
            <TextField
              select
              size="small"
              disabled={!canManageTask}
              label="Priority"
              value={task.priority || "MEDIUM"}
              onChange={handlePriorityChange}
              sx={{
                minWidth: 130,
                mx: 1.5,
                my: 0.5,
                "& .MuiInputBase-root": { fontSize: "0.82rem", height: 36 },
                "& .MuiInputLabel-root": { fontSize: "0.78rem" },
              }}
            >
              <MenuItem value="LOW">LOW</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="HIGH">HIGH</MenuItem>
              <MenuItem value="CRITICAL">CRITICAL</MenuItem>
            </TextField>
          </Tooltip>

          {/* Assignee Select */}
          <Tooltip title={!canManageTask ? "Only Managers & Admins can assign tasks" : ""}>
            <TextField
              select
              size="small"
              disabled={!canManageTask}
              label="Assignee"
              value={assignee._id || ""}
              onChange={handleAssigneeChange}
              sx={{
                minWidth: 140,
                mx: 1.5,
                my: 0.5,
                "& .MuiInputBase-root": { fontSize: "0.82rem", height: 36 },
                "& .MuiInputLabel-root": { fontSize: "0.78rem" },
              }}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {(projectId && projectMembers.length > 0 ? projectMembers : members).map((m) => {
                const u = m.userId || m;
                return (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name}
                  </MenuItem>
                );
              })}
            </TextField>
          </Tooltip>
        </Box>
      </Paper>

      {/* Tabs for Comments vs Activity Log */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<MessageSquare size={18} />} iconPosition="start" label="Comments" sx={{ fontWeight: 700 }} />
          <Tab icon={<Activity size={18} />} iconPosition="start" label="Activity History" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {activeTab === 0 && <TaskCommentsSection projectId={projectId} taskId={taskId} />}
      {activeTab === 1 && <ActivityTimeline projectId={projectId} taskId={taskId} />}

      {/* Edit Modal */}
      <EditTaskDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        projectId={projectId}
        task={task}
        canManageTask={canManageTask}
      />
    </Box>
  );
};

export default TaskDetailsPage;
