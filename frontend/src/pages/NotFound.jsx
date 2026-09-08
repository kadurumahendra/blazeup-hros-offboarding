import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#4f46e5' }}>404</h1>
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        The requested screen does not exist or has been relocated.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
};
