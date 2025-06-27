
import React from 'react';
import { BrandConfig } from '../types';

interface ScratchCardContentProps {
  content: React.ReactNode;
  brandConfig?: BrandConfig;
  isCompleted: boolean;
}

export const ScratchCardContent: React.FC<ScratchCardContentProps> = ({
  content,
  brandConfig,
  isCompleted
}) => {
  return (
    <div 
      className="scratch-card-content"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: brandConfig?.backgroundColor || '#ffffff',
        color: brandConfig?.textColor || '#333333',
        fontFamily: brandConfig?.fontFamily || 'Arial, sans-serif',
        transition: 'all 0.3s ease',
        transform: isCompleted ? 'scale(1.02)' : 'scale(1)',
        filter: isCompleted ? 'brightness(1.1)' : 'brightness(1)'
      }}
    >
      {content}
    </div>
  );
};
