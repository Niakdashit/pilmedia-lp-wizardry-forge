
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
    // Pour Mode 1 en desktop, utiliser le ratio d'aspect de l'image
    if (isMode1 && device === 'desktop' && imageAspectRatio) {
      return {
        width: '100%',
        height: `${100 / imageAspectRatio}vw`
      };
    }
    
    // Comportement par défaut pour tous les autres cas
    return { 
      width: '100%',
      height: '100%'
    };
  };

  const getBackgroundSize = () => {
    // Pour desktop, utiliser 'contain' pour afficher l'image entièrement
    if (device === 'desktop') {
      return 'contain';
    }
    // Pour mobile et tablet, garder 'cover'
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
