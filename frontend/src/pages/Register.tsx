import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { Sun, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { username, password });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <p style={{ opacity: 0.8, fontSize: '14px', marginTop: '5px' }}>Admin Registration</p>
        </div>

        {error && <div style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(0, 166, 81, 0.2)', color: '#00A651', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label><UserIcon size={14} style={{ marginRight: '5px' }} /> Username</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Pick a username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Lock size={14} style={{ marginRight: '5px' }} /> Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><Lock size={14} style={{ marginRight: '5px' }} /> Confirm Password</label>
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
            {loading ? <Loader2 className="animate-spin" /> : 'Register Admin'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
