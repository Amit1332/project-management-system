// src/features/tasks/components/TaskCard.jsx

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { Calendar, User, MoreVertical, Edit3, Trash2, CheckCircle } from "lucide-react";
import PriorityChip from "../../../components/common/PriorityChip";
import { formatDate } from "../../../utils/formatDate";

import { useNavigate } from "react-router-dom";

const TaskCard = ({ task, onEdit, onArchive, onStatusChange, draggable = false, onDragStart, onDragEnd }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const open = Boolean(anchorEl);

  const handleCardClick = () => {
    if (isDragging) return;
    const activeProjectId = task.projectId?._id || task.projectId;
    if (activeProjectId) {
      navigate(`/projects/${activeProjectId}/tasks/${task._id}`);
    } else {
      navigate(`/tasks/${task._id}`);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const assignee = task.assigneeId || task.assignee || {};

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDragStartInternal = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", task._id);
    e.dataTransfer.setData("sourceStatus", task.status || "");
    e.dataTransfer.effectAllowed = "move";
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  const handleDragEndInternal = (e) => {
    setIsDragging(false);
    if (onDragEnd) {
      onDragEnd(e, task);
    }
  };

  return (
    <Card
      elevation={0}
      draggable={draggable}
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onClick={handleCardClick}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: isDragging ? "primary.main" : "divider",
        bgcolor: "background.paper",
        cursor: draggable ? "grab" : "pointer",
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "scale(0.98)" : "none",
        transition: "all 0.18s ease-in-out",
        boxShadow: isDragging ? "0 10px 25px rgba(79, 70, 229, 0.25)" : "0 2px 6px rgba(15, 23, 42, 0.04)",
        "&:hover": {
          boxShadow: "0 8px 20px -4px rgba(15, 23, 42, 0.1)",
          borderColor: "primary.light",
        },
        "&:active": {
          cursor: draggable ? "grabbing" : "pointer",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Top Header Row: Priority Chip on Left, 3-dots Menu Button on Top Right Corner */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <PriorityChip priority={task.priority || "MEDIUM"} />

          <IconButton size="small" onClick={handleMenuClick} sx={{ p: 0.5 }}>
            <MoreVertical size={16} color="#64748B" />
          </IconButton>
        </div>

        {/* Task Title */}
        <Typography variant="subtitle1" fontWeight={800} color="text.primary" gutterBottom lineHeight={1.3}>
          {task.title}
        </Typography>

        {/* Task Description */}
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <Box display="flex" gap={0.8} flexWrap="wrap" mb={2}>
            {task.labels.map((label, idx) => (
              <Chip
                key={idx}
                label={label}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  bgcolor: "#F1F5F9",
                  color: "#475569",
                  borderRadius: 1.5,
                }}
              />
            ))}
          </Box>
        )}

        {/* Bottom Footer Info: Avatar + Assignee Name on Left, Due Date on Right (Strict Horizontal Row) */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "12px",
            borderTop: "1px solid #F1F5F9",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <Avatar
              src={assignee.avatar || undefined}
              sx={{
                width: 26,
                height: 26,
                fontSize: "0.7rem",
                fontWeight: 700,
                bgcolor: assignee.name ? "#eb4634" : "#CBD5E1",
                borderRadius: "6px",
                flexShrink: 0,
              }}
            >
              {assignee.name ? getInitials(assignee.name) : <User size={13} />}
            </Avatar>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#475569",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {assignee.name || "Unassigned"}
            </span>
          </div>

          {task.dueDate && (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "4px", flexShrink: 0 }}>
              <Calendar size={13} color="#64748B" />
              <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                {formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {onEdit && (
          <MenuItem
            onClick={() => {
              handleClose();
              onEdit(task);
            }}
          >
            <ListItemIcon>
              <Edit3 size={16} />
            </ListItemIcon>
            Edit Task
          </MenuItem>
        )}

        {onStatusChange && (
          <MenuItem
            onClick={() => {
              handleClose();
              const nextStatus =
                task.status === "TODO"
                  ? "IN_PROGRESS"
                  : task.status === "IN_PROGRESS"
                  ? "IN_REVIEW"
                  : task.status === "IN_REVIEW"
                  ? "DONE"
                  : "TODO";
              onStatusChange(task, nextStatus);
            }}
          >
            <ListItemIcon>
              <CheckCircle size={16} />
            </ListItemIcon>
            Advance Status
          </MenuItem>
        )}

        {onArchive && (
          <MenuItem
            onClick={() => {
              handleClose();
              onArchive(task);
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <Trash2 size={16} color="#DC2626" />
            </ListItemIcon>
            Archive Task
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default React.memo(TaskCard);
