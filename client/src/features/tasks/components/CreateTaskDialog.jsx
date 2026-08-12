// src/features/tasks/components/CreateTaskDialog.jsx

import React, { useState } from "react";
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
} from "@mui/material";
import { Plus } from "lucide-react";
import { useCreateTaskMutation } from "../api/taskApi";
import { useGetMembersQuery } from "../../organizations/api/organizationApi";
import { useGetProjectMembersQuery } from "../../projects/api/projectApi";
import { formatError } from "../../../utils/formatError";

const CreateTaskDialog = ({ open, onClose, projectId, defaultStatus = "TODO" }) => {
  const { currentOrganization } = useSelector((state) => state.auth);
  const [createTask, { isLoading }] = useCreateTaskMutation();

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
    status: defaultStatus,
    priority: "MEDIUM",
    assigneeId: "",
    dueDate: "",
    labelsString: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      setErrorMessage("Project ID is required to create a task.");
      return;
    }

    if (!formData.title.trim()) {
      setErrorMessage("Task title is required.");
      return;
    }

    const labels = formData.labelsString
      ? formData.labelsString.split(",").map((l) => l.trim()).filter(Boolean)
      : [];

    try {
      const response = await createTask({
        projectId,
        organizationId: currentOrganization?._id,
        title: formData.title.trim(),
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId || undefined,
        dueDate: formData.dueDate || undefined,
        labels,
      }).unwrap();

      if (response.success) {
        setFormData({
          title: "",
          description: "",
          status: defaultStatus,
          priority: "MEDIUM",
          assigneeId: "",
          dueDate: "",
          labelsString: "",
        });
        onClose();
      }
    } catch (err) {
      setErrorMessage(formatError(err));
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={800} sx={{ pt: 3, px: 3, pb: 1, fontSize: "1.25rem" }}>
        Create New Task
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, py: 3.5 }}>
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
              placeholder="e.g. Implement JWT User Authentication"
              required
              fullWidth
              autoFocus
              sx={{ mb: 3 }}
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context and requirements..."
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Status Stage"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="TODO">TODO</MenuItem>
                  <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                  <MenuItem value="IN_REVIEW">IN_REVIEW</MenuItem>
                  <MenuItem value="DONE">DONE / COMPLETED</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="LOW">LOW</MenuItem>
                  <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                  <MenuItem value="HIGH">HIGH</MenuItem>
                  <MenuItem value="CRITICAL">CRITICAL</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Assignee"
                  name="assigneeId"
                  value={formData.assigneeId}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {members.map((m) => {
                    const u = m.userId || {};
                    return (
                      <MenuItem key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Labels / Tags"
              name="labelsString"
              value={formData.labelsString}
              onChange={handleChange}
              placeholder="e.g. backend, auth, security (comma separated)"
              helperText="Separate tags with commas"
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
                <Plus size={16} />
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
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateTaskDialog;
