
import React from 'react';
import { SmartWheel } from '../SmartWheel';
import { useGameSize } from '../../hooks/useGameSize';

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
  disableForm?: boolean;
  borderStyle?: string;
}

const WheelPreview: React.FC<WheelPreviewProps> = ({
  campaign,
  config,
  onFinish,
  onStart,
  gameSize = 'medium',
  previewDevice = 'desktop',
  disabled = false,
  borderStyle = 'classic'
}) => {
  const { getResponsiveDimensions } = useGameSize(gameSize);
  const gameDimensions = getResponsiveDimensions(previewDevice);

  // Récupérer les segments depuis la configuration de la campagne avec priorité aux couleurs extraites
  const segments = campaign.gameConfig?.wheel?.segments || 
                  campaign.config?.roulette?.segments || [
    { id: '1', label: 'Prix 1', color: campaign.design?.customColors?.primary || '#ff6b6b' },
    { id: '2', label: 'Prix 2', color: campaign.design?.customColors?.secondary || '#4ecdc4' },
    { id: '3', label: 'Prix 3', color: campaign.design?.customColors?.primary || '#45b7d1' },
    { id: '4', label: 'Dommage', color: campaign.design?.customColors?.secondary || '#feca57' }
  ];


  // Utiliser les couleurs extraites de l'image de fond si disponibles
  const extractedColors = campaign.design?.extractedColors || [];
  
  // Convertir les segments au format SmartWheel avec seulement 2 couleurs en alternance
  const smartWheelSegments = segments.map((segment: any, index: number) => {
    let color = segment.color;
    
    // Si on a des couleurs extraites, utiliser la couleur extraite et le blanc en alternance
    if (extractedColors.length >= 1) {
      color = index % 2 === 0 ? extractedColors[0] : '#ffffff';
    }
    
    // Couleur de texte opposée au segment
    const textColor = index % 2 === 0 ? '#ffffff' : extractedColors[0] || '#000000';
    
    return {
      id: segment.id || index.toString(),
      label: segment.label,
      color: color,
      textColor: textColor
    };
  });

  // Couleurs de marque unifiées - priorité aux customColors de la campagne
  const brandColors = {
    primary: campaign.design?.customColors?.primary || extractedColors[0] || '#841b60',
    secondary: campaign.design?.customColors?.secondary || extractedColors[1] || '#4ecdc4',
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

  // Calculer une taille de roue adaptée avec l'échelle de la campagne
  const baseSize = Math.min(gameDimensions.width, gameDimensions.height) - 40;
  const campaignScale = campaign?.design?.wheelConfig?.scale || 1;
  const wheelSize = Math.min(baseSize * 1.5 * campaignScale, Math.min(gameDimensions.width, gameDimensions.height) - 20);
  const maxWheelSize = Math.min(gameDimensions.width, gameDimensions.height) - 20;

  return (
    <div 
      className="wheel-preview-container w-full h-full flex items-end justify-center"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: '-30%'
      }}
    >
      <SmartWheel
        segments={smartWheelSegments}
        theme="modern"
        size={wheelSize}
        maxSize={maxWheelSize}
        brandColors={brandColors}
        onResult={handleResult}
        onSpin={handleSpin}
        disabled={disabled}
        borderStyle={campaign?.design?.wheelBorderStyle || borderStyle}
        customBorderColor={campaign?.design?.wheelBorderStyle === 'classic' ? (campaign.design?.customColors?.primary || brandColors?.primary) : undefined}
        buttonPosition="center"
        customButton={{
          text: "GO",
          color: extractedColors[0] || campaign.buttonConfig?.color || brandColors.primary,
          textColor: campaign.buttonConfig?.textColor || '#ffffff'
        }}
      />
    </div>
  );
};

export default WheelPreview;
