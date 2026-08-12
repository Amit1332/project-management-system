// src/features/tasks/pages/TaskDetailsPage.jsx

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
  Chip,
  MenuItem,
  TextField,
  Tabs,
  Tab,
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
import TaskCommentsSection from "../../comments/components/TaskCommentsSection";
import ActivityTimeline from "../../activity/components/ActivityTimeline";
import EditTaskDialog from "../components/EditTaskDialog";
import StatusChip from "../../../components/common/StatusChip";
import PriorityChip from "../../../components/common/PriorityChip";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import { formatError } from "../../../utils/formatError";

import { joinRoom, leaveRoom, getSocket } from "../../../services/socket";

const TaskDetailsPage = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
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

  // Real-time Socket.io listeners
  React.useEffect(() => {
    if (taskId) {
      joinRoom("task", taskId);
    }
    if (projectId) {
      joinRoom("project", projectId);
    }

    const socket = getSocket();
    if (socket) {
      const handleSocketUpdate = () => {
        refetch();
      };
      socket.on("comment:created", handleSocketUpdate);
      socket.on("task:status_changed", handleSocketUpdate);

      return () => {
        socket.off("comment:created", handleSocketUpdate);
        socket.off("task:status_changed", handleSocketUpdate);
        if (taskId) leaveRoom("task", taskId);
        if (projectId) leaveRoom("project", projectId);
      };
    }
  }, [taskId, projectId, refetch]);

  const { data: membersData } = useGetMembersQuery(currentOrganization?._id, {
    skip: !currentOrganization?._id,
  });

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateTaskPriority] = useUpdateTaskPriorityMutation();
  const [updateTaskAssignee] = useUpdateTaskAssigneeMutation();

  const task = taskData?.data || {};
  const members = membersData?.data || [];
  const assignee = task.assigneeId || task.assignee || {};

  const handleStatusChange = async (e) => {
    try {
      await updateTaskStatus({
        projectId,
        taskId,
        status: e.target.value,
        organizationId: currentOrganization?._id,
      }).unwrap();
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
            gap: "20px",
            width: "100%",
          }}
        >
          {/* Left Side: Avatar/Icon + Title + Chips + Description + Labels */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "18px", flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#4F46E5",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 6px 16px rgba(79, 70, 229, 0.25)",
              }}
            >
              <CheckSquare size={24} color="#FFFFFF" />
            </div>

            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
                  {task.title}
                </Typography>
                <StatusChip label={task.status || "TODO"} />
                <PriorityChip priority={task.priority || "MEDIUM"} />
              </div>

              {task.description && (
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {task.description}
                </Typography>
              )}

              {task.labels && task.labels.length > 0 && (
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
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
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Action Buttons on Far Right */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Columns3 size={18} />}
              onClick={() => navigate(`/projects/${projectId}/board`)}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2.5, px: 2.5, py: 1.2, whiteSpace: "nowrap" }}
            >
              Kanban Board
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Edit3 size={18} />}
              onClick={() => setIsEditOpen(true)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2.5,
                px: 2.5,
                py: 1.2,
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                whiteSpace: "nowrap",
              }}
            >
              Edit Task
            </Button>
          </div>
        </div>

        <Divider sx={{ my: 3 }} />

        {/* Property Selectors (Medium Size & Spacing) */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              size="medium"
              fullWidth
              label="Status Stage"
              value={task.status || "TODO"}
              onChange={handleStatusChange}
            >
              <MenuItem value="TODO">TODO</MenuItem>
              <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
              <MenuItem value="IN_REVIEW">IN_REVIEW</MenuItem>
              <MenuItem value="DONE">DONE</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              size="medium"
              fullWidth
              label="Priority"
              value={task.priority || "MEDIUM"}
              onChange={handlePriorityChange}
            >
              <MenuItem value="LOW">LOW</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="HIGH">HIGH</MenuItem>
              <MenuItem value="CRITICAL">CRITICAL</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              size="medium"
              fullWidth
              label="Assignee"
              value={assignee._id || ""}
              onChange={handleAssigneeChange}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {members.map((m) => {
                const u = m.userId || {};
                return (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
        </Grid>
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
      />
    </Box>
  );
};

export default TaskDetailsPage;
