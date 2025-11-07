
import React from 'react';
import { DEVICE_CONSTRAINTS } from './utils/previewConstraints';

interface DeviceFrameProps {
  device: 'desktop' | 'tablet' | 'mobile';
  children: React.ReactNode;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, children }) => {
  if (device === 'desktop') {
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        {children}
      </div>
    );
  }

  const { maxWidth, maxHeight, aspectRatio } = DEVICE_CONSTRAINTS[device];

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
  
  // Calculer les dimensions avec un padding réduit pour le frame
  const framePadding = device === 'mobile' ? 16 : 20;
  const frameWidth = Math.min(maxWidth + framePadding, window.innerWidth * 0.95);
  const frameHeight = Math.min(maxHeight + framePadding, window.innerHeight * 0.95);

  return (
    <div 
      className="flex items-center justify-center w-full h-full overflow-hidden"
      style={{ padding: '20px' }}
    >
      <div
        className={`${styles.frame} flex items-center justify-center overflow-hidden`}
        style={{
          width: frameWidth,
          height: frameHeight,
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: aspectRatio?.toString(),
        }}
      >
        <div className={`${styles.inner} flex items-center justify-center w-full h-full overflow-hidden`}>
          <div className={`${styles.screen} w-full h-full flex flex-col overflow-hidden`}>
            {/* Éléments spécifiques au device */}
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

            {/* Contenu principal avec overflow strict */}
            <div className="flex-1 w-full h-full overflow-hidden relative">
              <div 
                className="w-full h-full overflow-hidden"
                style={{
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceFrame;
