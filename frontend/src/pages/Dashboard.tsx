import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { FileText, Download, Plus, Search, Calendar, MapPin, User, LogOut, Loader2 } from 'lucide-react';
import Modal from '../components/Modal.js';

interface Proposal {
  _id: string;
  clientName: string;
  proposalRef: string;
  date: string;
  location: string;
  pdfPath: string;
}

const Dashboard = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' as 'error' | 'success' | 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await api.get('/proposals');
      setProposals(response.data);
    } catch (err) {
      console.error('Error fetching proposals', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (id: string, filename: string) => {
    setDownloadingId(id);
    try {
      const response = await api.get(`/proposals/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setModal({
        isOpen: true,
        title: 'Download Failed',
        message: 'There was an error while generating or downloading your PDF. Please try again.',
        type: 'error'
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const filteredProposals = proposals.filter(p => 
    (p.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.proposalRef || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--secondary)', fontWeight: '700' }}>Admin Dashboard</h1>
          <div className="title-underline"></div>
        </div>
        <button onClick={() => navigate('/new-proposal')} className="btn-primary">
          <Plus size={20} /> Create New Proposal
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Search color="#999" size={20} />
        <input 
          type="text" 
          placeholder="Search by client name or reference..." 
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
      ) : (
        <div className="history-grid">
          {filteredProposals.length > 0 ? filteredProposals.map(proposal => (
            <div key={proposal._id} className="proposal-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div style={{ background: 'rgba(255, 204, 0, 0.1)', padding: '10px', borderRadius: '10px' }}>
                    <FileText color="var(--primary)" size={24} />
                  </div>
                  <span className="badge badge-success">Generated</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--secondary)', marginBottom: '5px' }}>{proposal.clientName}</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Ref: {proposal.proposalRef}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
                    <MapPin size={14} color="#999" /> {proposal.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
                    <Calendar size={14} color="#999" /> {new Date(proposal.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => downloadPDF(proposal._id, (proposal.proposalRef || 'proposal').replace(/\//g, '_'))}
                disabled={downloadingId === proposal._id}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '10px', 
                  background: downloadingId === proposal._id ? '#e2e8f0' : '#f0f4f8', 
                  border: '1px solid #d1d5db', 
                  color: 'var(--secondary)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: downloadingId === proposal._id ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { if (downloadingId !== proposal._id) e.currentTarget.style.background = '#e2e8f0'; }}
                onMouseOut={(e) => { if (downloadingId !== proposal._id) e.currentTarget.style.background = '#f0f4f8'; }}
              >
                {downloadingId === proposal._id ? (
                  <><Loader2 className="animate-spin" size={16} /> Preparing...</>
                ) : (
                  <><Download size={16} /> Download PDF</>
                )}
              </button>
            </div>
          )) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: 'white', borderRadius: '20px', color: '#999' }}>
              <FileText size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
              <p>No proposals found.</p>
            </div>
          )}
        </div>
      )}
      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default Dashboard;
