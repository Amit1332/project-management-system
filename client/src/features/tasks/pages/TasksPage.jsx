// src/features/tasks/pages/TasksPage.jsx

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import { CheckSquare, Plus, RotateCcw } from "lucide-react";

import { useGetProjectsQuery, useGetProjectMembersQuery } from "../../projects/api/projectApi";
import { useGetTasksQuery, useUpdateTaskStatusMutation, useArchiveTaskMutation } from "../api/taskApi";
import TaskCard from "../components/TaskCard";
import CreateTaskDialog from "../components/CreateTaskDialog";
import PageHeader from "../../../components/common/PageHeader";
import SearchInput from "../../../components/common/SearchInput";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import Pagination from "../../../components/common/Pagination";
import { formatError } from "../../../utils/formatError";

const TasksPage = () => {
  const navigate = useNavigate();
  const { user, currentOrganization } = useSelector((state) => state.auth);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const hasActiveFilters = Boolean(search || statusFilter || priorityFilter);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setPage(1);
  };

  // Fetch projects in workspace for selector
  const { data: projectsData } = useGetProjectsQuery(
    { organizationId: currentOrganization?._id },
    { skip: !currentOrganization?._id }
  );

  const projects = projectsData?.data || [];
  const activeProjectId = selectedProjectId || (projects.length > 0 ? projects[0]._id : "");

  // Fetch project members to evaluate role permissions
  const { data: projectMembersData } = useGetProjectMembersQuery(
    { projectId: activeProjectId, organizationId: currentOrganization?._id },
    { skip: !activeProjectId }
  );

  const projectMembers = Array.isArray(projectMembersData?.data) ? projectMembersData.data : [];
  const currentUserMember = projectMembers.find(
    (m) => (m?.userId?._id || m?.userId || m?._id) === user?._id
  );
  const projectRole = currentUserMember?.role;
  const orgRole = currentOrganization?.role || user?.role;
  const canCreateTask =
    orgRole === "OWNER" ||
    orgRole === "ADMIN" ||
    projectRole === "MANAGER" ||
    user?.systemRole === "SUPER_ADMIN";

  const {
    data: tasksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTasksQuery(
    {
      projectId: activeProjectId,
      organizationId: currentOrganization?._id,
      page,
      limit: 12,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      search: search || undefined,
    },
    {
      skip: !activeProjectId,
    }
  );

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [archiveTask] = useArchiveTaskMutation();

  const tasks = tasksData?.data || [];
  const pagination = tasksData?.pagination || {};

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTaskStatus({
        projectId: activeProjectId,
        taskId: task._id,
        status: newStatus,
        organizationId: currentOrganization?._id,
      }).unwrap();
    } catch (e) {}
  };

  const handleArchiveTask = async (task) => {
    try {
      await archiveTask({
        projectId: activeProjectId,
        taskId: task._id,
        organizationId: currentOrganization?._id,
      }).unwrap();
    } catch (e) {}
  };

  if (!currentOrganization) {
    return (
      <Box>
        <PageHeader title="Tasks" subtitle="Manage and assign tasks across projects" />
        <EmptyState
          icon={CheckSquare}
          title="No Active Workspace Selected"
          description="Select an organization workspace from the header dropdown to view and manage tasks."
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Tasks & Deliverables"
        subtitle={`Task workspace for ${currentOrganization.name}`}
        actionLabel={canCreateTask ? "Create Task" : undefined}
        actionIcon={canCreateTask ? Plus : undefined}
        onAction={canCreateTask ? () => setIsCreateOpen(true) : undefined}
      />

      {/* Project Selector & Search Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              size="medium"
              fullWidth
              label="Select Project"
              value={activeProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setPage(1);
              }}
            >
              {projects.length === 0 ? (
                <MenuItem value="" disabled>
                  No Projects Available
                </MenuItem>
              ) : (
                projects.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: hasActiveFilters ? 3 : 3.5 }}>
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={() => setSearch("")}
              placeholder="Search tasks..."
              size="medium"
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: hasActiveFilters ? 2.2 : 2.75 }}>
            <TextField
              select
              size="medium"
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="TODO">TODO</MenuItem>
              <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
              <MenuItem value="IN_REVIEW">IN_REVIEW</MenuItem>
              <MenuItem value="DONE">DONE</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: hasActiveFilters ? 2.2 : 2.75 }}>
            <TextField
              select
              size="medium"
              fullWidth
              label="Priority"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="LOW">LOW</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="HIGH">HIGH</MenuItem>
              <MenuItem value="CRITICAL">CRITICAL</MenuItem>
            </TextField>
          </Grid>

          {hasActiveFilters && (
            <Grid size={{ xs: 12, md: 1.6 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleResetFilters}
                startIcon={<RotateCcw size={16} />}
                fullWidth
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2.5, py: 1.1 }}
              >
                Reset
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Content Rendering */}
      {!activeProjectId ? (
        <EmptyState
          icon={CheckSquare}
          title="No Projects in Workspace"
          description="Create a project first to start adding and assigning tasks."
          actionLabel="Go to Projects"
          onAction={() => navigate("/projects")}
        />
      ) : isLoading ? (
        <LoadingSpinner label="Fetching project tasks..." py={6} />
      ) : isError ? (
        <ErrorState
          title="Failed to load tasks"
          message={formatError(error)}
          onRetry={refetch}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={hasActiveFilters ? "No matching tasks" : "No tasks in this project yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your search query or status filter."
              : "Get started by creating your first task for this project."
          }
          actionLabel={canCreateTask ? "Create Task" : undefined}
          onAction={canCreateTask ? () => setIsCreateOpen(true) : undefined}
        />
      ) : (
        <>
          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid key={task._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <TaskCard
                  task={task}
                  onStatusChange={handleStatusChange}
                  onArchive={canCreateTask ? handleArchiveTask : undefined}
                />
              </Grid>
            ))}
          </Grid>

          <Pagination
            page={page}
            count={pagination.totalPages || 1}
            totalItems={pagination.total}
            itemsPerPage={12}
            onChange={(e, val) => setPage(val)}
          />
        </>
      )}

      {/* Modal */}
      {activeProjectId && canCreateTask && (
        <CreateTaskDialog
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          projectId={activeProjectId}
        />
      )}
    </Box>
  );
};

export default TasksPage;
