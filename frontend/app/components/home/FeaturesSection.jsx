"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import { motion } from "framer-motion";
import feature1 from '../../images/feature1.png';
import feature2 from '../../images/feature2.png';
import feature3 from '../../images/feature3.png';
import feature4 from '../../images/feature4.png';
import feature5 from '../../images/feature5.png';
import feature6 from '../../images/feature6.png';
import styles from '../../styles/page.module.css';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2, // stagger effect
      duration: 0.6,
      ease: "easeOut"
    }
  })
};

const features = [
  {
    title: "Interactive Mind Maps",
    description: "Create, organize, and visualize your ideas in a dynamic, interactive mind map.",
    icon: feature1,
    comingSoon: false,
  },
  {
    title: "AI-Powered Insights",
    description: "Get smart suggestions and connections between your thoughts to enhance creativity.",
    icon: feature2,
    comingSoon: false,
  },
  {
    title: "Customizable Nodes & Themes",
    description: "Personalize nodes with colors, icons, and themes to fit your workflow.",
    icon: feature3,
    comingSoon: false,
  },
  {
    title: "Export & Share",
    description: "Export your mind maps as images, PDFs, or share a live link with anyone.",
    icon: feature4,
    comingSoon: false,
  },
  {
    title: "Cross-Platform Access",
    description: "Access your mind maps seamlessly across devices—desktop, tablet, or mobile—with consistent experience.",
    icon: feature6,
    comingSoon: false,
  },
  {
    title: "Task & Idea Management",
    description: "Track ideas, assign tasks, and organize thoughts efficiently in one place.",
    icon: feature5,
    comingSoon: true, // 👈 Coming Soon enabled
  },
];

const FeaturesSection = () => {
  return (
    <Box sx={{ px: { xs: 3, md: 10 }, py: { xs: 5, sm: 8 }, mb: 8 }}>
      {/* Section Header */}
      <Box textAlign="center" mb={8}>
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
              mb: 2,
            }}
          >
            Features
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 700, mx: "auto" }}
          >
            Discover everything you need to capture, connect, and organize your
            ideas effortlessly.
          </Typography>
        </motion.div>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" },
          gap: 4,
        }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: 3,
                boxShadow: "0px 8px 24px rgba(0,0,0,0.08)",
                transition: "transform 0.5s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0px 12px 32px rgba(0,0,0,0.15)",
                },
                minHeight: 300,
              }}
              className={styles.featureCard}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Box
                  sx={{
                    mb: 3,
                    backgroundColor: "background.iconBackground",
                    p: 2,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    className={styles.featureCardIcon}
                    src={feature.icon}
                    alt={feature.title}
                    width={64}
                    height={64}
                  />
                </Box>
              </motion.div>

              {/* Title with Coming Soon */}
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                {feature.title}
                {feature.comingSoon && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "success.main",
                      border: "1px solid",
                      borderColor: "success.main",
                      px: 1,
                      py: 0.2,
                      borderRadius: "8px",
                    }}
                  >
                    Coming Soon
                  </Box>
                )}
              </Typography>

              {/* Description */}
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {feature.description}
              </Typography>
            </Paper>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default FeaturesSection;
