import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../api/axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');
const BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── Stripe payment form ───────────────────────────────────────────────────
function StripeForm({ booking, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const intentData = await api.post('/payments/create-intent', { bookingId: booking._id });
      const result = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });
      if (result.error) throw new Error(result.error.message);
      await api.post('/payments/confirm', { bookingId: booking._id, paymentIntentId: result.paymentIntent.id });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handlePay}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label className="form-label">Card Details</label>
        <div style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
          <CardElement options={{ style: { base: { fontSize: '15px', fontFamily: 'Inter, sans-serif', color: '#111827' } } }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: 6 }}>🔒 Secured by Stripe · Test: 4242 4242 4242 4242 · Any date/CVV</p>
      </div>
      <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || !stripe}>
        {loading ? 'Processing payment...' : `💳 Pay ₹${booking.totalAmount}`}
      </button>
    </form>
  );
}

// ─── UPI QR payment form ───────────────────────────────────────────────────
function UpiForm({ booking, village, onSuccess }) {
  const [txnId, setTxnId] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleScreenshot = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('screenshot', file);
      const data = await api.post('/uploads/screenshot', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setScreenshot(data.url);
    } catch { alert('Screenshot upload failed'); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!txnId.trim()) { setError('Please enter your UPI Transaction ID'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post('/payments/upi-submit', {
        bookingId: booking._id,
        upiTransactionId: txnId.trim(),
        upiTransactionScreenshot: screenshot
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit transaction');
    } finally { setSubmitting(false); }
  };

  const hasQr = village?.paymentQrCode;

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Step 1 — Show QR */}
      <div style={{ background: 'var(--green-light)', border: '1.5px solid #86efac', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4, color: 'var(--green-dark)' }}>Step 1 — Scan & Pay</div>
        <p style={{ fontSize: '0.875rem', color: 'var(--green-dark)', marginBottom: 16 }}>
          Pay <strong>₹{booking.totalAmount}</strong> to the host via UPI
        </p>

        {hasQr ? (
          <div>
            <img
              src={`${BASE}${village.paymentQrCode}`}
              alt="Payment QR Code"
              style={{ height: 200, width: 200, objectFit: 'contain', borderRadius: 12, border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', margin: '0 auto', display: 'block' }}
            />
            <p style={{ fontSize: '0.8rem', color: '#166534', marginTop: 10, fontWeight: 500 }}>
              📱 Open any UPI app and scan this QR
            </p>
          </div>
        ) : (
          <div style={{ padding: 20, background: 'white', borderRadius: 10 }}>
            <div style={{ fontSize: '2rem', marginBottom: 6 }}>📵</div>
            <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>Host hasn't uploaded a QR code yet.</p>
          </div>
        )}

        {village?.upiId && (
          <div style={{ marginTop: 14, padding: '10px 16px', background: 'white', borderRadius: 8, display: 'inline-block' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray)', marginBottom: 2 }}>Or pay to UPI ID</p>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: '#111', letterSpacing: 0.5 }}>{village.upiId}</p>
          </div>
        )}
      </div>

      {/* Step 2 — Enter transaction ID */}
      <div style={{ background: '#fefce8', border: '1.5px solid #fcd34d', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4, color: '#92400e' }}>Step 2 — Enter Transaction ID</div>
        <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: 14 }}>
          After paying, find the <strong>UPI Transaction ID / Reference Number</strong> in your payment app and enter it below.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#92400e' }}>UPI Transaction ID *</label>
            <input
              className="form-input"
              value={txnId}
              onChange={e => setTxnId(e.target.value)}
              placeholder="e.g. 318910293847 or T2401011234ABC"
              style={{ fontFamily: 'monospace', letterSpacing: 1 }}
            />
            <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: 4 }}>
              📍 Find this in: PhonePe → History → Transaction Details | GPay → Payment → Transaction ID | Paytm → Passbook
            </p>
          </div>

          {/* Optional screenshot */}
          <div className="form-group">
            <label className="form-label" style={{ color: '#92400e' }}>Payment Screenshot (optional but recommended)</label>
            {screenshot ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={`${BASE}${screenshot}`} alt="screenshot" style={{ height: 60, borderRadius: 6, border: '2px solid var(--green)' }} />
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--green-dark)', fontWeight: 600 }}>✓ Screenshot uploaded</p>
                  <button type="button" onClick={() => setScreenshot('')} className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>Change</button>
                </div>
              </div>
            ) : (
              <div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="btn btn-outline btn-sm" disabled={uploading}>
                  {uploading ? 'Uploading...' : '📷 Upload Screenshot'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleScreenshot} />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting || !txnId.trim()}>
            {submitting ? 'Submitting...' : '✓ Confirm Payment Submission'}
          </button>
        </form>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--gray)', textAlign: 'center' }}>
        🔔 Host will verify your payment and confirm the booking within a few hours.
      </div>
    </div>
  );
}

