import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, userInfo, status } = useSelector((state) => state.auth);
  const location = useLocation();

  // If no token exists, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If still loading user data
  if (status === 'loading') {
    return <div>Loading...</div>; // Or your custom loader
  }

  // If userInfo hasn't loaded yet
  if (!userInfo) {
    return <div>Loading user information...</div>;
  }

  // If role doesn't match required role
  /*if (requiredRole && userInfo.role !== requiredRole) {
    return <Navigate to="/unauthzorized" replace />;
  }*/

  // If account is pending
  if (userInfo.status === 'pending') {
    return <Navigate to='/account-pending' replace />  }
   if (userInfo.status === 'deactivated') {
    return <Navigate to='/unauthorized' replace />  }

  // If account is not active
  /*if (userInfo.status !== 'active' && userInfo.role !== 'admin') {
    return <Navigate to="/unausthorized" replace />;
  }*/

  // If all checks pass, render children
  return children;
};

export default ProtectedRoute;