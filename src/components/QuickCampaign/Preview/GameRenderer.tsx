
import React from 'react';
import { synchronizeCampaignWithColors } from './utils/campaignSynchronizer';
import GameSwitcher from './components/GameSwitcher';
import { SmartWheel } from '../../SmartWheel';

interface GameRendererProps {
  gameType: string;
  mockCampaign: any;
  customColors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  jackpotColors: {
    containerBackgroundColor: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    slotBorderColor: string;
    slotBorderWidth: number;
    slotBackgroundColor: string;
  };
  logoUrl?: string;
  fontUrl?: string;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const GameRenderer: React.FC<GameRendererProps> = ({
  gameType,
  mockCampaign,
  customColors,
  jackpotColors,
  logoUrl,
  fontUrl,
  gameSize = 'large',
  gamePosition = 'center',
  previewDevice = 'desktop'
}) => {
  // Couleurs directement issues du logo
  const finalColors = customColors;

  // Chargement dynamique de la police
  React.useEffect(() => {
    if (fontUrl) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [fontUrl]);

  // Synchronisation de la campagne avec les couleurs extraites
  const synchronizedCampaign = React.useMemo(() => {
    return synchronizeCampaignWithColors(mockCampaign, finalColors, logoUrl);
  }, [mockCampaign, finalColors, logoUrl]);

  // Container style for the game
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  // Si c'est une roue, utiliser le nouveau SmartWheel
  if (gameType === 'wheel') {
    const segments = synchronizedCampaign.gameConfig?.wheel?.segments || 
                    synchronizedCampaign.config?.roulette?.segments || [
      { id: '1', label: 'Cadeau 1', color: finalColors.primary },
      { id: '2', label: 'Cadeau 2', color: finalColors.secondary },
      { id: '3', label: 'Cadeau 3', color: finalColors.accent || finalColors.primary },
      { id: '4', label: 'Cadeau 4', color: finalColors.primary },
    ];

    const wheelSize = gameSize === 'small' ? 200 : 
                     gameSize === 'medium' ? 300 : 
                     gameSize === 'large' ? 400 : 500;

    // Récupérer le style de bordure depuis la campagne avec console.log pour debug
    const borderStyle = synchronizedCampaign.design?.wheelBorderStyle || 'classic';
    console.log('QuickCampaign GameRenderer - borderStyle from campaign:', borderStyle);
    console.log('QuickCampaign GameRenderer - full campaign.design:', synchronizedCampaign.design);

    return (
      <div style={containerStyle}>
        <SmartWheel
          segments={segments}
          theme="modern"
          size={wheelSize}
          brandColors={finalColors}
          borderStyle={borderStyle}
          onResult={(segment) => {
            console.log('Segment gagné en preview:', segment);
          }}
          customButton={{
            text: synchronizedCampaign.gameConfig?.wheel?.buttonLabel || 'Faire tourner',
            color: finalColors.primary,
            textColor: '#ffffff'
          }}
        />
      </div>
    );
  }

  // Clé de rendu forcé pour la mise à jour des couleurs
  const renderKey = `${gameType}-${JSON.stringify(finalColors)}-${Date.now()}`;

  return (
    <GameSwitcher
      gameType={gameType}
      synchronizedCampaign={synchronizedCampaign}
      mockCampaign={mockCampaign}
      finalColors={finalColors}
      jackpotColors={jackpotColors}
      gameSize={gameSize}
      gamePosition={gamePosition}
      previewDevice={previewDevice}
      containerStyle={containerStyle}
      renderKey={renderKey}
    />
  );
};

export default GameRenderer;
