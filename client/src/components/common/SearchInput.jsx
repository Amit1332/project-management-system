// src/components/common/SearchInput.jsx

import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search, X } from "lucide-react";

const SearchInput = ({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  size = "medium",
  fullWidth = true,
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size={size}
      fullWidth={fullWidth}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color="#64748B" />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                edge="end"
                sx={{ color: "#94A3B8", "&:hover": { color: "#0F172A" } }}
              >
                <X size={16} />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: "background.paper",
          borderRadius: 2.5,
        },
      }}
    />
  );
};

export default SearchInput;
