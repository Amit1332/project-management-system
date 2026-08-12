// src/features/projects/pages/ProjectDetailsPage.jsx

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
  Tabs,
  Tab,
} from "@mui/material";
import {
  FolderKanban,
  Columns3,
  Edit3,
  Plus,
  ArrowLeft,
  Calendar,
  Users,
  CheckSquare,
  Activity,
} from "lucide-react";

import { useGetProjectQuery, useArchiveProjectMutation } from "../api/projectApi";
import { useGetTasksQuery, useUpdateTaskStatusMutation, useArchiveTaskMutation } from "../../tasks/api/taskApi";
import TaskCard from "../../tasks/components/TaskCard";
import CreateTaskDialog from "../../tasks/components/CreateTaskDialog";
import EditProjectDialog from "../components/EditProjectDialog";
import ProjectMembersSection from "../components/ProjectMembersSection";
import ActivityTimeline from "../../activity/components/ActivityTimeline";
import StatusChip from "../../../components/common/StatusChip";
import PriorityChip from "../../../components/common/PriorityChip";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import SearchInput from "../../../components/common/SearchInput";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { formatError } from "../../../utils/formatError";
import { formatDate } from "../../../utils/formatDate";

import { joinRoom, getSocket } from "../../../services/socket";

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentOrganization } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  const {
    data: projectData,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
    refetch: refetchProject,
  } = useGetProjectQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId }
  );

  const {
    data: tasksData,
    isLoading: isTasksLoading,
    refetch: refetchTasks,
  } = useGetTasksQuery(
    { projectId, organizationId: currentOrganization?._id, search },
    { skip: !projectId }
  );

  // Join project socket room & refetch on real-time task/activity events
  React.useEffect(() => {
    if (projectId) {
      joinRoom("project", projectId);
    }
    const socket = getSocket();
    if (socket) {
      const handleRealtimeUpdate = () => {
        refetchProject();
        refetchTasks();
      };
      socket.on("task:created", handleRealtimeUpdate);
      socket.on("task:status_changed", handleRealtimeUpdate);
      socket.on("activity:logged", handleRealtimeUpdate);

      return () => {
        socket.off("task:created", handleRealtimeUpdate);
        socket.off("task:status_changed", handleRealtimeUpdate);
        socket.off("activity:logged", handleRealtimeUpdate);
      };
    }
  }, [projectId, refetchProject, refetchTasks]);

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [archiveTask] = useArchiveTaskMutation();
  const [archiveProject, { isLoading: isArchiving }] = useArchiveProjectMutation();

  const project = projectData?.data || {};
  const tasks = tasksData?.data || [];

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTaskStatus({
        projectId,
        taskId: task._id,
        status: newStatus,
        organizationId: currentOrganization?._id,
      }).unwrap();
    } catch (e) {}
  };

  const handleArchiveTask = async (task) => {
    try {
      await archiveTask({
        projectId,
        taskId: task._id,
        organizationId: currentOrganization?._id,
      }).unwrap();
    } catch (e) {}
  };

  const handleConfirmArchiveProject = async () => {
    try {
      await archiveProject({
        projectId,
        organizationId: currentOrganization?._id,
      }).unwrap();
      setIsArchiveConfirmOpen(false);
      navigate("/projects");
    } catch (e) {}
  };

  if (isProjectLoading) {
    return <LoadingSpinner label="Loading project details..." py={8} />;
  }

  if (isProjectError) {
    return (
      <ErrorState
        title="Failed to load project"
        message={formatError(projectError)}
        onRetry={refetchProject}
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
          <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
            {project.name || "Project Details"}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Hero Header */}
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
          }}
        >
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
              <FolderKanban size={22} color="#FFFFFF" />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
                  {project.name}
                </Typography>
                <StatusChip label={project.status || "ACTIVE"} />
                <PriorityChip priority={project.priority || "MEDIUM"} />
              </div>

              <Typography variant="body2" color="text.secondary" mt={0.3} noWrap>
                {project.description || "No project description provided."}
              </Typography>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Columns3 size={18} />}
              onClick={() => navigate(`/projects/${projectId}/board`)}
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
              Kanban Board
            </Button>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<Edit3 size={18} />}
              onClick={() => setIsEditOpen(true)}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2.5, whiteSpace: "nowrap" }}
            >
              Edit Project
            </Button>
          </div>
        </div>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Calendar size={20} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Start Date
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formatDate(project.startDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Calendar size={20} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formatDate(project.dueDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <CheckSquare size={20} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Project Tasks
                </Typography>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  {tasks.length} Tasks
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<CheckSquare size={18} />} iconPosition="start" label="Tasks" sx={{ fontWeight: 700 }} />
          <Tab icon={<Users size={18} />} iconPosition="start" label="Members & Roles" sx={{ fontWeight: 700 }} />
          <Tab icon={<Activity size={18} />} iconPosition="start" label="Activity History" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              width: "100%",
            }}
          >
            <Typography variant="h5" fontWeight={800} color="text.primary">
              Project Tasks
            </Typography>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Plus size={18} />}
              onClick={() => setIsCreateTaskOpen(true)}
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
              Create Task
            </Button>
          </div>

          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project tasks by title..."
            />
          </Paper>

          {isTasksLoading ? (
            <LoadingSpinner label="Loading project tasks..." py={4} />
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title={search ? "No matching tasks found" : "No tasks in this project"}
              description={
                search
                  ? `No task matched "${search}".`
                  : "Create the first task for this project or switch to the Kanban board view."
              }
              actionLabel="Create Task"
              onAction={() => setIsCreateTaskOpen(true)}
            />
          ) : (
            <Grid container spacing={3}>
              {tasks.map((task) => (
                <Grid key={task._id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <TaskCard
                    task={task}
                    onStatusChange={handleStatusChange}
                    onArchive={handleArchiveTask}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 1 && <ProjectMembersSection projectId={projectId} />}
      {activeTab === 2 && <ActivityTimeline projectId={projectId} />}

      {/* Modals */}
      <CreateTaskDialog
        open={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projectId={projectId}
      />

      <EditProjectDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        projectId={projectId}
        project={project}
      />

      <ConfirmDialog
        open={isArchiveConfirmOpen}
        title="Archive Project"
        message="Are you sure you want to archive this project? You can unarchive it later."
        confirmLabel="Archive Project"
        confirmColor="error"
        isLoading={isArchiving}
        onConfirm={handleConfirmArchiveProject}
        onClose={() => setIsArchiveConfirmOpen(false)}
      />
    </Box>
  );
};

export default ProjectDetailsPage;
