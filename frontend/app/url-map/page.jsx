'use client'
import ModalOpenButton from '../components/ModalOpenButton';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNotification } from '../contexts/NotificationProvider';
import apiClient from '../apiClient';
import Mindmap from '../components/Mindmap';
import StepsModal from '../components/StepsModal';

const MapUsingUrl = () => {
  const { showNotification } = useNotification();
  const [url, setUrl] = useState();
  const [loading, setLoading] = useState(false);
  const [mindmapData, setMindmapData] = useState();
  const evtSourceRef = useRef(null);

  const modalStyles = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: 320, sm: 400, md: 500 },
    bgcolor: 'background.paper',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
    textAlign: 'center',
    borderRadius: 2
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [showStepsModal, setShowStepsModel] = useState(false);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const cachedData = localStorage.getItem('graph-by-url')
    if (cachedData) setMindmapData(JSON.parse(cachedData))
    else setModalOpen(true);

    // if routing to different page;
    return () => {
      setModalOpen(false);
    }
  }, []);

  const openModal = () => setModalOpen(true);

  const handleSubmit = async () => {
    if (!url) return showNotification({ message: 'Please enter a valid URL', status: 'error' });

    try {
      setSteps([]);
      setModalOpen(true);
      setLoading(true);

      // validating the url
      const data = await apiClient.validateUrl(url);
      if (data.is_valid && data.is_reachable) {
        showNotification({ message: data?.message, status: 'success' });
        setModalOpen(false);
        setLoading(false)
      }

      // steps update process
      setShowStepsModel(true);
      const sseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/generate-mindmap-by-url-sse?url=${encodeURIComponent(url)}`;
      evtSourceRef.current = new EventSource(sseUrl);

      evtSourceRef.current.onmessage = (event) => {
        // process finished
        try {
          // Try parsing as JSON (graph data)
          const parsed = JSON.parse(event.data);
          if (parsed?.graph) {
            // Final graph data
            setMindmapData(parsed);
            localStorage.setItem('graph-by-url', JSON.stringify(parsed));

            evtSourceRef.current.close();
            setShowStepsModel(false);
            setSteps([]);
            return;
          }
        } catch {
          // Not JSON → treat as step update
          setSteps((prev) => [...prev, event.data]);
        }
      };

      // some error in process
      evtSourceRef.current.onerror = () => {
        // Ignore the final close error if already done
        if (evtSourceRef.current.readyState === EventSource.CLOSED) {
          evtSourceRef.current.close();
          setShowStepsModel(false);
          setSteps([]);
          return;
        }
        // if ref is there
        if (evtSourceRef.current) {
          evtSourceRef.current.close();
        }
        setShowStepsModel(false);
        setSteps([])
        showNotification({ message: 'Error streaming updates', status: 'error' });
      };

    } catch (err) {
      setModalOpen(false);
      showNotification({ message: err.message || 'Something went wrong', status: 'error' });
    }
  };

  return (
    <Box className='layout'>
      <ModalOpenButton onClick={openModal} title='Enter URL' />

      {/* url model  */}
      <Modal open={modalOpen} onClose={() => { }}>
        <Box sx={modalStyles}>

          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
            Turn Any URL Into a Beautiful Map
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Just drop your link below and let’s get started.
          </Typography>
          <TextField fullWidth placeholder="Enter Valid URL" size='small' onChange={(e) => setUrl(e.target.value)} />

          <Box display="flex" justifyContent="center" alignItems='center' gap={1} sx={{ mt: 2 }}>
            <Button onClick={() => setModalOpen(false)} size='large' loading={loading}>Cancel</Button>
            <Button size='large' variant='contained' onClick={handleSubmit} loading={loading}>Map It</Button>
          </Box>
        </Box>
      </Modal>

      {/* update model */}
      <StepsModal
        open={showStepsModal}
        steps={steps}
        title="Processing..."
      />

      {mindmapData && <Mindmap data={mindmapData} />}
    </Box>
  )
}

export default MapUsingUrl;