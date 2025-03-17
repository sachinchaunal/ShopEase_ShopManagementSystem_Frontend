import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customerName, setCustomerName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if customer session exists
  useEffect(() => {
    const checkCustomerSession = async () => {
      try {
        const res = await api.get('/customer/session');
        
        if (res.data.success && res.data.data && res.data.data.customerName) {
          setCustomerName(res.data.data.customerName);
        } else {
          setCustomerName(null);
        }
      } catch (error) {
        console.error('Error checking customer session:', error);
        setCustomerName(null);
      } finally {
        setLoading(false);
      }
    };

    checkCustomerSession();
  }, []);

  // Create customer session
  const createCustomerSession = async (name) => {
    // Name validation
    if (!name || typeof name !== 'string') {
      toast.error('Please enter a valid name');
      return false;
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error('Name must be at least 2 characters');
      return false;
    }
    
    if (trimmedName.length > 50) {
      toast.error('Name must be less than 50 characters');
      return false;
    }
    
    try {
      const res = await api.post('/customer/session', { customerName: trimmedName });
      
      if (res.data.success) {
        setCustomerName(res.data.data.customerName);
        toast.success(`Welcome, ${trimmedName}!`);
        return true;
      } else {
        toast.error(res.data.message || 'Failed to set customer name');
        return false;
      }
    } catch (error) {
      console.error('Error creating customer session:', error);
      toast.error(error.response?.data?.message || 'Failed to set customer name');
      return false;
    }
  };

  // Clear customer session
  const clearCustomerSession = async () => {
    try {
      await api.delete('/customer/session');
      setCustomerName(null);
      toast.success('Session cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing customer session:', error);
      toast.error('Failed to clear session');
      return false;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customerName,
        loading,
        createCustomerSession,
        clearCustomerSession
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerContext; 