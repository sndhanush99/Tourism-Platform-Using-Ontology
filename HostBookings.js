import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const STATUS_BADGE = { pending: 'badge-amber', confirmed: 'badge-green', cancelled: 'badge-red', completed: 'badge-blue' };

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [verifying, setVerifying] = useState('');
  const [rejectReason, setRejectReason] = useState({});

  useEffect(() => {
    api.get('/bookings/host').then(d => { setBookings(d.bookings); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch { alert('Failed to update'); }
  };

  const verifyUpi = async (id, action) => {
    setVerifying(id + action);
    try {
      await api.post('/payments/upi-verify', {
        bookingId: id,
        action,
        rejectionReason: rejectReason[id] || ''
      });
      setBookings(prev => prev.map(b => b._id === id
        ? {
            ...b,
            paymentStatus: action === 'approve' ? 'paid' : 'unpaid',
            status: action === 'approve' ? 'confirmed' : 'pending',
            upiVerifiedByHost: action === 'approve'
          }
        : b
      ));
    } catch (err) {
      alert(err.message || 'Verification failed');
    } finally { setVerifying(''); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const pendingUpi = bookings.filter(b => b.paymentStatus === 'pending_verification').length;

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px' }}>
        <h1 className="section-title">Booking Requests 📋</h1>

        {pendingUpi > 0 && (
          <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: '1.2rem' }}>⏳</span>
            <span><strong>{pendingUpi} UPI payment{pendingUpi > 1 ? 's' : ''}</strong> waiting for your verification!</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`badge ${filter === f ? 'badge-green' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '6px 16px', textTransform: 'capitalize' }}>
              {f} ({f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length})
            </button>
          ))}
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div>
          : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
              <h3>No bookings found</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map(b => (
                <div key={b._id} className="card card-body" style={{ borderLeft: b.paymentStatus === 'pending_verification' ? '4px solid var(--amber)' : '4px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <div style={{ width: 38, height: 38, background: 'var(--green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--green-dark)' }}>
                          {b.tourist?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{b.tourist?.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>{b.tourist?.email} · {b.tourist?.phone}</div>
                        </div>
                        <span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`}>{b.status}</span>
                        <span className={`badge ${b.paymentStatus === 'paid' ? 'badge-green' : b.paymentStatus === 'pending_verification' ? 'badge-amber' : 'badge-red'}`}>
                          {b.paymentStatus === 'pending_verification' ? '⏳ Verify UPI' : b.paymentStatus}
                        </span>
                        {b.paymentMethod && <span className="badge badge-gray">{b.paymentMethod === 'upi_qr' ? '📱 UPI' : '💳 Card'}</span>}
                      </div>

                      <div style={{ display: 'flex', gap: 16, fontSize: '0.875rem', color: '#374151', flexWrap: 'wrap', marginBottom: 8 }}>
                        <span>📅 {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}</span>
                        <span>👥 {b.guests} guest(s) · {b.totalNights} night(s)</span>
                        <span>🏡 {b.stayOption?.title}</span>
                      </div>

                      {b.specialRequests && <div style={{ fontSize: '0.85rem', color: 'var(--gray)', fontStyle: 'italic', marginBottom: 8 }}>"{b.specialRequests}"</div>}

                      {/* UPI verification panel */}
                      {b.paymentStatus === 'pending_verification' && b.upiTransactionId && (
                        <div style={{ background: '#fefce8', border: '1px solid #fcd34d', borderRadius: 10, padding: 14, marginTop: 8 }}>
                          <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 8 }}>🔍 UPI Payment Verification Required</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                            <div>
                              <span style={{ fontSize: '0.78rem', color: '#78350f' }}>Transaction ID:</span>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: '#92400e', marginLeft: 6 }}>{b.upiTransactionId}</span>
                            </div>
                            {b.upiTransactionScreenshot && (
                              <a href={`${BASE}${b.upiTransactionScreenshot}`} target="_blank" rel="noreferrer"
                                className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem' }}>
                                📷 View Screenshot
                              </a>
                            )}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#78350f', marginBottom: 12 }}>
                            Check your UPI app to confirm you received ₹{b.totalAmount} with this transaction ID, then approve or reject.
                          </p>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => verifyUpi(b._id, 'approve')}
                              disabled={verifying === b._id + 'approve'}>
                              ✓ Payment Received — Confirm Booking
                            </button>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input
                                className="form-input"
                                style={{ padding: '6px 10px', fontSize: '0.8rem', width: 200 }}
                                placeholder="Rejection reason..."
                                value={rejectReason[b._id] || ''}
                                onChange={e => setRejectReason(prev => ({ ...prev, [b._id]: e.target.value }))}
                              />
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => verifyUpi(b._id, 'reject')}
                                disabled={verifying === b._id + 'reject'}>
                                ✗ Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                      <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--green)' }}>₹{b.hostEarnings || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginBottom: 12 }}>Your earnings</div>
                      {b.status === 'pending' && b.paymentStatus !== 'pending_verification' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => updateStatus(b._id, 'confirmed')}>✓ Confirm</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(b._id, 'cancelled')}>✗ Decline</button>
                        </div>
                      )}
                      {b.status === 'confirmed' && (
                        <button className="btn btn-sm" style={{ background: 'var(--blue)', color: 'white' }}
                          onClick={() => updateStatus(b._id, 'completed')}>Mark Complete</button>
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
