// frontend/theme.ts
import { createTheme } from '@mui/material/styles';

// Cores da marca BurnoutZero
const colors = {
  primary: {
    main: "#147DAC",
    light: "#157FAE",
    dark: "#147BAB",
  },
  secondary: {
    main: "#AE45AF",
    light: "#C571BB",
    dark: "#B962C0",
  },
  accent: {
    warning: "#FFB347",
    error: "#FF6B6B",
    success: "#4CAF50",
    info: "#147DAC",
  },
  background: {
    default: "#FCEBE8",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#2D3A4A",
    secondary: "#5F6B7A",
  },
};

export const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    error: { main: colors.accent.error },
    warning: { main: colors.accent.warning },
    success: { main: colors.accent.success },
    info: { main: colors.accent.info },
    background: colors.background,
    text: colors.text,
    divider: '#DBB0E3',
    action: {
      hover: '#E9BCD5',
    },
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "2.5rem", fontWeight: 600 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    h3: { fontSize: "1.75rem", fontWeight: 600 },
    h4: { fontSize: "1.5rem", fontWeight: 500 },
    h5: { fontSize: "1.25rem", fontWeight: 500 },
    h6: { fontSize: "1.125rem", fontWeight: 500 },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
          borderRadius: 16,
        },
      },
    },
  },
});