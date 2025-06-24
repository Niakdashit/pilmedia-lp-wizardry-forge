
import React from 'react';

interface WheelContainerProps {
  children: React.ReactNode;
  gameDimensions: { width: number; height: number };
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

const WheelContainer: React.FC<WheelContainerProps> = ({
  children,
  gameDimensions,
  previewDevice
}) => {
  // Dimensions fixes généreuses pour éviter toute coupure
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: `${Math.max(gameDimensions.width + 200, 600)}px`,
    minHeight: `${Math.max(gameDimensions.height + 200, 600)}px`,
    maxWidth: 'none', // Pas de limite pour éviter le responsive
    maxHeight: 'none', // Pas de limite pour éviter le responsive
    overflow: 'visible', // Permettre le débordement pour éviter les coupures
    padding: '60px 40px', // Padding généreux
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          minWidth: `${gameDimensions.width + 100}px`,
          minHeight: `${gameDimensions.height + 100}px`,
          overflow: 'visible'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default WheelContainer;
