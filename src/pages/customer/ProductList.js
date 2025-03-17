import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FaShoppingCart, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import CartContext from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});

  const { addToCart } = useContext(CartContext);

  // Fetch products and extract categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get('/products');
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          setProducts(res.data.data);
          setFilteredProducts(res.data.data);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(res.data.data.map(product => product.category))].filter(Boolean);
          setCategories(uniqueCategories);
          
          // Initialize quantities object
          const initialQuantities = {};
          res.data.data.forEach(product => {
            initialQuantities[product._id] = 1;
          });
          setQuantities(initialQuantities);
        } else {
          setError('Invalid product data received from server');
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter products based on search term and category
  const filterProducts = useCallback(() => {
    let result = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm]);
  
  // Update filtered products when filters change
  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  // Handle quantity change
  const handleQuantityChange = (id, value) => {
    if (!id) return;
    
    try {
      const product = products.find(p => p._id === id);
      const numValue = parseInt(value, 10);
      
      if (isNaN(numValue) || numValue < 1) {
        // Invalid input, reset to 1
        setQuantities(prev => ({ ...prev, [id]: 1 }));
        return;
      }
      
      if (product && numValue > product.maxQuantity) {
        // Cap at max available quantity
        setQuantities(prev => ({ ...prev, [id]: product.maxQuantity }));
        return;
      }
      
      setQuantities(prev => ({ ...prev, [id]: numValue }));
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (!product || !product._id) return;
    
    const quantity = quantities[product._id] || 1;
    addToCart(product, quantity);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState message="No products available" />;
  }

  if (filteredProducts.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="form-select" 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
            <button 
              className="btn btn-secondary" 
              onClick={resetFilters}
              aria-label="Reset filters"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <EmptyState message="No products match your search criteria" buttonText="Reset Filters" onClick={resetFilters} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Products</h2>
      
      {/* Search and Filter */}
      <div className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="form-select" 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
          {(searchTerm || selectedCategory !== 'all') && (
            <button 
              className="btn btn-secondary" 
              onClick={resetFilters}
              aria-label="Reset filters"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>
      
      {/* Product Grid */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="col">
            <div className="card h-100">
              {product.image && (
                <img 
                  src={product.image} 
                  className="card-img-top" 
                  alt={product.name} 
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400?text=No+Image';
                  }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text text-muted">{product.category}</p>
                <p className="card-text">{product.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{formatCurrency(product.price)}</h5>
                  <span className="text-muted">
                    {product.inStock ? `${product.maxQuantity} ${product.unit} available` : 'Out of stock'}
                  </span>
                </div>
              </div>
              <div className="card-footer">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="input-group input-group-sm" style={{ maxWidth: '120px' }}>
                    <input
                      type="number"
                      className="form-control"
                      value={quantities[product._id] || 1}
                      onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                      min="1"
                      max={product.maxQuantity}
                      disabled={!product.inStock}
                    />
                    <span className="input-group-text">{product.unit}</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    <FaShoppingCart className="me-1" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList; 