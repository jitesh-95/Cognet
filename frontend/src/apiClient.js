import axios from 'axios';

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`, // your API base URL from .env
  // timeout: 10000, // optional timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (placeholder for token)
axiosInstance.interceptors.request.use(
  (config) => {
    // TODO: Add auth token here if needed
    // const token = 'YOUR_TOKEN';
    // if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (optional logging)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Centralized error handler
const handleError = (err, defaultMessage) => {
  const message = err.response?.data?.message || err.message || err.detail || defaultMessage;
  return message; // simple popup for now
};

// Centralized API functions
const apiClient = {
  validateUrl: async (url) => {
    try {
      const response = await axiosInstance.post('/validate-url', { url });
      return response.data;
    } catch (err) {
      return handleError(err, 'Failed to validate url');
    }
  },

  generateMindmapUsingUrl: async (url) => {
    try {
      const response = await axiosInstance.post('/generate-mindmap-by-url', { url });
      return response.data;
    } catch (err) {
      return handleError(err, 'Failed to generate data');
    }
  },

  generateMindmapUsingFile: async (formData) => {
    try {
      const response = await axiosInstance.post('/generate-mindmap-by-file',
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    } catch (err) {
      return handleError(err, 'Failed to generate data');
    }
  },

  uploadTempFile: async (formData) => {
    try {
      const response = await axiosInstance.post('/upload-temp-file',
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    } catch (err) {
      return handleError(err, 'Failed to upload file');
    }
  },

  createUser: async (data) => {
    try {
      const response = await axiosInstance.post('/users', data);
      return response.data;
    } catch (err) {
      return handleError(err, 'Failed to create user');
    }
  },

  // Add more API functions here for other endpoints
};

export default apiClient;
