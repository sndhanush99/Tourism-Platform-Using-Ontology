import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

const BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ── Simple lightbox ────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length); if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + images.length) % images.length); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images, onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>✕</button>
      {images.length > 1 && <>
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: '1.5rem', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer' }}>‹</button>
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: '1.5rem', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer' }}>›</button>
      </>}
      <img src={`${BASE}${images[idx]}`} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 10 }} />
      <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>{idx + 1} / {images.length}</div>
    </div>
  );
}

// ── Photo strip ────────────────────────────────────────────────────────────
function PhotoStrip({ images, onOpen }) {
  if (!images?.length) return null;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
      {images.map((img, i) => (
        <img key={i} src={`${BASE}${img}`} alt="" onClick={() => onOpen(images, i)}
          style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '1.5px solid var(--border)', transition: 'transform 0.15s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
      ))}
    </div>
  );
}

export default function VillageDetail() {
  const { id } = useParams();
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverIdx, setCoverIdx] = useState(0);
  const [lightbox, setLightbox] = useState(null); // { images, index }
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/villages/${id}`)
      .then(d => { setVillage(d.village); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page loading-center"><div className="spinner" /></div>;
  if (!village) return <div className="page flex-center"><h2>Village not found</h2></div>;

  const allVillagePhotos = village.images || [];

  return (
    <div className="page">
      {lightbox && <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}

      <div className="container" style={{ padding: '30px 20px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm mb-2">← Back</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 30, alignItems: 'start' }}>

          {/* ── LEFT ──────────────────────────────────────────────────────── */}
          <div>
            {/* Cover photo + thumbnail strip */}
            <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--gray-light)', height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, cursor: allVillagePhotos.length ? 'pointer' : 'default', position: 'relative' }}
              onClick={() => allVillagePhotos.length && setLightbox({ images: allVillagePhotos, index: coverIdx })}>
              {allVillagePhotos.length
                ? <img src={`${BASE}${allVillagePhotos[coverIdx]}`} alt={village.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '4rem' }}>🏡</span>}
              {allVillagePhotos.length > 1 && (
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: '0.8rem', padding: '3px 10px', borderRadius: 20 }}>
                  {allVillagePhotos.length} photos · click to view
                </div>
              )}
            </div>

            {/* Thumbnail row */}
            {allVillagePhotos.length > 1 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
                {allVillagePhotos.map((img, i) => (
                  <img key={i} src={`${BASE}${img}`} alt="" onClick={() => setCoverIdx(i)}
                    style={{ width: 66, height: 48, objectFit: 'cover', borderRadius: 7, cursor: 'pointer', border: i === coverIdx ? '2px solid var(--green)' : '2px solid transparent', transition: 'border-color 0.15s' }} />
                ))}
              </div>
            )}

            {/* Title + meta */}
            <div className="flex-between mb-2">
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 4 }}>{village.name}</h1>
                <p style={{ color: 'var(--gray)' }}>📍 {village.district}, {village.state}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.3rem', color: '#f59e0b' }}>⭐ {village.averageRating?.toFixed(1) || 'New'}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gray)' }}>{village.totalReviews || 0} reviews</div>
              </div>
            </div>

            <p style={{ marginBottom: 24, lineHeight: 1.8, color: '#374151' }}>{village.description}</p>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {village.languages?.map((l, i) => <span key={i} className="badge badge-blue">🗣️ {l}</span>)}
              {village.localFood?.slice(0, 4).map((f, i) => <span key={i} className="badge badge-green">🍛 {f}</span>)}
            </div>

            {/* Activities */}
            {village.activities?.length > 0 && (
              <div className="mb-3">
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🎯 Activities</h3>
                <div className="grid grid-2">
                  {village.activities.map((a, i) => (
                    <div key={i} className="card card-body" style={{ padding: 14 }}>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      {a.description && <div style={{ fontSize: '0.82rem', color: 'var(--gray)', marginTop: 2 }}>{a.description}</div>}
                      <div style={{ color: a.price > 0 ? 'var(--green)' : 'var(--gray)', fontWeight: 600, marginTop: 6, fontSize: '0.9rem' }}>
                        {a.price > 0 ? `₹${a.price}` : 'Free'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Festivals */}
            {village.festivals?.length > 0 && (
              <div className="mb-3">
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🎉 Festivals</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {village.festivals.map((f, i) => <span key={i} className="badge badge-amber">🎊 {f.name} — {f.month}</span>)}
                </div>
              </div>
            )}

            {/* Safety */}
            {(village.safetyInfo || village.nearestHospital) && (
              <div style={{ background: 'var(--blue-light)', border: '1px solid #bfdbfe', borderRadius: 12, padding: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#1d4ed8' }}>🛡️ Safety</h3>
                {village.safetyInfo && <p style={{ fontSize: '0.9rem', marginBottom: 6 }}>{village.safetyInfo}</p>}
                {village.nearestHospital && <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>🏥 {village.nearestHospital}</p>}
                {village.nearestPoliceStation && <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>👮 {village.nearestPoliceStation}</p>}
              </div>
            )}
          </div>

          {/* ── RIGHT — Booking panel ─────────────────────────────────────── */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Choose Your Stay</h3>

              {village.stayOptions?.length > 0 ? village.stayOptions.map((s, i) => (
                <div key={i} style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 14, transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

                  {/* Stay photos */}
                  {s.images?.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                      {s.images.slice(0, 4).map((img, j) => (
                        <img key={j} src={`${BASE}${img}`} alt="" onClick={() => setLightbox({ images: s.images, index: j })}
                          style={{ width: j === 0 ? 120 : 56, height: j === 0 ? 80 : 56, objectFit: 'cover', borderRadius: 7, cursor: 'pointer', border: '1.5px solid var(--border)' }} />
                      ))}
                      {s.images.length > 4 && (
                        <div onClick={() => setLightbox({ images: s.images, index: 4 })}
                          style={{ width: 56, height: 56, borderRadius: 7, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                          +{s.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ fontWeight: 700, marginBottom: 3 }}>{s.title}</div>
                  {s.description && <div style={{ fontSize: '0.82rem', color: 'var(--gray)', marginBottom: 6 }}>{s.description}</div>}
                  <div style={{ fontSize: '0.82rem', color: 'var(--gray)', marginBottom: 6 }}>👥 Up to {s.maxGuests} guests</div>

                  {s.amenities?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                      {s.amenities.map((a, k) => <span key={k} style={{ fontSize: '0.72rem', background: 'var(--green-light)', color: 'var(--green-dark)', padding: '2px 7px', borderRadius: 10 }}>✓ {a}</span>)}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--green)', fontSize: '1.15rem' }}>₹{s.pricePerNight}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--gray)' }}>/night</span>
                    </div>
                    {user?.role === 'tourist' ? (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/book/${village._id}`, { state: { village, stayOption: s } })}>
                        Book Now
                      </button>
                    ) : !user ? (
                      <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Login to Book</button>
                    ) : null}
                  </div>
                </div>
              )) : (
                <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 20 }}>Contact host for availability</p>
              )}

              {/* Host */}
              <hr className="divider" />
              <h4 style={{ fontWeight: 700, marginBottom: 10 }}>Your Host</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, background: 'var(--green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--green-dark)', fontSize: '1rem' }}>
                  {village.host?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{village.host?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Verified Host ✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
