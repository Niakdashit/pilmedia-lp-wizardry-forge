
import React from 'react';

interface ConstrainedContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ConstrainedContainer: React.FC<ConstrainedContainerProps> = ({
  children,
  maxWidth = 1200,
  maxHeight = 800,
  className = '',
  style = {}
}) => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    maxWidth: `${maxWidth}px`,
    maxHeight: `${maxHeight}px`,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    ...style
  };

  return (
    <div className={`${className}`} style={containerStyle}>
      {children}
    </div>
  );
};

export default ConstrainedContainer;
