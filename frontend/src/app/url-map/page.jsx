'use client'
import ModalOpenButton from '@/components/ModalOpenButton';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationProvider';
import apiClient from '@/apiClient';
import Mindmap from '@/components/Mindmap';

const MapUsingUrl = () => {
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
    textAlign: 'center',
    borderRadius: 2
  };

  const [modalOpen, setModalOpen] = useState(false);

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
    if (!url) return showNotification({ message: 'Plase enter a valid URL', status: 'error' });

    setLoading(true);
    // validating url
    await apiClient.validateUrl(url).then(async (data) => {
      if (data.is_valid && data.is_reachable) {
        showNotification({
          message: `${data?.message} & Generating Mindmap...`,
          status: 'success'
        });

        // fetching map data
        await apiClient.generateMindmapUsingUrl(url).then((data) => {
          if (data) {
            setMindmapData(data)
            localStorage.setItem('graph-by-url', JSON.stringify(data));
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

          <Box display="flex" justifyContent="center" alignItems='center' gap={1} sx={{ mt: 2 }}>
            <Button onClick={() => setModalOpen(false)} size='large' loading={loading}>Cancel</Button>
            <Button size='large' variant='contained' onClick={handleSubmit} loading={loading}>Map It</Button>
          </Box>
        </Box>
      </Modal>
      {mindmapData && <Mindmap data={mindmapData} />}
    </Box>
  )
}

export default MapUsingUrl;