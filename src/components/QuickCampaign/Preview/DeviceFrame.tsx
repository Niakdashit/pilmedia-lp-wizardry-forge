
import React from 'react';

interface DeviceFrameProps {
  device: 'desktop' | 'tablet' | 'mobile';
  children: React.ReactNode;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, children }) => {
  if (device === 'desktop') {
    return <>{children}</>;
  }

  if (device === 'tablet') {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-4 box-border">
        {/* Tablet Frame */}
        <div className="bg-gray-800 rounded-3xl p-6 shadow-2xl max-w-full max-h-full w-full" style={{ maxWidth: '768px' }}>
          <div className="bg-black rounded-2xl p-2 w-full h-full flex items-center justify-center">
            <div
              className="bg-white rounded-xl overflow-hidden relative w-full h-full flex flex-col"
              style={{
                aspectRatio: '768 / 1024'
              }}
            >
              {/* Home indicator for tablet */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full"></div>
              {/* Ajout du scroll interne */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile frame
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 box-border">
      {/* Mobile Frame */}
      <div className="bg-gray-900 rounded-[3rem] p-2 shadow-2xl max-w-full max-h-full w-full" style={{ maxWidth: '375px' }}>
        <div className="bg-black rounded-[2.5rem] p-1 w-full h-full flex items-center justify-center">
          <div
            className="bg-white rounded-[2rem] overflow-hidden relative w-full h-full flex flex-col"
            style={{
              aspectRatio: '375 / 812'
            }}
          >
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
            {/* Status bar icons */}
            <div className="absolute top-2 left-4 right-4 flex justify-between items-center text-xs font-medium z-10">
              <span className="text-black">9:41</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-2 border border-black rounded-sm">
                  <div className="w-3 h-1 bg-black rounded-sm"></div>
                </div>
                <div className="w-6 h-3 border border-black rounded-sm relative">
                  <div className="w-4 h-2 bg-green-500 rounded-sm absolute top-0.5 left-0.5"></div>
                  <div className="w-1 h-1 bg-black rounded-sm absolute top-1 -right-0.5"></div>
                </div>
              </div>
            </div>
            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full z-10"></div>
            {/* Ajout du scroll interne */}
            <div
              style={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                position: 'relative',
                zIndex: 1
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceFrame;

