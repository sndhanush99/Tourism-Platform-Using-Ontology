import React, { useState } from 'react';
import api from '../../api/axios';

export default function RouteFinder() {
  const [form, setForm] = useState({ origin: '', destination: '', mode: 'driving' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFind = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await api.post('/route-finder/route', form);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Could not find route. Check your Google Maps API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px', maxWidth: 800 }}>
        <h1 className="section-title">🗺️ Safe Route Finder</h1>
        <p className="section-sub">Find the safest routes to your village destination. Especially useful for solo travelers.</p>

        <div className="card card-body mb-3">
          <form onSubmit={handleFind}>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Starting Point</label>
                <input className="form-input" required placeholder="e.g. Delhi, India"
                  value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Destination Village</label>
                <input className="form-input" required placeholder="e.g. Spiti Valley, Himachal Pradesh"
                  value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Travel Mode</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['driving', 'transit', 'walking'].map(m => (
                  <button key={m} type="button"
                    onClick={() => setForm(f => ({ ...f, mode: m }))}
                    className={`badge ${form.mode === m ? 'badge-green' : 'badge-gray'}`}
                    style={{ cursor: 'pointer', padding: '8px 16px', textTransform: 'capitalize' }}>
                    {m === 'driving' ? '🚗' : m === 'transit' ? '🚌' : '🚶'} {m}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Finding safe routes...' : '🔍 Find Safe Routes'}
            </button>
          </form>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {result && (
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 16 }}>
              {result.routes.length} Route{result.routes.length > 1 ? 's' : ''} Found
            </h2>

            {result.routes.map((route, i) => (
              <div key={i} className="card card-body mb-2" style={{ borderLeft: i === 0 ? '4px solid var(--green)' : '4px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontWeight: 600 }}>Route {i + 1}: {route.summary}</h3>
                      {i === 0 && <span className="badge badge-green">Recommended ✓</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.9rem', color: 'var(--gray)' }}>
                      <span>📏 {route.distance}</span>
                      <span>⏱️ {route.duration}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: route.safetyScore >= 85 ? 'var(--green)' : 'var(--amber)', fontSize: '1.2rem' }}>
                      {route.safetyScore}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Safety score</div>
                  </div>
                </div>

                {/* Safety tips */}
                <div style={{ background: 'var(--green-light)', borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6, fontSize: '0.875rem', color: 'var(--green-dark)' }}>🛡️ Safety Tips</div>
                  <ul style={{ paddingLeft: 18, fontSize: '0.85rem', color: 'var(--green-dark)' }}>
                    {route.safetyTips.map((tip, j) => <li key={j}>{tip}</li>)}
                  </ul>
                </div>

                {/* Steps preview */}
                <details>
                  <summary style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray)' }}>
                    View turn-by-turn directions ({route.steps.length} steps)
                  </summary>
                  <ol style={{ paddingLeft: 20, marginTop: 10 }}>
                    {route.steps.map((step, j) => (
                      <li key={j} style={{ fontSize: '0.85rem', color: '#374151', marginBottom: 6, lineHeight: 1.5 }}>
                        {step.instruction} <span style={{ color: 'var(--gray)' }}>({step.distance})</span>
                      </li>
                    ))}
                  </ol>
                </details>
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="card card-body" style={{ background: 'var(--amber-light)', border: '1px solid #fcd34d', marginTop: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8, color: '#92400e' }}>💡 Solo Traveler Tips</h3>
          <ul style={{ paddingLeft: 18, fontSize: '0.9rem', color: '#78350f' }}>
            <li>Always share your live location with a trusted contact</li>
            <li>Carry emergency contacts: Police 100, Ambulance 108, Women's Helpline 1091</li>
            <li>Avoid travelling on unfamiliar roads after dark</li>
            <li>Book verified Village State hosts — they go through identity checks</li>
            <li>Keep 20% extra battery charge before heading to remote areas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
