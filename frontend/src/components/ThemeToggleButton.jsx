'use client'

import React from "react";
import { Fab } from "@mui/material";

import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useThemeMode } from "@/app/contexts/ThemeContext";

const ThemeToggleButton = () => {
  const { darkMode, toggleTheme } = useThemeMode();

  return (
    <Fab
      color="primary"
      aria-label="toggle theme"
      onClick={toggleTheme}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
    </Fab>
  );
};

export default ThemeToggleButton;
