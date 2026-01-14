import axios from 'axios';

// Configure axios defaults - use relative URLs for proxy
axios.defaults.baseURL = '';
axios.defaults.withCredentials = true;

// Add request interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    // Ensure credentials are always sent with requests
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => axios.post('/api/auth/register', data, {
    headers: { 'Content-Type': 'application/json' }
  }),
  login: (data) => axios.post('/api/auth/login', data, {
    headers: { 'Content-Type': 'application/json' }
  }),
  getCurrentUser: () => axios.get('/api/auth/me'),
  logout: () => axios.post('/api/auth/logout'),
};

// Gigs API
export const gigsAPI = {
  getGigs: (params = {}) => axios.get('/api/gigs', { params }),
  getGig: (id) => axios.get(`/api/gigs/${id}`),
  createGig: (data) => axios.post('/api/gigs', data, {
    headers: { 'Content-Type': 'application/json' }
  }),
  updateGig: (id, data) => axios.put(`/api/gigs/${id}`, data, {
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteGig: (id) => axios.delete(`/api/gigs/${id}`),
  getUserGigs: () => axios.get('/api/gigs/user/me'),
};

// Bids API
export const bidsAPI = {
  getBidsForGig: (gigId) => axios.get(`/api/bids/${gigId}`),
  createBid: (data) => axios.post('/api/bids', data, {
    headers: { 'Content-Type': 'application/json' }
  }),
  hireFreelancer: (bidId) => axios.patch(`/api/bids/${bidId}/hire`),
  getUserBids: () => axios.get('/api/bids/user/me'),
};

// Axios response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;