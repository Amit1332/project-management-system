// src/features/tasks/components/EditTaskDialog.jsx

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  MenuItem,
  CircularProgress,
  Grid,
  Tooltip,
} from "@mui/material";
import { Edit3 } from "lucide-react";
import { useUpdateTaskMutation } from "../api/taskApi";
import { useGetMembersQuery } from "../../organizations/api/organizationApi";
import { useGetProjectMembersQuery } from "../../projects/api/projectApi";
import { formatError } from "../../../utils/formatError";

const EditTaskDialog = ({ open, onClose, projectId, task, canManageTask = true }) => {
  const { currentOrganization } = useSelector((state) => state.auth);
  const [updateTask, { isLoading }] = useUpdateTaskMutation();

  const { data: projectMembersData } = useGetProjectMembersQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId || !currentOrganization?._id }
  );

  const { data: orgMembersData } = useGetMembersQuery(currentOrganization?._id, {
    skip: !!projectId || !currentOrganization?._id,
  });

  const members = projectId
    ? (projectMembersData?.data || []).map((m) => (m.userId ? m : { userId: m }))
    : orgMembersData?.data || [];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    dueDate: "",
    labelsString: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (task) {
      const assignee = task.assigneeId || task.assignee || {};
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "TODO",
        priority: task.priority || "MEDIUM",
        assigneeId: assignee._id || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        labelsString: task.labels ? task.labels.join(", ") : "",
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId || !task?._id) return;

    if (!formData.title.trim()) {
      setErrorMessage("Task title is required.");
      return;
    }

    const labels = formData.labelsString
      ? formData.labelsString.split(",").map((l) => l.trim()).filter(Boolean)
      : [];

    try {
      const payload = {
        projectId,
        taskId: task._id,
        organizationId: currentOrganization?._id,
        title: formData.title.trim(),
        description: formData.description,
        status: formData.status,
        labels,
      };

      // Only send Priority, Assignee & Due Date if user has manager/admin permissions
      if (canManageTask) {
        payload.priority = formData.priority;
        payload.assigneeId = formData.assigneeId || null;
        payload.dueDate = formData.dueDate || null;
      }

      const response = await updateTask(payload).unwrap();

      if (response.success) {
        onClose();
      }
    } catch (err) {
      setErrorMessage(formatError(err));
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={800} sx={{ pt: 3, px: 3, pb: 1, fontSize: "1.25rem" }}>
        Edit Task Details
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, py: 3.5 }}>
          {!canManageTask && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              As a Member, you can edit Title, Description, Status, and Labels. Assignee, Priority, and Due Date modifications require Manager or Admin permissions.
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box display="flex" flexDirection="column">
            <TextField
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              sx={{ mb: 3 }}
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="TODO">TODO</MenuItem>
                  <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                  <MenuItem value="IN_REVIEW">IN_REVIEW</MenuItem>
                  <MenuItem value="DONE">DONE</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Tooltip title={!canManageTask ? "Only Managers & Admins can change priority" : ""}>
                  <TextField
                    select
                    label="Priority"
                    name="priority"
                    disabled={!canManageTask}
                    value={formData.priority}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="LOW">LOW</MenuItem>
                    <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                    <MenuItem value="HIGH">HIGH</MenuItem>
                    <MenuItem value="CRITICAL">CRITICAL</MenuItem>
                  </TextField>
                </Tooltip>
              </Grid>
            </Grid>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Tooltip title={!canManageTask ? "Only Managers & Admins can reassign tasks" : ""}>
                  <TextField
                    select
                    label="Assignee"
                    name="assigneeId"
                    disabled={!canManageTask}
                    value={formData.assigneeId}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {members.map((m) => {
                      const u = m.userId || {};
                      return (
                        <MenuItem key={u._id} value={u._id}>
                          {u.name}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Tooltip>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Tooltip title={!canManageTask ? "Only Managers & Admins can change due date" : ""}>
                  <TextField
                    label="Due Date"
                    name="dueDate"
                    type="date"
                    disabled={!canManageTask}
                    value={formData.dueDate}
                    onChange={handleChange}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Tooltip>
              </Grid>
            </Grid>

            <TextField
              label="Labels / Tags"
              name="labelsString"
              value={formData.labelsString}
              onChange={handleChange}
              placeholder="e.g. backend, auth (comma separated)"
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button onClick={onClose} disabled={isLoading} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Edit3 size={16} />
              )
            }
            sx={{
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              py: 1,
              borderRadius: 2.5,
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
            }}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditTaskDialog;
