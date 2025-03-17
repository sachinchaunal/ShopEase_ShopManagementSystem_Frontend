import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setIsAuthenticated(true);
          setUser(res.data.user);
        } else {
          // Clear invalid session
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear session on error
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
    
    // Set up a timer to periodically verify token
    const authCheckInterval = setInterval(checkAuthStatus, 15 * 60 * 1000); // Check every 15 minutes
    
    return () => {
      clearInterval(authCheckInterval);
    };
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      if (!email || !password) {
        toast.error('Please provide both email and password');
        return null;
      }
      
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        setIsAuthenticated(true);
        setUser(res.data.user);
        
        // Store token in localStorage (optional, as we're using HttpOnly cookies)
        localStorage.setItem('token', res.data.token);
        
        // Set token as default header
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        return res.data;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Register user (admin only function)
  const register = async (userData) => {
    try {
      if (!userData.email || !userData.password) {
        toast.error('Email and password are required');
        return null;
      }
      
      const res = await api.post('/auth/register', userData);
      
      if (res.data.success) {
        toast.success('User registered successfully');
        return res.data;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Even if API fails, clear local state
      setIsAuthenticated(false);
      setUser(null);
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Remove token from default headers
      delete api.defaults.headers.common['Authorization'];
      
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 