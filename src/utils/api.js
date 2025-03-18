import axios from 'axios';

const api = axios.create({
   baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies to be sent/received
});

// Check for token in localStorage and set Authorization header
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logout user if token is invalid or expired (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear token and auth headers
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // We'll let the auth context handle the UI redirects
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 
