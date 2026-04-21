import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Dashboard from './pages/Dashboard.js';
import ProposalForm from './pages/ProposalForm.js';
import ResetPassword from './pages/ResetPassword.js';
import Navbar from './components/Navbar.js';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  
  return (
    <>
      <Navbar />
      <div className="main-content">
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/dashboard" 
            element={
              <AuthLayout>
                <Dashboard />
              </AuthLayout>
            } 
          />
          <Route 
            path="/new-proposal" 
            element={
              <AuthLayout>
                <ProposalForm />
              </AuthLayout>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
