import React from 'react';
import type { DeviceType } from '../QualifioEditorLayout';

interface DeviceFrameProps {
  device: DeviceType;
  children: React.ReactNode;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, children }) => {
  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return { 
          width: '375px',
          height: '667px',
          margin: '20px auto',
          border: '8px solid #333',
          borderRadius: '25px',
          overflow: 'hidden'
        };
      case 'tablet':
        return { 
          width: '768px',
          height: '1024px', 
          margin: '20px auto',
          border: '12px solid #333',
          borderRadius: '20px',
          overflow: 'hidden'
        };
      case 'desktop':
      default:
        return { 
          width: '1200px',
          height: '800px',
          margin: '20px auto',
          border: '2px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        };
    }
  };

  const containerStyles = {
    backgroundColor: 'hsl(210, 20%, 98%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  return (
    <div style={containerStyles}>
      <div style={getDeviceStyles()}>
        {children}
      </div>
    </div>
  );
};

export default DeviceFrame;