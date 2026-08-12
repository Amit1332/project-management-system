// src/features/projects/pages/ProjectDetailsPage.jsx

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
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  FolderKanban,
  Calendar,
  CheckSquare,
  ArrowLeft,
  Columns3,
  Edit3,
  Users,
  History,
  RotateCcw,
} from "lucide-react";

import {
  useGetProjectQuery,
  useUpdateProjectMutation,
  useGetProjectMembersQuery,
} from "../api/projectApi";
import { useGetMyOrganizationsQuery } from "../../organizations/api/organizationApi";
import {
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
  useArchiveTaskMutation,
} from "../../tasks/api/taskApi";
import ProjectMembersSection from "../components/ProjectMembersSection";
import ActivityTimeline from "../../activity/components/ActivityTimeline";
import EditProjectDialog from "../components/EditProjectDialog";
import CreateTaskDialog from "../../tasks/components/CreateTaskDialog";
import TaskCard from "../../tasks/components/TaskCard";
import StatusChip from "../../../components/common/StatusChip";
import PriorityChip from "../../../components/common/PriorityChip";
import SearchInput from "../../../components/common/SearchInput";
import Pagination from "../../../components/common/Pagination";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import { formatDate } from "../../../utils/formatDate";
import { formatError } from "../../../utils/formatError";

