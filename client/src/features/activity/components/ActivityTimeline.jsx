// src/features/activity/components/ActivityTimeline.jsx

import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import { Activity, Clock, User, ArrowRight } from "lucide-react";

import {
  useGetProjectActivityQuery,
  useGetTaskActivityQuery,
} from "../api/activityApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import { formatError } from "../../../utils/formatError";
import { formatRelativeDate, formatDateTime } from "../../../utils/formatDate";

const actionLabels = {
  PROJECT_CREATED: "created this project",
  PROJECT_UPDATED: "updated project details",
  PROJECT_ARCHIVED: "archived this project",
  TASK_CREATED: "created a task",
  TASK_UPDATED: "updated a task",
  TASK_STATUS_CHANGED: "changed task status",
  TASK_PRIORITY_CHANGED: "changed task priority",
  TASK_ASSIGNEE_CHANGED: "reassigned a task",
  TASK_ARCHIVED: "archived a task",
  MEMBER_ADDED: "added a member",
  MEMBER_REMOVED: "removed a member",
  COMMENT_ADDED: "commented on a task",
};

import { getSocket } from "../../../services/socket";

const ActivityTimeline = ({ projectId, taskId }) => {
  const { currentOrganization } = useSelector((state) => state.auth);

  // If taskId is provided, fetch task activity, otherwise fetch project activity
  const projectActivityQuery = useGetProjectActivityQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId || Boolean(taskId) }
  );

  const taskActivityQuery = useGetTaskActivityQuery(
    { projectId, taskId, organizationId: currentOrganization?._id },
    { skip: !projectId || !taskId }
  );

  const activeQuery = taskId ? taskActivityQuery : projectActivityQuery;
  const { data, isLoading, isError, error, refetch } = activeQuery;

  // Listen to real-time activity log events
  React.useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleNewActivity = () => {
        refetch();
      };
      socket.on("activity:logged", handleNewActivity);
      return () => {
        socket.off("activity:logged", handleNewActivity);
      };
    }
  }, [refetch]);

  const activities = data?.data?.logs || data?.data || [];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderMetadataDetails = (activity) => {
    const meta = activity.metadata || {};
    if (meta.oldStatus && meta.newStatus) {
      return (
        <Box display="inline-flex" alignItems="center" gap={0.8} ml={1}>
          <Chip label={meta.oldStatus} size="small" sx={{ height: 18, fontSize: "0.68rem" }} />
          <ArrowRight size={12} />
          <Chip label={meta.newStatus} size="small" color="primary" sx={{ height: 18, fontSize: "0.68rem" }} />
        </Box>
      );
    }
    if (meta.oldPriority && meta.newPriority) {
      return (
        <Box display="inline-flex" alignItems="center" gap={0.8} ml={1}>
          <Chip label={meta.oldPriority} size="small" sx={{ height: 18, fontSize: "0.68rem" }} />
          <ArrowRight size={12} />
          <Chip label={meta.newPriority} size="small" color="warning" sx={{ height: 18, fontSize: "0.68rem" }} />
        </Box>
      );
    }
    return null;
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading activity logs..." py={4} />;
  }

  if (isError) {
    return <ErrorState message={formatError(error)} onRetry={refetch} />;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Activity size={20} color="#4F46E5" />
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Activity History
        </Typography>
      </Box>

      {activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity recorded"
          description="Activity logs will automatically record task and project actions as they occur."
        />
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box display="flex" flexDirection="column" gap={2.5}>
            {activities.map((item, idx) => {
              const user = item.userId || {};
              const actionText = actionLabels[item.action] || item.action?.toLowerCase().replace(/_/g, " ");

              return (
                <React.Fragment key={item._id || idx}>
                  {idx > 0 && <Divider />}

                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.main",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(user.name)}
                    </Avatar>

                    <Box flex={1}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                        <Typography variant="body2" color="text.primary">
                          <strong>{user.name || "User"}</strong> {actionText}
                          {renderMetadataDetails(item)}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeDate(item.createdAt)}
                        </Typography>
                      </Box>

                      {item.taskId?.title && !taskId && (
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.3}>
                          Task: <em>{item.taskId.title}</em>
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ActivityTimeline;
