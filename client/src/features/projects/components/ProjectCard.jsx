// src/features/projects/components/ProjectCard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
} from "@mui/material";
import { FolderKanban, Columns3, ArrowRight, Calendar } from "lucide-react";
import StatusChip from "../../../components/common/StatusChip";
import PriorityChip from "../../../components/common/PriorityChip";
import { formatDate } from "../../../utils/formatDate";

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const handleKanban = (e) => {
    e.stopPropagation();
    navigate(`/projects/${project._id}/board`);
  };

  const handleView = () => {
    navigate(`/projects/${project._id}`);
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 3.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "all 0.25s ease-in-out",
        "&:hover": {
          boxShadow: "0 12px 28px -4px rgba(15, 23, 42, 0.08)",
          borderColor: "primary.light",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 3, pb: 1.5 }}>
        {/* Top Row: Icon + Project Name on Left, BOTH Priority & Status Chips on Top-Right Corner */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            width: "100%",
            marginBottom: "16px",
          }}
        >
          {/* Left Side: Avatar + Project Name */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
            <Avatar
              sx={{
                bgcolor: "#EEF2FF",
                color: "#4F46E5",
                width: 44,
                height: 44,
                borderRadius: 2.5,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              <FolderKanban size={22} />
            </Avatar>

            <div style={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={800} color="text.primary" noWrap letterSpacing="-0.02em">
                {project.name}
              </Typography>
            </div>
          </div>

          {/* Right Side: Priority Chip & Status Chip Locked in Top-Right Corner */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <PriorityChip priority={project.priority || "MEDIUM"} />
            <StatusChip label={project.status || "ACTIVE"} />
          </div>
        </div>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minHeight: 40,
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 2,
          }}
        >
          {project.description || "No project description provided."}
        </Typography>

        {/* Due Date with Calendar Icon - Aligned Side-by-Side */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "6px",
            marginTop: "8px",
          }}
        >
          <Calendar size={15} color="#64748B" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748B" }}>
            Due: {formatDate(project.dueDate)}
          </span>
        </div>
      </CardContent>

      {/* Bottom Action Area (No Top Divider, Space Between, Padded Left & Right) */}
      <Box
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Button
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<Columns3 size={15} />}
          onClick={handleKanban}
          sx={{ textTransform: "none", borderRadius: 2.5, fontWeight: 700, px: 2 }}
        >
          Kanban Board
        </Button>

        <Button
          size="small"
          variant="text"
          color="primary"
          onClick={handleView}
          endIcon={<ArrowRight size={16} />}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Details
        </Button>
      </Box>
    </Card>
  );
};

export default ProjectCard;
