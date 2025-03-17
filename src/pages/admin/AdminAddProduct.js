import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes, FaUpload, FaLink } from 'react-icons/fa';
import api from '../../utils/api';
import Alert from '../../components/ui/Alert';
import { toast } from 'react-toastify';

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    customCategory: '',
    stock: '',
    unit: 'pcs',
    maxQuantity: '',
    image: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploadMode, setImageUploadMode] = useState('url'); // 'url' or 'file'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  // Available units
  const unitOptions = ['kg', 'gm', 'liter', 'ml', 'piece', 'dozen', 'packet'];
  
  // Available categories (could be fetched from API in a real app)
  const categoryOptions = ['Groceries', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Fruits', 'Vegetables', 'Meat'];
  
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
  
  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        image: 'Only JPG, PNG, and WebP images are allowed'
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...errors,
        image: 'Image size must be less than 5MB'
      });
      return;
    }
    
    setImageFile(file);
    setErrors({...errors, image: ''});
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Switch between URL and file upload modes
  const toggleImageUploadMode = (mode) => {
    setImageUploadMode(mode);
    setFormData({...formData, image: ''});
    setImageFile(null);
    setImagePreview('');
    setErrors({...errors, image: ''});
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
    } else if (formData.category === 'Other' && !formData.customCategory.trim()) {
      newErrors.customCategory = 'Please enter a category name';
    }
    
    // Validate stock
    if (!formData.stock) {
      newErrors.stock = 'Stock quantity is required';
    } else if (isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a non-negative number';
    }
    
    // Validate max quantity
    if (!formData.maxQuantity) {
      newErrors.maxQuantity = 'Maximum order quantity is required';
    } else if (isNaN(formData.maxQuantity) || parseInt(formData.maxQuantity) <= 0) {
      newErrors.maxQuantity = 'Maximum quantity must be a positive number';
    }
    
    // Validate image
    if (imageUploadMode === 'url') {
      if (!formData.image) {
        newErrors.image = 'Image URL is required';
      } else if (!/^https?:\/\/.+/.test(formData.image)) {
        newErrors.image = 'Please enter a valid URL';
      }
    } else {
      if (!imageFile) {
        newErrors.image = 'Please select an image file';
      }
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
      const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;
      
      // Create form data if uploading file
      if (imageUploadMode === 'file' && imageFile) {
        const formDataObj = new FormData();
        formDataObj.append('name', formData.name);
        formDataObj.append('description', formData.description);
        formDataObj.append('price', parseFloat(formData.price));
        formDataObj.append('category', finalCategory);
        formDataObj.append('inStock', parseInt(formData.stock) > 0);
        formDataObj.append('unit', formData.unit);
        formDataObj.append('maxQuantity', parseInt(formData.maxQuantity));
        formDataObj.append('image', imageFile);
        
        // Send API request with file upload
        const response = await api.post('/products', formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        
        if (response.data.success) {
          toast.success('Product added successfully');
          navigate('/admin/products');
        }
      } else {
        // Send regular JSON data with image URL
        const productData = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: finalCategory,
          inStock: parseInt(formData.stock) > 0,
          unit: formData.unit,
          maxQuantity: parseInt(formData.maxQuantity),
          imageUrl: formData.image
        };
        
        // Send API request
        const response = await api.post('/products', productData);
        
        if (response.data.success) {
          toast.success('Product added successfully');
          navigate('/admin/products');
        }
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setGeneralError(error.response?.data?.message || 'Failed to add product. Please try again.');
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  // Handle form reset
  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      customCategory: '',
      stock: '',
      unit: 'pcs',
      maxQuantity: '',
      image: ''
    });
    setImageFile(null);
    setImagePreview('');
    setImageUploadMode('url');
    setErrors({});
    setGeneralError('');
    setUploadProgress(0);
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Add New Product</h1>
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
                  <option value="Other">Other (Enter custom)</option>
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                
                {formData.category === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      className={`form-control ${errors.customCategory ? 'is-invalid' : ''}`}
                      id="customCategory"
                      name="customCategory"
                      value={formData.customCategory}
                      onChange={handleChange}
                      placeholder="Enter custom category"
                    />
                    {errors.customCategory && <div className="invalid-feedback">{errors.customCategory}</div>}
                  </div>
                )}
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
                <label className="form-label">
                  Product Image <span className="text-danger">*</span>
                </label>
                
                <div className="mb-2">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${imageUploadMode === 'url' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => toggleImageUploadMode('url')}
                    >
                      <FaLink className="me-1" /> Image URL
                    </button>
                    <button
                      type="button"
                      className={`btn ${imageUploadMode === 'file' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => toggleImageUploadMode('file')}
                    >
                      <FaUpload className="me-1" /> Upload Image
                    </button>
                  </div>
                </div>
                
                {imageUploadMode === 'url' ? (
                  <input
                    type="text"
                    className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      className="d-none"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                    />
                    <div className="d-grid">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <FaUpload className="me-2" /> Select Image File
                      </button>
                    </div>
                    {imageFile && (
                      <div className="mt-2">
                        <small className="text-muted">
                          Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                        </small>
                      </div>
                    )}
                    {uploadProgress > 0 && isSubmitting && (
                      <div className="mt-2">
                        <div className="progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${uploadProgress}%` }}
                            aria-valuenow={uploadProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {uploadProgress}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="stock" className="form-label">
                  Stock Quantity <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Enter stock quantity"
                />
                {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
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
            
            <div className="row mb-4">
              <div className="col-md-4">
                {((imageUploadMode === 'url' && formData.image) || 
                  (imageUploadMode === 'file' && imagePreview)) && (
                  <div>
                    <label className="form-label">Image Preview</label>
                    <div className="border rounded p-2">
                      <img
                        src={imageUploadMode === 'url' ? formData.image : imagePreview}
                        alt="Product Preview"
                        className="img-fluid"
                        style={{ maxHeight: '150px', display: 'block', margin: '0 auto' }}
                        onError={(e) => {
                          if (imageUploadMode === 'url') {
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                            setErrors({
                              ...errors,
                              image: 'Image URL is invalid or cannot be loaded'
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
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
                    <FaSave className="me-2" /> Save Product
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
              >
                <FaTimes className="me-2" /> Reset Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddProduct; 