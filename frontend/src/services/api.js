import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blazeup_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized response error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear token on auth error unless already on login page
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('blazeup_token');
          localStorage.removeItem('blazeup_user');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data || { message: error.message });
    }
    return Promise.reject({ message: error.message || 'Network communication error' });
  }
);

export default api;
