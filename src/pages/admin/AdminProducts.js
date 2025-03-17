import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';
import api from '../../utils/api';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'react-toastify';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch products and extract categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(res.data.data.map(product => product.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter and sort products when filters or sort options change
  useEffect(() => {
    let result = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(term) || 
          product.description.toLowerCase().includes(term)
      );
    }
    
    // Sort products
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, sortBy, sortOrder, products]);

  // Handle sort changes
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // If already sorting by this field, toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Otherwise, set new sort field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Open delete confirmation modal
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      await api.delete(`/products/${productToDelete._id}`);
      
      // Remove product from state
      setProducts(products.filter(p => p._id !== productToDelete._id));
      
      toast.success(`${productToDelete.name} has been deleted`);
      
      // Close modal
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      toast.error('Failed to delete product. Please try again.');
      console.error('Error deleting product:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Products</h1>
        <Link to="/admin/products/add" className="btn btn-primary">
          <FaPlus className="me-2" /> Add New Product
        </Link>
      </div>
      
      {error && (
        <Alert
          type="danger"
          message={error}
          dismissible={true}
          onDismiss={() => setError(null)}
        />
      )}
      
      {/* Filters Row */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaFilter />
                </span>
                <select 
                  className="form-select" 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="d-flex">
                <div className="input-group me-2">
                  <span className="input-group-text bg-white">Sort By</span>
                  <select 
                    className="form-select" 
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                    <option value="category">Category</option>
                  </select>
                </div>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
                
                {(selectedCategory !== 'all' || searchTerm || sortBy !== 'name' || sortOrder !== 'asc') && (
                  <button 
                    className="btn btn-outline-secondary ms-2" 
                    onClick={resetFilters}
                    title="Reset Filters"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <p className="mb-0">No products found</p>
                      {(selectedCategory !== 'all' || searchTerm) && (
                        <button 
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={resetFilters}
                        >
                          Clear Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="img-thumbnail" 
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      </td>
                      <td>
                        <div className="fw-bold">{product.name}</div>
                        <small className="text-muted d-block">
                          {product.description.length > 50
                            ? `${product.description.substring(0, 50)}...`
                            : product.description}
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-primary">{product.category}</span>
                      </td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>
                        <div>
                          {product.maxQuantity} {product.unit}
                        </div>
                      </td>
                      <td>
                        {product.inStock ? (
                          <span className="badge bg-success">In Stock</span>
                        ) : (
                          <span className="badge bg-danger">Out of Stock</span>
                        )}
                      </td>
                      <td className="text-center">
                        <Link 
                          to={`/admin/products/edit/${product._id}`} 
                          className="btn btn-sm btn-outline-primary me-2"
                          title="Edit Product"
                        >
                          <FaEdit />
                        </Link>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => confirmDelete(product)}
                          title="Delete Product"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <FaExclamationTriangle className="text-warning" size={48} />
                </div>
                <p>
                  Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleDeleteProduct}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Product'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 