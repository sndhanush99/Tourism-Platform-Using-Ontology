import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
function PhotoGrid({ images, onAdd, onRemove, uploading, label, hint }) {
  const ref = useRef();
  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        style={{
          border: '2px dashed var(--border)', borderRadius: 10,
          padding: images.length ? '12px 14px' : '22px 14px',
          cursor: 'pointer', background: 'var(--gray-light)', transition: 'all 0.2s',
          textAlign: images.length ? 'left' : 'center'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = '#f0fdf4'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--gray-light)'; }}
      >
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: images.length ? 'flex-start' : 'center' }}>
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--gray)' }}>Uploading...</span>
          </div>
        ) : images.length ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📷</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--green-dark)' }}>{images.length} photo{images.length > 1 ? 's' : ''}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>· click to add more</span>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>📷</div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>{hint}</p>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { if (e.target.files.length) onAdd(Array.from(e.target.files)); e.target.value = ''; }} />

      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={`${BASE}${img}`} alt="" style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, border: i === 0 ? '2px solid var(--green)' : '2px solid #e5e7eb', display: 'block' }} />
              {i === 0 && <span style={{ position: 'absolute', bottom: 3, left: 3, background: 'rgba(22,163,74,0.85)', color: 'white', fontSize: '0.58rem', fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>COVER</span>}
              <button onClick={() => onRemove(i)} style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, background: '#dc2626', border: '2px solid white', borderRadius: '50%', color: 'white', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditVillage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const qrRef = useRef();

  const [form, setForm] = useState({
    name: '', description: '', state: '', district: '', pincode: '',
    safetyInfo: '', nearestHospital: '', nearestPoliceStation: '',
    localFood: '', languages: '', upiId: '',
    images: [], paymentQrCode: '',
    stayOptions: [{ title: '', description: '', pricePerNight: '', maxGuests: 2, amenities: '', images: [] }],
    activities: [{ name: '', description: '', price: 0 }],
    festivals: [{ name: '', month: '', description: '' }],
  });

  useEffect(() => {
    api.get(`/villages/${id}`).then(d => {
      const v = d.village;
      setForm({
        name: v.name || '', description: v.description || '',
        state: v.state || '', district: v.district || '', pincode: v.pincode || '',
        safetyInfo: v.safetyInfo || '', nearestHospital: v.nearestHospital || '',
        nearestPoliceStation: v.nearestPoliceStation || '',
        localFood: v.localFood?.join(', ') || '', languages: v.languages?.join(', ') || '',
        upiId: v.upiId || '', images: v.images || [], paymentQrCode: v.paymentQrCode || '',
        stayOptions: v.stayOptions?.length > 0
          ? v.stayOptions.map(s => ({ ...s, amenities: s.amenities?.join(', ') || '', images: s.images || [] }))
          : [{ title: '', description: '', pricePerNight: '', maxGuests: 2, amenities: '', images: [] }],
        activities: v.activities?.length > 0 ? v.activities : [{ name: '', description: '', price: 0 }],
        festivals: v.festivals?.length > 0 ? v.festivals : [{ name: '', month: '', description: '' }],
      });
      setLoading(false);
    }).catch(() => { setError('Could not load village'); setLoading(false); });
  }, [id]);

  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const updateStay = (idx, field, val) => {
    const c = [...form.stayOptions]; c[idx] = { ...c[idx], [field]: val };
    setForm(p => ({ ...p, stayOptions: c }));
  };

  const updateArr = (arr, idx, field, val) => {
    const c = [...form[arr]]; c[idx] = { ...c[idx], [field]: val };
    setForm(p => ({ ...p, [arr]: c }));
  };

  const addRow = (arr, tpl) => setForm(p => ({ ...p, [arr]: [...p[arr], tpl] }));
  const removeRow = (arr, idx) => setForm(p => ({ ...p, [arr]: p[arr].filter((_, i) => i !== idx) }));

  const uploadVillagePhotos = async (files) => {
    setUploading('village');
    try {
      const fd = new FormData(); files.forEach(f => fd.append('images', f));
      const data = await api.post('/uploads/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(p => ({ ...p, images: [...p.images, ...data.urls] }));
    } catch { alert('Upload failed'); }
    setUploading('');
  };

  const uploadStayPhotos = async (idx, files) => {
    setUploading(`stay-${idx}`);
    try {
      const fd = new FormData(); files.forEach(f => fd.append('images', f));
      const data = await api.post('/uploads/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const c = [...form.stayOptions];
      c[idx] = { ...c[idx], images: [...(c[idx].images || []), ...data.urls] };
      setForm(p => ({ ...p, stayOptions: c }));
    } catch { alert('Upload failed'); }
    setUploading('');
  };

  const uploadQr = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading('qr');
    try {
      const fd = new FormData(); fd.append('qrcode', file);
      const data = await api.post('/uploads/qrcode', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(p => ({ ...p, paymentQrCode: data.url }));
    } catch { alert('QR upload failed'); }
    setUploading('');
    e.target.value = '';
  };

  const removeVillagePhoto = i => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }));
  const removeStayPhoto = (si, pi) => {
    const c = [...form.stayOptions];
    c[si] = { ...c[si], images: c[si].images.filter((_, j) => j !== pi) };
    setForm(p => ({ ...p, stayOptions: c }));
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = {
        ...form,
        localFood: form.localFood.split(',').map(s => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        stayOptions: form.stayOptions.filter(s => s.title).map(s => ({
          ...s,
          pricePerNight: Number(s.pricePerNight),
          amenities: typeof s.amenities === 'string' ? s.amenities.split(',').map(a => a.trim()).filter(Boolean) : s.amenities,
        })),
        activities: form.activities.filter(a => a.name),
        festivals: form.festivals.filter(f => f.name),
      };
      await api.put(`/villages/${id}`, payload);
      setSuccess('Village saved! ✓');
      setTimeout(() => navigate('/host/villages'), 1400);
    } catch (err) { setError(err.message || 'Save failed'); }
    setSaving(false);
  };

  const TABS = [
    { id: 'basic', label: '📋 Basic' },
    { id: 'photos', label: '📸 Village Photos' },
    { id: 'stays', label: '🛏️ Stay Options' },
    { id: 'activities', label: '🎯 Activities' },
    { id: 'payment', label: '💳 Payment QR' },
    { id: 'safety', label: '🛡️ Safety' },
  ];

  if (loading) return <div className="page loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px', maxWidth: 720 }}>
        <button onClick={() => navigate('/host/villages')} className="btn btn-outline btn-sm mb-2">← Back</button>
        <h1 className="section-title">Edit Village 🏡</h1>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 24, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: activeTab === t.id ? 700 : 400,
              color: activeTab === t.id ? 'var(--green)' : 'var(--gray)',
              borderBottom: `2px solid ${activeTab === t.id ? 'var(--green)' : 'transparent'}`,
              marginBottom: -2, transition: 'all 0.15s'
            }}>{t.label}</button>
          ))}
        </div>

        <div className="card card-body">

          {/* Basic */}
          {activeTab === 'basic' && (
            <>
              <div className="form-group"><label className="form-label">Village Name</label><input className="form-input" value={form.name} onChange={set('name')} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={4} value={form.description} onChange={set('description')} /></div>
              <div className="grid grid-2" style={{ gap: 12 }}>
                <div className="form-group"><label className="form-label">State</label>
                  <select className="form-select" value={form.state} onChange={set('state')}>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">District</label><input className="form-input" value={form.district} onChange={set('district')} /></div>
              </div>
              <div className="form-group"><label className="form-label">Local Food (comma separated)</label><input className="form-input" value={form.localFood} onChange={set('localFood')} /></div>
              <div className="form-group"><label className="form-label">Languages (comma separated)</label><input className="form-input" value={form.languages} onChange={set('languages')} /></div>
            </>
          )}

          {/* Village Photos */}
          {activeTab === 'photos' && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Village Photos</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: 16 }}>The first photo is the cover image shown in search results.</p>
              <PhotoGrid
                images={form.images}
                onAdd={uploadVillagePhotos}
                onRemove={removeVillagePhoto}
                uploading={uploading === 'village'}
                label="Add Village Photos"
                hint="Click to select · JPG, PNG"
              />
            </>
          )}

          {/* Stay Options */}
          {activeTab === 'stays' && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Stay Options & Room Photos</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: 18 }}>Add room photos to each stay option — tourists want to see exactly what they're booking.</p>

              {form.stayOptions.map((stay, i) => (
                <div key={i} style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 18, background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h4 style={{ fontWeight: 700 }}>{stay.title || `Stay Option ${i + 1}`}</h4>
                    {i > 0 && <button onClick={() => removeRow('stayOptions', i)} className="btn btn-danger btn-sm">Remove</button>}
                  </div>

                  <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={stay.title} onChange={e => updateStay(i, 'title', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={2} value={stay.description} onChange={e => updateStay(i, 'description', e.target.value)} /></div>
                  <div className="grid grid-2" style={{ gap: 12 }}>
                    <div className="form-group"><label className="form-label">Price/Night (₹)</label><input className="form-input" type="number" value={stay.pricePerNight} onChange={e => updateStay(i, 'pricePerNight', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Max Guests</label><input className="form-input" type="number" min={1} value={stay.maxGuests} onChange={e => updateStay(i, 'maxGuests', e.target.value)} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Amenities (comma separated)</label><input className="form-input" value={stay.amenities} onChange={e => updateStay(i, 'amenities', e.target.value)} /></div>

                  {/* Stay photos */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Room Photos
                      <span style={{ fontWeight: 400, color: 'var(--gray)', marginLeft: 6, fontSize: '0.8rem' }}>bed, bathroom, view, common space...</span>
                    </label>
                    <PhotoGrid
                      images={stay.images || []}
                      onAdd={files => uploadStayPhotos(i, files)}
                      onRemove={pi => removeStayPhoto(i, pi)}
                      uploading={uploading === `stay-${i}`}
                      label="Upload Room Photos"
                      hint="Show tourists exactly what to expect"
                    />
                  </div>
                </div>
              ))}
              <button onClick={() => addRow('stayOptions', { title: '', description: '', pricePerNight: '', maxGuests: 2, amenities: '', images: [] })} className="btn btn-outline" style={{ width: '100%' }}>+ Add Stay Option</button>
            </>
          )}

          {/* Activities */}
          {activeTab === 'activities' && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Activities</h3>
              {form.activities.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <input className="form-input" style={{ flex: '2 1 120px' }} value={a.name} onChange={e => updateArr('activities', i, 'name', e.target.value)} placeholder="Activity name" />
                  <input className="form-input" style={{ flex: '3 1 150px' }} value={a.description} onChange={e => updateArr('activities', i, 'description', e.target.value)} placeholder="Description" />
                  <input className="form-input" style={{ flex: '0 0 88px' }} type="number" value={a.price} onChange={e => updateArr('activities', i, 'price', e.target.value)} placeholder="₹" />
                  {i > 0 && <button onClick={() => removeRow('activities', i)} className="btn btn-danger btn-sm">✕</button>}
                </div>
              ))}
              <button onClick={() => addRow('activities', { name: '', description: '', price: 0 })} className="btn btn-outline btn-sm">+ Add Activity</button>

              <h3 style={{ fontWeight: 700, margin: '24px 0 14px' }}>Festivals</h3>
              {form.festivals.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input className="form-input" value={f.name} onChange={e => updateArr('festivals', i, 'name', e.target.value)} placeholder="Festival name" />
                  <input className="form-input" style={{ maxWidth: 130 }} value={f.month} onChange={e => updateArr('festivals', i, 'month', e.target.value)} placeholder="Month" />
                  {i > 0 && <button onClick={() => removeRow('festivals', i)} className="btn btn-danger btn-sm">✕</button>}
                </div>
              ))}
              <button onClick={() => addRow('festivals', { name: '', month: '', description: '' })} className="btn btn-outline btn-sm">+ Add Festival</button>
            </>
          )}

          {/* Payment QR */}
          {activeTab === 'payment' && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Payment QR Code 💳</h3>
              <div className="form-group">
                <label className="form-label">UPI ID</label>
                <input className="form-input" value={form.upiId} onChange={set('upiId')} placeholder="e.g. 9876543210@paytm" style={{ maxWidth: 300 }} />
              </div>
              <div className="form-group">
                <label className="form-label">UPI QR Code Photo</label>
                <div onClick={() => qrRef.current?.click()} style={{
                  border: `2px dashed ${form.paymentQrCode ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer',
                  background: form.paymentQrCode ? 'var(--green-light)' : 'var(--gray-light)'
                }}>
                  {uploading === 'qr'
                    ? <><div className="spinner" style={{ margin: '0 auto 8px', width: 26, height: 26, borderWidth: 2 }} /><p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Uploading...</p></>
                    : form.paymentQrCode
                      ? <><img src={`${BASE}${form.paymentQrCode}`} alt="QR" style={{ height: 150, borderRadius: 10, marginBottom: 8 }} /><p style={{ fontSize: '0.8rem', color: 'var(--green-dark)', fontWeight: 600 }}>✓ Uploaded — click to replace</p></>
                      : <><div style={{ fontSize: '2.5rem', marginBottom: 6 }}>🔳</div><p style={{ fontWeight: 600 }}>Upload UPI QR Code</p><p style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>Screenshot from PhonePe, GPay, Paytm...</p></>
                  }
                </div>
                <input ref={qrRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadQr} />
              </div>
            </>
          )}

          {/* Safety */}
          {activeTab === 'safety' && (
            <>
              <div className="form-group"><label className="form-label">Safety Notes</label><textarea className="form-textarea" rows={3} value={form.safetyInfo} onChange={set('safetyInfo')} /></div>
              <div className="form-group"><label className="form-label">Nearest Hospital</label><input className="form-input" value={form.nearestHospital} onChange={set('nearestHospital')} /></div>
              <div className="form-group"><label className="form-label">Nearest Police Station</label><input className="form-input" value={form.nearestPoliceStation} onChange={set('nearestPoliceStation')} /></div>
            </>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-outline" onClick={() => navigate('/host/villages')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
