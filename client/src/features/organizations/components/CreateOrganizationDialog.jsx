// src/features/organizations/components/CreateOrganizationDialog.jsx

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";
import { Building } from "lucide-react";
import { useCreateOrganizationMutation } from "../api/organizationApi";
import { setCurrentOrganization } from "../../auth/authSlice";
import { formatError } from "../../../utils/formatError";

const CreateOrganizationDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [createOrganization, { isLoading }] = useCreateOrganizationMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
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
    if (!formData.name.trim()) {
      setErrorMessage("Organization name is required.");
      return;
    }

    try {
      const response = await createOrganization(formData).unwrap();
      if (response.success && response.data) {
        dispatch(setCurrentOrganization(response.data));
        setFormData({ name: "", description: "" });
        onClose();
      }
    } catch (err) {
      setErrorMessage(formatError(err));
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={800} sx={{ pt: 3, px: 3, pb: 1, fontSize: "1.25rem" }}>
        Create New Organization
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
              label="Organization Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Acme Corporation"
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
              placeholder="Brief description of the organization..."
              multiline
              rows={3}
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
                <Building size={16} />
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
            {isLoading ? "Creating..." : "Create Organization"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateOrganizationDialog;
