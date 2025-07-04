import React from 'react';

interface DeviceFrameProps {
  device: 'desktop' | 'tablet' | 'mobile';
  children: React.ReactNode;
}

interface DeviceStyles {
  containerClass: string;
  screenClass: string;
  innerClass: string;
  maxWidth: number;
  maxHeight: number;
  showNotch: boolean;
  showHomeIndicator: boolean;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, children }) => {
  const getDeviceStyles = (): DeviceStyles => {
    switch (device) {
      case 'mobile':
        return {
          containerClass: 'bg-gray-900 rounded-[2.5rem] p-1 shadow-2xl',
          screenClass: 'bg-black rounded-[2rem] p-1',
          innerClass: 'bg-white rounded-[1.5rem] overflow-auto relative',
          maxWidth: 520,
          maxHeight: 1100,
          showNotch: true,
          showHomeIndicator: true
        };
      case 'tablet':
        return {
          containerClass: 'bg-gray-800 rounded-2xl p-2 shadow-2xl',
          screenClass: 'bg-black rounded-xl p-1',
          innerClass: 'bg-white rounded-lg overflow-auto relative',
          maxWidth: 850,
          maxHeight: 1200,
          showNotch: false,
          showHomeIndicator: false
        };
      default:
        return {
          containerClass: 'w-full h-full',
          screenClass: 'w-full h-full',
          innerClass: 'w-full h-full overflow-hidden relative',
          maxWidth: 0,
          maxHeight: 0,
          showNotch: false,
          showHomeIndicator: false
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  if (device === 'desktop') {
    return (
      <div className="w-full h-full p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 w-full h-full flex items-center justify-center overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div 
        className={deviceStyles.containerClass}
        style={{
          width: deviceStyles.maxWidth,
          height: deviceStyles.maxHeight,
          maxWidth: '95%',
          maxHeight: '95%'
        }}
      >
        <div className={deviceStyles.screenClass}>
          <div className={deviceStyles.innerClass}>
            {/* Device-specific elements */}
            {deviceStyles.showNotch && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black rounded-b-lg z-20"></div>
            )}
            
            {deviceStyles.showNotch && (
              <div className="absolute top-1 left-2 right-2 flex justify-between items-center text-xs font-medium z-20 text-black">
                <span>9:41</span>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-2 border border-black rounded-sm">
                    <div className="w-3 h-1 bg-green-500 rounded-sm"></div>
                  </div>
                </div>
              </div>
            )}
            
            {children}
            
            {deviceStyles.showHomeIndicator && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-400 rounded-full z-20"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceFrame;