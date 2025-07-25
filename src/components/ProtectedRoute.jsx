import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, loading, initialized, isAuthenticated, isAdmin } = useAuth();

    // Show loading only if not initialized yet
    if (!initialized) {
        return <LoadingSpinner />;
    }

    // If no user is logged in, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // If role is required and user doesn't have the required role
    if (requiredRole === 'admin' && !isAdmin) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute; 