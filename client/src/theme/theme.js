// src/theme/theme.js

import { createTheme } from "@mui/material/styles";

import colors from "./colors";
import typography from "./typography";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: colors.primary,

    secondary: colors.secondary,

    success: colors.success,

    warning: colors.warning,

    error: colors.error,

    info: colors.info,

    text: colors.text,

    background: colors.background,

    divider: colors.divider,
  },

  typography,

  shape: {
    borderRadius: 8,
  },

  spacing: 8,

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          fontWeight: 600,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary.main,
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 1px 3px rgba(15, 23, 42, 0.08)",
          border: `1px solid ${colors.divider}`,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.divider,
        },

        head: {
          fontWeight: 600,
          backgroundColor: colors.grey[50],
          color: colors.text.primary,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${colors.divider}`,
          backgroundColor: colors.background.sidebar,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "0.75rem",
          borderRadius: 6,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
  },
});

export default theme;
