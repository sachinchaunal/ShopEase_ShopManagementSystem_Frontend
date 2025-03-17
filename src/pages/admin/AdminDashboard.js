import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShoppingBag, 
  FaClipboardList, 
  FaUsers, 
  FaChartLine,
  FaBoxOpen,
  FaTruck
} from 'react-icons/fa';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import Loader from '../../components/ui/Loader';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard statistics
        const statsRes = await api.get('/stats/dashboard');
        setStats(statsRes.data.data);
        
        // Fetch recent orders
        const ordersRes = await api.get('/orders?limit=5&sort=-createdAt');
        setRecentOrders(ordersRes.data.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
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
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.name}</p>
        </div>
        <div>
          <Link to="/admin/orders" className="btn btn-primary me-2">
            View All Orders
          </Link>
          <Link to="/admin/products" className="btn btn-outline-primary">
            Manage Products
          </Link>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card dashboard-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Orders</h6>
                  <h3 className="mb-0">{stats.totalOrders}</h3>
                </div>
                <div className="bg-light p-3 rounded">
                  <FaClipboardList className="text-primary" size={24} />
                </div>
              </div>
              <div className="mt-3">
                <span className={`badge ${stats.ordersTrend >= 0 ? 'bg-success' : 'bg-danger'}`}>
                  {stats.ordersTrend >= 0 ? '+' : ''}{stats.ordersTrend}% 
                </span>
                <span className="text-muted ms-2">from last week</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card dashboard-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Revenue</h6>
                  <h3 className="mb-0">{formatCurrency(stats.totalRevenue || 0)}</h3>
                </div>
                <div className="bg-light p-3 rounded">
                  <FaChartLine className="text-success" size={24} />
                </div>
              </div>
              <div className="mt-3">
                <span className={`badge ${stats.revenueTrend >= 0 ? 'bg-success' : 'bg-danger'}`}>
                  {stats.revenueTrend >= 0 ? '+' : ''}{stats.revenueTrend}% 
                </span>
                <span className="text-muted ms-2">from last week</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card dashboard-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Products</h6>
                  <h3 className="mb-0">{stats.totalProducts}</h3>
                </div>
                <div className="bg-light p-3 rounded">
                  <FaBoxOpen className="text-warning" size={24} />
                </div>
              </div>
              <div className="mt-3">
                <Link to="/admin/products" className="text-decoration-none">
                  Manage Inventory &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card dashboard-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Pending Orders</h6>
                  <h3 className="mb-0">{stats.pendingOrders}</h3>
                </div>
                <div className="bg-light p-3 rounded">
                  <FaTruck className="text-info" size={24} />
                </div>
              </div>
              <div className="mt-3">
                <Link to="/admin/orders?status=pending" className="text-decoration-none">
                  Process Orders &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="card mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Orders</h5>
          <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">
            View All
          </Link>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-3">No recent orders found.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    // Get status badge class based on order status
                    let statusClass = '';
                    switch (order.status) {
                      case 'pending':
                        statusClass = 'bg-warning';
                        break;
                      case 'preparing':
                        statusClass = 'bg-info';
                        break;
                      case 'ready':
                        statusClass = 'bg-success';
                        break;
                      case 'completed':
                        statusClass = 'bg-secondary';
                        break;
                      case 'cancelled':
                        statusClass = 'bg-danger';
                        break;
                      default:
                        statusClass = 'bg-primary';
                    }
                    
                    return (
                      <tr key={order._id}>
                        <td>{order._id.substring(0, 8)}</td>
                        <td>{order.customerName}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${statusClass}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td>{formatCurrency(order.total || order.totalAmount)}</td>
                        <td className="text-center">
                          <Link to={`/admin/orders/${order._id}`} className="btn btn-sm btn-outline-primary">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Order Status Distribution</h5>
            </div>
            <div className="card-body">
              {stats.statusDistribution && (
                <div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Pending</span>
                      <span>{stats.statusDistribution.pending || 0} orders</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-warning"
                        role="progressbar"
                        style={{ width: `${stats.totalOrders ? ((stats.statusDistribution.pending || 0) / stats.totalOrders) * 100 : 0}%` }}
                        aria-valuenow={stats.totalOrders ? ((stats.statusDistribution.pending || 0) / stats.totalOrders) * 100 : 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Preparing</span>
                      <span>{stats.statusDistribution.preparing || 0} orders</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-info"
                        role="progressbar"
                        style={{ width: `${stats.totalOrders ? ((stats.statusDistribution.preparing || 0) / stats.totalOrders) * 100 : 0}%` }}
                        aria-valuenow={stats.totalOrders ? ((stats.statusDistribution.preparing || 0) / stats.totalOrders) * 100 : 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Ready for Pickup</span>
                      <span>{stats.statusDistribution.ready || 0} orders</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${stats.totalOrders ? ((stats.statusDistribution.ready || 0) / stats.totalOrders) * 100 : 0}%` }}
                        aria-valuenow={stats.totalOrders ? ((stats.statusDistribution.ready || 0) / stats.totalOrders) * 100 : 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Completed</span>
                      <span>{stats.statusDistribution.completed || 0} orders</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-secondary"
                        role="progressbar"
                        style={{ width: `${stats.totalOrders ? ((stats.statusDistribution.completed || 0) / stats.totalOrders) * 100 : 0}%` }}
                        aria-valuenow={stats.totalOrders ? ((stats.statusDistribution.completed || 0) / stats.totalOrders) * 100 : 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Cancelled</span>
                      <span>{stats.statusDistribution.cancelled || 0} orders</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-danger"
                        role="progressbar"
                        style={{ width: `${stats.totalOrders ? ((stats.statusDistribution.cancelled || 0) / stats.totalOrders) * 100 : 0}%` }}
                        aria-valuenow={stats.totalOrders ? ((stats.statusDistribution.cancelled || 0) / stats.totalOrders) * 100 : 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Product Inventory Status</h5>
            </div>
            <div className="card-body">
              {stats.lowStockProducts && (
                <div>
                  <div className="mb-4">
                    <h6 className="mb-3">Low Stock Products <span className="badge bg-danger ms-2">{stats.lowStockProducts.length}</span></h6>
                    {stats.lowStockProducts.length > 0 ? (
                      <ul className="list-group">
                        {stats.lowStockProducts.map((product) => (
                          <li key={product._id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{product.name || 'Unknown Product'}</strong>
                              <span className="text-danger ms-2">
                                {product.stock || 0} {product.unit || 'unit'} left
                              </span>
                            </div>
                            <Link 
                              to={`/admin/products/edit/${product._id}`} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              Update
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">No products with low stock.</p>
                    )}
                  </div>
                  
                  <div>
                    <h6 className="mb-3">Top-Selling Products</h6>
                    {stats.topSellingProducts && stats.topSellingProducts.length > 0 ? (
                      <ul className="list-group">
                        {stats.topSellingProducts.map((product) => (
                          <li key={product._id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{product.name || 'Unknown Product'}</strong>
                              <span className="text-muted ms-2">
                                {product.totalSold || 0} sold
                              </span>
                            </div>
                            <span className="badge bg-success">
                              {formatCurrency(product.revenue || 0)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">No sales data available.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;