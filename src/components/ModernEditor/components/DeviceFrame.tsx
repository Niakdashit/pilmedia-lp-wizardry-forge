
import React from 'react';
const DEVICE_CONSTRAINTS = {
  mobile: { width: 390, height: 844 }, // iPhone 13/14/15 dimensions for realistic mobile preview
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
};

interface DeviceFrameProps {
  device: 'desktop' | 'tablet' | 'mobile';
  children: React.ReactNode;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, children }) => {
  if (device === 'desktop') {
    return (
      <div className="w-full h-full p-1">
        <div 
          className="bg-white rounded-xl shadow-lg border border-gray-200/50 w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300"
          style={{
            minWidth: '1400px',
            minHeight: '900px',
            maxWidth: '1800px',
            maxHeight: '1200px'
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Utiliser les contraintes standardisées
  const { width: maxWidth, height: maxHeight } = DEVICE_CONSTRAINTS[device];

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
    <div className="w-full h-full flex items-center justify-center p-1">
      <div 
        className={`${styles.frame} transition-all duration-300 hover:shadow-3xl`}
        style={{
          width: Math.round(maxWidth),
          height: Math.round(maxHeight),
          maxWidth: '95%',
          maxHeight: '95%'
        }}
      >
        <div className={`${styles.inner} transition-all duration-200`}>
          <div className={`${styles.screen} transition-all duration-200`}>
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
