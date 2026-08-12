// src/features/dashboard/pages/DashboardPage.jsx

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  UserCheck,
  Building,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  ListTodo,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import PageHeader from "../../../components/common/PageHeader";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import StatusChip from "../../../components/common/StatusChip";
import PriorityChip from "../../../components/common/PriorityChip";
import { useGetDashboardAnalyticsQuery } from "../../analytics/api/analyticsApi";
import { formatDate } from "../../../utils/formatDate";
import { formatError } from "../../../utils/formatError";

const STATUS_COLORS = {
  TODO: "#64748B",
  IN_PROGRESS: "#0284C7",
  IN_REVIEW: "#7E22CE",
  DONE: "#16A34A",
};

const PRIORITY_COLORS = {
  LOW: "#64748B",
  MEDIUM: "#0284C7",
  HIGH: "#EA580C",
  CRITICAL: "#DC2626",
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, currentOrganization } = useSelector((state) => state.auth);

  const {
    data: analyticsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDashboardAnalyticsQuery(
    { organizationId: currentOrganization?._id },
    { skip: !currentOrganization?._id }
  );

  const stats = analyticsData?.data || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    myTasksCount: 0,
    tasksByStatus: { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 },
    tasksByPriority: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    myTasks: [],
  };

  const hasTasks = (stats.totalTasks || 0) > 0;

  // Recharts Data formatting
  const statusChartData = [
    { name: "To Do", value: stats.tasksByStatus?.TODO || 0, color: STATUS_COLORS.TODO },
    { name: "In Progress", value: stats.tasksByStatus?.IN_PROGRESS || 0, color: STATUS_COLORS.IN_PROGRESS },
    { name: "In Review", value: stats.tasksByStatus?.IN_REVIEW || 0, color: STATUS_COLORS.IN_REVIEW },
    { name: "Done", value: stats.tasksByStatus?.DONE || 0, color: STATUS_COLORS.DONE },
  ];

  const priorityChartData = [
    { name: "Low", count: stats.tasksByPriority?.LOW || 0, fill: PRIORITY_COLORS.LOW },
    { name: "Medium", count: stats.tasksByPriority?.MEDIUM || 0, fill: PRIORITY_COLORS.MEDIUM },
    { name: "High", count: stats.tasksByPriority?.HIGH || 0, fill: PRIORITY_COLORS.HIGH },
    { name: "Critical", count: stats.tasksByPriority?.CRITICAL || 0, fill: PRIORITY_COLORS.CRITICAL },
  ];

  if (!currentOrganization?._id) {
    return (
      <Box sx={{ pb: 4 }}>
        <PageHeader
          title={`Welcome back, ${user?.name || "User"}!`}
          subtitle="Select or create an organization to view real-time analytics."
        />

        <Paper
          elevation={0}
          sx={{
            p: 4,
            mt: 3,
            textAlign: "center",
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Building size={48} color="#4F46E5" style={{ marginBottom: 16 }} />
          <Typography variant="h5" fontWeight={800} gutterBottom>
            No Active Organization Selected
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Please select or create an organization to start viewing real-time project metrics, task status breakdowns, and analytics charts.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/organizations")}
            sx={{ fontWeight: 700, px: 3, py: 1.2, borderRadius: 2.5 }}
          >
            Go to Organizations
          </Button>
        </Paper>
      </Box>
    );
  }

  if (isLoading) {
    return <LoadingSpinner label="Fetching workspace dashboard & analytics..." py={8} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load dashboard metrics"
        message={formatError(error)}
        onRetry={refetch}
      />
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Header Section */}
      <div style={{ marginBottom: "36px" }}>
        <PageHeader
          title={`Welcome back, ${user?.name || "User"}!`}
          subtitle={`Real-time project analytics and workspace metrics for ${currentOrganization.name}`}
        />
      </div>

      {/* 4 Key Metrics Cards Grid */}
      <div style={{ marginBottom: "36px" }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  TOTAL PROJECTS
                </Typography>
                <Avatar sx={{ width: 40, height: 40, bgcolor: "#EEF2FF", color: "#4F46E5", borderRadius: 2.5 }}>
                  <FolderKanban size={20} />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                {stats.totalProjects}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Typography variant="caption" color="#16A34A" fontWeight={700}>
                  {stats.activeProjects} Active
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • {stats.completedProjects} Completed
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  TOTAL TASKS
                </Typography>
                <Avatar sx={{ width: 40, height: 40, bgcolor: "#F0F9FF", color: "#0284C7", borderRadius: 2.5 }}>
                  <CheckSquare size={20} />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                {stats.totalTasks}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Across all workspace projects
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  COMPLETED TASKS
                </Typography>
                <Avatar sx={{ width: 40, height: 40, bgcolor: "#F0FDF4", color: "#16A34A", borderRadius: 2.5 }}>
                  <CheckSquare size={20} />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={800} color="#16A34A">
                {stats.completedTasks}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Successfully finished tasks
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: "1px solid #FEF2F2",
                bgcolor: "#FFFFFF",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography variant="caption" color="#DC2626" fontWeight={700}>
                  OVERDUE TASKS
                </Typography>
                <Avatar sx={{ width: 40, height: 40, bgcolor: "#FEF2F2", color: "#DC2626", borderRadius: 2.5 }}>
                  <AlertTriangle size={20} />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={800} color="#DC2626">
                {stats.overdueTasks}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Require immediate action
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ marginBottom: "36px" }}>
        <Grid container spacing={3}>
          {/* Pie Chart: Tasks by Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 3.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                height: 380,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <PieIcon size={20} color="#4F46E5" />
                <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                  Tasks Breakdown by Status
                </Typography>
              </div>

              <div style={{ width: "100%", height: "290px", position: "relative" }}>
                {!hasTasks ? (
                  <Box textAlign="center" my="auto" pt={6}>
                    <ListTodo size={40} color="#94A3B8" style={{ marginBottom: 12 }} />
                    <Typography variant="body2" color="#0F172A" fontWeight={700}>
                      No tasks in this workspace
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      Create tasks inside your project to view live status distributions.
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={290}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Tasks`, "Count"]} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Paper>
          </Grid>

          {/* Bar Chart: Tasks by Priority */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 3.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                height: 380,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <BarChart3 size={20} color="#0284C7" />
                <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                  Tasks Breakdown by Priority
                </Typography>
              </div>

              <div style={{ width: "100%", height: "290px", position: "relative" }}>
                {!hasTasks ? (
                  <Box textAlign="center" my="auto" pt={6}>
                    <BarChart3 size={40} color="#94A3B8" style={{ marginBottom: 12 }} />
                    <Typography variant="body2" color="#0F172A" fontWeight={700}>
                      No priority analytics yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      Create tasks inside your project to view priority metrics.
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart data={priorityChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                      <YAxis allowDecimals={false} stroke="#64748B" fontSize={12} />
                      <Tooltip formatter={(value) => [`${value} Tasks`, "Count"]} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {priorityChartData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>

      {/* Tasks Assigned to Current User Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          borderRadius: 3.5,
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
            <UserCheck size={20} color="#16A34A" />
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              Tasks Assigned to You ({stats.myTasksCount})
            </Typography>
          </div>

          <Button
            size="small"
            variant="text"
            color="primary"
            onClick={() => navigate("/tasks")}
            endIcon={<ArrowRight size={16} />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            View All Tasks
          </Button>
        </div>

        {stats.myTasks.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              No tasks currently assigned to you in this workspace.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ borderRadius: 2.5, border: "1px solid #F1F5F9" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Task Title</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.myTasks.map((t) => (
                  <TableRow key={t._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/tasks/${t._id}`)}>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>
                      {t.title}
                    </TableCell>
                    <TableCell sx={{ color: "#475569", fontWeight: 600 }}>
                      {t.projectId?.name || "Project"}
                    </TableCell>
                    <TableCell>
                      <StatusChip label={t.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityChip priority={t.priority} />
                    </TableCell>
                    <TableCell sx={{ color: "#64748B", fontWeight: 600 }}>
                      {t.dueDate ? formatDate(t.dueDate) : "No due date"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardPage;
