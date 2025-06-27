
import React from 'react';
import SmartWheelWrapper from '../SmartWheel/components/SmartWheelWrapper';
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
}

const WheelPreview: React.FC<WheelPreviewProps> = ({
  campaign,
  config,
  onFinish,
  onStart,
  gameSize = 'medium',
  disabled = false
}) => {
  const { getGameDimensions } = useGameSize(gameSize);
  const gameDimensions = getGameDimensions();

  // Récupérer les segments depuis la configuration de la campagne
  const segments = React.useMemo(() => {
    return campaign.gameConfig?.wheel?.segments || 
           campaign.config?.roulette?.segments || [];
  }, [campaign.gameConfig?.wheel?.segments, campaign.config?.roulette?.segments, campaign._lastUpdate]);

  // Couleurs de marque depuis la campagne
  const brandColors = React.useMemo(() => {
    return {
      primary: campaign.design?.customColors?.primary || '#841b60',
      secondary: campaign.design?.customColors?.secondary || '#4ecdc4',
      accent: campaign.design?.customColors?.accent || '#45b7d1'
    };
  }, [campaign.design?.customColors, campaign._lastUpdate]);

  const wheelSize = Math.min(gameDimensions.width, gameDimensions.height) - 40;

  const handleResult = React.useCallback(() => {
    if (onFinish) {
      // Logique de win/lose basée sur la probabilité configurée
      const isWin = Math.random() < config.winProbability;
      onFinish(isWin ? 'win' : 'lose');
    }
  }, [onFinish, config.winProbability]);

  const handleSpin = React.useCallback(() => {
    if (onStart) {
      onStart();
    }
  }, [onStart]);

  if (process.env.NODE_ENV !== 'production') {
    console.log('WheelPreview render:', {
      segments: segments.length,
      brandColors,
      wheelSize,
      lastUpdate: campaign._lastUpdate
    });
  }

  return (
    <div className="flex justify-center items-center w-full h-full">
      <SmartWheelWrapper
        campaign={campaign}
        segments={segments}
        size={wheelSize}
        gameSize={gameSize}
        brandColors={brandColors}
        onResult={handleResult}
        onSpin={handleSpin}
        disabled={disabled}
        buttonLabel={campaign.gameConfig?.wheel?.buttonLabel || 'Faire tourner'}
        lastUpdate={campaign._lastUpdate}
      />
    </div>
  );
};

export default WheelPreview;
