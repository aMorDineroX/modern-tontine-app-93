import React from 'react';
import DatabaseChecker from '@/components/DatabaseChecker';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function DatabaseCheck() {
  const { user } = useAuth();

  // Only allow authenticated users to access this page
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Database Connection Check</h1>
      <DatabaseChecker />
    </div>
  );
}
