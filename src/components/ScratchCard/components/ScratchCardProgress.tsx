
import React from 'react';
import { BrandConfig } from '../types';

interface ScratchCardProgressProps {
  percentage: number;
  brandConfig?: BrandConfig;
}

export const ScratchCardProgress: React.FC<ScratchCardProgressProps> = ({
  percentage,
  brandConfig
}) => {
  return (
    <div
      className="scratch-card-progress"
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        right: '10px',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '2px',
        overflow: 'hidden',
        zIndex: 5
      }}
    >
      <div
        className="progress-bar"
        style={{
          height: '100%',
          backgroundColor: brandConfig?.primaryColor || '#4CAF50',
          borderRadius: '2px',
          transition: 'width 0.3s ease',
          width: `${Math.min(percentage, 100)}%`,
          boxShadow: `0 0 8px ${brandConfig?.primaryColor || '#4CAF50'}40`
        }}
      />
    </div>
  );
};
