// src/app/theme-registry.jsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '../theme';

const ThemeContext = createContext();
export function useThemeMode() {
  return useContext(ThemeContext);
}

// Helper: Set cookie (client-side only)
function setThemeCookie(mode) {
  document.cookie = `theme=${mode}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

// Helper: Read cookie (client-side fallback)
function getThemeCookie() {
  const match = document.cookie.match(/(^| )theme=([^;]+)/);
  return match ? match[2] : null;
}

export default function ThemeContextProvider({ children, isDarkMode = false }) {
  const [darkMode, setDarkMode] = useState(isDarkMode);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    setThemeCookie(newMode ? 'dark' : 'light');
  };

  // Fallback check for client-side cookie (only on mount)
  useEffect(() => {
    const saved = getThemeCookie();
    if (saved && saved !== (darkMode ? 'dark' : 'light')) {
      setDarkMode(saved === 'dark');
    }
  }, []);

  useEffect(() => {
    // Apply or remove the .dark class on <body>
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
