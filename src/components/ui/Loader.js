import React from 'react';

const Loader = ({ size = 'medium', text = 'Loading...' }) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 'spinner-border-sm';
      case 'large':
        return '';
      default:
        return '';
    }
  };
  
  return (
    <div className="d-flex flex-column justify-content-center align-items-center my-5">
      <div className={`spinner-border text-primary ${getSpinnerSize()}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <p className="mt-3 text-muted">{text}</p>}
    </div>
  );
};

export default Loader; 