import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { Sun, Lock, User as UserIcon, Loader2, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';

const ResetPassword = () => {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { username, newPassword });
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={logo} alt="Nimbus Logo" style={{ height: '80px', marginBottom: '15px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '0.5px' }}>Nimbus Solar Solutions</h1>
          <p style={{ opacity: 0.8, fontSize: '14px', marginTop: '5px' }}>Reset Admin Password</p>
        </div>

        {error && <div style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(0, 166, 81, 0.2)', color: '#00A651', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{success}</div>}

        <form onSubmit={handleReset}>
          <div className="form-group">
            <label><UserIcon size={14} style={{ marginRight: '5px' }} /> Admin Username</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Lock size={14} style={{ marginRight: '5px' }} /> New Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Lock size={14} style={{ marginRight: '5px' }} /> Confirm New Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: 0.8 }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
