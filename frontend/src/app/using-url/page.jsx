'use client'
import ModalOpenButton from '@/components/ModalOpenButton';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationProvider';
import apiClient from '@/apiClient';
import Mindmap from '@/components/Mindmap';

const UsingUrl = () => {
  const { showNotification } = useNotification();
  const [url, setUrl] = useState();
  const [loading, setLoading] = useState(false);
  const [mindmapData, setMindmapData] = useState();

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
    textAlign: 'center'
  };

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const cachedData = localStorage.getItem('graph')
    if (cachedData) setMindmapData(JSON.parse(cachedData))
    else setModalOpen(true);

    // if routing to different page;
    return () => {
      setModalOpen(false);
    }
  }, []);

  const openModal = () => setModalOpen(true);

  const handleSubmit = async () => {
    if (!url) return showNotification({ message: 'Plase enter a valid URL', status: 'error' });

    setLoading(true);
    await apiClient.validateUrl(url).then(async (data) => {
      if (data.is_valid && data.is_reachable) {
        showNotification({ message: data?.message, status: 'success' });
        showNotification({ message: 'Generating mindmap', status: 'success' });

        await apiClient.generateMindmapUsingUrl(url).then((data) => {
          if (data) {
            setMindmapData(data.graph)
            localStorage.setItem('graph', JSON.stringify(data.graph));
            setModalOpen(false)
          }
        })
      }
      else {
        showNotification({ message: data?.message, status: 'warning' })
      }
    }).catch((err) => {
      showNotification({ message: err, status: 'error' })
    });
    setLoading(false);
  }

  return (
    <Box className='layout'>
      <ModalOpenButton onClick={openModal} title='Enter URL' />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={modalStyles}>

          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
            Turn Any URL Into a Beautiful Map
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Just drop your link below and let’s get started.
          </Typography>
          <TextField fullWidth placeholder="Enter Valid URL" size='small' onChange={(e) => setUrl(e.target.value)} />
          <Button size='large' variant='contained' sx={{ mt: 2 }} onClick={handleSubmit} loading={loading}>Map It</Button>
        </Box>
      </Modal>
      {mindmapData && <Mindmap data={mindmapData} />}
    </Box>
  )
}

export default UsingUrl;