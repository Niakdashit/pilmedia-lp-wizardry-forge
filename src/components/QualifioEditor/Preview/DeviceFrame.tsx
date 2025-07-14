
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
          width: '375px',
          height: '667px', // Taille fixe pour iPhone 8/SE
          margin: '20px auto',
          border: '8px solid #333',
          borderRadius: '25px',
          overflow: 'hidden' // Empêche le débordement du frame
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px', // Taille fixe pour iPad
          margin: '20px auto',
          border: '12px solid #333',
          borderRadius: '20px',
          overflow: 'hidden'
        };
      case 'desktop':
      default:
        return {
          width: '1200px',
          minHeight: '800px',
          margin: '20px auto',
          border: '2px solid #ddd',
          borderRadius: '8px',
          overflow: 'auto'
        };
    }
  };

  const containerStyles = {
    backgroundColor: 'hsl(210, 20%, 98%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '20px'
  };

  return (
    <div style={containerStyles} className="py-0 my-0 rounded-sm">
      <div style={getDeviceStyles()}>
        {/* Pour mobile et tablet, on ajoute le scroll à l'intérieur */}
        {device === 'mobile' || device === 'tablet' ? (
          <div 
            style={{
              width: '100%',
              height: '100%',
              overflow: 'auto', // Permet le scroll du contenu
              position: 'relative'
            }}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default DeviceFrame;
