
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
    // Pour Mode 1 en desktop, utiliser le ratio exact de l'image pour éviter les espaces blancs
    if (isMode1 && device === 'desktop' && imageAspectRatio) {
      // Utiliser la largeur du viewport et calculer la hauteur proportionnelle
      return {
        width: '100%',
        height: `${100 / imageAspectRatio}vw`,
        maxHeight: '70vh' // Limiter la hauteur pour éviter les bannières trop hautes
      };
    }
    
    // Comportement par défaut pour tous les autres cas
    return { 
      width: '100%',
      height: '100%'
    };
  };

  const getBackgroundSize = () => {
    // Pour desktop en Mode 1, utiliser 'contain' pour afficher l'image entièrement
    if (isMode1 && device === 'desktop') {
      return 'contain';
    }
    // Pour Mode 2 ou mobile/tablet, toujours utiliser 'cover' pour remplir complètement
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
