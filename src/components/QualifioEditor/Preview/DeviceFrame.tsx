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
          width: '319px',
          // 375px réduit de 15%
          height: '567px',
          // 667px réduit de 15%
          margin: '20px auto',
          border: '8px solid #333',
          borderRadius: '25px',
          overflow: 'hidden'
        };
      case 'tablet':
        return {
          width: '653px',
          // 768px réduit de 15%
          height: '870px',
          // 1024px réduit de 15%
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
        {/* Pour mobile et tablet, on ajoute le scroll à l'intérieur avec scrollbar masquée */}
        {device === 'mobile' || device === 'tablet' ? <div className="scrollbar-hide" style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        // Permet le scroll du contenu
        position: 'relative'
      }}>
            {children}
          </div> : children}
      </div>
    </div>;
};
export default DeviceFrame;