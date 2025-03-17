import React, { useState, useEffect } from 'react';
import { FaChartLine, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import api from '../../utils/api';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import { formatCurrency } from '../../utils/formatters';

// Mock component for charts since we don't have an actual chart library installed
const ChartPlaceholder = ({ title, height = '300px', children }) => {
  return (
    <div className="border rounded p-3 bg-light text-center" style={{ height }}>
      <h5>{title}</h5>
      <p className="text-muted">Chart would appear here with actual chart library (like Chart.js or Recharts)</p>
      {children}
    </div>
  );
};

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        params.append('from', dateRange.from);
        params.append('to', dateRange.to);
        
        const res = await api.get(`/stats/analytics?${params.toString()}`);
        setAnalyticsData(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [dateRange]);
  
  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (loading) {
    return <Loader />;
  }
  
  if (error) {
    return <Alert type="danger" message={error} />;
  }
  
  // In a real app, we would use actual chart data
  // For now, we'll use placeholders
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Analytics</h1>
        
        <div className="d-flex align-items-center">
          <FaCalendarAlt className="me-2 text-muted" />
          <div className="input-group">
            <input
              type="date"
              className="form-control"
              name="from"
              value={dateRange.from}
              onChange={handleDateRangeChange}
            />
            <span className="input-group-text">to</span>
            <input
              type="date"
              className="form-control"
              name="to"
              value={dateRange.to}
              onChange={handleDateRangeChange}
              min={dateRange.from}
            />
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card dashboard-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-1">Total Orders</h6>
                  <h3 className="mb-0">{analyticsData?.orderCount || 0}</h3>
                </div>
                <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FaChartBar size={24} />
                </div>
              </div>
              <div className="mt-3">
                <div className={`small ${analyticsData?.orderGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                  {analyticsData?.orderGrowth >= 0 ? '↑' : '↓'} {Math.abs(analyticsData?.orderGrowth || 0)}% from previous period
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card dashboard-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-1">Total Revenue</h6>
                  <h3 className="mb-0">{formatCurrency(analyticsData?.totalRevenue || 0)}</h3>
                </div>
                <div className="bg-success rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FaChartLine size={24} />
                </div>
              </div>
              <div className="mt-3">
                <div className={`small ${analyticsData?.revenueGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                  {analyticsData?.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(analyticsData?.revenueGrowth || 0)}% from previous period
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card dashboard-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-1">Average Order Value</h6>
                  <h3 className="mb-0">{formatCurrency(analyticsData?.averageOrderValue || 0)}</h3>
                </div>
                <div className="bg-info rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FaChartBar size={24} />
                </div>
              </div>
              <div className="mt-3">
                <div className={`small ${analyticsData?.aovGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                  {analyticsData?.aovGrowth >= 0 ? '↑' : '↓'} {Math.abs(analyticsData?.aovGrowth || 0)}% from previous period
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card dashboard-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted mb-1">Completion Rate</h6>
                  <h3 className="mb-0">{analyticsData?.completionRate || 0}%</h3>
                </div>
                <div className="bg-warning rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FaChartBar size={24} />
                </div>
              </div>
              <div className="mt-3">
                <div className={`small ${analyticsData?.completionRateGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                  {analyticsData?.completionRateGrowth >= 0 ? '↑' : '↓'} {Math.abs(analyticsData?.completionRateGrowth || 0)}% from previous period
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="row mb-4">
        <div className="col-lg-8 mb-3">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Revenue Trend</h5>
            </div>
            <div className="card-body">
              <ChartPlaceholder title="Daily Revenue">
                {analyticsData?.dailyRevenue && (
                  <div className="mt-3 text-start">
                    <div className="row">
                      <div className="col-md-6">
                        <h6>Highest Revenue Day</h6>
                        <p>
                          <strong>{analyticsData.dailyRevenue.highestDay?.date}: </strong>
                          {formatCurrency(analyticsData.dailyRevenue.highestDay?.revenue || 0)}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <h6>Lowest Revenue Day</h6>
                        <p>
                          <strong>{analyticsData.dailyRevenue.lowestDay?.date}: </strong>
                          {formatCurrency(analyticsData.dailyRevenue.lowestDay?.revenue || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </ChartPlaceholder>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4 mb-3">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Order Status Distribution</h5>
            </div>
            <div className="card-body">
              <ChartPlaceholder title="Status Distribution">
                {analyticsData?.statusDistribution && (
                  <div className="mt-3 text-start">
                    <div className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span>
                          <span className="badge bg-warning me-2">Pending</span>
                        </span>
                        <span>{analyticsData.statusDistribution.pending || 0} orders</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-warning" 
                          style={{ width: `${analyticsData.statusDistribution.pendingPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span>
                          <span className="badge bg-info me-2">Preparing</span>
                        </span>
                        <span>{analyticsData.statusDistribution.preparing || 0} orders</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-info" 
                          style={{ width: `${analyticsData.statusDistribution.preparingPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span>
                          <span className="badge bg-success me-2">Ready</span>
                        </span>
                        <span>{analyticsData.statusDistribution.ready || 0} orders</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${analyticsData.statusDistribution.readyPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span>
                          <span className="badge bg-secondary me-2">Completed</span>
                        </span>
                        <span>{analyticsData.statusDistribution.completed || 0} orders</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-secondary" 
                          style={{ width: `${analyticsData.statusDistribution.completedPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span>
                          <span className="badge bg-danger me-2">Cancelled</span>
                        </span>
                        <span>{analyticsData.statusDistribution.cancelled || 0} orders</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-danger" 
                          style={{ width: `${analyticsData.statusDistribution.cancelledPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </ChartPlaceholder>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Performance and Customer Stats */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Top Selling Products</h5>
            </div>
            <div className="card-body">
              {analyticsData?.topProducts && analyticsData.topProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="text-center">Quantity Sold</th>
                        <th className="text-end">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topProducts.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div 
                                className="bg-light rounded me-2 d-flex align-items-center justify-content-center" 
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              >
                                <span className="text-muted">T</span>
                              </div>
                              <div>
                                <div className="fw-bold">{product.name || 'Unknown Product'}</div>
                                <small className="text-muted">Product ID: {product._id?.substring(0, 8) || 'N/A'}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">{product.totalQuantity || 0}</td>
                          <td className="text-end">{formatCurrency(product.totalRevenue || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted my-5">
                  <p>No product data available for the selected date range.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Top Customers</h5>
            </div>
            <div className="card-body">
              <div className="text-center text-muted my-5">
                <p>Customer analytics feature coming soon.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional note about charts */}
      <div className="alert alert-info mt-2">
        <p className="mb-0">
          <strong>Note:</strong> In a production environment, this page would use a charting library like Chart.js or Recharts to display actual interactive charts instead of placeholders.
        </p>
      </div>
    </div>
  );
};

export default AdminAnalytics;