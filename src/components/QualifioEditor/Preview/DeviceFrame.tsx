
import React from 'react';
import type { DeviceType } from '../QualifioEditorLayout';

interface DeviceFrameProps {
  device: DeviceType;
  children: React.ReactNode;
  /**
   * When true, the desktop frame adapts its height to
   * the content and disables internal scrolling.
   */
  fitContentDesktop?: boolean;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({
  device,
  children,
  fitContentDesktop = false
}) => {
  const getDeviceStyles = (): React.CSSProperties => {
    switch (device) {
      case 'mobile':
        return {
          width: '350px',
          height: '622px',
          margin: '20px auto',
          position: 'relative'
        };
      case 'tablet':
        return {
          width: '653px',
          height: '792px',
          margin: '20px auto',
          position: 'relative'
        };
      case 'desktop':
      default:
        if (fitContentDesktop) {
          return {
            width: '1020px',
            margin: '20px auto',
            border: '2px solid #ddd',
            borderRadius: '8px',
            overflowY: 'visible' as const
          };
        }
        return {
          width: '1020px',
          height: '680px',
          margin: '20px auto',
          border: '2px solid #ddd',
          borderRadius: '8px',
          overflowY: 'auto' as const
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

  // Pour mobile et tablette, utiliser une approche en couches avec bordures visibles
  if (device === 'mobile' || device === 'tablet') {
    const borderRadius = device === 'mobile' ? '25px' : '20px';
    const borderWidth = device === 'mobile' ? '8px' : '12px';

    return (
      <div style={containerStyles} className="py-0 my-0 rounded">
        <div style={getDeviceStyles()}>
          {/* Frame extérieur avec bordure visible */}
          <div 
            style={{
              width: '100%',
              height: '100%',
              border: `${borderWidth} solid #333`,
              borderRadius: borderRadius,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Conteneur intérieur pour le contenu avec l'image de fond qui remplit tout */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                borderRadius: `calc(${borderRadius} - ${borderWidth})`,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pour desktop, garder le comportement existant
  return (
    <div style={containerStyles} className="py-0 my-0 rounded">
      <div style={getDeviceStyles()}>
        {children}
      </div>
    </div>
  );
};

export default DeviceFrame;
