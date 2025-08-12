import React from 'react';

interface GradientBandProps {
  children?: React.ReactNode;
  className?: string;
}

const GradientBand: React.FC<GradientBandProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`fixed top-0 left-0 right-0 h-[5cm] ${className}`}
      style={{
        background: 'radial-gradient(circle at 0% 0%, #b41b60, #841b60 70%)',
        borderTopLeftRadius: '28px',
        borderTopRightRadius: '28px',
        overflow: 'hidden',
        padding: '2px 32px 24px',
        zIndex: -1,
        boxShadow: '0 14px 34px rgba(0, 0, 0, 0.67)'
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        {children}
      </div>
    </div>
  );
};

export default GradientBand;
