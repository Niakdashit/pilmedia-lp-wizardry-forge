
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
    // Calculer le ratio d'aspect pour desktop (Mode 1 et Mode 2)
    if (device === 'desktop') {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        setImageAspectRatio(aspectRatio);
      };
      img.src = getBackgroundImage();
    }
  }, [isMode1, device, config.deviceConfig]);

  const getContentDimensions = () => {
    // Pour Mode 2 en desktop, utiliser un ratio 16:9 standard de page web
    if (!isMode1 && device === 'desktop') {
      return {
        width: '100%',
        aspectRatio: '16/9',
        maxWidth: '100vw',
        maxHeight: '100vh'
      };
    }
    
    // Pour Mode 2 sur tablette/mobile, remplir complètement l'espace disponible
    if (!isMode1) {
      return {
        width: '100%',
        height: '100%',
        minHeight: '100%',
        minWidth: '100%',
        flex: 1
      };
    }
    
    // Pour Mode 1 en desktop, utiliser le ratio exact de l'image pour éviter les espaces blancs
    if (device === 'desktop' && imageAspectRatio) {
      return {
        width: '100%',
        height: `${100 / imageAspectRatio}vw`,
        maxHeight: '70vh'
      };
    }
    
    // Comportement par défaut pour les autres cas
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
    // Pour desktop en Mode 2, utiliser 'cover' pour remplir le cadre 16:9
    if (!isMode1 && device === 'desktop') {
      return 'cover';
    }
    // Pour tablette et mobile en Mode 2, utiliser 'cover' pour remplir complètement
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
