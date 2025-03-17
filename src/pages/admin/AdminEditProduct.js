import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';
import Alert from '../../components/ui/Alert';
import Loader from '../../components/ui/Loader';
import { toast } from 'react-toastify';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inStock: true,
    unit: '',
    maxQuantity: '',
    image: ''
  });
  
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState('');
  
  // Available units
  const unitOptions = ['kg', 'gm', 'liter', 'ml', 'piece', 'dozen', 'packet'];
  
  // Available categories (could be fetched from API in a real app)
  const categoryOptions = ['Groceries', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Fruits', 'Vegetables', 'Meat'];
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const product = res.data.data;
        
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          category: product.category,
          inStock: product.inStock,
          unit: product.unit,
          maxQuantity: product.maxQuantity.toString(),
          image: product.image
        });
        
        setOriginalData(product);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setGeneralError('Failed to load product data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    // Validate price
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    // Validate category
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Validate max quantity
    if (!formData.maxQuantity) {
      newErrors.maxQuantity = 'Maximum order quantity is required';
    } else if (isNaN(formData.maxQuantity) || parseInt(formData.maxQuantity) <= 0) {
      newErrors.maxQuantity = 'Maximum quantity must be a positive number';
    }
    
    // Validate image URL
    if (!formData.image) {
      newErrors.image = 'Image URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.image)) {
      newErrors.image = 'Please enter a valid URL';
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
    
    setIsSubmitting(true);
    setGeneralError('');
    
    try {
      // Prepare data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        maxQuantity: parseInt(formData.maxQuantity),
        imageUrl: formData.image
      };
      
      // Send API request
      const response = await api.put(`/products/${id}`, productData);
      
      if (response.data.success) {
        toast.success('Product updated successfully');
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setGeneralError(error.response?.data?.message || 'Failed to update product. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Handle form reset
  const handleReset = () => {
    if (originalData) {
      setFormData({
        name: originalData.name,
        description: originalData.description || '',
        price: originalData.price.toString(),
        category: originalData.category,
        inStock: originalData.inStock,
        unit: originalData.unit,
        maxQuantity: originalData.maxQuantity.toString(),
        image: originalData.image
      });
    }
    setErrors({});
    setGeneralError('');
  };
  
  if (isLoading) {
    return <Loader />;
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Edit Product</h1>
        <Link to="/admin/products" className="btn btn-outline-primary">
          <FaArrowLeft className="me-2" /> Back to Products
        </Link>
      </div>
      
      {generalError && (
        <Alert
          type="danger"
          message={generalError}
          dismissible={true}
          onDismiss={() => setGeneralError('')}
        />
      )}
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="name" className="form-label">
                  Product Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="category" className="form-label">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
              ></textarea>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="price" className="form-label">
                  Price <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                  {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="image" className="form-label">
                  Image URL <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image && <div className="invalid-feedback">{errors.image}</div>}
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="form-check mt-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="inStock"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="inStock">
                    In Stock
                  </label>
                </div>
              </div>
              
              <div className="col-md-4">
                <label htmlFor="unit" className="form-label">
                  Unit <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  {unitOptions.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-4">
                <label htmlFor="maxQuantity" className="form-label">
                  Max Order Quantity <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={`form-control ${errors.maxQuantity ? 'is-invalid' : ''}`}
                  id="maxQuantity"
                  name="maxQuantity"
                  value={formData.maxQuantity}
                  onChange={handleChange}
                  placeholder="Enter maximum quantity"
                />
                {errors.maxQuantity && <div className="invalid-feedback">{errors.maxQuantity}</div>}
                <small className="form-text text-muted">
                  Maximum quantity a customer can order at once
                </small>
              </div>
            </div>
            
            {formData.image && (
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label">Image Preview</label>
                  <div className="border rounded p-2">
                    <img
                      src={formData.image}
                      alt="Product Preview"
                      className="img-fluid"
                      style={{ maxHeight: '150px', display: 'block', margin: '0 auto' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                        setErrors({
                          ...errors,
                          image: 'Image URL is invalid or cannot be loaded'
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Update Product
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
              >
                <FaTimes className="me-2" /> Reset Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProduct; 