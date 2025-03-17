import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import CartContext from '../../context/CartContext';
import CustomerContext from '../../context/CustomerContext';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'react-toastify';
import Loader from '../../components/ui/Loader';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { customerName, loading: customerLoading } = useContext(CustomerContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    notes: ''
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if no customer name is set
  useEffect(() => {
    if (!customerLoading && !customerName) {
      toast.error('Please set your name before checkout');
      navigate('/customer-name', { state: { redirect: '/checkout' } });
    }
  }, [customerName, customerLoading, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.info('Your cart is empty');
      navigate('/products');
    }
  }, [cartItems, navigate]);

  // Calculate total (no tax)
  const orderTotal = cartTotal;

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate email (optional)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate phone (required)
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Check if customer name is set
    if (!customerName) {
      toast.error('Please set your name before checkout');
      navigate('/customer-name', { state: { redirect: '/checkout' } });
      return;
    }
    
    setProcessing(true);
    
    try {
      // Create order items array from cart items
      const orderItems = cartItems.map(item => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Create order object
      const orderData = {
        customerName,
        phone: formData.phone,
        email: formData.email,
        items: orderItems,
        subtotal: cartTotal,
        total: orderTotal,
        notes: formData.notes || 'No special instructions'
      };
      
      // Send order to API
      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        // Store complete order info in sessionStorage to ensure it's available in confirmation page
        sessionStorage.setItem('lastOrder', JSON.stringify({
          orderId: response.data.data._id,
          customerName: customerName,
          orderData: response.data.data
        }));
        
        // Clear cart
        clearCart();
        
        // Show success message before navigation
        toast.success('Your order has been placed successfully!');
        
        // Navigate to order confirmation page
        navigate(`/order-confirmation/${response.data.data._id}`);
      } else {
        toast.error(response.data.message || 'Failed to place order');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
      setProcessing(false);
    }
  };
  
  if (customerLoading) {
    return <Loader text="Loading..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Checkout</h1>
        <Link to="/cart" className="btn btn-outline-primary">
          <FaArrowLeft className="me-2" /> Back to Cart
        </Link>
      </div>
      
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Contact Information</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-4" role="alert">
                <FaInfoCircle className="me-2" />
                You're checking out as <strong>{customerName}</strong>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label htmlFor="email" className="form-label">Email Address (Optional)</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">Phone Number (Required)</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaPhone />
                      </span>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="1234567890"
                        required
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Special Instructions (Optional)</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions for your order..."
                  ></textarea>
                </div>
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={processing || cartItems.length === 0}
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h6 className="mb-3">Items ({cartItems.length})</h6>
                {cartItems.map((item) => (
                  <div key={item._id} className="d-flex justify-content-between mb-2">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-end">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-0">
                <strong>Total:</strong>
                <strong>{formatCurrency(orderTotal)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 