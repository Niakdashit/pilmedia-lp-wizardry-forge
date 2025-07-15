
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
  isMode1?: boolean;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ 
  device, 
  config, 
  children, 
  className = "",
  style = {},
  onClick,
  isMode1 = false
}) => {
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const getBackgroundImage = () => {
    const deviceBackgroundImage = config.deviceConfig?.[device]?.backgroundImage;
    return deviceBackgroundImage || summerBeachImage;
  };

  useEffect(() => {
    // Calculer le ratio d'aspect seulement pour Mode 1 en desktop
    if (isMode1 && device === 'desktop') {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        setImageAspectRatio(aspectRatio);
      };
      img.src = getBackgroundImage();
    }
  }, [isMode1, device, config.deviceConfig]);

  const getContentDimensions = () => {
    // Pour Mode 1 en desktop, utiliser une hauteur fixe basée sur l'image
    if (isMode1 && device === 'desktop' && imageAspectRatio) {
      // Hauteur fixe de 400px maximum pour éviter les espaces variables
      const maxHeight = 400;
      const calculatedHeight = 100 / imageAspectRatio;
      const finalHeight = Math.min(maxHeight, calculatedHeight);
      
      return {
        width: '100%',
        height: `${finalHeight}px`
      };
    }
    
    // Comportement par défaut pour tous les autres cas
    return { 
      width: '100%',
      height: '100%'
    };
  };

  const getBackgroundSize = () => {
    // Utiliser 'cover' pour tous les appareils pour éviter les espaces blancs
    return 'cover';
  };

  return (
    <div 
      className={`relative bg-center ${className}`}
      style={{ 
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: getBackgroundSize(),
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        margin: 0,
        padding: 0,
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
