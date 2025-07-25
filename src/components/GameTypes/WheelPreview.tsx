
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

  // Récupérer les segments depuis la configuration de la campagne
  const segments = campaign.gameConfig?.wheel?.segments || 
                  campaign.config?.roulette?.segments || [
    { id: '1', label: 'Prix 1', color: '#ff6b6b' },
    { id: '2', label: 'Prix 2', color: '#4ecdc4' },
    { id: '3', label: 'Prix 3', color: '#45b7d1' },
    { id: '4', label: 'Dommage', color: '#feca57' }
  ];

  // Utiliser les couleurs extraites de l'image de fond si disponibles
  const extractedColors = campaign.design?.extractedColors || [];
  
  // Convertir les segments au format SmartWheel avec couleurs extraites
  const smartWheelSegments = segments.map((segment: any, index: number) => {
    // Si on a des couleurs extraites, les utiliser cycliquement
    const color = extractedColors.length > 0 
      ? extractedColors[index % extractedColors.length]
      : segment.color;
    
    return {
      id: segment.id || index.toString(),
      label: segment.label,
      color: color,
      textColor: segment.textColor || '#ffffff'
    };
  });

  // Couleurs de marque depuis la campagne avec couleurs extraites en priorité
  const brandColors = {
    primary: extractedColors[0] || campaign.design?.customColors?.primary || '#841b60',
    secondary: extractedColors[1] || campaign.design?.customColors?.secondary || '#4ecdc4',
    accent: extractedColors[2] || campaign.design?.customColors?.accent || '#45b7d1'
  };

  const wheelSize = Math.min(gameDimensions.width, gameDimensions.height) - 40;

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

  return (
    <div className="wheel-preview-container">
      <SmartWheel
        segments={smartWheelSegments}
        theme="modern"
        size={wheelSize}
        maxSize={Math.min(gameDimensions.width, gameDimensions.height)}
        brandColors={brandColors}
        onResult={handleResult}
        onSpin={handleSpin}
        disabled={disabled}
        borderStyle={borderStyle}
        customButton={{
          text: campaign.gameConfig?.wheel?.buttonLabel || campaign.buttonConfig?.text || 'Faire tourner',
          color: extractedColors[0] || campaign.buttonConfig?.color || brandColors.primary,
          textColor: campaign.buttonConfig?.textColor || '#ffffff'
        }}
      />
    </div>
  );
};

export default WheelPreview;
