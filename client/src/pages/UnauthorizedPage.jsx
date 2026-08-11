// src/pages/UnauthorizedPage.jsx

import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <Box>
        <Typography variant="h3" gutterBottom>
          403
        </Typography>

        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          You don't have permission to access this page.
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default UnauthorizedPage;