import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, FileText, LayoutDashboard, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const username = localStorage.getItem('username') || 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Nimbus Logo" className="navbar-logo" />
          <Link to="/dashboard" className="navbar-brand">
            NIMBUS <span className="brand-suffix">SOLAR SOLUTIONS</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links-desktop">
          <Link to="/dashboard" className="nav-link">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/new-proposal" className="nav-link">
            <FileText size={18} /> New Proposal
          </Link>
          
          <div className="nav-divider"></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="navbar-welcome">
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Welcome,</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{username}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="logout-btn"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="nav-links-mobile">
          <Link to="/dashboard" className="nav-link-mobile" onClick={() => setIsMenuOpen(false)}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/new-proposal" className="nav-link-mobile" onClick={() => setIsMenuOpen(false)}>
            <FileText size={20} /> New Proposal
          </Link>
          <div className="nav-divider-mobile"></div>
          <div className="navbar-welcome-mobile">
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Logged in as</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{username}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="logout-btn-mobile"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
