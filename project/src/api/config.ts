import axios from 'axios';

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // If we're in development and accessing via ngrok
  if (window.location.hostname.includes('ngrok-free.app')) {
    return 'https://c23f03ac13b7.ngrok-free.app/api';
  }
  // Otherwise use the proxy
  return '/api';
};

// Create axios instance with ngrok configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to ensure headers are always sent
api.interceptors.request.use(
  (config) => {
    config.headers['ngrok-skip-browser-warning'] = 'true';
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;