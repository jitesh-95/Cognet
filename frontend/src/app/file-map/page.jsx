'use client'
import Mindmap from '@/components/Mindmap'
import ModalOpenButton from '@/components/ModalOpenButton'
import { Box, Button, Divider, IconButton, List, ListItem, ListItemText, Modal, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationProvider';
import apiClient from '@/apiClient';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";

const MapUsingDocs = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [mindmapData, setMindmapData] = useState();
  const [files, setFiles] = useState([]);

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
    const cachedData = localStorage.getItem('graph-by-file')
    if (cachedData) setMindmapData(JSON.parse(cachedData))
    else setModalOpen(true);

    // if routing to different page;
    return () => {
      setModalOpen(false);
    }
  }, []);

  const handleFileChange = (e) => {
    if (!e.target.files) return;

    // Filter only pdf and txt files
    const validFiles = Array.from(e.target.files).filter(file =>
      file.type === "application/pdf" || file.type === "text/plain"
    );

    if (validFiles.length !== e.target.files.length) {
      showNotification({ message: "Only PDF and TXT files are allowed", status: 'error' });
    }

    setFiles(prev => [...prev, ...validFiles]);
    e.target.value = ""; // reset input
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return showNotification({ message: "Please select one file", status: 'warning' });
    if (files.length > 1) return showNotification({ message: "Please select only one file", status: 'warning' });

    setLoading(true);
    const formData = new FormData();

    files.forEach(file => {
      formData.append("file", file);
    });

    showNotification({ message: 'Generating Mindmap...', status: 'success' })
    await apiClient.generateMindmapUsingFile(formData).then(data => {
      if (data) {
        setMindmapData(data);
        localStorage.setItem('graph-by-file', JSON.stringify(data));
      }
    }).catch((err) => {
      showNotification({ message: err, status: 'error' })
    });

    setFiles([]);
    setLoading(false);
    setModalOpen(false);
  };

  const openModal = () => setModalOpen(true);

  return (
    <Box className='layout'>
      <ModalOpenButton onClick={openModal} title='Upload File' />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={modalStyles}>

          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
            Upload File and See the Big Picture
          </Typography>
          <Typography variant="caption" mb={2} sx={{ display: 'block' }}>
            Only PDF and TXT files are allowed
          </Typography>

          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{ mb: 2 }}
            disabled={files?.length >= 1}
            loading={loading}
          >
            Select File
            <input hidden type="file" accept=".pdf,.txt" onChange={handleFileChange} />
          </Button>

          {files.length > 0 ? (
            <List dense sx={{ maxHeight: 200, overflow: "auto", mb: 2 }}>
              {files.map((file, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary" mb={2}>
              No files selected
            </Typography>
          )}

          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="center" gap={1}>
            <Button onClick={() => setModalOpen(false)} size='large' loading={loading}>Cancel</Button>
            <Button
              size='large'
              onClick={handleUpload}
              variant="contained"
              disabled={files.length === 0}
              loading={loading}
            >
              Upload
            </Button>
          </Box>
        </Box>
      </Modal>

      {mindmapData && <Mindmap data={mindmapData} />}
    </Box>
  )
}

export default MapUsingDocs