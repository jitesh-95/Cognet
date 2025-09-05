'use client'
import React from 'react';
import {
  Modal,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  timelineItemClasses,
} from '@mui/lab';
import { CheckCircle } from '@mui/icons-material';

const StepsModal = ({ open, steps = [], title = 'Processing Steps' }) => {
  return (
    <Modal open={open} onClose={() => { }} disableEscapeKeyDown>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 320, sm: 400, md: 500 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <Typography variant="h6" mb={2}>
          {title}
        </Typography>

        {steps.length === 0 ? (
          <Typography color="text.secondary">No steps available</Typography>
        ) : (
          <Timeline position="right"
            sx={{
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}>
            {steps?.map((step, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  {index < steps.length - 1 ? (
                    <CheckCircle color="success" />
                  ) : (
                    <CircularProgress size={24} />
                  )
                  }
                  {index < steps.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>{step}</TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Box>
    </Modal>
  );
};

export default StepsModal;
