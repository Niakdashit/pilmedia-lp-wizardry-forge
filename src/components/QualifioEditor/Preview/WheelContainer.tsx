
import React from 'react';
import { SmartWheel } from '../../SmartWheel';
import type { DeviceType, EditorConfig } from '../QualifioEditorLayout';
import { createSegments } from './wheelHelpers';

interface WheelContainerProps {
  device: DeviceType;
  config: EditorConfig;
  isMode1?: boolean;
  isVisible?: boolean;
  onResult?: (segment: { id: string; label: string; color: string }) => void;
  scale?: number;
}

// Fonction pour calculer la luminance d'une couleur
const getLuminance = (color: string): number => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const sRGB = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};

// Fonction pour déterminer la couleur de texte optimale (contraste)
const getContrastTextColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

const WheelContainer: React.FC<WheelContainerProps> = ({ 
  device, 
  config, 
  isMode1 = false, 
  isVisible = true,
  onResult,
  scale = 1.0
}) => {
  const brandColor = config.brandAssets?.primaryColor || '#4ECDC4';

  // Utiliser les couleurs extraites de l'image si disponibles
  const brandColors = config.brandAssets ? {
    primary: brandColor,
    secondary: config.brandAssets.secondaryColor || '#F7B731',
    accent: config.brandAssets.accentColor || '#E74C3C'
  } : undefined;

  const wheelSegments = createSegments(config, brandColor).map(segment => ({
    ...segment,
    // Appliquer automatiquement la couleur de texte contrastée
    textColor: getContrastTextColor(segment.color)
  }));

  const handleWheelResult = (segment: any) => {
    console.log('Segment sélectionné:', segment);
    onResult?.(segment);
  };

  const getWheelSize = () => {
    const baseSize = (() => {
      switch (device) {
        case 'mobile':
          return 200;
        case 'tablet':
          return 280;
        case 'desktop':
        default:
          return 320;
      }
    })();
    // Appliquer l'échelle structurellement plutôt qu'en CSS
    return Math.round(baseSize * scale);
  };

  // Pour Mode 1, on cache la roue si isVisible est false
  if (isMode1 && !isVisible) {
    return null;
  }

  // Récupérer la position du jeu depuis la configuration
  const gamePosition = config.deviceConfig?.[device]?.gamePosition;

  return (
    <div className="flex items-center justify-center w-full" style={{ height: 'auto', minHeight: 'fit-content' }}>
      <SmartWheel 
        segments={wheelSegments}
        size={getWheelSize() * (isMode1 ? 0.8 : 1)}
        theme="modern"
        borderStyle={config.borderStyle || 'classic'}
        onResult={handleWheelResult}
        gamePosition={gamePosition}
        isMode1={isMode1}
        formFields={config.formFields}
        brandColors={brandColors}
        customButton={{
          text: isMode1 ? "Faire tourner" : "Remplir le formulaire",
          color: brandColors?.primary || "#8E44AD",
          textColor: "#ffffff"
        }}
        buttonPosition={config.wheelButtonPosition || 'bottom'}
      />
    </div>
  );
};

export default WheelContainer;
