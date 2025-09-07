'use client'
import { Box, Typography, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import SecurityIcon from "@mui/icons-material/Security";
import BlockIcon from "@mui/icons-material/Block";
import LockIcon from "@mui/icons-material/Lock";

const points = [
  {
    icon: <LockIcon fontSize="large" color="success" />,
    title: "Stored Locally",
    description: "Your data stays on your device. Nothing is uploaded to our servers.",
  },
  {
    icon: <BlockIcon fontSize="large" color="error" />,
    title: "No Ads, No Trackers",
    description: "Enjoy a distraction-free experience, without hidden tracking.",
  },
  {
    icon: <SecurityIcon fontSize="large" color="primary" />,
    title: "You're in Control",
    description: "You decide what to keep, update, or export. Full control in your hands.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

const PrivacySection = () => {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 10 },
        py: { xs: 8, md: 14 },
        backgroundColor: "background.default",
        textAlign: "center",
      }}
    >
      {/* Headline */}
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
              mb: 4,
            }}
          >
            Your Thoughts, Fortified
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 600, mx: { xs: 2, sm: 'auto' } }}
          >
            Keep your ideas private, ad-free, and fully under your control — because your creativity deserves a safe space.
          </Typography>
        </motion.div>
      </Box>

      {/* Privacy Points */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "stretch",
          gap: 4,
        }}
      >
        {points.map((item, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            style={{ flex: 1 }}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                gap: 2,
                transition: "transform 0.5s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0px 12px 32px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box sx={{ backgroundColor: 'background.iconBackground', p: 2, borderRadius: '20px' }}>{item.icon}</Box>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", mb: 1 }}
                  gutterBottom
                >
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default PrivacySection;
