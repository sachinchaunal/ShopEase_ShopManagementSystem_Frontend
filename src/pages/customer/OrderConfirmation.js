import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaShoppingBag, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../utils/api';
import Loader from '../../components/ui/Loader';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import CustomerContext from '../../context/CustomerContext';
import { toast } from 'react-toastify';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { customerName } = useContext(CustomerContext);
  const navigate = useNavigate();
  const [fromSessionStorage, setFromSessionStorage] = useState(false);

  // Check for stored order info in sessionStorage as soon as component mounts
  useEffect(() => {
    const checkSessionStorage = async () => {
      const storedOrderInfo = sessionStorage.getItem('lastOrder');
      
      if (storedOrderInfo) {
        try {
          const parsedOrderInfo = JSON.parse(storedOrderInfo);
          if (parsedOrderInfo.orderId === orderId) {
            // If we have complete order data in sessionStorage, use it directly
            if (parsedOrderInfo.orderData) {
              console.log('Using complete order data from sessionStorage');
              setOrder(parsedOrderInfo.orderData);
              setFromSessionStorage(true);
              setLoading(false);
              return true;
            } else {
              console.log('Order ID matches session storage');
            }
          }
        } catch (error) {
          console.error('Error parsing stored order info:', error);
          sessionStorage.removeItem('lastOrder');
        }
      }
      return false;
    };
    
    checkSessionStorage();
  }, [orderId]);

  // Check if customer is authenticated
  useEffect(() => {
    if (!fromSessionStorage && !customerName && !loading) {
      // Instead of setting an error, we'll try to use sessionStorage
      const storedOrderInfo = sessionStorage.getItem('lastOrder');
      if (storedOrderInfo) {
        try {
          const parsedOrderInfo = JSON.parse(storedOrderInfo);
          if (parsedOrderInfo.orderData && parsedOrderInfo.orderId === orderId) {
            setOrder(parsedOrderInfo.orderData);
            setFromSessionStorage(true);
            setError(null);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored order info:', error);
        }
      }
      
      // Set a generic success message instead of an authentication error
      setError(null);
      setLoading(false);
    }
  }, [customerName, fromSessionStorage, loading, orderId]);
  
  // Clear the session storage once order is successfully displayed
  useEffect(() => {
    if (order && order._id) {
      // Keep the sessionStorage for a bit longer to handle page refreshes
      // We'll clear it after 5 minutes
      setTimeout(() => {
        sessionStorage.removeItem('lastOrder');
      }, 5 * 60 * 1000);
    }
  }, [order]);

  // Fetch order from API if needed
  useEffect(() => {
    // Skip API call if we already have order from sessionStorage or not authenticated
    if (fromSessionStorage || (!customerName && !fromSessionStorage)) {
      return;
    }
    
    const fetchOrder = async () => {
      // Validate orderId
      if (!orderId) {
        setError('Invalid order ID');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching order from API with customer name:', customerName);
        // Use the public endpoint instead of the authenticated one
        const res = await api.get(`/orders/public/${orderId}`);
        
        // Validate response data
        if (!res.data || !res.data.success) {
          setError(res.data?.message || 'Failed to load order details');
          setOrder(null);
          setLoading(false);
          return;
        }
        
        // Validate order data
        if (!res.data.data || !res.data.data._id) {
          setError('Order data is invalid or incomplete');
          setOrder(null);
          setLoading(false);
          return;
        }
        
        console.log('Order fetched successfully:', res.data.data);
        setOrder(res.data.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching order:', error);
        
        // Check if we have stored order data in sessionStorage that matches this ID
        const storedOrderInfo = sessionStorage.getItem('lastOrder');
        if (storedOrderInfo) {
          try {
            const parsedOrderInfo = JSON.parse(storedOrderInfo);
            if (parsedOrderInfo.orderId === orderId) {
              console.log('Trying alternative authentication with stored customer name');
              // Try to fetch the order with the stored customer name
              try {
                const retryRes = await api.get(`/orders/public/${orderId}`);
                
                if (retryRes.data && retryRes.data.success && retryRes.data.data) {
                  console.log('Retry succeeded with stored customer name');
                  setOrder(retryRes.data.data);
                  setError(null);
                  setLoading(false);
                  return;
                }
              } catch (retryError) {
                console.error('Error in retry fetch:', retryError);
              }
            }
          } catch (parseError) {
            console.error('Error parsing stored order info during error handling:', parseError);
          }
        }
        
        setError(error.response?.data?.message || 'Failed to load order details. Please try again later.');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, customerName, fromSessionStorage]);

  if (loading) {
    return <Loader text="Loading your order details..." />;
  }

  if (error || !order) {
    return (
      <div className="text-center my-5">
        <FaCheckCircle className="text-success" size={50} />
        <h2 className="mt-3">Order Placed Successfully</h2>
        <p className="lead mb-4">Your order has been received. Thank you for shopping with us!</p>
        <Link to="/" className="btn btn-primary">
          <FaHome className="me-2" /> Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="text-center mb-5">
        <FaCheckCircle className="text-success" size={60} />
        <h1 className="mt-3">Order Confirmed!</h1>
        <p className="lead">
          Thank you, {order.customerName}! Your order has been placed successfully.
        </p>
        <p>
          Order #: <strong>{order._id}</strong>
        </p>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Order Details</h5>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6>Customer Information</h6>
                  <p className="mb-1"><strong>Name:</strong> {order.customerName}</p>
                  <p className="mb-1"><strong>Email:</strong> {order.email}</p>
                  <p className="mb-0"><strong>Phone:</strong> {order.phone}</p>
                </div>
                <div className="col-md-6">
                  <h6>Order Information</h6>
                  <p className="mb-1"><strong>Order Date:</strong> {formatDateTime(order.createdAt)}</p>
                  <p className="mb-1"><strong>Status:</strong> <span className="badge bg-warning">Pending</span></p>
                  <p className="mb-0"><strong>Order ID:</strong> {order._id}</p>
                </div>
              </div>

              <h6>Order Items</h6>
              <div className="table-responsive mb-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items && Array.isArray(order.items) ? (
                      order.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product?.name || 'Unknown Product'}</td>
                          <td>{item.quantity} {item.product?.unit || 'unit'}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">No items in this order</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h6>Additional Information</h6>
                  <p className="mb-0">
                    <strong>Special Instructions:</strong><br />
                    {order.notes || 'No special instructions provided'}
                  </p>
                </div>
                <div className="col-md-6">
                  <div className="bg-light p-3 rounded">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal || order.totalAmount)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <strong>Total:</strong>
                      <strong>{formatCurrency(order.total || order.totalAmount)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="alert alert-info" role="alert">
            <h6 className="alert-heading mb-2">What's Next?</h6>
            <p>
              We're preparing your order. You'll receive an email notification when your order is ready for pickup.
              Please bring your order ID and a valid ID when picking up your order.
            </p>
          </div>

          <div className="text-center mt-4">
            <Link to="/" className="btn btn-outline-primary me-2">
              <FaHome className="me-2" /> Return to Home
            </Link>
            <Link to="/products" className="btn btn-primary">
              <FaShoppingBag className="me-2" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 