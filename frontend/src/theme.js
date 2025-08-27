// src/theme.js
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00809D', // sets the primary color used by MUI Buttons
    },
    text: {
      primary: '#000000',   // Fully black text
      secondary: '#444444', // Slightly dimmed
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00809D', // sets the primary color used by MUI Buttons
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});
