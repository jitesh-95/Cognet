"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Image from "next/image";
import styles from '../../styles/page.module.css';
import heroImg from '../../images/heroImg.svg';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';

// Variants for animations
const containerVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const imageVariant = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

// New background span animation
const bgAnimation = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const HeroSection = () => {
  const router = useRouter();
  const handleNavigate = () => router.push('/url-map');

  return (
    <motion.div variants={containerVariant} initial="hidden" animate="visible">
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
          minHeight: { xs: '80vh', sm: '50vh', md: '70vh' }
        }}
      >
        {/* Text Section */}
        <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" }, mb: { xs: 5, md: 0 } }}>
          <motion.div variants={fadeUpVariant}>
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 3, fontSize: { xs: '2rem', sm: '2.5rem', md: '2.5rem', lg: '3.5rem' } }}>
              AI That Maps Your <br />
              {['Mind', 'Ideas', 'Thoughts'].map((word, i) => (
                <Box
                  key={word}
                  component="span"
                  sx={{ position: 'relative', display: 'inline-block', marginRight: '0.8rem' }}
                >
                  {/* Animated background */}
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, ease: "easeOut", delay: i * 0.2 }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      backgroundColor: '#6e83f4', // primary.main
                      zIndex: -1,
                    }}
                  />
                  {/* Static text */}
                  <span style={{ padding: '0 0.6rem', fontStyle: 'italic' }}>
                    {word}
                  </span>
                </Box>
              ))}

            </Typography>
          </motion.div>

          <motion.div variants={fadeUpVariant}>
            <Typography variant="h6" sx={{ mb: 4, mx: { xs: 2, sm: 8, md: 0 } }}>
              Turn any link or file into a clear, interactive mindmap <br /> instantly, privately, and ad-free.
            </Typography>
          </motion.div>

          <motion.div variants={fadeUpVariant}>
            <Button variant="contained" sx={{ fontWeight: 600 }} size="large" onClick={handleNavigate}>
              Generate My Mindmap
            </Button>
          </motion.div>
        </Box>

        {/* Image Section */}
        <motion.div variants={imageVariant} style={{ flex: 1 }}>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Box sx={{ width: '100%', height: "auto" }}>
              <Image src={heroImg} height={1920} width={1080} alt='hero image' priority className={styles.heroImage} />
            </Box>
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default HeroSection;
