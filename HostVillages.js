import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_BADGE = {
  pending: 'badge-amber',
  verified: 'badge-green',
  rejected: 'badge-red',
  suspended: 'badge-gray'
};

export default function HostVillages() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || '';

  useEffect(() => {
    api.get('/villages/host/my')
      .then(d => { setVillages(d.villages); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px' }}>
        <div className="flex-between mb-3">
          <div>
            <h1 className="section-title">My Villages 🏡</h1>
            <p className="section-sub">Manage your village listings</p>
          </div>
          <Link to="/host/villages/add" className="btn btn-primary">+ Add Village</Link>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : villages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏕️</div>
            <h3 style={{ marginBottom: 8 }}>No villages listed yet</h3>
            <p style={{ color: 'var(--gray)', marginBottom: 20 }}>Add your first village to start welcoming guests</p>
            <Link to="/host/villages/add" className="btn btn-primary">Add Your Village</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {villages.map(v => (
              <div key={v._id} className="card card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 80, height: 64, background: 'var(--gray-light)', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    {v.images?.[0]
                      ? <img src={`${BASE}${v.images[0]}`} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🏡'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontWeight: 600 }}>{v.name}</h3>
                      <span className={`badge ${STATUS_BADGE[v.status] || 'badge-gray'}`}>{v.status}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: 4 }}>📍 {v.district}, {v.state}</p>
                    <p style={{ fontSize: '0.85rem', color: '#374151' }}>
                      {v.stayOptions?.length || 0} stay options · {v.activities?.length || 0} activities · ⭐ {v.averageRating?.toFixed(1) || 'No reviews yet'}
                    </p>
                    {v.status === 'pending' && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--amber)', marginTop: 4 }}>⏳ Awaiting admin verification before going live</p>
                    )}
                    {v.status === 'rejected' && v.adminNote && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--red)', marginTop: 4 }}>❌ Rejected: {v.adminNote}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/villages/${v._id}`)}>View</button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/host/villages/edit/${v._id}`)}>Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
