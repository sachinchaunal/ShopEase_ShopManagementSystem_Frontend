import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerContext from '../../context/CustomerContext';
import { FaUser } from 'react-icons/fa';

const CustomerName = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { customerName, createCustomerSession } = useContext(CustomerContext);
  const navigate = useNavigate();
  
  // Redirect if customer already has a name
  useEffect(() => {
    if (customerName) {
      navigate('/');
    }
  }, [customerName, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const success = await createCustomerSession(name);
      
      if (success) {
        navigate('/');
      }
    } catch (error) {
      setError('Failed to set your name. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow-sm mt-5">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <FaUser className="text-primary" size={40} />
              <h2 className="mt-2">Welcome!</h2>
              <p className="text-muted">Please enter your name to continue</p>
            </div>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Your Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerName; 