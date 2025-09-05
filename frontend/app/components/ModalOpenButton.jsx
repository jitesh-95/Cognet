'use client'

import { Fab, Tooltip } from '@mui/material'
import React from 'react';
import PolylineIcon from '@mui/icons-material/Polyline';

const ModalOpenButton = ({ onClick, title }) => {
  return (
    <Tooltip title={title ?? 'Open Modal'}>
      <Fab
        color="primary"
        aria-label="toggle modal"
        size='medium'
        onClick={onClick}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <PolylineIcon />
      </Fab>
    </Tooltip>
  )
}

export default ModalOpenButton;