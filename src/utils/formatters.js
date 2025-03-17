// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date and time
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Format date only
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Format order status for display
export const formatOrderStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  
  return statusMap[status] || status;
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  const statusClassMap = {
    pending: 'bg-warning',
    preparing: 'bg-info',
    ready: 'bg-success',
    completed: 'bg-secondary',
    cancelled: 'bg-danger'
  };
  
  return statusClassMap[status] || 'bg-primary';
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}; 