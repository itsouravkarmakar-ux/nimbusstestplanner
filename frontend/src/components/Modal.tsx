import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error': return <AlertCircle size={48} color="#ef4444" />;
      case 'success': return <CheckCircle size={48} color="#10b981" />;
      default: return <Info size={48} color="var(--primary)" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{ 
        maxWidth: '400px', 
        textAlign: 'center', 
        position: 'relative',
        padding: '40px 30px',
        animation: 'modalFadeIn 0.3s ease-out'
      }}>
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: '15px', 
            right: '15px', 
            background: 'transparent', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            opacity: 0.7
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          {getIcon()}
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '15px' }}>{title}</h2>
        <p style={{ fontSize: '15px', opacity: 0.9, lineHeight: '1.6', marginBottom: '30px' }}>{message}</p>

        <button 
          className="btn-primary" 
          onClick={onClose} 
          style={{ width: '100%', minWidth: '120px' }}
        >
          OK
        </button>
      </div>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Modal;
