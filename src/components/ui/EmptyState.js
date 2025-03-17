import React from 'react';

const EmptyState = ({ 
  icon, 
  message = 'No data available', 
  description = 'There are no items to display at the moment.',
  actionButton = null
}) => {
  return (
    <div className="empty-state text-center my-5 py-5">
      {icon && <div className="mb-3">{icon}</div>}
      
      <h4 className="mb-2">{message}</h4>
      <p className="text-muted mb-4">{description}</p>
      
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

export default EmptyState; 