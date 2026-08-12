// src/features/projects/pages/ProjectsPage.jsx

import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import { FolderKanban, Plus, RotateCcw } from "lucide-react";

import { useGetProjectsQuery } from "../api/projectApi";
import ProjectCard from "../components/ProjectCard";
import CreateProjectDialog from "../components/CreateProjectDialog";
import PageHeader from "../../../components/common/PageHeader";
import SearchInput from "../../../components/common/SearchInput";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import Pagination from "../../../components/common/Pagination";
import { formatError } from "../../../utils/formatError";

const ProjectsPage = () => {
  const { currentOrganization } = useSelector((state) => state.auth);

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

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectsQuery(
    {
      organizationId: currentOrganization?._id,
      page,
      limit: 12,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      search: search || undefined,
    },
    {
      skip: !currentOrganization?._id,
    }
  );

  const projects = data?.data || [];
  const pagination = data?.pagination || {};

  if (!currentOrganization) {
    return (
      <Box>
        <PageHeader
          title="Projects"
          subtitle="Manage your organization projects and deliverables"
        />
        <EmptyState
          icon={FolderKanban}
          title="No Active Workspace Selected"
          description="Please select or create an organization workspace from the header dropdown to view and manage projects."
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Projects"
        subtitle={`Projects for ${currentOrganization.name}`}
        actionLabel="Create Project"
        actionIcon={Plus}
        onAction={() => setIsCreateOpen(true)}
      />

      {/* Filter & Search Bar */}
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
          <Grid size={{ xs: 12, md: hasActiveFilters ? 4 : 5 }}>
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={() => setSearch("")}
              placeholder="Search projects by name..."
              size="medium"
            />
          </Grid>

          <Grid size={{ xs: 6, md: hasActiveFilters ? 3 : 3.5 }}>
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
              <MenuItem value="PLANNING">PLANNING</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="ON_HOLD">ON_HOLD</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              <MenuItem value="ARCHIVED">ARCHIVED</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, md: hasActiveFilters ? 3 : 3.5 }}>
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
            <Grid size={{ xs: 12, md: 2 }}>
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

      {/* State Render */}
      {isLoading ? (
        <LoadingSpinner label="Fetching projects..." py={6} />
      ) : isError ? (
        <ErrorState
          title="Failed to load projects"
          message={formatError(error)}
          onRetry={refetch}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={hasActiveFilters ? "No matching projects" : "No projects created yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your search filters to find projects."
              : "Get started by creating your first project for this organization."
          }
          actionLabel="Create Project"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid key={project._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ProjectCard project={project} />
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
      <CreateProjectDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </Box>
  );
};

export default ProjectsPage;
