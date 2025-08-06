import React from 'react';
import type { MobileConfig } from '../../ModernEditor/types/CampaignTypes';

interface MobileOverlaysProps {
  mobileConfig: MobileConfig;
  previewMode: string;
}

const MobileOverlays: React.FC<MobileOverlaysProps> = ({ mobileConfig, previewMode }) => {
  return (
    <>
      {/* Logo Overlay */}
      {(typeof mobileConfig.logoOverlay === 'string' ? mobileConfig.logoOverlay : mobileConfig.logoOverlay?.src) && (
        <div
          className={`absolute ${mobileConfig.logoPosition === 'top-left' ? 'top-4 left-4' :
            mobileConfig.logoPosition === 'top-center' ? 'top-4 left-1/2 transform -translate-x-1/2' :
              mobileConfig.logoPosition === 'top-right' ? 'top-4 right-4' :
                mobileConfig.logoPosition === 'center' ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' :
                  mobileConfig.logoPosition === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4'
            }`}
          style={{ zIndex: 20 }}
        >
          <img
            src={typeof mobileConfig.logoOverlay === 'string' ? mobileConfig.logoOverlay : mobileConfig.logoOverlay?.src}
            alt="Logo"
            className="object-contain"
            style={{
              width: previewMode === 'mobile' ? '42px' : '56px',
              height: previewMode === 'mobile' ? '42px' : '56px'
            }}
          />
        </div>
      )}

      {/* Decorative Overlay */}
      {(typeof mobileConfig.decorativeOverlay === 'string' ? mobileConfig.decorativeOverlay : mobileConfig.decorativeOverlay?.type) && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
          <img
            src={typeof mobileConfig.decorativeOverlay === 'string' ? mobileConfig.decorativeOverlay : mobileConfig.decorativeOverlay?.type}
            alt="Decorative overlay"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </>
  );
};

export default MobileOverlays;
