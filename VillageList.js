import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const STATES = ['All', 'Kerala', 'Rajasthan', 'Himachal Pradesh', 'Goa', 'Uttarakhand', 'Sikkim', 'Meghalaya', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Gujarat'];

export default function VillageList() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedState = searchParams.get('state') || 'All';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVillages = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedState !== 'All') params.state = selectedState;
        if (search) params.search = search;
        const data = await api.get('/villages', { params });
        setVillages(data.villages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVillages();
  }, [selectedState, search]);

  const setStateFilter = (s) => {
    if (s === 'All') setSearchParams({});
    else setSearchParams({ state: s });
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: '30px 20px' }}>
        <h1 className="section-title">Explore Villages 🗺️</h1>
        <p className="section-sub">Discover {villages.length} verified village experiences across India</p>

        {/* Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input
            className="form-input"
            placeholder="Search villages, states, activities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        {/* State filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {STATES.map(s => (
            <button key={s} onClick={() => setStateFilter(s)}
              className={`badge ${selectedState === s ? 'badge-green' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '6px 14px', fontSize: '0.8rem' }}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : villages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌾</div>
            <h3>No villages found</h3>
            <p>Try a different state or search term</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {villages.map(v => (
              <div key={v._id} className="card village-card" onClick={() => navigate(`/villages/${v._id}`)}>
                <div className="village-card-img">
                  {v.images?.[0]
                    ? <img src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${v.images[0]}`} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🏡'}
                </div>
                <div className="village-card-info">
                  <div className="flex-between">
                    <h3 className="village-card-title">{v.name}</h3>
                    <span className="village-card-rating">⭐ {v.averageRating?.toFixed(1) || 'New'}</span>
                  </div>
                  <p className="village-card-location">📍 {v.district}, {v.state}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {v.description}
                  </p>
                  <div className="flex-between">
                    <span className="village-card-price">
                      {v.stayOptions?.[0] ? `₹${v.stayOptions[0].pricePerNight}/night` : 'Contact host'}
                    </span>
                    <span className="badge badge-green">Verified ✓</span>
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
