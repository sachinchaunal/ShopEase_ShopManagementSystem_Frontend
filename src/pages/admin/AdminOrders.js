import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaSort,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import api from '../../utils/api';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency, formatDateTime, getStatusBadgeClass } from '../../utils/formatters';

const AdminOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [dateRange, setDateRange] = useState({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || ''
  });
  
  // Pagination
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const ordersPerPage = 10;
  
  // Sorting
  const [sortField, setSortField] = useState(searchParams.get('sort')?.replace(/^-/, '') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort')?.startsWith('-') ? 'desc' : 'desc');
  
  // Available order statuses
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready for Pickup' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedStatus !== 'all') {
      params.set('status', selectedStatus);
    }
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    if (dateRange.from) {
      params.set('from', dateRange.from);
    }
    
    if (dateRange.to) {
      params.set('to', dateRange.to);
    }
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    if (sortField !== 'createdAt' || sortOrder !== 'desc') {
      params.set('sort', `${sortOrder === 'desc' ? '-' : ''}${sortField}`);
    }
    
    const queryString = params.toString();
    navigate({
      pathname: location.pathname,
      search: queryString ? `?${queryString}` : ''
    }, { replace: true });
    
    // Fetch orders whenever filters change
    fetchOrders();
    
  }, [selectedStatus, searchTerm, dateRange, currentPage, sortField, sortOrder]);
  
  // Fetch orders based on filters
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      // Filter by status
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      // Search term
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      // Date range
      if (dateRange.from) {
        params.append('from', dateRange.from);
      }
      
      if (dateRange.to) {
        params.append('to', dateRange.to);
      }
      
      // Pagination
      params.append('page', currentPage.toString());
      params.append('limit', ordersPerPage.toString());
      
      // Sorting
      params.append('sort', `${sortOrder === 'desc' ? '-' : ''}${sortField}`);
      
      // Make API call
      const res = await api.get(`/orders?${params.toString()}`);
      
      setOrders(res.data.data);
      setTotalOrders(res.data.total);
      setTotalPages(Math.ceil(res.data.total / ordersPerPage));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle status filter change
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  // Handle date filter change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set sort field
      setSortField(field);
      
      // Default to descending for date fields (newest first), ascending for other fields
      if (field === 'createdAt') {
        setSortOrder('desc');
      } else {
        setSortOrder('asc');
      }
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedStatus('all');
    setSearchTerm('');
    setDateRange({
      from: '',
      to: ''
    });
    setCurrentPage(1);
    setSortField('createdAt');
    setSortOrder('desc');
  };
  
  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Determine if filters are active
  const filtersActive = selectedStatus !== 'all' || 
                         searchTerm || 
                         dateRange.from || 
                         dateRange.to || 
                         sortField !== 'createdAt' || 
                         sortOrder !== 'desc';
  
  if (loading && currentPage === 1) {
    return <Loader />;
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Orders</h1>
      </div>
      
      {error && (
        <Alert
          type="danger"
          message={error}
          dismissible={true}
          onDismiss={() => setError(null)}
        />
      )}
      
      {/* Filter Row */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Status Filter */}
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Date Range */}
            <div className="col-md-5">
              <label className="form-label">Date Range</label>
              <div className="row">
                <div className="col">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="From"
                    name="from"
                    value={dateRange.from}
                    onChange={handleDateChange}
                  />
                </div>
                <div className="col">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="To"
                    name="to"
                    value={dateRange.to}
                    onChange={handleDateChange}
                    min={dateRange.from}
                  />
                </div>
              </div>
            </div>
            
            {/* Search */}
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <form onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by ID or customer name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button className="btn btn-outline-secondary" type="submit">
                    <FaSearch />
                  </button>
                  {filtersActive && (
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={resetFilters}
                      title="Reset Filters"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="card mb-4">
        <div className="card-body">
          {orders.length === 0 ? (
            <EmptyState
              message="No orders found"
              description={filtersActive 
                ? "Try changing your filters or search criteria." 
                : "No orders have been placed yet."}
              actionButton={
                filtersActive && (
                  <button className="btn btn-primary" onClick={resetFilters}>
                    Reset Filters
                  </button>
                )
              }
            />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th 
                        className="cursor-pointer" 
                        onClick={() => handleSortChange('_id')}
                      >
                        Order ID
                        {sortField === '_id' && (
                          <FaSort className="ms-1" />
                        )}
                      </th>
                      <th 
                        className="cursor-pointer" 
                        onClick={() => handleSortChange('customerName')}
                      >
                        Customer
                        {sortField === 'customerName' && (
                          <FaSort className="ms-1" />
                        )}
                      </th>
                      <th 
                        className="cursor-pointer" 
                        onClick={() => handleSortChange('createdAt')}
                      >
                        Order Date
                        {sortField === 'createdAt' && (
                          <FaSort className="ms-1" />
                        )}
                      </th>
                      <th 
                        className="cursor-pointer" 
                        onClick={() => handleSortChange('total')}
                      >
                        Total
                        {sortField === 'total' && (
                          <FaSort className="ms-1" />
                        )}
                      </th>
                      <th 
                        className="cursor-pointer" 
                        onClick={() => handleSortChange('status')}
                      >
                        Status
                        {sortField === 'status' && (
                          <FaSort className="ms-1" />
                        )}
                      </th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>{order._id.substring(0, 8)}</td>
                        <td>
                          <div>{order.customerName}</div>
                          <small className="text-muted">{order.phone}</small>
                        </td>
                        <td>
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td>
                          {formatCurrency(order.total || order.totalAmount)}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="text-center">
                          <Link to={`/admin/orders/${order._id}`} className="btn btn-sm btn-outline-primary">
                            <FaEye className="me-1" /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
                  </div>
                  <nav aria-label="Orders pagination">
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <FaChevronLeft size={12} />
                        </button>
                      </li>
                      
                      {[...Array(totalPages).keys()].map(page => {
                        // Show first page, last page, current page, and pages around current
                        const pageNum = page + 1;
                        if (
                          pageNum === 1 || 
                          pageNum === totalPages || 
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <li 
                              key={pageNum} 
                              className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                            >
                              <button 
                                className="page-link" 
                                onClick={() => goToPage(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        } else if (
                          (pageNum === 2 && currentPage > 3) || 
                          (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                          // Show ellipsis
                          return (
                            <li key={pageNum} className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <FaChevronRight size={12} />
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders; 