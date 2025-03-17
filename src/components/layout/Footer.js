import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Chaunal General Store</h5>
            <p className="mb-0">
              Order online and pick up in-store. Skip the queue and save time.
            </p>
          </div>
          
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-decoration-none text-light">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-decoration-none text-light">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-decoration-none text-light">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-md-4">
            <h5>Contact Us</h5>
            <address className="mb-0">
              <p className="mb-1">Ghingrani, Bhimtal Nainital</p>
              <p className="mb-1">Phone: (819) 105-9756</p>
              <p className="mb-0">Email: sachinchaunal@gmail.com</p>
            </address>
          </div>
        </div>
        
        <hr className="my-3 bg-secondary" />
        
        <div className="text-center">
          <p className="mb-0">
            &copy; {currentYear} Chaunal General Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 