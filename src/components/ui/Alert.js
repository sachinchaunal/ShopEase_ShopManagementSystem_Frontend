import React from 'react';

const Alert = ({ type = 'info', message, dismissible = false, onDismiss }) => {
  return (
    <div className={`alert alert-${type} ${dismissible ? 'alert-dismissible fade show' : ''}`} role="alert">
      {message}
      
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
          onClick={onDismiss}
        ></button>
      )}
    </div>
  );
};

export default Alert; 