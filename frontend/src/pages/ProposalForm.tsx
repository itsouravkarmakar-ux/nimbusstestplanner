import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
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
    companyName: '',
    address: '',
    proposalRef: `NSS/26-27/${Math.floor(Math.random() * 10000)}/01`,
    date: new Date().toISOString().split('T')[0],
    location: '',
    capacity: '',
    installationType: 'TopCon',
    moduleWp: '580',
    structureType: [] as string[],
    enableOpex: false,
    perKwpCost: 0,
    gstPercentage: 18,
    projectCost: 0,
    carbonFootprint: 0,
    moduleTech: 'TOPCON high efficiency Solar PV Module (Each module capacity >585 Wp)',
    completionTime: '',
    bom: [
      { item: 'Solar PV Module', description: 'WAAREE/Vikram/ Equivalent ALMM Approved | Tier 1 Make', quantity: '1', unit: 'Lot', included: true },
      { item: 'Module Mounting Structure', description: 'Anodized Aluminium Long Rail', quantity: '1', unit: 'Lot', included: true },
      { item: 'PV Array Junction Box (inbuilt with inverter)', description: 'Growwatt / Sungrow', quantity: '1', unit: 'Lot', included: true },
      { item: 'PV String Inverter -3 440V', description: 'Growwatt / Sungrow', quantity: '1', unit: 'Lot', included: true },
      { item: 'Inverter Combiner LT Panel (ACDB)', description: 'ABB / L&T/ Schneider', quantity: '1', unit: 'Lot', included: true },
      { item: 'DC Cable (Cu, Double Insulated)', description: 'Polycab', quantity: '1', unit: 'Lot', included: true },
      { item: 'AC Cable (Al armoured)', description: 'Polycab', quantity: '1', unit: 'Lot', included: true },
      { item: 'Earth Cable (Cu-Green)', description: 'Polycab', quantity: '1', unit: 'Lot', included: true },
      { item: 'Grid LT Panel', description: 'ABB / L&T/ Schneider', quantity: '1', unit: 'Lot', included: true },
      { item: 'Lightening Arrestor', description: 'True Power/Remedies/SG Power', quantity: '1', unit: 'Lot', included: true },
      { item: 'Earthing System & Protection', description: 'True Power/Remedies/SG Power', quantity: '1', unit: 'Lot', included: true },
      { item: 'Signage & Schematic Diagram', description: 'Nimbus', quantity: '1', unit: 'Lot', included: true },
      { item: 'Manual Type PV Array Cleaning Arrangement', description: 'Pipe: PVC/UPVC, Make: Oriplast/Prince/Across', quantity: '1', unit: 'Lot', included: true },
      { item: 'FRP Walkway (272 mm)', description: 'Technofab/Equivalent', quantity: '1', unit: 'Lot', included: true },
      { item: 'Fire Extinguisher', description: 'Ultrafire/Reputed Make', quantity: '1', unit: 'Lot', included: true }
    ],
    commercials: [
      { milestone: 'Advance', percentage: 10, description: 'Against order confirmation' },
      { milestone: 'Delivery', percentage: 30, description: 'Against delivery of panels' },
      { milestone: 'Installation', percentage: 50, description: 'During installation phase' },
      { milestone: 'Final', percentage: 10, description: 'After commissioning' }
    ],
    paymentTerms: [
      { milestone: 'Advance', percentage: 0 },
      { milestone: 'Approved of Design drawing', percentage: 0 },
      { milestone: 'Delivery of Solar Module', percentage: 0 },
      { milestone: 'Delivery of Inverter', percentage: 0 },
      { milestone: 'Delivery of Bos', percentage: 0 },
      { milestone: 'After Commissioning', percentage: 0 },
    ],
    opexDetails: '',
    opexCompanyName: '',
    opexSystemSize: 0,
    opexRate: 0,
    opexCarbonRate: 0,
    feasibilityDetails: '',
    feasibilitySystemSize: 0,
    feasibilityCosting: 0,
    feasibilityTariff: 0,
    feasibilityUnitGenerated: 1200,
    arrayAttachment: ''
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddItem = (field: 'bom' | 'paymentTerms' | 'commercials') => {
    let newItem;
    if (field === 'bom') {
      newItem = { item: '', description: '', quantity: '1', unit: 'Lot', included: true };
    } else if (field === 'paymentTerms') {
      newItem = { milestone: '', percentage: 0 };
    } else {
      newItem = { milestone: '', percentage: 0, description: '' };
    }
    setFormData({ ...formData, [field]: [...formData[field], newItem] } as any);
  };

  const handleRemoveItem = (field: 'bom' | 'paymentTerms' | 'commercials', index: number) => {
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

  const handleCheckboxChange = (value: string) => {
    const current = [...formData.structureType];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    setFormData({ ...formData, structureType: current });
  };

  const handlePaymentTermChange = (index: number, percentage: number) => {
    const list = [...formData.paymentTerms];
    if (list[index]) {
      list[index].percentage = percentage;
      setFormData({ ...formData, paymentTerms: list });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, arrayAttachment: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-calculate Project Cost and Carbon Footprint
  React.useEffect(() => {
    const capacity = parseFloat(formData.capacity) || 0;
    const costPerKwp = formData.perKwpCost || 0;
    const projectCost = capacity * costPerKwp;
    const carbonFootprint = capacity * 1200;
    
    setFormData(prev => ({
      ...prev,
      projectCost,
      carbonFootprint
    }));
  }, [formData.capacity, formData.perKwpCost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep('Initializing proposal data...');
    try {
      setLoadingStep('Generating high-resolution PDF pages...');
      // Sanitize numeric fields to ensure they are Numbers
      const sanitizedData = {
        ...formData,
        capacity: Number(formData.capacity) || 0,
        perKwpCost: Number(formData.perKwpCost) || 0,
        gstPercentage: Number(formData.gstPercentage) || 0,
        projectCost: Number(formData.projectCost) || 0,
        carbonFootprint: Number(formData.carbonFootprint) || 0,
        opexSystemSize: Number(formData.opexSystemSize) || 0,
        opexRate: Number(formData.opexRate) || 0,
        opexCarbonRate: Number(formData.opexCarbonRate) || 0,
        feasibilitySystemSize: Number(formData.feasibilitySystemSize) || 0,
        feasibilityCosting: Number(formData.feasibilityCosting) || 0,
        feasibilityTariff: Number(formData.feasibilityTariff) || 0,
        feasibilityUnitGenerated: Number(formData.feasibilityUnitGenerated) || 0,
      };

      const response = await api.post('/proposals', sanitizedData);
      
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
              <label>Company Name</label>
              <input type="text" name="companyName" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.companyName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Client Name</label>
              <input type="text" name="clientName" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.clientName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.address} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Location (City/Area)</label>
              <input type="text" name="location" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.location} onChange={handleChange} required />
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
              <label>System Size (KWp)</label>
              <input type="number" name="capacity" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.capacity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Type of Installation</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="radio" name="installationType" value="TopCon" checked={formData.installationType === 'TopCon'} onChange={handleChange} /> TopCon
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="radio" name="installationType" value="Mono Crystalline" checked={formData.installationType === 'Mono Crystalline'} onChange={handleChange} /> Mono Crystalline
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Module Capacity (Wp)</label>
              <select name="moduleWp" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.moduleWp} onChange={(e) => setFormData({...formData, moduleWp: e.target.value})}>
                {formData.installationType === 'TopCon' ? (
                  [580, 585, 590, 595, 600, 605, 610].map(val => <option key={val} value={val}>{val} Wp</option>)
                ) : (
                  [545, 550, 555, 560].map(val => <option key={val} value={val}>{val} Wp</option>)
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Module Technology Details (Auto-generated)</label>
              <textarea 
                className="form-input" 
                style={{ color: '#666', background: '#f1f5f9', border: '1px solid #ddd', fontSize: '13px', minHeight: '60px' }} 
                value={formData.moduleTech} 
                readOnly 
              />
            </div>
            <div className="form-group">
              <label>Estimated Completion Time (e.g. 30 Days)</label>
              <input type="text" name="completionTime" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.completionTime} onChange={handleChange} placeholder="Enter completion timeline" required />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--primary)" /> Project Calculation
            </h3>
            <div style={{ background: '#f0f9ff', padding: '25px', borderRadius: '15px', border: '1px solid #bae6fd' }}>
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>System Size:</span>
                <span>{formData.capacity} KWp</span>
              </div>
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>Cost per KWp:</span>
                <span>₹{formData.perKwpCost}</span>
              </div>
              <div className="title-underline" style={{ margin: '15px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                <span>Total Project Cost:</span>
                <span>₹{(formData.projectCost).toLocaleString()}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>* Calculated as: System Size × Per KWp Cost</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="var(--primary)" /> Bill of Materials
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Select materials to include and edit specifications</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.bom.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#f9f9f9', padding: '12px', borderRadius: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={item.included} 
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        bom: formData.bom.map((it, idx) => 
                          idx === index ? { ...it, included: e.target.checked } : it
                        )
                      });
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{item.item}</div>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ fontSize: '12px', padding: '6px 10px', background: 'white' }} 
                      value={item.description} 
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          bom: formData.bom.map((it, idx) => 
                            idx === index ? { ...it, description: e.target.value } : it
                          )
                        });
                      }}
                      placeholder="Specification / Brand"
                    />
                  </div>
                  <button type="button" onClick={() => handleRemoveItem('bom', index)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              type="button" 
              onClick={() => handleAddItem('bom')}
              style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', background: 'transparent', border: '1px dashed var(--primary)', padding: '10px', borderRadius: '10px', width: '100%', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Plus size={18} /> Add Custom Material
            </button>
          </div>
        );
      case 5:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--primary)" /> Payment Terms
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Select percentages for each milestone (Total must sum to 100%)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.paymentTerms.map((term, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#f9f9f9', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ fontSize: '14px', padding: '6px 10px', background: 'white', fontWeight: '500' }} 
                      value={term.milestone} 
                      onChange={(e) => {
                        const newList = [...formData.paymentTerms];
                        newList[index].milestone = e.target.value;
                        setFormData({ ...formData, paymentTerms: newList });
                      }}
                      placeholder="Milestone Description"
                    />
                  </div>
                  <select 
                    className="form-input" 
                    style={{ width: '100px', color: 'black', background: 'white' }} 
                    value={term.percentage}
                    onChange={(e) => handlePaymentTermChange(index, Number(e.target.value))}
                  >
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100].map(v => <option key={v} value={v}>{v}%</option>)}
                  </select>
                  <button type="button" onClick={() => handleRemoveItem('paymentTerms', index)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              type="button" 
              onClick={() => handleAddItem('paymentTerms')}
              style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', background: 'transparent', border: '1px dashed var(--primary)', padding: '10px', borderRadius: '10px', width: '100%', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Plus size={18} /> Add Custom Payment Term
            </button>

            <div style={{ marginTop: '20px', padding: '15px', borderRadius: '10px', background: formData.paymentTerms.reduce((s,t) => s+t.percentage, 0) === 100 ? '#f0fdf4' : '#fef2f2', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
              <span>Total Percentage:</span>
              <span>{formData.paymentTerms.reduce((s,t) => s+t.percentage, 0)}%</span>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="var(--primary)" /> Carbon Footprint Calculation
            </h3>
            <div style={{ background: '#ecfdf5', padding: '25px', borderRadius: '15px', border: '1px solid #a7f3d0' }}>
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>Benchmark:</span>
                <span>1 KWp = 1200 units/year</span>
              </div>
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>System Size:</span>
                <span>{formData.capacity} KWp</span>
              </div>
              <div className="title-underline" style={{ margin: '15px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700', color: '#059669' }}>
                <span>Annual Generation:</span>
                <span>{(formData.carbonFootprint).toLocaleString()} Units</span>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="var(--primary)" /> Opex Details
            </h3>
            
            <div className="form-row-responsive">
              <div className="form-group flex-1">
                <label>Company Name</label>
                <input type="text" name="opexCompanyName" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.opexCompanyName} onChange={handleChange} />
              </div>
              <div className="form-group flex-1">
                <label>System Size (kWp)</label>
                <input type="number" name="opexSystemSize" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.opexSystemSize} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row-responsive">
              <div className="form-group flex-1">
                <label>OPEX Rate (₹/Unit)</label>
                <input type="number" name="opexRate" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.opexRate} onChange={handleChange} />
              </div>
              <div className="form-group flex-1">
                <label>Opex Carbon Rate (kg CO2/Unit)</label>
                <input type="number" name="opexCarbonRate" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.opexCarbonRate} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Structure / Remarks (Optional)</label>
              <textarea name="opexDetails" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd', minHeight: '100px' }} value={formData.opexDetails} onChange={handleChange as any} placeholder="Enter any specific details about the Opex model..."></textarea>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--primary)" /> Array Layout
            </h3>
            <div className="form-group">
              <label>Upload Attachment (Image)</label>
              <div style={{ border: '2px dashed #ddd', padding: '30px', borderRadius: '15px', textAlign: 'center', cursor: 'pointer', background: '#f9f9f9' }} onClick={() => document.getElementById('array-upload')?.click()}>
                <Plus size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
                <p style={{ color: '#64748b' }}>{formData.arrayAttachment ? 'Image Selected!' : 'Click to upload array plan'}</p>
                <input id="array-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
              {formData.arrayAttachment && (
                <div style={{ marginTop: '20px', position: 'relative' }}>
                  <img src={formData.arrayAttachment} alt="Array Layout" style={{ width: '100%', borderRadius: '10px', maxHeight: '300px', objectFit: 'contain', background: '#fff' }} />
                  <button type="button" onClick={() => setFormData({...formData, arrayAttachment: ''})} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', padding: '5px', borderRadius: '50%', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          </div>
        );
      case 9:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--primary)" /> Feasibility Report
            </h3>
            
            <div className="form-row-responsive">
              <div className="form-group flex-1">
                <label>System Size (kWp)</label>
                <input type="number" name="feasibilitySystemSize" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.feasibilitySystemSize} onChange={handleChange} />
              </div>
              <div className="form-group flex-1">
                <label>Per kW Costing (₹)</label>
                <input type="number" name="feasibilityCosting" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.feasibilityCosting} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row-responsive">
              <div className="form-group flex-1">
                <label>Electric Tariffs (Current) [0-20]</label>
                <input type="number" name="feasibilityTariff" step="0.1" min="0" max="20" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.feasibilityTariff} onChange={handleChange} />
              </div>
              <div className="form-group flex-1">
                <label>Unit Generated [1000-1500]</label>
                <input type="number" name="feasibilityUnitGenerated" min="1000" max="1500" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd' }} value={formData.feasibilityUnitGenerated} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Report Summary / Notes</label>
              <textarea name="feasibilityDetails" className="form-input" style={{ color: 'black', background: '#f9f9f9', border: '1px solid #ddd', minHeight: '120px' }} value={formData.feasibilityDetails} onChange={handleChange as any} placeholder="Enter feasibility report details..."></textarea>
            </div>
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

      <div className="form-card">
        <div style={{ display: 'flex', marginBottom: '30px', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <div key={i} style={{ flex: 1, minWidth: '10px', height: '6px', background: step >= i ? 'var(--primary)' : '#eee', borderRadius: '3px', transition: 'all 0.5s ease' }}></div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '30px' }}>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ background: '#eee', color: '#666', boxShadow: 'none' }}
              onClick={() => {
                const prevStep = (step === 8 && !formData.enableOpex) ? 6 : step - 1;
                setStep(Math.max(1, prevStep));
              }}
              disabled={step === 1}
            >
              <ArrowLeft size={18} /> Previous
            </button>
            
            {step < 9 ? (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => {
                  if (step === 1 && (!formData.clientName || !formData.proposalRef || !formData.location)) {
                    return setModal({ isOpen: true, title: 'Missing Information', message: 'Please fill in Client Name, Reference, and Location before proceeding.', type: 'info' });
                  }
                  if (step === 2 && (!formData.capacity || !formData.completionTime)) {
                    return setModal({ isOpen: true, title: 'Missing Information', message: 'Please fill in System Size and Completion Time before proceeding.', type: 'info' });
                  }
                  if (step === 5) {
                    const totalPercent = formData.paymentTerms.reduce((sum, term) => sum + term.percentage, 0);
                    if (totalPercent !== 100) {
                      return setModal({ isOpen: true, title: 'Invalid Payment Terms', message: `Total percentage must be exactly 100%. Current total: ${totalPercent}%`, type: 'info' });
                    }
                  }
                  const nextStep = (step === 6 && !formData.enableOpex) ? 8 : step + 1;
                  setStep(nextStep);
                }}
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
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
