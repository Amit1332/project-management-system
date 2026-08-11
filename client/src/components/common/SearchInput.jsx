// src/components/common/SearchInput.jsx

import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Search } from "lucide-react";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  size = "small",
  fullWidth = true,
}) => {
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
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: "background.paper",
        },
      }}
    />
  );
};

export default SearchInput;
