import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminVillages() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState({});

  useEffect(() => {
    api.get('/admin/villages/pending').then(d => { setVillages(d.villages); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const decide = async (id, status) => {
    try {
      await api.put(`/admin/villages/${id}/verify`, { status, adminNote: note[id] || '' });
      setVillages(v => v.filter(x => x._id !== id));
    } catch (err) { alert(err.message || 'Failed'); }
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px' }}>
        <h1 className="section-title">Village Applications 🏡</h1>
        <p className="section-sub">Review and approve village listings from hosts</p>

        {loading ? <div className="loading-center"><div className="spinner" /></div>
          : villages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
              <h3>All caught up!</h3>
              <p>No pending village applications</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {villages.map(v => (
                <div key={v._id} className="card card-body">
                  <div className="flex-between mb-2">
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{v.name}</h3>
                      <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>📍 {v.district}, {v.state} · PIN {v.pincode}</p>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Applied {new Date(v.createdAt).toLocaleDateString()}</div>
                  </div>

                  <p style={{ marginBottom: 12, lineHeight: 1.6, color: '#374151' }}>{v.description}</p>

                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, fontSize: '0.875rem' }}>
                    <span>🏠 {v.stayOptions?.length || 0} stay options</span>
                    <span>🎯 {v.activities?.length || 0} activities</span>
                    <span>🎉 {v.festivals?.length || 0} festivals</span>
                    {v.stayOptions?.[0] && <span style={{ color: 'var(--green)', fontWeight: 600 }}>From ₹{v.stayOptions[0].pricePerNight}/night</span>}
                  </div>

                  <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: '0.875rem' }}>Host Details</div>
                    <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                      👤 {v.host?.name} · ✉️ {v.host?.email} · 📞 {v.host?.phone}
                      {v.host?.aadhaarNumber && <span> · 🪪 Aadhaar: {v.host.aadhaarNumber}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Admin Note (shown to host if rejected)</label>
                    <input className="form-input" value={note[v._id] || ''} onChange={e => setNote(n => ({ ...n, [v._id]: e.target.value }))} placeholder="e.g. Please upload clearer photos of the accommodation" />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary" onClick={() => decide(v._id, 'verified')}>✓ Approve Village</button>
                    <button className="btn btn-danger" onClick={() => decide(v._id, 'rejected')}>✗ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
