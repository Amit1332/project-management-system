// src/features/organizations/components/AddMemberDialog.jsx

import React, { useState } from "react";
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
  Autocomplete,
} from "@mui/material";
import { UserPlus } from "lucide-react";
import { useAddMemberMutation } from "../api/organizationApi";
import { formatError } from "../../../utils/formatError";

const AddMemberDialog = ({ open, onClose, organizationId }) => {
  const [addMember, { isLoading }] = useAddMemberMutation();

  const [formData, setFormData] = useState({
    email: "",
    role: "MEMBER",
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
    if (!organizationId) return;

    if (!formData.email.trim()) {
      setErrorMessage("User email address is required.");
      return;
    }

    try {
      const response = await addMember({
        organizationId,
        email: formData.email.trim(),
        role: formData.role,
      }).unwrap();

      if (response.success) {
        setFormData({ email: "", role: "MEMBER" });
        onClose();
      }
    } catch (err) {
      setErrorMessage(formatError(err));
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={800} sx={{ pt: 3, px: 3, pb: 1, fontSize: "1.25rem" }}>
        Add Organization Member
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, py: 3.5 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box display="flex" flexDirection="column">
            <Autocomplete
              freeSolo
              options={[]}
              value={formData.email}
              onInputChange={(event, newInputValue) => {
                setFormData((prev) => ({ ...prev, email: newInputValue || "" }));
                if (errorMessage) setErrorMessage("");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="User Email Address"
                  name="email"
                  placeholder="Search or enter registered user email..."
                  helperText="Search or type a registered user email address"
                  required
                  fullWidth
                  autoFocus
                  size="medium"
                  sx={{ mb: 3 }}
                />
              )}
            />

            <TextField
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              size="medium"
            >
              <MenuItem value="MEMBER">Member (Standard Access)</MenuItem>
              <MenuItem value="ADMIN">Admin (Organization Management)</MenuItem>
            </TextField>
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
                <UserPlus size={16} />
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
            {isLoading ? "Adding..." : "Add Member"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddMemberDialog;
