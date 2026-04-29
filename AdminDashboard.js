import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/dashboard'), api.get('/admin/bookings')])
      .then(([s, b]) => { setStats(s.stats); setBookings(b.bookings.slice(0, 8)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Admin Dashboard 🛠️</h1>
          <p style={{ color: 'var(--gray)' }}>Manage DESI TRAVEL platform</p>
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <>
            <div className="grid grid-4 mb-3">
              <div className="stat-card"><div className="stat-number">{stats?.totalUsers || 0}</div><div className="stat-label">Total Users</div></div>
              <div className="stat-card"><div className="stat-number">{stats?.totalVillages || 0}</div><div className="stat-label">Live Villages</div></div>
              <div className="stat-card"><div className="stat-number" style={{ color: 'var(--amber)' }}>{stats?.pendingVillages || 0}</div><div className="stat-label">Pending Review</div></div>
              <div className="stat-card"><div className="stat-number">₹{(stats?.platformRevenue || 0).toLocaleString()}</div><div className="stat-label">Platform Revenue</div></div>
            </div>

            <div className="grid grid-2 mb-3">
              <Link to="/admin/villages" className="card card-body" style={{ display: 'block', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏡</div>
                <div style={{ fontWeight: 600 }}>Review Village Applications</div>
                {stats?.pendingVillages > 0 && <div className="badge badge-amber mt-1">{stats.pendingVillages} pending</div>}
              </Link>
              <div className="card card-body" style={{ textAlign: 'center', opacity: 0.7 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>👥</div>
                <div style={{ fontWeight: 600 }}>User Management</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: 4 }}>{stats?.totalUsers} registered users</div>
              </div>
            </div>

            <div className="card card-body">
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Recent Bookings</h3>
              {bookings.length === 0 ? <p style={{ color: 'var(--gray)' }}>No bookings yet</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        {['Tourist', 'Village', 'Dates', 'Amount', 'Status', 'Payment'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--gray)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px' }}>{b.tourist?.name}</td>
                          <td style={{ padding: '10px 12px' }}>{b.village?.name}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--gray)' }}>{new Date(b.checkIn).toLocaleDateString()}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--green)' }}>₹{b.totalAmount}</td>
                          <td style={{ padding: '10px 12px' }}><span className={`badge badge-${b.status === 'confirmed' ? 'green' : b.status === 'pending' ? 'amber' : b.status === 'cancelled' ? 'red' : 'blue'}`}>{b.status}</span></td>
                          <td style={{ padding: '10px 12px' }}><span className={`badge ${b.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{b.paymentStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
