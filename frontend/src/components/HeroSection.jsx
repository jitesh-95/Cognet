"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Image from "next/image";
import styles from '../styles/page.module.css';

const HeroSection = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        gap: 5,
        justifyContent: "space-between",
        px: { xs: 3, md: 10 },
        pt: { xs: 18, md: 12 },
        pb: { xs: 10, md: 5 },
        minHeight: "80vh"
      }}
    >
      {/* Text Section */}
      <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, mb: { xs: 5, md: 0 } }}>
        <Typography variant="h3" sx={{
          fontWeight: "bold", mb: 3,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '2.5rem', lg: '3.5rem' }
        }}>
          Visualize Ideas.<br />
          Organize Thoughts.<br />
          Unlock Creativity.
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, mx: { xs: 2, sm: 8, md: 0 } }}>
          Cognet helps you map your thoughts, explore connections, and boost productivity effortlessly.
        </Typography>
        <Button variant="contained" color="primary" size="large">
          Get Started
        </Button>
      </Box>

      {/* Image Section */}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            width: '100%',
            height: "auto",
          }}
        >
          <Image src='/images/heroImg.svg' height={1920} width={1080} alt='hero image' className={styles.heroImage} />
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSection;
