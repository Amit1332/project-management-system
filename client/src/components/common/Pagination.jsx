// src/components/common/Pagination.jsx

import React from "react";
import { Box, Pagination as MuiPagination, Typography } from "@mui/material";

const Pagination = ({
  page = 1,
  count = 1,
  onChange,
  totalItems,
  itemsPerPage = 10,
  mt = 4,
}) => {
  if (count <= 1 && !totalItems) return null;

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems || count * itemsPerPage);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        mt: mt,
        pt: 2,
        gap: 2,
      }}
    >
      {totalItems !== undefined && (
        <Typography variant="body2" color="text.secondary">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
          <strong>{totalItems}</strong> items
        </Typography>
      )}

      <MuiPagination
        count={count}
        page={page}
        onChange={onChange}
        color="primary"
        shape="rounded"
        size="medium"
      />
    </Box>
  );
};

export default Pagination;
