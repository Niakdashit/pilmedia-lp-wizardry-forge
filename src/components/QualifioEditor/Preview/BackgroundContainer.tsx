
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
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);

  const getBackgroundImage = () => {
    const deviceBackgroundImage = config.deviceConfig?.[device]?.backgroundImage;
    return deviceBackgroundImage || summerBeachImage;
  };

  // Charger les dimensions de l'image
  useEffect(() => {
    const imageUrl = getBackgroundImage();
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = imageUrl;
    }
  }, [getBackgroundImage()]);

  const getContainerDimensions = () => {
    if (!imageDimensions) {
      // Dimensions par défaut en attendant le chargement de l'image
      return {
        width: '100%',
        height: device === 'mobile' ? '50vh' : device === 'tablet' ? '45vh' : '55vh'
      };
    }

    // Calculer la hauteur basée sur les dimensions réelles de l'image
    const aspectRatio = imageDimensions.height / imageDimensions.width;
    
    // Utiliser la largeur du conteneur et calculer la hauteur proportionnelle
    return {
      width: '100%',
      height: 'auto',
      aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`
    };
  };

  const containerDimensions = getContainerDimensions();

  return (
    <div 
      className={`relative bg-cover bg-center ${className}`}
      style={{ 
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...containerDimensions,
        ...style
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default BackgroundContainer;
