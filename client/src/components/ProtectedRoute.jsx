import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, token } = useAuth();

  // If not logged in, redirect to login page (/)
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // If role is specified and doesn't match the user's role, redirect to login page (/)
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
