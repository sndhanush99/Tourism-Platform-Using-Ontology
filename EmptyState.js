import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon = '🌾', title, subtitle, action, actionLink }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray)' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>{title}</h3>
      {subtitle && <p style={{ marginBottom: 24 }}>{subtitle}</p>}
      {action && actionLink && (
        <Link to={actionLink} className="btn btn-primary">{action}</Link>
      )}
    </div>
  );
}
