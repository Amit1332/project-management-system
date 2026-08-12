// src/features/activity/components/ActivityTimeline.jsx

import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import { Activity, ArrowRight } from "lucide-react";

import {
  useGetProjectActivityQuery,
  useGetTaskActivityQuery,
} from "../api/activityApi";
import StatusChip from "../../../components/common/StatusChip";
import PriorityChip from "../../../components/common/PriorityChip";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import { formatError } from "../../../utils/formatError";
import { formatRelativeDate } from "../../../utils/formatDate";
import { joinRoom, onSocketEvent } from "../../../services/socket";

const actionLabels = {
  PROJECT_CREATED: "created this project",
  PROJECT_UPDATED: "updated project details",
  PROJECT_ARCHIVED: "archived this project",
  TASK_CREATED: "created a task",
  TASK_UPDATED: "updated a task",
  TASK_STATUS_CHANGED: "changed task status",
  TASK_PRIORITY_CHANGED: "changed task priority",
  TASK_ASSIGNED: "assigned a task",
  TASK_ASSIGNEE_CHANGED: "reassigned a task",
  TASK_ARCHIVED: "archived a task",
  MEMBER_ADDED: "added a project member",
  MEMBER_REMOVED: "removed a project member",
  COMMENT_ADDED: "added a comment",
};

const ActivityTimeline = ({ projectId, taskId }) => {
  const { currentOrganization } = useSelector((state) => state.auth);

  const projectActivityQuery = useGetProjectActivityQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId || Boolean(taskId), refetchOnMountOrArgChange: true }
  );

  const taskActivityQuery = useGetTaskActivityQuery(
    { projectId, taskId, organizationId: currentOrganization?._id },
    { skip: !projectId || !taskId, refetchOnMountOrArgChange: true }
  );

  const activeQuery = taskId ? taskActivityQuery : projectActivityQuery;
  const { data, isLoading, isError, error, refetch } = activeQuery;

  React.useEffect(() => {
    if (projectId) {
      joinRoom("project", projectId);
    }

    const handleNewActivity = () => {
      refetch();
    };

    const unsubs = [
      onSocketEvent("activity:created", handleNewActivity),
      onSocketEvent("activity:logged", handleNewActivity),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub && unsub());
    };
  }, [projectId, refetch]);

  const rawLogs = data?.data?.logs || data?.data || [];
  const activities = Array.isArray(rawLogs) ? rawLogs : [];

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
        <div style={{ display: "inline-flex", flexDirection: "row", alignItems: "center", gap: "6px" }}>
          <StatusChip label={meta.oldStatus} />
          <ArrowRight size={12} color="#64748B" />
          <StatusChip label={meta.newStatus} />
        </div>
      );
    }
    if (meta.newStatus) {
      return (
        <div style={{ display: "inline-flex", flexDirection: "row", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#64748B", fontSize: "0.875rem", fontWeight: 500 }}>to</span>
          <StatusChip label={meta.newStatus} />
        </div>
      );
    }
    if (meta.oldPriority && meta.newPriority) {
      return (
        <div style={{ display: "inline-flex", flexDirection: "row", alignItems: "center", gap: "6px" }}>
          <PriorityChip priority={meta.oldPriority} />
          <ArrowRight size={12} color="#64748B" />
          <PriorityChip priority={meta.newPriority} />
        </div>
      );
    }
    if (meta.newPriority) {
      return (
        <div style={{ display: "inline-flex", flexDirection: "row", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#64748B", fontSize: "0.875rem", fontWeight: 500 }}>to</span>
          <PriorityChip priority={meta.newPriority} />
        </div>
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
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <Activity size={20} color="#eb4634" />
        <Typography variant="h6" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
          Activity History
        </Typography>
      </div>

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
          <Box display="flex" flexDirection="column">
            {activities.map((item, idx) => {
              const user = item.userId || {};
              const actionText = actionLabels[item.action] || item.action?.toLowerCase().replace(/_/g, " ");

              return (
                <React.Fragment key={item._id || idx}>
                  {idx > 0 && <Divider sx={{ my: 1.5 }} />}

                  {/* Strict Horizontal Activity Row */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      width: "100%",
                      padding: "4px 0",
                    }}
                  >
                    {/* Left Side: Avatar + User Name + Action Phrase + Status/Priority Chips */}
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", flex: 1, minWidth: 0, flexWrap: "wrap" }}>
                      <Avatar
                        src={user.avatar}
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: "#eb4634",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          borderRadius: "8px",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(user.name)}
                      </Avatar>

                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", flexWrap: "wrap", minWidth: 0 }}>
                        <span style={{ fontWeight: 800, color: "#0F172A", fontSize: "0.875rem" }}>
                          {user.name || "User"}
                        </span>

                        <span style={{ color: "#475569", fontSize: "0.875rem", fontWeight: 500 }}>
                          {actionText}
                        </span>

                        {renderMetadataDetails(item)}

                        {(item.taskId?.title || item.metadata?.title) && !taskId && (
                          <span style={{ color: "#64748B", fontSize: "0.8rem", fontStyle: "italic", marginLeft: "4px" }}>
                            ("{item.taskId?.title || item.metadata?.title}")
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Relative Timestamp */}
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                        {formatRelativeDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
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
