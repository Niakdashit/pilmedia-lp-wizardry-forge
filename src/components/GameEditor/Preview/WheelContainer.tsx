
import React from 'react';
import { SmartWheel } from '../../SmartWheel';
import type { DeviceType, EditorConfig } from '../GameEditorLayout';
import { createSegments } from './wheelHelpers';
import { useBrandColorExtraction } from '../../QuickCampaign/Preview/hooks/useBrandColorExtraction';

interface WheelContainerProps {
  device: DeviceType;
  config: EditorConfig;
  isMode1?: boolean;
  isVisible?: boolean;
  onResult?: (segment: { id: string; label: string; color: string }) => void;
  onShowParticipationModal?: () => void;
  scale?: number;
}

const WheelContainer: React.FC<WheelContainerProps> = ({ 
  device, 
  config, 
  isMode1 = false, 
  isVisible = true,
  onResult,
  onShowParticipationModal,
  scale = 1.7 // Échelle par défaut à 1.7x
}) => {
  // Extraction de couleurs automatique pour synchroniser avec DesignEditor
  const { finalColors } = useBrandColorExtraction(
    { 
      primary: config.brandAssets?.primaryColor || config.participateButtonColor || '#841b60', 
      secondary: '#4ecdc4', 
      accent: '#45b7d1' 
    },
    config.deviceConfig?.[device]?.backgroundImage
  );

  const brandColor = finalColors.primary;

  // Utiliser les couleurs extraites
  const brandColors = {
    primary: finalColors.primary,
    secondary: finalColors.secondary,
    accent: finalColors.accent
  };

  const wheelSegments = createSegments(config, brandColor);

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

  // Forcer le centrage pour toutes les roues - pas de gamePosition spécifique

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center w-full h-full"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0
      }}
    >
      <SmartWheel 
        segments={wheelSegments}
        size={getWheelSize() * (isMode1 ? 0.8 : 1)}
        theme="modern"
        borderStyle={config.borderStyle || 'classic'}
        onResult={handleWheelResult}
        gamePosition={undefined}
        isMode1={isMode1}
        formFields={config.formFields}
        brandColors={brandColors}
        buttonPosition={config.wheelButtonPosition === 'center' ? 'center' : 'bottom'}
        onShowParticipationModal={onShowParticipationModal}
        customButton={{
          text: isMode1 ? "Faire tourner" : "Remplir le formulaire",
          color: brandColors.primary,
          textColor: "#ffffff"
        }}
      />
    </div>
  );
};

export default WheelContainer;
