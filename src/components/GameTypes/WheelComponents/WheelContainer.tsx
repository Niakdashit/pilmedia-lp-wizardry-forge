
import React from 'react';

interface WheelContainerProps {
  children: React.ReactNode;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const WheelContainer: React.FC<WheelContainerProps> = ({ children, previewDevice }) => {
  const minHeight = previewDevice === 'mobile' ? 'min-h-[300px]' : 'min-h-[400px]';

  return (
    <div className={`relative flex items-center justify-center w-full h-full ${minHeight} overflow-visible`}>
      {children}
    </div>
  );
};

export default WheelContainer;
