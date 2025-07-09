import React, { useState, useEffect } from 'react';

interface DeviceTransitionProps {
  children: React.ReactNode;
  device: 'desktop' | 'tablet' | 'mobile';
  isChanging?: boolean;
}

const DeviceTransition: React.FC<DeviceTransitionProps> = ({
  children,
  device,
  isChanging = false
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(device);

  useEffect(() => {
    if (device !== currentDevice || isChanging) {
      setIsTransitioning(true);
      
      // Début de la transition
      const timer1 = setTimeout(() => {
        setCurrentDevice(device);
      }, 150); // Halfway through transition
      
      // Fin de la transition
      const timer2 = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [device, currentDevice, isChanging]);

  const getTransitionClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-in-out';
    
    if (isTransitioning) {
      return `${baseClasses} opacity-80 scale-95 blur-sm`;
    }
    
    return `${baseClasses} opacity-100 scale-100 blur-0`;
  };

  return (
    <div className={getTransitionClasses()}>
      {children}
      
      {/* Overlay pendant la transition */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-lg animate-fade-in z-10 pointer-events-none" />
      )}
    </div>
  );
};

export default DeviceTransition;