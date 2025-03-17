import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import api from '../../utils/api';
import Loader from '../../components/ui/Loader';
import CustomerContext from '../../context/CustomerContext';
import { formatCurrency } from '../../utils/formatters';

const CustomerHome = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { customerName } = useContext(CustomerContext);
  
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await api.get('/products?limit=4');
        setFeaturedProducts(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setError('Failed to load featured products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, []);
  
  if (loading) {
    return <Loader />;
  }
  
  return (
    <div>
      {/* Hero Banner */}
      <div className="banner py-5 mb-5 text-center">
        <div className="container">
          <h1 className="display-4 fw-bold">Welcome to Chaunal General Store</h1>
          <p className="lead mb-4">
            Order online and pick up in-store. Skip the queue and save time!
          </p>
          
          {customerName ? (
            <p className="mb-4">
              Hello, <strong>{customerName}</strong>! Start shopping now.
            </p>
          ) : (
            <p className="mb-4">
              Please enter your name to start shopping.
            </p>
          )}
          
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <Link to="/products" className="btn btn-primary btn-lg px-4 gap-3">
              Browse Products
            </Link>
            {!customerName && (
              <Link to="/customer-name" className="btn btn-outline-secondary btn-lg px-4">
                Enter Name
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Featured Products */}
      <div className="container mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Featured Products</h2>
          <Link to="/products" className="btn btn-outline-primary">
            View All <FaArrowRight className="ms-1" />
          </Link>
        </div>
        
        {error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <div className="row">
            {featuredProducts.map((product) => (
              <div key={product._id} className="col-md-6 col-lg-3 mb-4">
                <div className="card h-100 product-card">
                  <img
                    src={product.image}
                    className="card-img-top product-image"
                    alt={product.name}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text text-muted">
                      {product.description.length > 60
                        ? `${product.description.substring(0, 60)}...`
                        : product.description}
                    </p>
                    <p className="card-text fw-bold">
                      {formatCurrency(product.price)} / {product.unit}
                    </p>
                  </div>
                  <div className="card-footer bg-white border-top-0">
                    <Link to="/products" className="btn btn-primary w-100">
                      <FaShoppingCart className="me-2" /> View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* How It Works */}
      <div className="bg-light py-5 mb-5">
        <div className="container">
          <h2 className="text-center mb-4">How It Works</h2>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <h3 className="mb-0">1</h3>
                  </div>
                  <h4>Browse Products</h4>
                  <p className="text-muted">
                    Explore our wide range of products and add items to your cart.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <h3 className="mb-0">2</h3>
                  </div>
                  <h4>Place Your Order</h4>
                  <p className="text-muted">
                    Review your cart and place your order with your name.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <h3 className="mb-0">3</h3>
                  </div>
                  <h4>Pick Up In-Store</h4>
                  <p className="text-muted">
                    Visit our store to pick up your order when it's ready.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome; 