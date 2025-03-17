import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="text-center my-5">
      <FaExclamationTriangle className="text-warning" size={50} />
      <h1 className="mt-3">404 - Page Not Found</h1>
      <p className="lead mb-4">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound; 