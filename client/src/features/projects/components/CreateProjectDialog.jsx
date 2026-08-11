// src/features/projects/components/CreateProjectDialog.jsx

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
import { FolderPlus } from "lucide-react";
import { useCreateProjectMutation } from "../api/projectApi";
import { formatError } from "../../../utils/formatError";

const CreateProjectDialog = ({ open, onClose }) => {
  const { currentOrganization } = useSelector((state) => state.auth);
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
    priority: "MEDIUM",
    startDate: "",
    dueDate: "",
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
    if (!currentOrganization?._id) {
      setErrorMessage("Active organization is required to create a project.");
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage("Project name is required.");
      return;
    }

    try {
      const response = await createProject({
        organizationId: currentOrganization._id,
        ...formData,
      }).unwrap();

      if (response.success) {
        setFormData({
          name: "",
          description: "",
          status: "ACTIVE",
          priority: "MEDIUM",
          startDate: "",
          dueDate: "",
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
        Create New Project
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
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. E-Commerce Platform V2"
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
              placeholder="Project goals and overview..."
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
                  <MenuItem value="PLANNING">PLANNING</MenuItem>
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="ON_HOLD">ON_HOLD</MenuItem>
                  <MenuItem value="COMPLETED">COMPLETED</MenuItem>
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

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
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
                <FolderPlus size={16} />
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
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateProjectDialog;
