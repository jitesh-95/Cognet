'use client'

import { Box, Typography } from '@mui/material';
import React from 'react';
import pgk from '../../package.json';


const APP_VERSION = pgk.version; // Update from package.json if needed

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'center',
        alignItems: 'center',
        gap: { xs: 0.5, md: 2 },
        textAlign: 'center',
        color: 'text.secondary',
        py: 2,
        borderTop: 'rgb(57, 57, 57)',
        boxShadow: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.72)'
      }}
    >
      <Typography variant="body2" color='#fff'>Organize Your Mind, Empower Your Ideas ❤️</Typography>

      {/* Vertical bar separator on md+ */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          mx: 1,
          color: '#fff',
        }}
      >
        |
      </Box>

      <Typography variant='caption' color='#cccccc'>© {year} Cognet. All rights reserved.</Typography>

      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          mx: 1,
          color: '#fff',
        }}
      >
        |
      </Box>

      <Typography variant='caption' color='#cccccc'>Version {APP_VERSION}</Typography>
    </Box>
  )
}

export default Footer;