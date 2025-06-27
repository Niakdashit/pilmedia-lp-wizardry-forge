
import React from 'react';
import { ScratchCardState, BrandConfig } from '../types';

interface ScratchCardOverlayProps {
  state: ScratchCardState;
  disabled: boolean;
  brandConfig?: BrandConfig;
  animationDuration: number;
}

export const ScratchCardOverlay: React.FC<ScratchCardOverlayProps> = ({
  state,
  disabled,
  brandConfig,
  animationDuration
}) => {
  if (!disabled && !state.isCompleted) return null;

  return (
    <div
      className="scratch-card-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: disabled ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: `all ${animationDuration}ms ease`,
        zIndex: 10,
        pointerEvents: disabled ? 'auto' : 'none'
      }}
    >
      {disabled && (
        <div className="text-center">
          <div className="mb-2">🔒</div>
          <div>Carte verrouillée</div>
        </div>
      )}
      
      {state.isCompleted && (
        <div 
          className="completion-animation"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: brandConfig?.accentColor || '#FFD700',
            fontSize: '24px',
            animation: 'bounce 0.6s ease-out'
          }}
        >
          🎉
        </div>
      )}
    </div>
  );
};
