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
  Avatar,
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
  Calendar,
  User,
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
import { formatDate } from "../../../utils/formatDate";

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
            sx={{ fontSize: "0.875rem" }}
          >
            Projects
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

      {/* Task Overview Hero */}
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
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          gap={3}
        >
          <Box display="flex" alignItems="flex-start" gap={2.5}>
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "white",
                p: 2,
                borderRadius: 3,
                display: "flex",
              }}
            >
              <CheckSquare size={32} />
            </Box>

            <Box>
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" mb={1}>
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  {task.title}
                </Typography>
                <StatusChip label={task.status || "TODO"} />
                <PriorityChip priority={task.priority || "MEDIUM"} />
              </Box>

              <Typography variant="body1" color="text.secondary" maxWidth={700}>
                {task.description || "No description provided for this task."}
              </Typography>

              {/* Labels */}
              {task.labels && task.labels.length > 0 && (
                <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                  {task.labels.map((label, idx) => (
                    <Chip key={idx} label={label} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1.5}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Columns3 size={18} />}
              onClick={() => navigate(`/projects/${projectId}/board`)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Kanban Board
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Edit3 size={18} />}
              onClick={() => setIsEditOpen(true)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Edit Task
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Inline Property Selectors */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              size="small"
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
              size="small"
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
              size="small"
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
