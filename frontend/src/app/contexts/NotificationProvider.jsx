"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Slide, Alert } from "@mui/material";

const NotificationContext = createContext();

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error"
  });

  const showNotification = useCallback(({ message, status = "success" }) => {
    setNotification({
      open: true,
      message,
      severity: status,
    });

    // closing notification after 10 seconds
    setTimeout(() => {
      setNotification({ open: false, message: '', severity: 'success' });
    }, 10000);
  }, []);

  const handleClose = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={notification.open}
        autoHideDuration={5000}
        message={notification.message}
        key={SlideTransition}
      >
        <Alert
          onClose={handleClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
