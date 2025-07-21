
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
          width: '100%',
          height: '100%',
          margin: '0',
          border: 'none',
          borderRadius: '0',
          overflowY: 'hidden' as const
        };
      case 'tablet':
        return {
          width: '100%',
          height: '100%',
          margin: '0',
          border: 'none',
          borderRadius: '0',
          overflowY: 'hidden' as const
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

  return (
    <div style={containerStyles} className="py-0 my-0 rounded">
      <div style={getDeviceStyles()}>
        {/* Pour mobile et tablet, contenu fixe sans scroll */}
        {device === 'mobile' || device === 'tablet' ? (
          <div 
            className="scrollbar-hide" 
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
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
