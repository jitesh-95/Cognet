'use client'
import Mindmap from '../components/mindmap/Mindmap'
import ModalOpenButton from '../components/ModalOpenButton'
import { Box, Button, Divider, IconButton, List, ListItem, ListItemText, Modal, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react';
import { useNotification } from '../contexts/NotificationProvider';
import apiClient from '../apiClient';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import StepsModal from '../components/StepsModal';

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/html",
];

const MapUsingDocs = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [mindmapData, setMindmapData] = useState();
  const [files, setFiles] = useState([]);
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

  const openModal = () => setModalOpen(true);

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

    const validFiles = Array.from(e.target.files).filter(file =>
      ALLOWED_FILE_TYPES.includes(file.type)
    );

    if (validFiles.length === 0) {
      showNotification({ message: 'No valid files selected', status: 'error' });
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    e.target.value = ""; // reset input to allow re-selecting same files
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files || files.length !== 1) {
      return showNotification({
        message: 'Please select a single file',
        status: 'error',
      });
    }

    setLoading(true);
    setSteps([]);

    try {
      // Upload file and get a token for SSE
      const uploadFileForSSE = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const data = await apiClient.uploadTempFile(formData);
          if (data?.token) {
            showNotification({
              message: 'File uploaded successfully.',
              status: 'success',
            });
            return data.token;
          } else {
            return showNotification({ message: 'No token received from server', status: 'error' });
          }
        } catch (err) {
          showNotification({ message: err.message || 'File upload failed', status: 'error' });
          throw err;
        }
      };

      const token = await uploadFileForSSE(files[0]); // only one file
      setLoading(false); // stops loading in buttons
      setModalOpen(false); // closing the upload modal 
      setShowStepsModel(true); // opening steps modal

      // Connect to SSE for step updates
      const sseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/generate-mindmap-by-file-sse?token=${token}`;
      evtSourceRef.current = new EventSource(sseUrl);

      evtSourceRef.current.onmessage = (event) => {
        try {
          // Final graph data
          const parsed = JSON.parse(event.data);
          if (parsed?.graph) {
            setMindmapData(parsed);
            localStorage.setItem('graph-by-file', JSON.stringify(parsed));

            evtSourceRef.current.close();
            setShowStepsModel(false);
            setSteps([]);
            return;
          }
        } catch {
          // Step update
          setSteps((prev) => [...prev, event.data]);
        }
      };

      evtSourceRef.current.onerror = () => {
        if (evtSourceRef.current) {
          evtSourceRef.current.close();
        }
        setShowStepsModel(false);
        setSteps([]);
        showNotification({
          message: 'Error streaming file upload updates',
          status: 'error',
        });
      };
    } catch (err) {
      setShowStepsModel(false);
      setSteps([]);
      setLoading(false);
      showNotification({ message: err.message || 'Something went wrong', status: 'error' });
    }
  };


  return (
    <Box className='layout'>
      <ModalOpenButton onClick={openModal} title='Upload File' />

      <Modal open={modalOpen} onClose={() => { }}>
        <Box sx={modalStyles}>

          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
            Upload File and See the Big Picture
          </Typography>
          <Typography variant="caption" mb={2} sx={{ display: 'block' }}>
            Only PDF, TXT, DOC, DOCX, MD & HTML files are allowed
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
            <input hidden type="file" accept=".pdf,.txt,.doc,.docx,.md,.html" onChange={handleFileChange} />
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

export default MapUsingDocs