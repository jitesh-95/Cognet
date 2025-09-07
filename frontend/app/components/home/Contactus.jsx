"use client";
import React from "react";
import { Box, Container, Typography, TextField, Button, Stack, Paper } from "@mui/material";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

const Contactus = () => {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 }, mb: 5 }}>
      <Container maxWidth="lg">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            align="center"
            fontWeight={700}
            gutterBottom
            sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" } }}
          >
            Let's Stay Connected
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            mb={6}
            sx={{ mx: { xs: 5, md: 25 } }}
          >
            Have questions, feedback, or ideas? We’d love to hear from you. Fill out the form below and our team will get back to you as soon as possible
          </Typography>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 5,
              }}
            >
              <TextField fullWidth label="Full Name" />
              <TextField fullWidth label="Company (Optional)" />
              <TextField fullWidth label="Email" />
              <TextField fullWidth label="Phone" />
            </Box>
            <Box sx={{ mt: 5 }}>
              <TextField
                fullWidth
                placeholder="Tell us about yourself"
                variant="outlined"
                multiline
                rows={4}
              />
              <Stack spacing={2} alignItems="center" sx={{ mt: 5 }}>
                <Typography variant="body2" color="text.disabled" align="center">
                  By clicking contact us button, you agree to our terms and policy.
                </Typography>
                <Button variant="contained" size="large">
                  Contact Us
                </Button>
              </Stack>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Contactus;
