import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user) {
    const userRole = user.role || user.user_type || '';
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedRoles = roles.map(r => r.toLowerCase());
    
    // Also allow superusers if that field exists
    if (user.is_superuser) {
      return <Outlet />;
    }

    if (normalizedUserRole && !normalizedRoles.includes(normalizedUserRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
