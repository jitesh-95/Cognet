"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import fastIllustration from '../../images/FastLoading.svg';
import Image from "next/image";

const highlights = [
  {
    icon: "⚡",
    title: "Fast Performance",
    description: "Load maps instantly without waiting."
  },
  {
    icon: "🪶",
    title: "Lightweight",
    description: "No heavy memory usage—smooth on any device."
  },
  {
    icon: "📤",
    title: "Export in Seconds",
    description: "Export as Image or PDF super quickly."
  }
];

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" }
  })
};

const FastLightweightSection = () => {
  return (
    <Box
      sx={{
        px: { xs: 0, md: 10 },
        py: { xs: 6, md: 12 },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        gap: { xs: 6, md: 10 },
        mb: { xs: 4, md: 2 },
      }}
    >
      {/* Left: Illustration / App Screenshot Placeholder */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, amount: 0.3 }}
        style={{ flex: 1, width: "100%" }}
      >
        <Box
          sx={{
            height: { xs: 300, sm: 500, md: 400 },
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image alt="fast illustration" priority width={450} height={450} src={fastIllustration} />
        </Box>
      </motion.div>

      {/* Right: Highlights */}
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
            Fast & Lightweight
          </Typography>
        </motion.div>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {highlights.map((item, index) => (
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
                  {item.icon}
                </Typography>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FastLightweightSection;
