import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'host') navigate('/host');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/villages');
    } catch {}
  };

  return (
    <div className="page flex-center" style={{ minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, margin: '0 20px' }}>
        <div className="card-body">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏡</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome back</h1>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginTop: 4 }}>Login to DESI TRAVEL</p>
          </div>

          {error && <div className="alert alert-error" onClick={clearError}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--gray)', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--green)', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
