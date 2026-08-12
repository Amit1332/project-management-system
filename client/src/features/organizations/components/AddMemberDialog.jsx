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
  Avatar,
  Typography,
} from "@mui/material";
import { UserPlus } from "lucide-react";
import { useAddMemberMutation } from "../api/organizationApi";
import { useSearchUsersQuery } from "../../auth/api/authApi";
import { formatError } from "../../../utils/formatError";

const AddMemberDialog = ({ open, onClose, organizationId }) => {
  const [addMember, { isLoading }] = useAddMemberMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const { data: searchData, isLoading: isSearching } = useSearchUsersQuery(searchTerm);
  const options = searchData?.data || [];

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
      setErrorMessage("Please select or enter a registered user email address.");
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
        setSearchTerm("");
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
            {/* Search Dropdown Select Field for Existing DB Users */}
            <Autocomplete
              freeSolo
              options={options}
              getOptionLabel={(option) => {
                if (typeof option === "string") return option;
                return `${option.name} (${option.email})`;
              }}
              isOptionEqualToValue={(option, value) => {
                if (typeof value === "string") return option.email === value;
                return option._id === value?._id || option.email === value?.email;
              }}
              onInputChange={(event, newInputValue) => {
                setSearchTerm(newInputValue || "");
                setFormData((prev) => ({ ...prev, email: newInputValue || "" }));
                if (errorMessage) setErrorMessage("");
              }}
              onChange={(event, newValue) => {
                if (newValue) {
                  const selectedEmail = typeof newValue === "string" ? newValue : newValue.email;
                  setFormData((prev) => ({ ...prev, email: selectedEmail }));
                }
              }}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  key={option._id}
                  sx={{
                    py: 1,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    src={option.avatar || undefined}
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      bgcolor: "#eb4634",
                      flexShrink: 0,
                    }}
                  >
                    {option.name ? option.name[0].toUpperCase() : "U"}
                  </Avatar>
                  <Box minWidth={0}>
                    <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {option.email}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Registered User"
                  placeholder="Type name or email to search existing users..."
                  helperText="Select an existing registered user from dropdown or enter an email address"
                  required
                  fullWidth
                  autoFocus
                  size="medium"
                  sx={{ mb: 3 }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isSearching ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps?.endAdornment}
                      </>
                    ),
                  }}
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
              boxShadow: "0 4px 14px rgba(235, 70, 52, 0.3)",
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
