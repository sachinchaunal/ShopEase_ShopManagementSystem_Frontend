import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaBox 
} from 'react-icons/fa';
import api from '../../utils/api';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import { formatCurrency, formatDateTime, getStatusBadgeClass } from '../../utils/formatters';
import { toast } from 'react-toastify';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Available order statuses
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready for Pickup' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
        setNewStatus(res.data.data.status);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  // Handle status update
  const handleUpdateStatus = async () => {
    if (newStatus === order.status) {
      setEditingStatus(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await api.put(`/orders/${id}/status`, { status: newStatus });
      
      if (res.data.success) {
        // Create a status history entry for this update
        const newHistoryEntry = {
          status: newStatus,
          timestamp: new Date().toISOString()
        };
        
        // Update the order with the new status and add to status history if it exists
        setOrder({
          ...order,
          status: newStatus,
          statusHistory: order.statusHistory 
            ? [...order.statusHistory, newHistoryEntry] 
            : [newHistoryEntry] // Create new array if statusHistory doesn't exist
        });
        
        toast.success(`Order status updated to ${newStatus}`);
        setEditingStatus(false);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Cancel editing status
  const cancelEditStatus = () => {
    setNewStatus(order.status);
    setEditingStatus(false);
  };
  
  if (loading) {
    return <Loader />;
  }
  
  if (error || !order) {
    return (
      <div className="my-5">
        <Alert type="danger" message={error || 'Order not found'} />
        <div className="text-center mt-4">
          <Link to="/admin/orders" className="btn btn-primary">
            <FaArrowLeft className="me-2" /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Order Details</h1>
          <p className="text-muted">Order ID: {order._id}</p>
        </div>
        <Link to="/admin/orders" className="btn btn-outline-primary">
          <FaArrowLeft className="me-2" /> Back to Orders
        </Link>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-8">
          {/* Order Information */}
          <div className="card mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Order Information</h5>
              <div className="d-flex align-items-center">
                <span className="me-3">Status:</span>
                {!editingStatus ? (
                  <>
                    <span className={`badge ${getStatusBadgeClass(order.status)} me-2`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setEditingStatus(true)}
                    >
                      <FaEdit />
                    </button>
                  </>
                ) : (
                  <div className="d-flex">
                    <select 
                      className="form-select form-select-sm me-2"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      style={{ width: '150px' }}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button 
                      className="btn btn-sm btn-success me-2"
                      onClick={handleUpdateStatus}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <FaSave />
                      )}
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={cancelEditStatus}
                      disabled={isSubmitting}
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold">
                    <FaCalendarAlt className="me-2 text-muted" /> Order Details
                  </h6>
                  <table className="table table-sm table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted" style={{ width: '40%' }}>Order Date:</td>
                        <td>{formatDateTime(order.createdAt)}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Subtotal:</td>
                        <td>{formatCurrency(order.subtotal || order.totalAmount)}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Total:</td>
                        <td className="fw-bold">{formatCurrency(order.total || order.totalAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="col-md-6">
                  <h6 className="fw-bold">
                    <FaUser className="me-2 text-muted" /> Customer Information
                  </h6>
                  <table className="table table-sm table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted" style={{ width: '40%' }}>Name:</td>
                        <td>{order.customerName}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          <FaPhone className="me-1" size={12} /> Phone:
                        </td>
                        <td>{order.phone || "Not provided"}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          <FaEnvelope className="me-1" size={12} /> Email:
                        </td>
                        <td>{order.email || "Not provided"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mb-4">
                <h6 className="fw-bold">
                  <FaBox className="me-2 text-muted" /> Order Items
                </h6>
                <div className="table-responsive">
                  <table className="table">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "60px" }}>Image</th>
                        <th>Product</th>
                        <th className="text-center">Price</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="img-thumbnail" 
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          </td>
                          <td>
                            <div className="fw-bold">{item.product.name}</div>
                            <small className="text-muted">{item.product.unit}</small>
                          </td>
                          <td className="text-center">{formatCurrency(item.price)}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="4" className="text-end fw-bold">Subtotal:</td>
                        <td className="text-end">{formatCurrency(order.subtotal || order.totalAmount)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end fw-bold">Total:</td>
                        <td className="text-end fw-bold">{formatCurrency(order.total || order.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {order.notes && (
                <div className="mb-4">
                  <h6 className="fw-bold">Special Instructions</h6>
                  <p className="mb-0 p-3 bg-light rounded">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          {/* Status History */}
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Status History</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory.map((history, index) => (
                    <div key={index} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge ${getStatusBadgeClass(history.status)}`}>
                          {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                        </span>
                        <small className="text-muted">
                          {formatDateTime(history.timestamp)}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <small className="text-muted">
                          {formatDateTime(order.createdAt)}
                        </small>
                      </div>
                    </div>
                    <div className="list-group-item text-center text-muted">
                      No additional status history available
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {order.status === 'pending' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setNewStatus('preparing');
                      setEditingStatus(true);
                    }}
                  >
                    Start Preparing Order
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      setNewStatus('ready');
                      setEditingStatus(true);
                    }}
                  >
                    Mark as Ready for Pickup
                  </button>
                )}
                
                {order.status === 'ready' && (
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      setNewStatus('completed');
                      setEditingStatus(true);
                    }}
                  >
                    Complete Order
                  </button>
                )}
                
                {(order.status === 'pending' || order.status === 'preparing') && (
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => {
                      setNewStatus('cancelled');
                      setEditingStatus(true);
                    }}
                  >
                    Cancel Order
                  </button>
                )}
                
                {/* Email buttons would go here in a real app */}
                {(order.status === 'ready') && (
                  <button className="btn btn-outline-primary">
                    Send Pickup Notification
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail; 