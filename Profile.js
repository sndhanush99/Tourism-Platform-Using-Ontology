import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authStore from "../store/authStore";
import axios from "../api/axios";

export default function Profile() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.put('/auth/profile', form);
      updateUser(data.user);
      setMsg('Profile updated!');
    } catch { setMsg('Failed to update'); }
    setSaving(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const roleColor = { tourist: 'badge-blue', host: 'badge-green', admin: 'badge-red' };

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px', maxWidth: 500 }}>
        <h1 className="section-title">My Profile 👤</h1>

        <div className="card card-body mb-3" style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, background: 'var(--green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 12px' }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <h2 style={{ fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ color: 'var(--gray)', marginBottom: 10 }}>{user?.email}</p>
          <span className={`badge ${roleColor[user?.role] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
            {user?.role}
          </span>
          {user?.role === 'host' && (
            <div style={{ marginTop: 8 }}>
              <span className={`badge ${user?.hostStatus === 'verified' ? 'badge-green' : 'badge-amber'}`}>
                Host: {user?.hostStatus}
              </span>
            </div>
          )}
        </div>

        <div className="card card-body mb-3">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Edit Profile</h3>
          {msg && <div className={`alert ${msg.includes('updated') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: 4 }}>Email cannot be changed</p>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="card card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {user?.role === 'tourist' && (
              <button className="btn btn-outline btn-full" onClick={() => navigate('/my-bookings')}>🧳 My Bookings</button>
            )}
            {user?.role === 'host' && (
              <>
                <button className="btn btn-outline btn-full" onClick={() => navigate('/host')}>🏠 Host Dashboard</button>
                <button className="btn btn-outline btn-full" onClick={() => navigate('/host/bookings')}>📋 My Bookings</button>
              </>
            )}
            {user?.role === 'admin' && (
              <button className="btn btn-outline btn-full" onClick={() => navigate('/admin')}>🛠️ Admin Panel</button>
            )}
            <button className="btn btn-danger btn-full" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
