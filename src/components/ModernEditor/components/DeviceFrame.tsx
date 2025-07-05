import React from 'react';
import { DEVICE_CONSTRAINTS } from '../../QuickCampaign/Preview/utils/previewConstraints';

interface DeviceFrameProps {
  device: 'desktop' | 'tablet' | 'mobile';
  children: React.ReactNode;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, children }) => {
  if (device === 'desktop') {
    return (
      <div className="w-full h-full p-4">
        <div 
          className="bg-white rounded-xl shadow-lg border border-gray-200/50 w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300"
          style={{
            imageRendering: 'crisp-edges',
            transform: 'translateZ(0)' // Force hardware acceleration for crisp rendering
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Utiliser les contraintes Qualifio standardisées
  const { maxWidth, maxHeight } = DEVICE_CONSTRAINTS[device];

  const getDeviceStyles = () => {
    if (device === 'mobile') {
      return {
        frame: "bg-gray-900 rounded-[2.5rem] p-1 shadow-2xl",
        inner: "bg-black rounded-[2rem] p-1",
        screen: "bg-white rounded-[1.5rem] overflow-hidden relative"
      };
    }
    
    return {
      frame: "bg-gray-800 rounded-2xl p-2 shadow-2xl",
      inner: "bg-black rounded-xl p-1",
      screen: "bg-white rounded-lg overflow-hidden relative"
    };
  };

  const styles = getDeviceStyles();

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div 
        className={`${styles.frame} transition-all duration-300 hover:shadow-3xl`}
        style={{
          width: Math.round(maxWidth), // Round to avoid fractional pixels
          height: Math.round(maxHeight),
          maxWidth: '95%',
          maxHeight: '95%',
          imageRendering: 'crisp-edges',
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
      >
        <div className={`${styles.inner} transition-all duration-200`}>
          <div 
            className={`${styles.screen} transition-all duration-200`}
            style={{
              imageRendering: 'crisp-edges',
              transform: 'translateZ(0)'
            }}
          >
            {/* Device-specific elements */}
            {device === 'mobile' && (
              <>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black rounded-b-lg z-20"></div>
                
                {/* Status bar */}
                <div className="absolute top-1 left-2 right-2 flex justify-between items-center text-xs font-medium z-20 text-black">
                  <span>9:41</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-2 border border-black rounded-sm">
                      <div className="w-3 h-1 bg-green-500 rounded-sm"></div>
                    </div>
                  </div>
                </div>
                
                {/* Home indicator */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-400 rounded-full z-20"></div>
              </>
            )}
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceFrame;