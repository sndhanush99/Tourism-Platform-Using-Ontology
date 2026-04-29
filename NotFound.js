import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page flex-center" style={{ flexDirection: 'column', minHeight: '80vh', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '5rem', marginBottom: 16 }}>🌾</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Page Not Found</h1>
      <p style={{ color: 'var(--gray)', marginBottom: 28, fontSize: '1rem' }}>
        Looks like this path leads to an unexplored village!
      </p>
      <Link to="/" className="btn btn-primary btn-lg">Go Back Home</Link>
    </div>
  );
}
