import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, LogOut, FileText, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.png" alt="Nimbus Logo" style={{ height: '40px' }} />
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'white', fontWeight: '700', fontSize: '20px', letterSpacing: '0.5px' }}>
          NIMBUS <span style={{ color: 'var(--primary)' }}>SOLAR SOLUTIONS</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/new-proposal" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}>
          <FileText size={18} /> New Proposal
        </Link>
        
        <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="navbar-welcome" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Welcome,</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{username}</div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: 'white', 
              padding: '8px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Logout"
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
