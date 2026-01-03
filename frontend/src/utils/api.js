// utils/api.js - UPDATED VERSION
import axios from 'axios';

// Get the current hostname (works for localhost and network IP)
const getBaseURL = () => {
  const hostname = window.location.hostname;
  const port = 5000;
  
  // If accessing from phone (network IP), use same IP for backend
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:${port}/api`;
  }
  
  // Default for local development
  return `http://localhost:${port}/api`;
};

// Create API instance with better error handling
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout
  withCredentials: false, // Important for CORS
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Log detailed error
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error - Server may be down or CORS issue');
      
      // Don't redirect for login/register pages
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        // Show user-friendly error
        if (window.location.pathname !== '/') {
          alert('Cannot connect to server. Please check if backend is running on port 5000.');
        }
      }
      return Promise.reject(new Error('Network Error - Cannot connect to server'));
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle 404
    if (error.response?.status === 404) {
      console.error('Endpoint not found:', error.config.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;