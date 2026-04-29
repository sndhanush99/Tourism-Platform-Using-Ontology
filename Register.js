import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tourist', phone: '', aadhaarNumber: '' });
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(form);
      if (user.role === 'host') navigate('/host');
      else navigate('/villages');
    } catch {}
  };

  return (
    <div className="page flex-center" style={{ minHeight: '100vh', padding: '80px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 460 }}>
        <div className="card-body">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🌿</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Join DESI TEAVEL </h1>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginTop: 4 }}>Create your account</p>
          </div>

          {error && <div className="alert alert-error" onClick={clearError}>{error}</div>}

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {['tourist', 'host'].map(role => (
              <button key={role} type="button"
                onClick={() => setForm(f => ({ ...f, role }))}
                style={{
                  padding: '14px', border: `2px solid ${form.role === role ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', background: form.role === role ? 'var(--green-light)' : 'white',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                  color: form.role === role ? 'var(--green-dark)' : 'var(--gray)'
                }}>
                {role === 'tourist' ? '🧳 I\'m a Traveler' : '🏠 I\'m a Host'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" required value={form.name} onChange={set('name')} placeholder="Ramesh Kumar" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
            </div>
            {form.role === 'host' && (
              <div className="form-group">
                <label className="form-label">Aadhaar Number (for verification)</label>
                <input className="form-input" value={form.aadhaarNumber} onChange={set('aadhaarNumber')} placeholder="XXXX XXXX XXXX" />
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--gray)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
