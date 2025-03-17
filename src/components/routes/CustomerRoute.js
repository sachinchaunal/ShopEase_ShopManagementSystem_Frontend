import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import CustomerContext from '../../context/CustomerContext';

const CustomerRoute = ({ children }) => {
  const { customerName, loading } = useContext(CustomerContext);
  const location = useLocation();
  
  // Special case for order confirmation page
  const isOrderConfirmation = location.pathname.includes('/order-confirmation/');

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Allow access to order confirmation page even without customer name
  // This is because the customer might have completed checkout but lost their session
  if (isOrderConfirmation) {
    return children;
  }

  return customerName ? children : <Navigate to="/customer-name" />;
};

export default CustomerRoute; 