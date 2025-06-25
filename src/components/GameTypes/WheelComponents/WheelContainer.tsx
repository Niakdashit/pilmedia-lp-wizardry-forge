
import React from 'react';

interface WheelContainerProps {
  children: React.ReactNode;
}

const WheelContainer: React.FC<WheelContainerProps> = ({ children }) => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const gameWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div style={containerStyle}>
      <div style={gameWrapperStyle}>
        {children}
      </div>
    </div>
  );
};

export default WheelContainer;
