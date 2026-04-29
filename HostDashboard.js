import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function HostDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ villages: 0, bookings: 0, earnings: 0, pending: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/villages/host/my'),
      api.get('/bookings/host')
    ]).then(([villagesData, bookingsData]) => {
      const villages = villagesData.villages;
      const bookings = bookingsData.bookings;
      const earnings = bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + (b.hostEarnings || 0), 0);
      const pending = bookings.filter(b => b.status === 'pending').length;
      setStats({ villages: villages.length, bookings: bookings.length, earnings, pending });
      setRecentBookings(bookings.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const STATUS_COLOR = { pending: '#f59e0b', confirmed: '#16a34a', cancelled: '#dc2626', completed: '#2563eb' };

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Welcome back, {user?.name?.split(' ')[0]} 🏠</h1>
          <p style={{ color: 'var(--gray)' }}>Manage your village listings and bookings</p>
          {user?.hostStatus === 'pending' && (
            <div className="alert alert-info mt-2">⏳ Your host account is pending admin verification. Your listings will go live once approved.</div>
          )}
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <>
            {/* Stats */}
            <div className="grid grid-4 mb-3">
              <div className="stat-card"><div className="stat-number">{stats.villages}</div><div className="stat-label">Villages Listed</div></div>
              <div className="stat-card"><div className="stat-number">{stats.bookings}</div><div className="stat-label">Total Bookings</div></div>
              <div className="stat-card"><div className="stat-number" style={{ color: 'var(--amber)' }}>{stats.pending}</div><div className="stat-label">Pending Requests</div></div>
              <div className="stat-card"><div className="stat-number">₹{stats.earnings.toLocaleString()}</div><div className="stat-label">Total Earnings</div></div>
            </div>

            {/* Quick links */}
            <div className="grid grid-3 mb-3">
              {[
                { to: '/host/villages/add', icon: '➕', label: 'Add Village', sub: 'List a new village stay' },
                { to: '/host/bookings', icon: '📋', label: 'View Bookings', sub: `${stats.pending} pending` },
                { to: '/host/marketplace', icon: '🛒', label: 'My Products', sub: 'Manage marketplace items' },
              ].map(l => (
                <Link key={l.to} to={l.to} className="card card-body" style={{ textAlign: 'center', display: 'block' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>{l.icon}</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{l.label}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{l.sub}</div>
                </Link>
              ))}
            </div>

            {/* Recent bookings */}
            <div className="card card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 600 }}>Recent Booking Requests</h3>
                <Link to="/host/bookings" style={{ fontSize: '0.85rem', color: 'var(--green)' }}>View all →</Link>
              </div>
              {recentBookings.length === 0 ? (
                <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 20 }}>No bookings yet. Share your village listing to get started!</p>
              ) : (
                recentBookings.map(b => (
                  <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{b.tourist?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                        {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()} · {b.guests} guest(s)
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: 'var(--green)' }}>₹{b.hostEarnings || 0}</div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: STATUS_COLOR[b.status] || 'gray' }}>{b.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
