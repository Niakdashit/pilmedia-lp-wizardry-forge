import React from 'react';
import type { DeviceType, EditorConfig } from '../QualifioEditorLayout';
import summerBeachImage from '../../../assets/summer-beach.jpg';

interface BackgroundContainerProps {
  device: DeviceType;
  config: EditorConfig;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ 
  device, 
  config, 
  children, 
  className = "",
  style = {},
  onClick
}) => {
  const getBackgroundImage = () => {
    const deviceBackgroundImage = config.deviceConfig?.[device]?.backgroundImage;
    return deviceBackgroundImage || summerBeachImage;
  };

  const getContentDimensions = () => {
    return { 
      width: '100%',
      height: '100%'
    };
  };

  return (
    <div 
      className={`relative bg-cover bg-center ${className}`}
      style={{ 
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: device === 'desktop' ? 'cover' : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...getContentDimensions(),
        ...style
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default BackgroundContainer;