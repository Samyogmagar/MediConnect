import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and 403 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      console.warn('Access denied (403):', error.response?.data?.message || 'Forbidden');
      // Redirect unverified doctors/labs or unauthorized users to their dashboard
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user?.role) {
        const dashboards = {
          patient: '/patient/dashboard',
          doctor: '/doctor/dashboard',
          lab: '/lab/dashboard',
          admin: '/admin/dashboard',
        };
        const dashPath = dashboards[user.role];
        if (dashPath && window.location.pathname !== dashPath) {
          window.location.href = dashPath;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;
