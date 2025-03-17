import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSignOutAlt } from 'react-icons/fa';
import CartContext from '../../context/CartContext';
import AuthContext from '../../context/AuthContext';
import CustomerContext from '../../context/CustomerContext';

const Header = () => {
  const { cartCount } = useContext(CartContext);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { customerName, clearCustomerSession } = useContext(CustomerContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleClearCustomerSession = async () => {
    await clearCustomerSession();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          Chaunal General Store
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Customer Navigation - Show when not in admin section */}
          {!isAuthenticated && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products">
                  Products
                </Link>
              </li>
            </ul>
          )}

          {/* Admin Navigation - Show when authenticated as admin */}
          {isAuthenticated && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/admin/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/products">
                  Products
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/orders">
                  Orders
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/analytics">
                  Analytics
                </Link>
              </li>
            </ul>
          )}

          <ul className="navbar-nav ms-auto">
            {/* Customer Section */}
            {!isAuthenticated && (
              <>
                {customerName ? (
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      id="navbarDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FaUser className="me-1" /> {customerName}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleClearCustomerSession}
                        >
                          <FaSignOutAlt className="me-2" />
                          Change Name
                        </button>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <li className="nav-item">
                    <Link className="nav-link" to="/customer-name">
                      <FaUser className="me-1" /> Enter Name
                    </Link>
                  </li>
                )}
                
                <li className="nav-item">
                  <Link className="nav-link position-relative" to="/cart">
                    <FaShoppingCart className="me-1" /> Cart
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </Link>
                </li>
              </>
            )}

            {/* Admin Section */}
            {isAuthenticated && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaUser className="me-1" /> {user?.name}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            )}

            {/* Login for admin */}
            {!isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin/login">
                  Admin Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header; 