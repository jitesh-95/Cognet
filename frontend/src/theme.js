// theme.js
import { createTheme } from "@mui/material/styles";

// Light Theme
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6e83f4",
      light: "#ffffff",
      dark: "#004ba0",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f50057",
      light: "#ff5983",
      dark: "#bb002f",
      contrastText: "#fff",
    },
    success: { main: "#4caf50" },
    error: { main: "#f44336" },
    warning: { main: "#ff9800" },
    info: { main: "#2196f3" },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
      iconBackground: '#f8f9fe',
      rootNode: '#91bbeb',
      subNode: '#E8F0FE',
      detailNode: '#F5F5F5',
    },
    text: {
      primary: "#212121",
      secondary: "#616161",
      disabled: "rgba(0,0,0,0.38)",
    },
    divider: "rgba(0,0,0,0.12)",
    action: {
      hover: "rgba(25, 118, 210, 0.08)",
      selected: "rgba(25, 118, 210, 0.16)",
      disabled: "rgba(0,0,0,0.26)",
      disabledBackground: "rgba(0,0,0,0.12)",
      focus: "rgba(25, 118, 210, 0.24)",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: "none" } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiAppBar: { styleOverrides: { root: { borderRadius: '0', background: '#ffffff' } } },
  },
});

// Dark Theme
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6e83f4",
      light: "#171c30",
      dark: "#171c30",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f50057",
      light: "#ff5983",
      dark: "#bb002f",
      contrastText: "#fff",
    },
    success: { main: "#4caf50" },
    error: { main: "#f44336" },
    warning: { main: "#ff9800" },
    info: { main: "#2196f3" },
    background: {
      default: "#171c30",
      paper: "#1e2339",
      iconBackground: '#292e44',
      rootNode: '#367ccc',
      subNode: '#2C2F48',
      detailNode: '#1E1E1E',
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
      disabled: "rgba(255,255,255,0.5)",
    },
    divider: "rgba(255,255,255,0.12)",
    action: {
      hover: "rgba(25, 118, 210, 0.12)",
      selected: "rgba(25, 118, 210, 0.24)",
      disabled: "rgba(255,255,255,0.3)",
      disabledBackground: "rgba(255,255,255,0.12)",
      focus: "rgba(25, 118, 210, 0.32)",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: "none" } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: "none", borderRadius: '0', background: '#171c30' } } },
  },
});
