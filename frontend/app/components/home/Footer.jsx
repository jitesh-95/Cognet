'use client'

import { Box, Typography } from '@mui/material';
import React from 'react';
import { motion } from 'framer-motion';
import pgk from '../../../package.json';

const APP_VERSION = pgk.version;

const Footer = () => {
  const year = new Date().getFullYear();

  const footerVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: { scaleX: 1, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={footerVariants}
      style={{ transformOrigin: "center" }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 0.5, md: 2 },
          textAlign: 'center',
          color: 'text.secondary',
          py: 4,
          borderTop: 'rgb(57, 57, 57)',
          boxShadow: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.72)'
        }}
      >
        <Typography variant="body2" color='#fff'>
          💡 Empowering Your Ideas, 🔒 Protecting Your Mind.
        </Typography>

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

        <Typography variant='caption' color='#cccccc'>
          © {year} Cognet. All rights reserved.
        </Typography>

        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            mx: 1,
            color: '#fff',
          }}
        >
          |
        </Box>

        <Typography variant='caption' color='#cccccc'>
          Version {APP_VERSION}
        </Typography>
      </Box>
    </motion.div>
  );
}

export default Footer;
