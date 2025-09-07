"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const steps = [
  {
    icon: "📝",
    title: "Add Your Thoughts",
    description: "Paste URL, or Upload File under 2MB to start mapping instantly.",
  },
  {
    icon: "🤖",
    title: "AI Organizes for You",
    description: "Our AI arranges and connects your thoughts automatically.",
  },
  {
    icon: "📤",
    title: "Export & Share",
    description: "Export as Image/PDF/JSON and share directly in seconds.",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

const HowItWorks = () => {
  return (
    <Box
      sx={{
        px: { xs: 0, md: 10 },
        py: { xs: 6, md: 12 },
        display: "flex",
        flexDirection: { xs: "column-reverse", md: "row" },
        alignItems: "center",
        gap: { xs: 6, md: 10 },
        mb: { xs: 4, md: 2 },
      }}
    >
      {/* Left: Steps */}
      <Box sx={{ flex: 1, px: { xs: 2.5, sm: 2 } }}>
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
              mb: 4,
            }}
          >
            How It Works
          </Typography>
        </motion.div>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Typography variant="h4" component="span">
                  {step.icon}
                </Typography>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* Right: Illustration */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, amount: 0.3 }}
        style={{ flex: 1, width: "100%" }}
      >
        <Box
          sx={{
            height: { xs: 300, sm: 500, md: 400 },
            backgroundColor: "grey.200",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          Illustration / App Screenshot
        </Box>
      </motion.div>
    </Box>
  );
};

export default HowItWorks;
