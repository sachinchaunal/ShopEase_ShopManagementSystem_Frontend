import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import CartContext from '../../context/CartContext';
import CustomerContext from '../../context/CustomerContext';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { customerName } = useContext(CustomerContext);
  const navigate = useNavigate();

  // Validate cart quantities against max available quantity
  useEffect(() => {
    const validateCartItems = () => {
      let hasIssue = false;
      
      cartItems.forEach(item => {
        if (item.quantity > item.maxQuantity) {
          updateQuantity(item._id, item.maxQuantity);
          toast.warning(`${item.name} quantity adjusted to the maximum available (${item.maxQuantity})`);
          hasIssue = true;
        }
      });
      
      return hasIssue;
    };
    
    validateCartItems();
  }, [cartItems, updateQuantity]);

  // Handle quantity change with validation
  const handleQuantityChange = (id, value) => {
    try {
      if (!id) return;
      
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) {
        return;
      }
      
      updateQuantity(id, numValue);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Handle remove item
  const handleRemoveItem = (id) => {
    if (!id) return;
    
    removeFromCart(id);
  };
  
  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (!customerName) {
      navigate('/customer-name', { state: { redirect: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  // Render empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div>
        <h1 className="mb-4">Your Cart</h1>
        <EmptyState
          icon={<FaShoppingBag size={50} className="text-muted" />}
          message="Your cart is empty"
          description="Start shopping to add items to your cart."
          actionButton={
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Your Cart</h1>
        <div>
          <button 
            className="btn btn-outline-danger me-2"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your cart?')) {
                clearCart();
              }
            }}
          >
            Clear Cart
          </button>
          <Link to="/products" className="btn btn-outline-primary">
            <FaArrowLeft className="me-1" /> Continue Shopping
          </Link>
        </div>
      </div>
      
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-center">Subtotal</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/100x100?text=No+Image';
                            }}
                          />
                        )}
                        <div>
                          <h6 className="mb-0">{item.name}</h6>
                          <small className="text-muted">{item.unit}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center align-middle">{formatCurrency(item.price)}</td>
                    <td className="text-center align-middle" style={{ minWidth: '150px' }}>
                      <div className="input-group input-group-sm d-inline-flex" style={{ width: '120px' }}>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => handleQuantityChange(item._id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="form-control text-center"
                          value={item.quantity}
                          min="1"
                          max={item.maxQuantity}
                          onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => handleQuantityChange(item._id, Math.min(item.maxQuantity, item.quantity + 1))}
                        >
                          +
                        </button>
                      </div>
                      {item.quantity >= item.maxQuantity && (
                        <div className="text-danger small mt-1">Max quantity reached</div>
                      )}
                    </td>
                    <td className="text-center align-middle fw-bold">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                    <td className="text-center align-middle">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveItem(item._id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6 offset-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <strong>Total:</strong>
                <h5 className="mb-0">{formatCurrency(cartTotal)}</h5>
              </div>
              <button
                className="btn btn-primary w-100"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 