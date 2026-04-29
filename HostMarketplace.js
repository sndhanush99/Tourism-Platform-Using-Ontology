import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const CATEGORIES = ['handicraft','organic_food','textiles','pottery','jewellery','art','spices','other'];

export default function HostMarketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'handicraft', price: '', stock: 1, isService: false, serviceType: '', serviceDuration: '' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/marketplace').then(d => { setProducts(d.products.filter(p => true)); setLoading(false); }).catch(() => setLoading(false));
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marketplace', { ...form, price: Number(form.price), stock: Number(form.stock) });
      setShowForm(false);
      setForm({ name: '', description: '', category: 'handicraft', price: '', stock: 1, isService: false, serviceType: '', serviceDuration: '' });
      fetchProducts();
    } catch (err) { alert(err.message || 'Failed to add product'); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await api.delete(`/marketplace/${id}`);
    setProducts(p => p.filter(x => x._id !== id));
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px' }}>
        <div className="flex-between mb-3">
          <div>
            <h1 className="section-title">My Marketplace Items 🛒</h1>
            <p className="section-sub">Sell products or offer local services to travelers</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>{showForm ? '✕ Cancel' : '+ Add Item'}</button>
        </div>

        {showForm && (
          <div className="card card-body mb-3">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Add New Item</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <button type="button" onClick={() => setForm(f => ({ ...f, isService: false }))} className={`badge ${!form.isService ? 'badge-green' : 'badge-gray'}`} style={{ cursor: 'pointer', padding: '8px 16px' }}>🛍️ Product</button>
                <button type="button" onClick={() => setForm(f => ({ ...f, isService: true }))} className={`badge ${form.isService ? 'badge-green' : 'badge-gray'}`} style={{ cursor: 'pointer', padding: '8px 16px' }}>🎭 Service</button>
              </div>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" required value={form.name} onChange={set('name')} placeholder="e.g. Handmade Pottery Bowl" /></div>
              <div className="form-group"><label className="form-label">Description *</label><textarea className="form-textarea" rows={2} required value={form.description} onChange={set('description')} /></div>
              <div className="grid grid-2" style={{ gap: 12 }}>
                {!form.isService && (
                  <div className="form-group"><label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={set('category')}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                )}
                {form.isService && (
                  <div className="form-group"><label className="form-label">Service Type</label>
                    <select className="form-select" value={form.serviceType} onChange={set('serviceType')}>
                      <option value="guide">Local Guide</option>
                      <option value="cultural_event">Cultural Event</option>
                      <option value="cooking_class">Cooking Class</option>
                      <option value="farm_tour">Farm Tour</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
                <div className="form-group"><label className="form-label">Price (₹) *</label><input className="form-input" type="number" required value={form.price} onChange={set('price')} /></div>
              </div>
              {!form.isService && <div className="form-group"><label className="form-label">Stock Quantity</label><input className="form-input" type="number" min={1} value={form.stock} onChange={set('stock')} /></div>}
              {form.isService && <div className="form-group"><label className="form-label">Duration (e.g. "2 hours", "Half day")</label><input className="form-input" value={form.serviceDuration} onChange={set('serviceDuration')} /></div>}
              <button type="submit" className="btn btn-primary">Add to Marketplace</button>
            </form>
          </div>
        )}

        {loading ? <div className="loading-center"><div className="spinner" /></div>
          : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛒</div>
              <h3>No items yet</h3>
              <p>Add handmade products or local services to earn more from travelers</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {products.map(p => (
                <div key={p._id} className="card">
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                        <span className="badge badge-gray" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{p.isService ? p.serviceType : p.category?.replace('_', ' ')}</span>
                      </div>
                      <button onClick={() => deleteProduct(p._id)} className="btn btn-danger btn-sm">✕</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray)', margin: '10px 0' }}>{p.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1.1rem' }}>₹{p.price}</span>
                      {!p.isService && <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Stock: {p.stock}</span>}
                      {p.isService && p.serviceDuration && <span className="badge badge-blue">{p.serviceDuration}</span>}
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
