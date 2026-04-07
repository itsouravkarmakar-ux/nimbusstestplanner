import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { Sun, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
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
          <p style={{ opacity: 0.8, fontSize: '14px', marginTop: '5px' }}>Proposal Maker Admin Login</p>
        </div>

        {error && <div style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label><UserIcon size={14} style={{ marginRight: '5px' }} /> Username</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter your username" 
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

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
        </p>
        <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px', opacity: 0.7 }}>
          <Link to="/reset-password" style={{ color: 'white', textDecoration: 'none' }}>Forgot password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
