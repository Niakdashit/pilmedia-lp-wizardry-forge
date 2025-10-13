import React from 'react';

interface CenteredWheelWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const CenteredWheelWrapper: React.FC<CenteredWheelWrapperProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`wheel-center-container ${className}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'auto',
        height: 'auto',
        zIndex: 1
      }}
    >
      {children}
    </div>
  );
};

export default CenteredWheelWrapper;