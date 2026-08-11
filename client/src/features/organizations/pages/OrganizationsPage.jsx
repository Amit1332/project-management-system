// src/features/organizations/pages/OrganizationsPage.jsx

import React, { useState } from "react";
import { Box, Grid, Typography, Button, Paper } from "@mui/material";
import { Building, Plus } from "lucide-react";

import { useGetMyOrganizationsQuery } from "../api/organizationApi";
import OrganizationCard from "../components/OrganizationCard";
import CreateOrganizationDialog from "../components/CreateOrganizationDialog";
import PageHeader from "../../../components/common/PageHeader";
import SearchInput from "../../../components/common/SearchInput";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import { formatError } from "../../../utils/formatError";

const OrganizationsPage = () => {
  const { data, isLoading, isError, error, refetch } = useGetMyOrganizationsQuery();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const orgItems = data?.data || [];

  const filteredOrgs = orgItems.filter((item) => {
    const org = item.organization || item;
    const nameMatch = org.name?.toLowerCase().includes(search.toLowerCase());
    const descMatch = org.description?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || descMatch;
  });

  return (
    <Box>
      <PageHeader
        title="Organizations"
        subtitle="Manage your workspaces, team members, and permissions"
        actionLabel="Create Organization"
        actionIcon={Plus}
        onAction={() => setIsCreateOpen(true)}
      />

      {/* Filter Bar */}
      {orgItems.length > 0 && (
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
            <Grid size={{ xs: 12, md: 6 }}>
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations by name or description..."
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Content State Handling */}
      {isLoading ? (
        <LoadingSpinner label="Fetching organizations..." py={6} />
      ) : isError ? (
        <ErrorState
          title="Failed to load organizations"
          message={formatError(error)}
          onRetry={refetch}
        />
      ) : filteredOrgs.length === 0 ? (
        <EmptyState
          icon={Building}
          title={search ? "No matching organizations found" : "No organizations created yet"}
          description={
            search
              ? `No organization matched "${search}". Try another search term.`
              : "Create your first organization workspace to start inviting members and managing projects."
          }
          actionLabel="Create Organization"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredOrgs.map((item) => {
            const org = item.organization || item;
            return (
              <Grid key={org._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <OrganizationCard item={item} />
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal */}
      <CreateOrganizationDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </Box>
  );
};

export default OrganizationsPage;
