import React from 'react';

interface DeviceFrameProps {
  device: 'desktop' | 'tablet' | 'mobile';
  children: React.ReactNode;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, children }) => {
  if (device === 'desktop') {
    return (
      <div className="relative bg-gray-800 rounded-t-lg" style={{ width: '100%', height: '100%' }}>
        {/* Browser header */}
        <div className="bg-gray-700 h-8 rounded-t-lg flex items-center px-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        {/* Canvas area */}
        <div 
          className="relative overflow-hidden"
          style={{ 
            height: 'calc(100% - 32px)',
            background: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 60%, #9ACD32 60%, #7CB342 80%, #689F38 100%)'
          }}
        >
          {/* Clouds */}
          <div className="absolute top-8 left-16 w-24 h-12 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-6 left-12 w-16 h-8 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-12 right-32 w-32 h-16 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-8 right-28 w-20 h-10 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-16 right-8 w-20 h-10 bg-white rounded-full opacity-80"></div>
          
          {/* Hills */}
          <div className="absolute bottom-0 left-0 w-full h-32">
            <svg width="100%" height="100%" viewBox="0 0 800 128" preserveAspectRatio="none">
              <path d="M0,64 Q200,20 400,64 T800,64 L800,128 L0,128 Z" fill="#9ACD32" opacity="0.8"/>
              <path d="M0,80 Q300,40 600,80 T800,80 L800,128 L0,128 Z" fill="#7CB342"/>
            </svg>
          </div>
          
          {/* Content area */}
          <div className="absolute inset-8 flex items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (device === 'tablet') {
    return (
      <div 
        className="relative bg-gray-800 rounded-3xl p-4"
        style={{ width: '400px', height: '600px' }}
      >
        {/* Tablet canvas */}
        <div 
          className="relative w-full h-full rounded-2xl overflow-hidden"
          style={{ 
            background: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 70%, #9ACD32 70%, #7CB342 85%, #689F38 100%)'
          }}
        >
          {/* Clouds */}
          <div className="absolute top-6 left-8 w-16 h-8 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-4 left-6 w-10 h-5 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-8 right-12 w-20 h-10 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-6 right-8 w-12 h-6 bg-white rounded-full opacity-80"></div>
          
          {/* Hills */}
          <div className="absolute bottom-0 left-0 w-full h-24">
            <svg width="100%" height="100%" viewBox="0 0 400 96" preserveAspectRatio="none">
              <path d="M0,48 Q100,20 200,48 T400,48 L400,96 L0,96 Z" fill="#9ACD32" opacity="0.8"/>
              <path d="M0,60 Q150,30 300,60 T400,60 L400,96 L0,96 Z" fill="#7CB342"/>
            </svg>
          </div>

          {/* Bottom indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-800 rounded-full"></div>
          
          {/* Content area */}
          <div className="absolute inset-4 flex items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Mobile
  return (
    <div 
      className="relative bg-gray-900 rounded-3xl p-2"
      style={{ width: '280px', height: '560px' }}
    >
      {/* Mobile canvas */}
      <div 
        className="relative w-full h-full rounded-3xl overflow-hidden"
        style={{ 
          background: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 70%, #9ACD32 70%, #7CB342 85%, #689F38 100%)'
        }}
      >
        {/* Status bar */}
        <div className="absolute top-2 left-4 right-4 flex items-center justify-between text-white text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <div className="w-16 h-1 bg-white/50 rounded-full"></div>
          </div>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Clouds */}
        <div className="absolute top-12 left-6 w-12 h-6 bg-white rounded-full opacity-80"></div>
        <div className="absolute top-10 left-4 w-8 h-4 bg-white rounded-full opacity-80"></div>
        <div className="absolute top-16 right-8 w-16 h-8 bg-white rounded-full opacity-80"></div>
        <div className="absolute top-14 right-6 w-10 h-5 bg-white rounded-full opacity-80"></div>
        
        {/* Hills */}
        <div className="absolute bottom-12 left-0 w-full h-20">
          <svg width="100%" height="100%" viewBox="0 0 280 80" preserveAspectRatio="none">
            <path d="M0,40 Q70,15 140,40 T280,40 L280,80 L0,80 Z" fill="#9ACD32" opacity="0.8"/>
            <path d="M0,50 Q105,25 210,50 T280,50 L280,80 L0,80 Z" fill="#7CB342"/>
          </svg>
        </div>

        {/* Bottom buttons */}
        <div className="absolute bottom-3 right-4 flex space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border border-white/60 rounded-full"></div>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-4 h-3 border-2 border-white/60 rounded-sm"></div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="absolute inset-4 flex items-center justify-center" style={{ top: '32px', bottom: '48px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DeviceFrame;