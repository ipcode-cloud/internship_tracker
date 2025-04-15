import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles || allowedRoles.includes(user.role)) {
    // If no roles specified or user's role is allowed, render the children
    return children;
  }

  // If user's role is not allowed, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default PrivateRoute; 