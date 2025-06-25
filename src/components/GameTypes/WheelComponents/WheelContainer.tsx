
import React from 'react';

interface WheelContainerProps {
  children: React.ReactNode;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const WheelContainer: React.FC<WheelContainerProps> = ({ children, previewDevice = 'desktop' }) => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] relative">
      {children}
    </div>
  );
};

export default WheelContainer;
