'use client'
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import lightLayout from '../../images/lightThemeLayout.png';
import Image from "next/image";
import styles from '../../styles/page.module.css';

const MultiScreenShowcaseSection = () => {
  return (
    <Box
      sx={{
        px: { xs: 0, md: 10 },
        py: { xs: 6, md: 12 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 6, md: 10 },
        mb: { xs: 4, md: 2 },
      }}
    >
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            textAlign: "center",
            mb: 4,
            mx: { xs: 2, sm: 'auto' }
          }}
        >
          Multi-Screen Showcase 🖥️📱
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", textAlign: "center", maxWidth: 600, mx: { xs: 2, sm: 'auto' } }}
        >
          See how your app looks across Desktop, Tablet, and Mobile — with smooth dark ↔ light mode
          transitions for a polished, modern experience.
        </Typography>
      </motion.div>

      {/* Illustration Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, amount: 0.3 }}
        style={{ width: "100%" }}
      >
        <Box
          sx={{
            height: { xs: 300, sm: 400, md: 600 },
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: 'hidden'
          }}
        >
          <Image src={lightLayout} height={1080} width={1920} alt='layout image' priority className={styles.heroImage} />
        </Box>
      </motion.div>
    </Box>
  );
};

export default MultiScreenShowcaseSection;
