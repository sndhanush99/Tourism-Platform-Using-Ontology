import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';

const BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const STATUS_BADGE = { pending: 'badge-amber', confirmed: 'badge-green', cancelled: 'badge-red', completed: 'badge-blue', refunded: 'badge-gray' };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { success, method } = location.state || {};

  useEffect(() => {
    api.get('/bookings/my').then(d => { setBookings(d.bookings); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: 'Cancelled by tourist' });
      setBookings(b => b.map(bk => bk._id === id ? { ...bk, status: 'cancelled' } : bk));
    } catch { alert('Could not cancel'); }
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px' }}>
        <h1 className="section-title">My Trips 🧳</h1>

        {success && method === 'upi' && (
          <div className="alert alert-info" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.4rem' }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Transaction ID Submitted!</div>
              <div style={{ fontSize: '0.875rem' }}>Your host has been notified and will verify your UPI payment. Booking will be confirmed once verified — usually within a few hours.</div>
            </div>
          </div>
        )}
        {success && method !== 'upi' && (
          <div className="alert alert-success">🎉 Booking confirmed! Your host will be in touch soon.</div>
        )}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌾</div>
            <h3>No bookings yet</h3>
            <p>Start exploring villages to book your first rural experience!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map(b => (
              <div key={b._id} className="card card-body" style={{
                borderLeft: b.paymentStatus === 'pending_verification' ? '4px solid var(--amber)' : '4px solid var(--border)'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      {b.village?.images?.[0] && (
                        <img src={`${BASE}${b.village.images[0]}`} alt="" style={{ width: 46, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                      )}
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{b.village?.name}</h3>
                        <p style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>📍 {b.village?.district}, {b.village?.state}</p>
                      </div>
                      <span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`}>{b.status}</span>
                      <span className={`badge ${b.paymentStatus === 'paid' ? 'badge-green' : b.paymentStatus === 'pending_verification' ? 'badge-amber' : 'badge-red'}`}>
                        {b.paymentStatus === 'pending_verification' ? '⏳ Verifying payment' : b.paymentStatus}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, fontSize: '0.875rem', flexWrap: 'wrap', color: '#374151' }}>
                      <span>📅 {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}</span>
                      <span>👥 {b.guests} guest(s)</span>
                      <span>🌙 {b.totalNights} night(s)</span>
                    </div>

                    {b.host && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--gray)', marginTop: 6 }}>
                        Host: <strong>{b.host.name}</strong> · {b.host.phone}
                      </div>
                    )}

                    {/* UPI pending */}
                    {b.paymentStatus === 'pending_verification' && (
                      <div style={{ background: '#fefce8', border: '1px solid #fcd34d', borderRadius: 8, padding: 12, marginTop: 10 }}>
                        <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 600, marginBottom: 4 }}>⏳ Waiting for host to verify UPI payment</div>
                        <div style={{ fontSize: '0.82rem', color: '#78350f' }}>
                          Transaction ID: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{b.upiTransactionId}</span>
                        </div>
                        {b.upiTransactionScreenshot && (
                          <a href={`${BASE}${b.upiTransactionScreenshot}`} target="_blank" rel="noreferrer"
                            style={{ fontSize: '0.8rem', color: 'var(--green-dark)', fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
                            📷 View screenshot
                          </a>
                        )}
                        <p style={{ fontSize: '0.78rem', color: '#92400e', marginTop: 6 }}>
                          Your host will confirm within a few hours. You'll see the booking status update here.
                        </p>
                      </div>
                    )}

                    {/* UPI rejected */}
                    {b.paymentStatus === 'unpaid' && b.upiTransactionId && !b.upiVerifiedByHost && b.upiRejectionReason && (
                      <div style={{ background: 'var(--red-light)', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginTop: 10 }}>
                        <div style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 600, marginBottom: 4 }}>❌ Payment verification failed</div>
                        <div style={{ fontSize: '0.82rem', color: '#7f1d1d' }}>Reason: {b.upiRejectionReason}</div>
                        <p style={{ fontSize: '0.78rem', color: '#991b1b', marginTop: 6 }}>
                          Please contact your host or try again with the correct transaction ID.
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--green)' }}>₹{b.totalAmount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginBottom: 10 }}>
                      {b.paymentMethod === 'upi_qr' ? '📱 UPI' : b.paymentMethod === 'stripe' ? '💳 Card' : ''}
                    </div>
                    {['pending', 'confirmed'].includes(b.status) && b.paymentStatus !== 'pending_verification' && (
                      <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(b._id)}>Cancel</button>
                    )}
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
