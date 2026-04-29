import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-center" style={{ flexDirection: 'column', gap: 12 }}>
      <div className="spinner" />
      {message && <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{message}</p>}
    </div>
  );
}
