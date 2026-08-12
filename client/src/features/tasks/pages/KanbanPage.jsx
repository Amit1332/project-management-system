// src/features/tasks/pages/KanbanPage.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Breadcrumbs,
  Link,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Columns3,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";

import {
  useGetKanbanTasksQuery,
  useUpdateTaskStatusMutation,
  useArchiveTaskMutation,
} from "../api/taskApi";
import { useGetProjectQuery } from "../../projects/api/projectApi";
import TaskCard from "../components/TaskCard";
import CreateTaskDialog from "../components/CreateTaskDialog";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import { formatError } from "../../../utils/formatError";

import { joinRoom, leaveRoom, getSocket } from "../../../services/socket";

const STAGES = [
  { id: "TODO", label: "To Do", color: "#64748B", bg: "#F8FAFC", icon: Circle },
  { id: "IN_PROGRESS", label: "In Progress", color: "#0284C7", bg: "#F0F9FF", icon: Clock },
  { id: "IN_REVIEW", label: "In Review", color: "#7E22CE", bg: "#FAF5FF", icon: AlertCircle },
  { id: "DONE", label: "Done", color: "#15803D", bg: "#F0FDF4", icon: CheckCircle2 },
];

const KanbanPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentOrganization } = useSelector((state) => state.auth);

  const { data: projectData } = useGetProjectQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId }
  );

  const {
    data: kanbanData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetKanbanTasksQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId }
  );

  // Real-time Kanban board update socket listeners
  React.useEffect(() => {
    if (projectId) {
      joinRoom("project", projectId);
    }

    const socket = getSocket();
    if (socket) {
      const handleKanbanUpdate = () => {
        refetch();
      };
      socket.on("task:status_changed", handleKanbanUpdate);
      socket.on("task:created", handleKanbanUpdate);
      socket.on("comment:created", handleKanbanUpdate);

      return () => {
        socket.off("task:status_changed", handleKanbanUpdate);
        socket.off("task:created", handleKanbanUpdate);
        socket.off("comment:created", handleKanbanUpdate);
        if (projectId) leaveRoom("project", projectId);
      };
    }
  }, [projectId, refetch]);

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [archiveTask] = useArchiveTaskMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("TODO");
  const [dragOverStage, setDragOverStage] = useState(null);

  const project = projectData?.data || {};
  const kanban = kanbanData?.data || {};

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTaskStatus({
        projectId,
        taskId: task._id || task,
        status: newStatus,
        organizationId: currentOrganization?._id,
      }).unwrap();
    } catch (err) {}
  };

  const handleArchive = async (task) => {
    try {
      await archiveTask({
        projectId,
        taskId: task._id,
        organizationId: currentOrganization?._id,
      }).unwrap();
    } catch (err) {}
  };

  const handleAddTaskToStage = (stageId) => {
    setSelectedStage(stageId);
    setIsCreateOpen(true);
  };

  // Drag and Drop handlers for Stage Columns
  const handleDragOverColumn = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeaveColumn = (e, stageId) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverStage(null);
    }
  };

  const handleDropTaskOnColumn = async (e, targetStageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const taskId = e.dataTransfer.getData("text/plain");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");

    if (taskId && targetStageId !== sourceStatus) {
      await handleStatusChange({ _id: taskId }, targetStageId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading Kanban board..." py={8} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load Kanban board"
        message={formatError(error)}
        onRetry={refetch}
      />
    );
  }

  return (
    <Box>
      {/* Navigation Breadcrumbs */}
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
            {project.name || "Project Details"}
          </Link>
          <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
            Board View
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Board Header Banner - STRICT HORIZONTAL ROW (Create Task Button on Far Right) */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
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
          }}
        >
          {/* Left Side: Icon + Title + Subtitle */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#4F46E5",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
              }}
            >
              <Columns3 size={22} color="#FFFFFF" />
            </div>

            <div style={{ minWidth: 0 }}>
              <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em" noWrap>
                {project.name ? `${project.name} Board` : "Project Board"}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.3} noWrap>
                Drag and drop tasks between stage columns to instantly update task status
              </Typography>
            </div>
          </div>

          {/* Right Side: + Create Task Button on same line */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={() => handleAddTaskToStage("TODO")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              py: 1.2,
              borderRadius: 2.5,
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
            }}
          >
            Create Task
          </Button>
        </div>
      </Paper>

      {/* 4 Stage Kanban Columns Grid */}
      <Grid container spacing={3}>
        {STAGES.map((stage) => {
          const StageIcon = stage.icon;
          const stageTasks = kanban[stage.id] || kanban[stage.id.toLowerCase()] || [];
          const isOver = dragOverStage === stage.id;

          return (
            <Grid key={stage.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                onDragOver={(e) => handleDragOverColumn(e, stage.id)}
                onDragLeave={(e) => handleDragLeaveColumn(e, stage.id)}
                onDrop={(e) => handleDropTaskOnColumn(e, stage.id)}
                sx={{
                  p: 2,
                  minHeight: 560,
                  borderRadius: 3.5,
                  bgcolor: isOver ? "#EEF2FF" : stage.bg,
                  border: isOver ? "2px dashed #4F46E5" : "1px solid",
                  borderColor: isOver ? "#4F46E5" : "divider",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease-in-out",
                  boxShadow: isOver ? "0 10px 30px rgba(79, 70, 229, 0.15)" : "none",
                }}
              >
                {/* Stage Column Header */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "12px",
                    marginBottom: "16px",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
                    <StageIcon size={18} color={stage.color} />
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A" }}>
                      {stage.label}
                    </span>
                    <Chip
                      label={stageTasks.length}
                      size="small"
                      sx={{
                        height: 20,
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        bgcolor: "background.paper",
                        color: "#475569",
                        borderRadius: 1.5,
                      }}
                    />
                  </div>

                  <IconButton
                    size="small"
                    onClick={() => handleAddTaskToStage(stage.id)}
                    title={`Add Task to ${stage.label}`}
                    sx={{
                      bgcolor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      width: 28,
                      height: 28,
                      "&:hover": { bgcolor: "#EEF2FF", borderColor: "#4F46E5" },
                    }}
                  >
                    <Plus size={16} color="#4F46E5" />
                  </IconButton>
                </div>

                {/* Task Cards Column */}
                <Box flex={1} display="flex" flexDirection="column" gap={2}>
                  {stageTasks.length === 0 ? (
                    <Box
                      p={3}
                      textAlign="center"
                      borderRadius={2.5}
                      border={isOver ? "2px dashed #4F46E5" : "1px dashed"}
                      borderColor={isOver ? "#4F46E5" : "divider"}
                      bgcolor="background.paper"
                      my="auto"
                      sx={{ transition: "all 0.2s ease" }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                        {isOver ? "Drop task here" : `No tasks in ${stage.label}`}
                      </Typography>
                      {!isOver && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleAddTaskToStage(stage.id)}
                          sx={{ fontSize: "0.75rem", textTransform: "none", mt: 0.5, fontWeight: 700 }}
                        >
                          + Add Task
                        </Button>
                      )}
                    </Box>
                  ) : (
                    stageTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        draggable
                        onStatusChange={handleStatusChange}
                        onArchive={handleArchive}
                      />
                    ))
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Task Modal */}
      <CreateTaskDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={projectId}
        defaultStatus={selectedStage}
      />
    </Box>
  );
};

export default KanbanPage;
