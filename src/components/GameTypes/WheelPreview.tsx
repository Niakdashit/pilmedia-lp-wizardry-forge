
import React from 'react';
import { SmartWheel } from '../SmartWheel';
import { useGameSize } from '../../hooks/useGameSize';
import { WheelConfigService } from '../../services/WheelConfigService';

interface WheelPreviewProps {
  campaign: any;
  config: {
    mode: 'instant_winner';
    winProbability: number;
    maxWinners?: number;
    winnersCount: number;
  };
  onFinish?: (result: 'win' | 'lose') => void;
  onStart?: () => void;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition?: string;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
  disabled?: boolean;
  wheelModalConfig?: any; // Configuration en temps réel depuis le Design Editor
  disableForm?: boolean;
}

const WheelPreview: React.FC<WheelPreviewProps> = ({
  campaign,
  config,
  onFinish,
  onStart,
  gameSize = 'medium',
  previewDevice = 'desktop',
  disabled = false,
  wheelModalConfig = {}
}) => {
  const { getResponsiveDimensions } = useGameSize(gameSize);
  const gameDimensions = getResponsiveDimensions(previewDevice);

  // Récupérer les segments depuis la configuration de la campagne (brut)
  const primaryFallback = campaign.design?.customColors?.primary || '#ff6b6b';
  const segments = campaign.gameConfig?.wheel?.segments ||
                   campaign.config?.roulette?.segments || [
    { id: '1', label: 'Prix 1', color: primaryFallback },
    { id: '2', label: 'Prix 2', color: '#ffffff' },
    { id: '3', label: 'Prix 3', color: primaryFallback },
    { id: '4', label: 'Dommage',  color: '#ffffff' }
  ];


  // Utiliser les couleurs extraites de l'image de fond si disponibles
  const extractedColors = campaign.design?.extractedColors || [];
  
  // Convertir les segments au format SmartWheel avec couleurs dérivées de la config unifiée
  // (utilise la couleur de bordure ou les couleurs de marque comme référence)
  const smartWheelSegments = React.useMemo(() => {
    // Couleur primaire issue des priorités: wheelModalConfig.borderColor -> design.customColors.primary -> extracted -> fallback
    const primaryRef = wheelModalConfig?.wheelBorderColor
      || campaign.design?.customColors?.primary
      || extractedColors[0]
      || '#841b60';
    const secondaryRef = '#ffffff';

    return segments.map((segment: any, index: number) => {
      const color = index % 2 === 0 ? primaryRef : secondaryRef;
      return {
        id: segment.id || index.toString(),
        label: segment.label,
        color,
        textColor: index % 2 === 0 ? secondaryRef : primaryRef
      };
    });
  }, [segments, wheelModalConfig?.wheelBorderColor, campaign.design?.customColors, extractedColors]);

  // Couleurs de marque unifiées - priorité aux customColors de la campagne
  const brandColors = {
    primary: campaign.design?.customColors?.primary || extractedColors[0] || '#841b60',
    secondary: '#ffffff',
    accent: campaign.design?.customColors?.accent || extractedColors[2] || '#45b7d1'
  };

  const handleResult = () => {
    if (onFinish) {
      // Logique de win/lose basée sur la probabilité configurée
      const isWin = Math.random() < config.winProbability;
      onFinish(isWin ? 'win' : 'lose');
    }
  };

  const handleSpin = () => {
    if (onStart) {
      onStart();
    }
  };

  // Utiliser la même logique de calcul que StandardizedWheel pour la cohérence
  // Passer wheelModalConfig pour synchroniser les modifications en temps réel
  const wheelConfig = WheelConfigService.getCanonicalWheelConfig(
    campaign,
    campaign?.design?.extractedColors || [],
    wheelModalConfig,
    { device: previewDevice, shouldCropWheel: true }
  );
  
  console.log('🎡 WheelPreview - Configuration unifiée:', {
    wheelConfigSize: wheelConfig.size,
    campaignScale: campaign?.design?.wheelConfig?.scale,
    previewDevice,
    gameDimensions
  });
  
  const wheelSize = wheelConfig.size || 200;

  // Styles de découpage/position selon la config unifiée
  const cropping = WheelConfigService.getWheelCroppingStyles(
    wheelConfig.shouldCropWheel ?? true,
    (wheelConfig.position as 'center' | 'left' | 'right') || 'center',
    (previewDevice as 'desktop' | 'tablet' | 'mobile')
  );
  
  console.log('🎡 WheelPreview - Taille finale:', {
    wheelSize,
    wheelConfigSize: wheelConfig.size,
    scale: wheelConfig.scale
  });

  return (
    <div className="relative w-full h-full">
      <div className={cropping.containerClass} style={cropping.styles as React.CSSProperties}>
        <SmartWheel
          segments={smartWheelSegments}
          theme="modern"
          size={wheelSize}
          brandColors={brandColors}
          onResult={handleResult}
          onSpin={handleSpin}
          disabled={disabled}
          borderStyle={wheelConfig.borderStyle}
          customBorderColor={wheelConfig.borderColor}
          customBorderWidth={wheelConfig.borderWidth}
          showBulbs={wheelConfig.showBulbs}
          buttonPosition="center"
          customButton={{
            text: "GO",
            color: extractedColors[0] || campaign.buttonConfig?.color || brandColors.primary,
            textColor: campaign.buttonConfig?.textColor || '#ffffff'
          }}
        />
      </div>
    </div>
  );
};

export default WheelPreview;
