import React from 'react';

interface GradientBandProps {
  children?: React.ReactNode;
  className?: string;
  heightClass?: string; // Tailwind height utility, e.g., 'h-12' or 'h-[5cm]'
  zIndex?: number; // Control stacking order; defaults to -1 to sit behind content
}

const GradientBand: React.FC<GradientBandProps> = ({ children, className = '', heightClass = 'h-[5cm]', zIndex = -1 }) => {
  return (
    <div 
      className={`fixed top-0 left-0 right-0 ${heightClass} ${className}`}
      style={{
        background: 'radial-gradient(circle at 0% 0%, #6B2AA0, #E0004D 70%)',
        overflow: 'hidden',
        padding: '2px 32px 24px',
        zIndex,
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
