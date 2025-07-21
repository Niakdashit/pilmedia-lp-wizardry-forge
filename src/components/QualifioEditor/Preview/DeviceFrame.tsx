
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
          position: 'relative' as const,
          overflow: 'hidden' as const
        };
      case 'tablet':
        return {
          width: '653px',
          height: '720px',
          margin: '20px auto',
          position: 'relative' as const,
          overflow: 'hidden' as const
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

  const getBorderStyles = (): React.CSSProperties => {
    switch (device) {
      case 'mobile':
        return {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '8px solid #333',
          borderRadius: '25px',
          pointerEvents: 'none' as const,
          zIndex: 10
        };
      case 'tablet':
        return {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '12px solid #333',
          borderRadius: '20px',
          pointerEvents: 'none' as const,
          zIndex: 10
        };
      default:
        return {};
    }
  };

  const getContentStyles = (): React.CSSProperties => {
    switch (device) {
      case 'mobile':
        return {
          position: 'absolute' as const,
          top: '8px',
          left: '8px',
          right: '8px',
          bottom: '8px',
          borderRadius: '17px',
          overflow: 'hidden' as const,
          zIndex: 5
        };
      case 'tablet':
        return {
          position: 'absolute' as const,
          top: '12px',
          left: '12px',
          right: '12px',
          bottom: '12px',
          borderRadius: '8px',
          overflow: 'hidden' as const,
          zIndex: 5
        };
      default:
        return {};
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
        {/* Image de fond qui s'étend sur tout le device pour mobile et tablet */}
        {device === 'mobile' || device === 'tablet' ? (
          <>
            {/* Container pour l'image de fond - s'étend sur tout le device */}
            <div style={{
              position: 'absolute' as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: device === 'mobile' ? '25px' : '20px',
              overflow: 'hidden' as const,
              zIndex: 1
            }}>
              {children}
            </div>
            
            {/* Bordures du device par-dessus l'image */}
            <div style={getBorderStyles()}></div>
            
            {/* Container pour le contenu à l'intérieur des bordures */}
            <div className="scrollbar-hide" style={{
              ...getContentStyles(),
              display: 'flex',
              flexDirection: 'column' as const,
              overflowY: 'auto'
            }}>
              {/* Le contenu sera rendu ici par les composants enfants */}
            </div>
          </>
        ) : children}
      </div>
    </div>;
};
export default DeviceFrame;
