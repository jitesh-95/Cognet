"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Image from "next/image";

const features = [
  {
    title: "Interactive Mind Maps",
    description: "Create, organize, and visualize your ideas in a dynamic, interactive mind map.",
    icon: "/images/feature1.png",
  },
  {
    title: "AI-Powered Insights",
    description: "Get smart suggestions and connections between your thoughts to enhance creativity.",
    icon: "/images/feature2.png",
  },
  {
    title: "Customizable Nodes & Themes",
    description: "Personalize nodes with colors, icons, and themes to fit your workflow.",
    icon: "/images/feature3.png",
  },
  {
    title: "Export & Share",
    description: "Export your mind maps as images, PDFs, or share a live link with anyone.",
    icon: "/images/feature4.png",
  },
  {
    title: "Task & Idea Management",
    description: "Track ideas, assign tasks, and organize thoughts efficiently in one place.",
    icon: "/images/feature5.png",
  },
  {
    title: "Cross-Platform Access",
    description: "Access your mind maps seamlessly across devices—desktop, tablet, or mobile—with consistent experience.",
    icon: "/images/feature6.png",
  }
];

const FeaturesSection = () => {
  return (
    <Box sx={{ px: { xs: 3, md: 10 }, py: { xs: 5, md: 8 }, mb: 8 }}>
      <Typography
        variant="h3"
        sx={{ fontWeight: "bold", textAlign: "center", mb: 2, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
      >
        Features
      </Typography>

      <Typography
        variant="body1"
        sx={{ textAlign: "center", mb: 8, color: 'text.secondary' }}
      >
        Discover everything you need to capture, connect, and organize your ideas effortlessly
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" },
          backgroundColor: 'background.paper',
          p: 4,
          boxShadow: "0px 16px 40px rgba(0,0,0,0.12)",
          borderRadius: 4
        }}
      >
        {features.map((feature, index) => (
          <Paper
            key={index}
            sx={{
              p: 4,
              textAlign: "center",
              width: "95%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 300,
              boxShadow: 'none',
              backgroundImage: 'none'
            }}
          >
            <Box sx={{ mb: 3, backgroundColor: 'background.iconBackground', p: 2, borderRadius: 10 }}>
              <Image
                src={feature.icon}
                alt={feature.title}
                width={80}
                height={80}
                style={{ width: "80px", height: "80px" }}
              />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
              {feature.title}
            </Typography>
            <Typography variant="body1" sx={{ color: "gray", flexGrow: 1 }}>
              {feature.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default FeaturesSection;
