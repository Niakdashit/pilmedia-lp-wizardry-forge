
import React from 'react';

interface DeviceTransitionProps {
  device: 'desktop' | 'tablet' | 'mobile';
  isChanging?: boolean;
  children: React.ReactNode;
}

const DeviceTransition: React.FC<DeviceTransitionProps> = ({
  device,
  isChanging = false,
  children
}) => {
  return (
    <div 
      className={`transition-opacity duration-200 ${isChanging ? 'opacity-50' : 'opacity-100'}`}
      key={device}
    >
      {children}
    </div>
  );
};

export default DeviceTransition;