// ─── Main Booking Page ─────────────────────────────────────────────────────
export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { village, stayOption } = location.state || {};

  const [form, setForm] = useState({ checkIn: '', checkOut: '', guests: 1, specialRequests: '' });
  const [payMethod, setPayMethod] = useState(''); // 'stripe' | 'upi'
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: details, 2: payment

  if (!village || !stayOption) { navigate('/villages'); return null; }

  const nights = form.checkIn && form.checkOut
    ? Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)
    : 0;
  const total = nights * stayOption.pricePerNight;
  const platformFee = Math.round(total * 0.1);

  const createBooking = async () => {
    if (nights <= 0) { setError('Please select valid dates'); return; }
    if (!payMethod) { setError('Please select a payment method'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.post('/bookings', {
        villageId: village._id,
        stayOption,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: form.guests,
        specialRequests: form.specialRequests
      });
      setBooking(data.booking);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally { setLoading(false); }
  };

  const onSuccess = () => navigate('/my-bookings', { state: { success: true, method: payMethod } });

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px', maxWidth: 620 }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm mb-2">← Back</button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Book Your Stay 🏡</h1>
        <p style={{ color: 'var(--gray)', marginBottom: 24 }}>{village.name} — {stayOption.title}</p>

        {/* Booking summary card */}
        <div style={{ background: 'var(--green-light)', border: '1px solid #86efac', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{village.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--green-dark)' }}>📍 {village.district}, {village.state}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--green-dark)', marginTop: 2 }}>{stayOption.title} · ₹{stayOption.pricePerNight}/night</div>
          </div>
          {village.images?.[0] && (
            <img src={`${BASE}${village.images[0]}`} alt="" style={{ width: 70, height: 52, objectFit: 'cover', borderRadius: 8 }} />
          )}
        </div>

        {/* STEP 1 — Booking Details */}
        {step === 1 && (
          <div className="card card-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Check In *</label>
                <input className="form-input" type="date" required
                  min={new Date().toISOString().split('T')[0]}
                  value={form.checkIn}
                  onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Check Out *</label>
                <input className="form-input" type="date" required
                  min={form.checkIn || new Date().toISOString().split('T')[0]}
                  value={form.checkOut}
                  onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Guests</label>
              <input className="form-input" type="number" min={1} max={stayOption.maxGuests}
                value={form.guests}
                onChange={e => setForm(f => ({ ...f, guests: parseInt(e.target.value) }))} />
              <p style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: 4 }}>Max {stayOption.maxGuests} guests</p>
            </div>

            <div className="form-group">
              <label className="form-label">Special Requests</label>
              <textarea className="form-textarea" rows={2}
                value={form.specialRequests}
                onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
                placeholder="Dietary needs, arrival time, accessibility requirements..." />
            </div>

            {/* Price breakdown */}
            {nights > 0 && (
              <div style={{ background: 'var(--gray-light)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}>
                  <span>₹{stayOption.pricePerNight} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span>₹{total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem', color: 'var(--gray)' }}>
                  <span>Platform fee (10%)</span>
                  <span>₹{platformFee}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                  <span>Total</span><span style={{ color: 'var(--green)' }}>₹{total}</span>
                </div>
              </div>
            )}

            {/* Payment method selector */}
            <div className="form-group">
              <label className="form-label">Choose Payment Method *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button type="button" onClick={() => setPayMethod('upi')}
                  style={{
                    padding: 14, border: `2px solid ${payMethod === 'upi' ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 10, background: payMethod === 'upi' ? 'var(--green-light)' : 'white',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                  }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>📱</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: payMethod === 'upi' ? 'var(--green-dark)' : '#111' }}>UPI / QR Code</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: 2 }}>PhonePe, GPay, Paytm</div>
                  {village.paymentQrCode && <div style={{ fontSize: '0.72rem', color: 'var(--green-dark)', marginTop: 4, fontWeight: 600 }}>✓ QR Available</div>}
                </button>

                <button type="button" onClick={() => setPayMethod('stripe')}
                  style={{
                    padding: 14, border: `2px solid ${payMethod === 'stripe' ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 10, background: payMethod === 'stripe' ? 'var(--green-light)' : 'white',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                  }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>💳</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: payMethod === 'stripe' ? 'var(--green-dark)' : '#111' }}>Card / Stripe</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: 2 }}>Visa, Mastercard, Rupay</div>
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={createBooking} disabled={loading || nights <= 0 || !payMethod}>
              {loading ? 'Creating booking...' : `Continue to Payment →`}
            </button>
          </div>
        )}

        {/* STEP 2 — Payment */}
        {step === 2 && booking && (
          <div className="card card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>
                {payMethod === 'upi' ? '📱 Pay via UPI' : '💳 Pay via Card'}
              </h3>
              <button onClick={() => setStep(1)} className="btn btn-outline btn-sm">← Change</button>
            </div>

            {/* Booking reference */}
            <div style={{ background: 'var(--gray-light)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray)' }}>Booking ID</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{booking._id?.slice(-8).toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ color: 'var(--gray)' }}>{form.checkIn} → {form.checkOut} · {nights} night{nights > 1 ? 's' : ''}</span>
                <span style={{ fontWeight: 700, color: 'var(--green)' }}>₹{total}</span>
              </div>
            </div>

            {payMethod === 'upi' ? (
              <UpiForm booking={booking} village={village} onSuccess={onSuccess} />
            ) : (
              <Elements stripe={stripePromise}>
                <StripeForm booking={booking} onSuccess={onSuccess} />
              </Elements>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
