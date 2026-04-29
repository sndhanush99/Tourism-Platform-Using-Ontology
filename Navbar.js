import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = path => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';
  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          🏡 DESI TRAVELS
        </Link>

        <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/villages" className={isActive('/villages')}>Explore</Link>
          <Link to="/marketplace" className={isActive('/marketplace')}>Marketplace</Link>
          <Link to="/route-finder" className={isActive('/route-finder')}>Safe Routes</Link>

          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ marginLeft: 4 }}>Register</Link>
            </>
          ) : user.role === 'tourist' ? (
            <>
              <Link to="/my-bookings" className={isActive('/my-bookings')}>My Trips</Link>
              <Link to="/profile" className={isActive('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 28, height: 28, background: 'var(--green-light)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-dark)' }}>
                  {user.name?.[0]?.toUpperCase()}
                </span>
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : user.role === 'host' ? (
            <>
              <Link to="/host" className={isActive('/host')}>Dashboard</Link>
              <Link to="/host/bookings" className={isActive('/host/bookings')}>Bookings</Link>
              <Link to="/profile" className={isActive('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 28, height: 28, background: 'var(--green-light)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-dark)' }}>
                  {user.name?.[0]?.toUpperCase()}
                </span>
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : user.role === 'admin' ? (
            <>
              <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
              <Link to="/admin/villages" className={isActive('/admin/villages')}>Villages</Link>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
