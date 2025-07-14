
import React, { useState, useEffect } from 'react';
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
  const [aspectRatio, setAspectRatio] = useState<number>(1500 / 744); // Default ratio

  const getBackgroundImage = () => {
    const deviceBackgroundImage = config.deviceConfig?.[device]?.backgroundImage;
    return deviceBackgroundImage || summerBeachImage;
  };

  // Load image to get its natural dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    };
    img.src = getBackgroundImage();
  }, [config.deviceConfig?.[device]?.backgroundImage]);

  const getContentDimensions = () => {
    return { 
      width: '100%',
      height: `${100 / aspectRatio}vw`, // Height based on viewport width and aspect ratio
      maxHeight: '60vh' // Prevent it from being too tall on very wide screens
    };
  };

  return (
    <div 
      className={`relative bg-cover bg-center ${className}`}
      style={{ 
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
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
