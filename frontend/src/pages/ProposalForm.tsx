import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Plus, Trash2, ArrowLeft, ArrowRight, Check, Loader2, MapPin, Zap, Clock, Package, DollarSign } from 'lucide-react';
import Modal from '../components/Modal.js';

const ProposalForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' as 'error' | 'success' | 'info' });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientName: '',
    proposalRef: `NSS/26-27/${Math.floor(Math.random() * 10000)}/01`,
    date: new Date().toISOString().split('T')[0],
    location: '',
    capacity: '',
    moduleTech: 'TOPCON high efficiency Solar PV Module (Each module capacity >585 Wp)',
    completionTime: '',
    bom: [
      { item: 'Solar PV Modules', description: 'Mono-crystalline Topcon', quantity: '2200', unit: 'Nos' },
      { item: 'Grid Tied Inverters', description: '100/110/125 KW', quantity: '10', unit: 'Sets' }
    ],
    commercials: [
      { milestone: 'Advance', percentage: 10, description: 'Against order confirmation' },
      { milestone: 'Delivery', percentage: 30, description: 'Against delivery of panels' },
      { milestone: 'Installation', percentage: 50, description: 'During installation phase' },
      { milestone: 'Final', percentage: 10, description: 'After commissioning' }
    ]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddItem = (field: 'bom' | 'commercials') => {
    const newItem = field === 'bom' 
      ? { item: '', description: '', quantity: '', unit: '' }
      : { milestone: '', percentage: 0, description: '' };
    setFormData({ ...formData, [field]: [...formData[field], newItem] } as any);
  };

  const handleRemoveItem = (field: 'bom' | 'commercials', index: number) => {
    const newList = [...formData[field]];
    newList.splice(index, 1);
    setFormData({ ...formData, [field]: newList });
  };

  const handleItemChange = (field: 'bom' | 'commercials', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const list = [...formData[field]] as any[];
    const value = e.target.name === 'percentage' ? Number(e.target.value) : e.target.value;
    list[index] = { ...list[index], [e.target.name]: value };
    setFormData({ ...formData, [field]: list });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep('Initializing proposal data...');
    try {
      const token = localStorage.getItem('token');
      
      setLoadingStep('Processing professional solar template...');
      // Small artificial delay for visual feedback on the steps
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLoadingStep('Generating high-resolution PDF pages...');
      await axios.post('http://localhost:5000/api/proposals', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLoadingStep('Finalizing and saving to dashboard...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      
      let errorDetail = '';
      if (validationErrors && Array.isArray(validationErrors)) {
        errorDetail = '\nMissing/Invalid fields: ' + validationErrors.map((e: any) => e.field).join(', ');
      }
      
      setModal({
        isOpen: true,
        title: 'Submission Error',
        message: `${serverMsg || 'Creating proposal failed.'}${errorDetail}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="var(--primary)" /> Client Information
            </h3>
            <div className="form-group">
              <label>Client Name / Company</label>
              <input type="text" name="clientName" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.clientName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Proposal Reference Number</label>
              <input type="text" name="proposalRef" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.proposalRef} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.date} onChange={handleChange} required />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="var(--primary)" /> Project Details
            </h3>
            <div className="form-group">
              <label>Site Location</label>
              <input type="text" name="location" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.location} onChange={handleChange} placeholder="e.g. Kolkata, West Bengal" required />
            </div>
            <div className="form-group">
              <label>Capacity (KWp)</label>
              <input type="text" name="capacity" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.capacity} onChange={handleChange} placeholder="e.g. 1300" required />
            </div>
            <div className="form-group">
              <label>Module Technology</label>
              <input type="text" name="moduleTech" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.moduleTech} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Estimated Completion Time</label>
              <input type="text" name="completionTime" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.completionTime} onChange={handleChange} placeholder="e.g. 120 Days" required />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={20} color="var(--primary)" /> Bill of Materials</span>
              <button type="button" onClick={() => handleAddItem('bom')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}><Plus size={14} /> Add Item</button>
            </h3>
            {formData.bom.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'flex-end', background: '#f9f9f9', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px' }}>Item</label>
                  <input type="text" name="item" className="form-input" style={{ color: 'black', background: 'white', border: '1px solid #ddd', padding: '8px' }} value={item.item} onChange={(e) => handleItemChange('bom', index, e)} placeholder="Item name" />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: '12px' }}>Description</label>
                  <input type="text" name="description" className="form-input" style={{ color: 'black', background: 'white', border: '1px solid #ddd', padding: '8px' }} value={item.description} onChange={(e) => handleItemChange('bom', index, e)} placeholder="Description" />
                </div>
                <div style={{ flex: 0.5 }}>
                  <label style={{ fontSize: '12px' }}>Qty</label>
                  <input type="text" name="quantity" className="form-input" style={{ color: 'black', background: 'white', border: '1px solid #ddd', padding: '8px' }} value={item.quantity} onChange={(e) => handleItemChange('bom', index, e)} />
                </div>
                <div style={{ flex: 0.5 }}>
                  <label style={{ fontSize: '12px' }}>Unit</label>
                  <input type="text" name="unit" className="form-input" style={{ color: 'black', background: 'white', border: '1px solid #ddd', padding: '8px' }} value={item.unit} onChange={(e) => handleItemChange('bom', index, e)} />
                </div>
                <button type="button" onClick={() => handleRemoveItem('bom', index)} style={{ background: '#fee2e2', border: 'none', padding: '10px', borderRadius: '8px', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={20} color="var(--primary)" /> Commercial Terms</span>
              <button type="button" onClick={() => handleAddItem('commercials')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}><Plus size={14} /> Add Milestone</button>
            </h3>
            {formData.commercials.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'flex-end', background: '#f9f9f9', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px' }}>Milestone</label>
                  <input type="text" name="milestone" className="form-input" style={{ color: 'black', background: 'white', border: '1px solid #ddd', padding: '8px' }} value={item.milestone} onChange={(e) => handleItemChange('commercials', index, e)} placeholder="e.g. Advance" />
                </div>
                <div style={{ flex: 0.5 }}>
                  <label style={{ fontSize: '12px' }}>%</label>
                  <input type="number" name="percentage" className="form-input" style={{ color: 'black', background: 'white', border: '1px solid #ddd', padding: '8px' }} value={item.percentage} onChange={(e) => handleItemChange('commercials', index, e)} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: '12px' }}>Description</label>
                  <input type="text" name="description" className="form-input" style={{ color: 'black', background: 'white', border: '1px solid #ddd', padding: '8px' }} value={item.description} onChange={(e) => handleItemChange('commercials', index, e)} placeholder="Description" />
                </div>
                <button type="button" onClick={() => handleRemoveItem('commercials', index)} style={{ background: '#fee2e2', border: 'none', padding: '10px', borderRadius: '8px', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const totalPercentage = formData.commercials.reduce((acc, curr) => acc + Number(curr.percentage), 0);

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <Loader2 size={48} className="animate-spin" color="var(--primary)" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>Processing</h2>
            <p className="animate-pulse" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
              {loadingStep || 'Generating your proposal...'}
            </p>
            <div className="loading-step">This usually takes about 3-5 seconds</div>
          </div>
        </div>
      )}
      <div className="dashboard-container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--secondary)', fontWeight: '700' }}>New Proposal</h1>
          <div className="title-underline"></div>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', marginBottom: '40px', gap: '10px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: 1, height: '6px', background: step >= i ? 'var(--primary)' : '#eee', borderRadius: '3px', transition: 'all 0.5s ease' }}></div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '30px' }}>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ background: '#eee', color: '#666', boxShadow: 'none' }}
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              <ArrowLeft size={18} /> Previous
            </button>
            
            {step < 4 ? (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => {
                  // Basic validation for mandatory fields per step
                  if (step === 1 && (!formData.clientName || !formData.proposalRef)) {
                    return setModal({
                      isOpen: true,
                      title: 'Missing Information',
                      message: 'Please fill in Client Name and Proposal Reference before proceeding.',
                      type: 'info'
                    });
                  }
                  if (step === 2 && (!formData.location || !formData.capacity || !formData.completionTime)) {
                    return setModal({
                      isOpen: true,
                      title: 'Missing Information',
                      message: 'Please fill in Site Location, Capacity, and Completion Time before proceeding.',
                      type: 'info'
                    });
                  }
                  setStep(step + 1);
                }}
              >
                Next Step <ArrowRight size={18} />
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                {totalPercentage !== 100 && <span style={{ color: '#dc2626', fontSize: '12px' }}>Total commercials must be 100% (Current: {totalPercentage}%)</span>}
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading || totalPercentage !== 100}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Check size={18} /> Generate Proposal</>}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  </>
);
};

export default ProposalForm;
