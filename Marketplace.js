import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const CATEGORIES = ['All', 'handicraft', 'organic_food', 'textiles', 'pottery', 'jewellery', 'art', 'spices'];
const CATEGORY_ICONS = { handicraft: '🎨', organic_food: '🌿', textiles: '🧵', pottery: '🏺', jewellery: '💍', art: '🖼️', spices: '🌶️', other: '📦' };

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // products | services
  const [category, setCategory] = useState('All');
  const BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || '';

  useEffect(() => {
    setLoading(true);
    const params = { isService: activeTab === 'services' };
    if (category !== 'All') params.category = category;
    api.get('/marketplace', { params })
      .then(d => { setProducts(d.products); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeTab, category]);

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px' }}>
        <h1 className="section-title">Village Marketplace 🛒</h1>
        <p className="section-sub">Buy handmade products and book local services directly from villagers.</p>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>🛍️ Products</button>
          <button className={`tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>🎭 Local Services</button>
        </div>

        {/* Category filters */}
        {activeTab === 'products' && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`badge ${category === c ? 'badge-green' : 'badge-gray'}`}
                style={{ cursor: 'pointer', padding: '6px 14px', textTransform: 'capitalize' }}>
                {CATEGORY_ICONS[c] || ''} {c.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛒</div>
            <h3>No items found</h3>
          </div>
        ) : (
          <div className="grid grid-4">
            {products.map(p => (
              <div key={p._id} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ height: 160, background: 'var(--gray-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  {p.images?.[0] ? <img src={`${BASE}${p.images[0]}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : CATEGORY_ICONS[p.category] || '📦'}
                </div>
                <div className="card-body" style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</div>
                  {p.village && <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>📍 {p.village.name}, {p.village.state}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1rem' }}>₹{p.price}</span>
                    {p.isService && p.serviceDuration && <span className="badge badge-blue">{p.serviceDuration}</span>}
                    {!p.isService && <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Stock: {p.stock}</span>}
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--gray)' }}>Seller: {p.seller?.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