import { joinRoom, leaveRoom, onSocketEvent } from "../../../services/socket";

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, currentOrganization } = useSelector((state) => state.auth);

  const [currentTab, setCurrentTab] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  // Task filter states inside Project Details Page
  const [taskPage, setTaskPage] = useState(1);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("");

  const hasActiveTaskFilters = Boolean(taskSearch || taskStatusFilter || taskPriorityFilter);

  const handleResetTaskFilters = () => {
    setTaskSearch("");
    setTaskStatusFilter("");
    setTaskPriorityFilter("");
    setTaskPage(1);
  };

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
    {
      projectId,
      organizationId: currentOrganization?._id,
      page: taskPage,
      limit: 9,
      status: taskStatusFilter || undefined,
      priority: taskPriorityFilter || undefined,
      search: taskSearch || undefined,
    },
    { skip: !projectId }
  );

  const { data: projectMembersData } = useGetProjectMembersQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId }
  );

  // Look up user's active organization role
  const { data: orgData } = useGetMyOrganizationsQuery();
  const orgs = orgData?.data || [];
  const currentOrgItem = orgs.find((item) => {
    const orgId = item.organization?._id || item.organization || item._id;
    return orgId === currentOrganization?._id;
  });

  const projectMembers = projectMembersData?.data || [];
  const currentUserMember = projectMembers.find(
    (m) => (m.userId?._id || m.userId || m._id) === user?._id
  );
  const projectRole = currentUserMember?.role;
  const orgRole = currentOrgItem?.role || currentOrganization?.role || user?.role;

  const isOrgAdminOrOwner =
    orgRole === "OWNER" ||
    orgRole === "ADMIN" ||
    user?.systemRole === "SUPER_ADMIN";

  const canManageProject = isOrgAdminOrOwner || projectRole === "MANAGER";

  // Real-time socket listeners
  useEffect(() => {
    if (projectId) {
      joinRoom("project", projectId);
    }

    const handleUpdate = () => {
      refetchProject();
      refetchTasks();
    };

    const unsubs = [
      onSocketEvent("project:updated", handleUpdate),
      onSocketEvent("task:status_changed", handleUpdate),
      onSocketEvent("task:updated", handleUpdate),
      onSocketEvent("task:created", handleUpdate),
      onSocketEvent("task:deleted", handleUpdate),
      onSocketEvent("task:archived", handleUpdate),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub && unsub());
      if (projectId) leaveRoom("project", projectId);
    };
  }, [projectId, refetchProject, refetchTasks]);

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [archiveTask] = useArchiveTaskMutation();

  const project = projectData?.data || {};
  const tasks = tasksData?.data || [];
  const pagination = tasksData?.pagination || {};

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

      {/* Hero Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 3.5, md: 4 },
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
            top: { xs: 20, md: 24 },
            right: { xs: 20, md: 28 },
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Tooltip title="Kanban Board View">
            <IconButton
              onClick={() => navigate(`/projects/${projectId}/board`)}
              sx={{
                border: "1px solid #FED7AA",
                bgcolor: "#FFF7ED",
                color: "#eb4634",
                "&:hover": { bgcolor: "#FFEDD5" },
                borderRadius: 2.5,
                p: 1,
              }}
            >
              <Columns3 size={18} color="#eb4634" />
            </IconButton>
          </Tooltip>

          {canManageProject && (
            <Tooltip title="Edit Project">
              <IconButton
                onClick={() => setIsEditOpen(true)}
                sx={{
                  bgcolor: "#eb4634",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "#C23525" },
                  borderRadius: 2.5,
                  p: 1,
                  boxShadow: "0 4px 12px rgba(235, 70, 52, 0.3)",
                }}
              >
                <Edit3 size={18} color="#FFFFFF" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Project Icon + Title Header Row */}
        <Box display="flex" alignItems="center" gap={2} mb={2} pr={{ md: "160px" }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 3,
              bgcolor: "#eb4634",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(235, 70, 52, 0.3)",
            }}
          >
            <FolderKanban size={24} color="#FFFFFF" />
          </Box>

          <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
            {project.name}
          </Typography>
        </Box>

        {/* Status & Priority Chips */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            marginTop: "16px",
            marginBottom: "16px",
          }}
        >
          <StatusChip label={project.status || "ACTIVE"} />
          <PriorityChip priority={project.priority || "MEDIUM"} />
        </div>

        {/* Project Description */}
        {project.description && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 2,
              mb: 3,
              lineHeight: 1.6,
              maxWidth: "880px",
              fontSize: "0.95rem",
            }}
          >
            {project.description}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Metadata Details Row */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Calendar size={20} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Start Date
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {formatDate(project.startDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Calendar size={20} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Due Date
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {formatDate(project.dueDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <CheckSquare size={20} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Total Project Tasks
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {pagination.total || tasks.length} Tasks
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Bar: Tasks, Activity History, Members & Roles */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          mb: 4,
          px: 2,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              py: 2,
              minHeight: 52,
            },
          }}
        >
          <Tab icon={<CheckSquare size={18} />} iconPosition="start" label={`Tasks (${pagination.total || tasks.length})`} />
          <Tab icon={<History size={18} />} iconPosition="start" label="Activity History" />
          <Tab icon={<Users size={18} />} iconPosition="start" label="Members & Roles" />
        </Tabs>
      </Paper>

      {/* Tab Panel 0: Tasks List */}
      {currentTab === 0 && (
        <Box>
          {/* Header Row: Title + Create Task Button */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <Typography variant="h6" fontWeight={800} color="text.primary">
              Project Tasks
            </Typography>

            {canManageProject && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsCreateTaskOpen(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 2.5,
                  py: 1,
                  boxShadow: "0 4px 14px rgba(235, 70, 52, 0.3)",
                }}
              >
                + Create Task
              </Button>
            )}
          </div>

          {/* Task Search & Filter Controls Bar - Small Field Sizes */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: hasActiveTaskFilters ? 4.5 : 5.5 }}>
                <SearchInput
                  value={taskSearch}
                  onChange={(e) => {
                    setTaskSearch(e.target.value);
                    setTaskPage(1);
                  }}
                  onClear={() => setTaskSearch("")}
                  placeholder="Search project tasks..."
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: hasActiveTaskFilters ? 3 : 3.25 }}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="Status"
                  value={taskStatusFilter}
                  onChange={(e) => {
                    setTaskStatusFilter(e.target.value);
                    setTaskPage(1);
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="TODO">TODO</MenuItem>
                  <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                  <MenuItem value="IN_REVIEW">IN_REVIEW</MenuItem>
                  <MenuItem value="DONE">DONE</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: hasActiveTaskFilters ? 3 : 3.25 }}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="Priority"
                  value={taskPriorityFilter}
                  onChange={(e) => {
                    setTaskPriorityFilter(e.target.value);
                    setTaskPage(1);
                  }}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="LOW">LOW</MenuItem>
                  <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                  <MenuItem value="HIGH">HIGH</MenuItem>
                  <MenuItem value="CRITICAL">CRITICAL</MenuItem>
                </TextField>
              </Grid>

              {hasActiveTaskFilters && (
                <Grid size={{ xs: 12, md: 1.5 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={handleResetTaskFilters}
                    startIcon={<RotateCcw size={15} />}
                    fullWidth
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, py: 0.7 }}
                  >
                    Reset
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>

          {isTasksLoading ? (
            <LoadingSpinner label="Loading project tasks..." py={4} />
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title={hasActiveTaskFilters ? "No matching tasks found" : "No tasks in this project yet"}
              description={
                hasActiveTaskFilters
                  ? "Try clearing or adjusting your search query or status/priority filters."
                  : "Tasks will appear here once created."
              }
              actionLabel={canManageProject ? "Create Task" : undefined}
              onAction={canManageProject ? () => setIsCreateTaskOpen(true) : undefined}
            />
          ) : (
            <>
              <Grid container spacing={3}>
                {tasks.map((task) => (
                  <Grid key={task._id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <TaskCard
                      task={task}
                      onStatusChange={handleStatusChange}
                      onArchive={canManageProject ? handleArchiveTask : undefined}
                    />
                  </Grid>
                ))}
              </Grid>

              <Pagination
                page={taskPage}
                count={pagination.totalPages || 1}
                totalItems={pagination.total}
                itemsPerPage={9}
                onChange={(e, val) => setTaskPage(val)}
              />
            </>
          )}
        </Box>
      )}

      {/* Tab Panel 1: Activity History */}
      {currentTab === 1 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h6" fontWeight={800} color="text.primary" mb={2.5}>
            Project Activity History
          </Typography>
          <ActivityTimeline projectId={projectId} />
        </Paper>
      )}

      {/* Tab Panel 2: Members & Roles */}
      {currentTab === 2 && <ProjectMembersSection projectId={projectId} />}

      {/* Dialog Modals */}
      <EditProjectDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
        onSuccess={refetchProject}
      />

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projectId={projectId}
        onSuccess={refetchTasks}
      />
    </Box>
  );
};

export default ProjectDetailsPage;
