
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
  // Utiliser des dimensions plus généreuses pour éviter les coupures
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: `${Math.max(gameDimensions.width + 100, 400)}px`,
    minHeight: `${Math.max(gameDimensions.height + 100, 400)}px`,
    maxWidth: '100%',
    overflow: 'visible', // Permettre le débordement pour éviter les coupures
    padding: '40px 20px',
    boxSizing: 'border-box',
  };

  // Pas de crop pour l'éditeur - on veut voir la roue complète
  const isMobile = previewDevice === 'mobile';
  if (isMobile) {
    containerStyle.padding = '30px 15px';
    containerStyle.minHeight = `${Math.max(gameDimensions.height + 80, 350)}px`;
  }

  return (
    <div style={containerStyle}>
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          minWidth: `${gameDimensions.width}px`,
          minHeight: `${gameDimensions.height}px`,
          overflow: 'visible'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default WheelContainer;
