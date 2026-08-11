// src/components/layout/MobileSidebar.jsx

import React from "react";
import { Drawer } from "@mui/material";
import Sidebar from "./Sidebar";

const MobileSidebar = ({ open, onClose }) => {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: "block", lg: "none" },
        "& .MuiDrawer-paper": {
          width: 260,
          boxSizing: "border-box",
        },
      }}
    >
      <Sidebar onClose={onClose} />
    </Drawer>
  );
};

export default MobileSidebar;
