import React from 'react';
import type { DeviceType } from '../QualifioEditorLayout';
interface DeviceFrameProps {
  device: DeviceType;
  children: React.ReactNode;
}
const DeviceFrame: React.FC<DeviceFrameProps> = ({
  device,
  children
}) => {
  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return {
          width: '350px',
          height: '622px',
          margin: '20px auto',
          border: '8px solid #333',
          borderRadius: '25px',
          overflow: 'hidden'
        };
      case 'tablet':
        return {
          width: '653px',
          height: '870px',
          margin: '20px auto',
          border: '12px solid #333',
          borderRadius: '20px',
          overflow: 'hidden'
        };
      case 'desktop':
      default:
        return {
          width: '1020px',
          // 1200px réduit de 15%
          minHeight: '680px',
          // 800px réduit de 15%
          margin: '20px auto',
          border: '2px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        };
    }
  };
  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '20px'
  };
  return <div style={containerStyles} className="py-0 my-0 rounded">
      <div style={getDeviceStyles()}>
        {/* Pour mobile et tablet, contenu fixe sans scroll */}
        {device === 'mobile' || device === 'tablet' ? <div className="scrollbar-hide" style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
            {children}
          </div> : children}
      </div>
    </div>;
};
export default DeviceFrame;