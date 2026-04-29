import React from 'react';
import { Link } from 'react-router-dom';

const STATES = ['Kerala', 'Rajasthan', 'Himachal Pradesh', 'Goa', 'Uttarakhand', 'Sikkim', 'Meghalaya', 'Karnataka'];

export default function Home() {
  return (
    <div className="page" style={{ paddingTop: 64 }}>
      {/* Hero */}
      <div className="hero">
        <h1>Experience Real India 🇮🇳</h1>
        <p>Discover authentic village stays, handmade crafts, local festivals, and the warmth of rural India — directly from the villagers themselves.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/villages" className="btn btn-lg" style={{ background: 'white', color: '#15803d' }}>Explore Villages</Link>
          <Link to="/register" className="btn btn-lg btn-outline" style={{ borderColor: 'white', color: 'white' }}>Become a Host</Link>
        </div>
      </div>

      {/* Why Village State */}
      <div className="container" style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="section-title">Why DESI TRAVEL ?</h2>
          <p className="section-sub">We eliminate the middleman so villagers earn more and travelers pay less.</p>
        </div>
        <div className="grid grid-4">
          {[
            { icon: '🤝', title: 'Direct Booking', desc: 'Book directly with host families — no middlemen, no hidden fees.' },
            { icon: '🛡️', title: 'Safe Routes', desc: 'Our route finder ensures safe travel paths, especially for solo travelers.' },
            { icon: '🤖', title: 'AI Assistant', desc: 'Our RAG-powered chatbot helps you discover and plan your trip.' },
            { icon: '🌿', title: 'Eco Tourism', desc: 'Sustainable tourism that protects culture and the environment.' },
          ].map(f => (
            <div key={f.title} className="card card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Browse by state */}
      <div style={{ background: 'var(--green-light)', padding: '50px 20px' }}>
        <div className="container">
          <h2 className="section-title text-center mb-3">Browse by State</h2>
          <div className="grid grid-4">
            {STATES.map(s => (
              <Link key={s} to={`/villages?state=${s}`} className="card card-body" style={{ textAlign: 'center', fontWeight: 600, color: 'var(--green-dark)', cursor: 'pointer' }}>
                🗺️ {s}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="container" style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="section-title">How It Works</h2>
        </div>
        <div className="grid grid-3">
          {[
            { step: '1', title: 'Browse Villages', desc: 'Explore verified villages across India, filter by state, activities, or budget.' },
            { step: '2', title: 'Book Your Stay', desc: 'Select your dates, choose a stay option, and pay securely via Stripe.' },
            { step: '3', title: 'Experience India', desc: 'Arrive, enjoy authentic food, festivals, and culture with your host family.' },
          ].map(s => (
            <div key={s.step} className="card card-body" style={{ textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, background: 'var(--green)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', margin: '0 auto 16px' }}>{s.step}</div>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#111827', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Are you a village host?</h2>
        <p style={{ opacity: 0.8, marginBottom: 24 }}>Register your village and start welcoming travelers from across India and the world.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Register as Host</Link>
      </div>

      <footer style={{ background: '#1f2937', color: '#9ca3af', padding: '24px 20px', textAlign: 'center', fontSize: '0.875rem' }}>
        © 2024 DESI TRAVEL — Built with ❤️ for Rural India
      </footer>
    </div>
  );
}
