import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal'
];

// ── Reusable photo grid ────────────────────────────────────────────────────
function PhotoGrid({ images, onAdd, onRemove, label, hint, uploading }) {
  const ref = useRef();
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    onAdd(files);
    e.target.value = '';
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => ref.current?.click()}
        style={{
          border: '2px dashed var(--border)', borderRadius: 10,
          padding: images.length ? '14px 16px' : '28px 16px',
          cursor: 'pointer', background: 'var(--gray-light)',
          transition: 'border-color 0.2s, background 0.2s',
          textAlign: images.length ? 'left' : 'center'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = '#f0fdf4'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--gray-light)'; }}
      >
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: images.length ? 'flex-start' : 'center' }}>
            <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
            <span style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>Uploading photos...</span>
          </div>
        ) : images.length ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.1rem' }}>📷</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--green-dark)', fontWeight: 600 }}>{images.length} photo{images.length > 1 ? 's' : ''} added</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>· click to add more</span>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>📷</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{hint || 'Click to select photos · JPG, PNG · up to 50MB each'}</p>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />

      {/* Photo grid */}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'visible' }}>
              <img
                src={`${BASE}${img}`}
                alt={`photo-${i}`}
                style={{ width: 100, height: 76, objectFit: 'cover', borderRadius: 8, border: '2px solid #86efac', display: 'block' }}
              />
              {i === 0 && (
                <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(22,163,74,0.85)', color: 'white', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>
                  COVER
                </span>
              )}
              <button
                onClick={() => onRemove(i)}
                style={{
                  position: 'absolute', top: -7, right: -7,
                  width: 22, height: 22, background: '#dc2626', border: '2px solid white',
                  borderRadius: '50%', color: 'white', fontSize: '0.7rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, padding: 0
                }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── QR upload box ─────────────────────────────────────────────────────────
function QrBox({ qrUrl, onUpload, uploading }) {
  const ref = useRef();
  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        style={{
          border: `2px dashed ${qrUrl ? 'var(--green)' : 'var(--border)'}`,
          borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer',
          background: qrUrl ? 'var(--green-light)' : 'var(--gray-light)', transition: 'all 0.2s'
        }}
      >
        {uploading ? (
          <><div className="spinner" style={{ margin: '0 auto 8px', width: 28, height: 28, borderWidth: 2 }} /><p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Uploading QR code...</p></>
        ) : qrUrl ? (
          <>
            <img src={`${BASE}${qrUrl}`} alt="QR" style={{ height: 160, maxWidth: '100%', borderRadius: 10, marginBottom: 10, border: '2px solid white', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--green-dark)', fontWeight: 600 }}>✓ QR code uploaded — click to change</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔳</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Upload your UPI QR Code</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Screenshot from PhonePe, GPay, Paytm, or any UPI app</p>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) onUpload(e.target.files[0]); e.target.value = ''; }} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AddVillage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(''); // tracks which upload is in progress

  const [form, setForm] = useState({
    name: '', description: '', state: '', district: '', pincode: '',
    safetyInfo: '', nearestHospital: '', nearestPoliceStation: '',
    localFood: '', languages: '', upiId: '',
    images: [],          // village photos
    paymentQrCode: '',
    stayOptions: [{
      title: '', description: '', pricePerNight: '', maxGuests: 2,
      amenities: '', images: []   // stay-specific photos
    }],
    activities: [{ name: '', description: '', price: 0 }],
    festivals: [{ name: '', month: '', description: '' }],
  });

  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const updateStay = (idx, field, val) => {
    const copy = [...form.stayOptions];
    copy[idx] = { ...copy[idx], [field]: val };
    setForm(p => ({ ...p, stayOptions: copy }));
  };

  const updateArr = (arr, idx, field, val) => {
    const copy = [...form[arr]];
    copy[idx] = { ...copy[idx], [field]: val };
    setForm(p => ({ ...p, [arr]: copy }));
  };

  const addRow = (arr, tpl) => setForm(p => ({ ...p, [arr]: [...p[arr], tpl] }));
  const removeRow = (arr, idx) => setForm(p => ({ ...p, [arr]: p[arr].filter((_, i) => i !== idx) }));

  // Upload village photos
  const uploadVillagePhotos = async (files) => {
    setUploading('village');
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const data = await api.post('/uploads/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(p => ({ ...p, images: [...p.images, ...data.urls] }));
    } catch { alert('Village photo upload failed'); }
    setUploading('');
  };

  // Upload stay option photos
  const uploadStayPhotos = async (idx, files) => {
    setUploading(`stay-${idx}`);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const data = await api.post('/uploads/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const copy = [...form.stayOptions];
      copy[idx] = { ...copy[idx], images: [...(copy[idx].images || []), ...data.urls] };
      setForm(p => ({ ...p, stayOptions: copy }));
    } catch { alert('Stay photo upload failed'); }
    setUploading('');
  };

  // Upload QR code
  const uploadQr = async (file) => {
    setUploading('qr');
    try {
      const fd = new FormData(); fd.append('qrcode', file);
      const data = await api.post('/uploads/qrcode', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(p => ({ ...p, paymentQrCode: data.url }));
    } catch { alert('QR upload failed'); }
    setUploading('');
  };

  const removeVillagePhoto = (i) => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }));
  const removeStayPhoto = (stayIdx, photoIdx) => {
    const copy = [...form.stayOptions];
    copy[stayIdx] = { ...copy[stayIdx], images: copy[stayIdx].images.filter((_, j) => j !== photoIdx) };
    setForm(p => ({ ...p, stayOptions: copy }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.state || !form.district || !form.description) {
      setError('Please fill in name, state, district and description'); setStep(1); return;
    }
    setSubmitting(true); setError('');
    try {
      const payload = {
        ...form,
        localFood: form.localFood.split(',').map(s => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        stayOptions: form.stayOptions
          .filter(s => s.title)
          .map(s => ({
            ...s,
            pricePerNight: Number(s.pricePerNight),
            amenities: typeof s.amenities === 'string'
              ? s.amenities.split(',').map(a => a.trim()).filter(Boolean)
              : s.amenities,
          })),
        activities: form.activities.filter(a => a.name),
        festivals: form.festivals.filter(f => f.name),
      };
      await api.post('/villages', payload);
      navigate('/host/villages');
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const STEPS = ['Basic Info', 'Village Photos', 'Stay Options', 'Activities', 'Payment QR', 'Safety'];

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px', maxWidth: 700 }}>
        <button onClick={() => navigate('/host/villages')} className="btn btn-outline btn-sm mb-2">← Back</button>
        <h1 className="section-title">Add Your Village 🏡</h1>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, cursor: i + 1 < step ? 'pointer' : 'default' }} onClick={() => i + 1 < step && setStep(i + 1)}>
              <div style={{ height: 4, borderRadius: 2, marginBottom: 5, transition: 'background 0.3s', background: i + 1 <= step ? 'var(--green)' : 'var(--border)' }} />
              <div style={{ fontSize: '0.68rem', textAlign: 'center', fontWeight: i + 1 === step ? 700 : 400, color: i + 1 === step ? 'var(--green)' : 'var(--gray)' }}>{s}</div>
            </div>
          ))}
        </div>

        <div className="card card-body">
          {error && <div className="alert alert-error">{error}</div>}

          {/* ── STEP 1: Basic Info ── */}
          {step === 1 && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 18 }}>Basic Information</h3>
              <div className="form-group">
                <label className="form-label">Village Name *</label>
                <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. Kumarakom Backwater Village" />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" rows={4} value={form.description} onChange={set('description')} placeholder="Describe your village — its scenery, culture, warmth, and what makes it special for travelers..." />
              </div>
              <div className="grid grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <select className="form-select" value={form.state} onChange={set('state')}>
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District *</label>
                  <input className="form-input" value={form.district} onChange={set('district')} placeholder="e.g. Kottayam" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-input" value={form.pincode} onChange={set('pincode')} placeholder="686563" style={{ maxWidth: 160 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Local Food (comma separated)</label>
                <input className="form-input" value={form.localFood} onChange={set('localFood')} placeholder="Appam, Fish Curry, Puttu, Karimeen" />
              </div>
              <div className="form-group">
                <label className="form-label">Languages Spoken (comma separated)</label>
                <input className="form-input" value={form.languages} onChange={set('languages')} placeholder="Malayalam, English, Hindi" />
              </div>
            </>
          )}

          {/* ── STEP 2: Village Photos ── */}
          {step === 2 && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Village Photos</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: 18 }}>
                Upload photos of your village — landscapes, common areas, food, festivals, surroundings.
                The <strong>first photo</strong> will be the cover image shown in search results.
              </p>

              <PhotoGrid
                images={form.images}
                onAdd={uploadVillagePhotos}
                onRemove={removeVillagePhoto}
                uploading={uploading === 'village'}
                label="Upload Village Photos"
                hint="Select multiple at once · First photo = cover image"
              />

              {form.images.length === 0 && (
                <div className="alert alert-info" style={{ marginTop: 16 }}>
                  💡 Villages with 5+ photos receive <strong>3× more bookings</strong>. Try to include photos of the surroundings, food, and activities.
                </div>
              )}
            </>
          )}

          {/* ── STEP 3: Stay Options ── */}
          {step === 3 && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Stay Options</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: 18 }}>
                Add each type of accommodation you offer. Upload <strong>room / stay photos</strong> for each option so tourists know exactly what to expect.
              </p>

              {form.stayOptions.map((stay, i) => (
                <div key={i} style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 18, background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#111' }}>
                      {stay.title || `Stay Option ${i + 1}`}
                    </h4>
                    {i > 0 && (
                      <button onClick={() => removeRow('stayOptions', i)} className="btn btn-danger btn-sm">Remove</button>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" value={stay.title} onChange={e => updateStay(i, 'title', e.target.value)} placeholder="e.g. Traditional Mud House Room" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" rows={2} value={stay.description} onChange={e => updateStay(i, 'description', e.target.value)} placeholder="Describe the room — size, view, feel, what guests love about it..." />
                  </div>
                  <div className="grid grid-2" style={{ gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Price per Night (₹) *</label>
                      <input className="form-input" type="number" min={0} value={stay.pricePerNight} onChange={e => updateStay(i, 'pricePerNight', e.target.value)} placeholder="800" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max Guests</label>
                      <input className="form-input" type="number" min={1} max={20} value={stay.maxGuests} onChange={e => updateStay(i, 'maxGuests', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amenities (comma separated)</label>
                    <input className="form-input" value={stay.amenities} onChange={e => updateStay(i, 'amenities', e.target.value)} placeholder="Home-cooked meals, Hot water, WiFi, Guided village walk" />
                  </div>

                  {/* Stay-specific photos */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Room / Stay Photos
                      <span style={{ fontWeight: 400, color: 'var(--gray)', marginLeft: 6 }}>— show tourists exactly what they're booking</span>
                    </label>
                    <PhotoGrid
                      images={stay.images || []}
                      onAdd={files => uploadStayPhotos(i, files)}
                      onRemove={photoIdx => removeStayPhoto(i, photoIdx)}
                      uploading={uploading === `stay-${i}`}
                      label={`Upload photos for "${stay.title || 'this stay'}"`}
                      hint="Bed, bathroom, view from window, common area..."
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => addRow('stayOptions', { title: '', description: '', pricePerNight: '', maxGuests: 2, amenities: '', images: [] })}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                + Add Another Stay Option
              </button>
            </>
          )}

          {/* ── STEP 4: Activities & Festivals ── */}
          {step === 4 && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Activities</h3>
              {form.activities.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input className="form-input" style={{ flex: '2 1 130px' }} value={a.name} onChange={e => updateArr('activities', i, 'name', e.target.value)} placeholder="Activity name" />
                  <input className="form-input" style={{ flex: '3 1 160px' }} value={a.description} onChange={e => updateArr('activities', i, 'description', e.target.value)} placeholder="Short description" />
                  <input className="form-input" style={{ flex: '0 0 90px' }} type="number" value={a.price} onChange={e => updateArr('activities', i, 'price', e.target.value)} placeholder="₹ Price" />
                  {i > 0 && <button onClick={() => removeRow('activities', i)} className="btn btn-danger btn-sm">✕</button>}
                </div>
              ))}
              <button onClick={() => addRow('activities', { name: '', description: '', price: 0 })} className="btn btn-outline btn-sm mb-3">+ Add Activity</button>

              <h3 style={{ fontWeight: 700, margin: '20px 0 16px' }}>Festivals</h3>
              {form.festivals.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                  <input className="form-input" value={f.name} onChange={e => updateArr('festivals', i, 'name', e.target.value)} placeholder="Festival name" />
                  <input className="form-input" style={{ maxWidth: 140 }} value={f.month} onChange={e => updateArr('festivals', i, 'month', e.target.value)} placeholder="Month e.g. October" />
                  {i > 0 && <button onClick={() => removeRow('festivals', i)} className="btn btn-danger btn-sm">✕</button>}
                </div>
              ))}
              <button onClick={() => addRow('festivals', { name: '', month: '', description: '' })} className="btn btn-outline btn-sm">+ Add Festival</button>
            </>
          )}

          {/* ── STEP 5: Payment QR ── */}
          {step === 5 && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Payment Setup 💳</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: 20 }}>
                Upload your UPI QR code so tourists can pay you directly. After scanning, tourists enter their transaction ID and you verify it before confirming.
              </p>
              <div className="form-group">
                <label className="form-label">UPI ID <span style={{ fontWeight: 400, color: 'var(--gray)' }}>(shown as text fallback)</span></label>
                <input className="form-input" value={form.upiId} onChange={set('upiId')} placeholder="e.g. rajan@paytm or 9876543210@ybl" style={{ maxWidth: 320 }} />
              </div>
              <div className="form-group">
                <label className="form-label">UPI QR Code Photo *</label>
                <QrBox qrUrl={form.paymentQrCode} onUpload={uploadQr} uploading={uploading === 'qr'} />
              </div>
              <div className="alert alert-info" style={{ marginTop: 16 }}>
                <strong>How it works:</strong><br />
                1. Tourist scans your QR → pays in their UPI app<br />
                2. Tourist enters Transaction ID on the booking page<br />
                3. You see a <em>"Verify UPI"</em> alert in your Bookings tab<br />
                4. You confirm receipt → booking is confirmed ✓
              </div>
            </>
          )}

          {/* ── STEP 6: Safety ── */}
          {step === 6 && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Safety Information</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: 18 }}>Helps solo travelers and families feel confident. Displayed on your village page.</p>
              <div className="form-group">
                <label className="form-label">Safety Notes</label>
                <textarea className="form-textarea" rows={3} value={form.safetyInfo} onChange={set('safetyInfo')} placeholder="e.g. Village is well-lit at night. Host available 24/7. Suitable for solo women travelers." />
              </div>
              <div className="form-group">
                <label className="form-label">Nearest Hospital</label>
                <input className="form-input" value={form.nearestHospital} onChange={set('nearestHospital')} placeholder="e.g. Kottayam Medical College, 12 km" />
              </div>
              <div className="form-group">
                <label className="form-label">Nearest Police Station</label>
                <input className="form-input" value={form.nearestPoliceStation} onChange={set('nearestPoliceStation')} placeholder="e.g. Kumarakom Police Station, 3 km" />
              </div>
              <div className="alert alert-success" style={{ marginTop: 16 }}>
                ✓ Your village will be reviewed by our admin team within 24–48 hours before going live.
              </div>
            </>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            {step > 1
              ? <button className="btn btn-outline" onClick={() => { setStep(s => s - 1); setError(''); }}>← Back</button>
              : <div />
            }
            {step < 6
              ? <button className="btn btn-primary" onClick={() => { setError(''); setStep(s => s + 1); }}>Next →</button>
              : <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : '✓ Submit Village for Review'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
