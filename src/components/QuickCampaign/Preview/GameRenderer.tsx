import React from 'react';
import WheelPreview from '../../GameTypes/WheelPreview';
import { Jackpot } from '../../GameTypes';
import ScratchPreview from '../../GameTypes/ScratchPreview';
import DicePreview from '../../GameTypes/DicePreview';
import FormPreview from '../../GameTypes/FormPreview';
import { applyBrandStyleToWheel, BrandColors } from '../../../utils/BrandStyleAnalyzer';

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

  // Appliquer la charte de marque à la configuration de la roue
  const synchronizedCampaign = applyBrandStyleToWheel(mockCampaign, customColors as BrandColors);
  synchronizedCampaign.design = {
    ...synchronizedCampaign.design,
    centerLogo: logoUrl || synchronizedCampaign.design?.centerLogo,
  };

  // Style universel pour tout centrer verticalement et horizontalement
  const centeredContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: '400px',
    position: 'relative',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const gameWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '20px'
  };

  switch (gameType) {
    case 'wheel':
      return (
        <div style={centeredContainerStyle}>
          <div style={gameWrapperStyle}>
            <WheelPreview
              campaign={synchronizedCampaign}
              config={mockCampaign.gameConfig?.wheel || {
                mode: "instant_winner" as const,
                winProbability: 0.1,
                maxWinners: 10,
                winnersCount: 0
              }}
              gameSize={gameSize}
              gamePosition={gamePosition}
              previewDevice={previewDevice}
            />
          </div>
        </div>
      );
    case 'jackpot':
      return (
        <div style={centeredContainerStyle}>
          <div style={gameWrapperStyle}>
            <Jackpot
              isPreview={true}
              instantWinConfig={mockCampaign.gameConfig?.jackpot?.instantWin || {
                mode: "instant_winner" as const,
                winProbability: 0.1,
                maxWinners: 10,
                winnersCount: 0
              }}
              buttonLabel={mockCampaign.gameConfig?.jackpot?.buttonLabel || mockCampaign.buttonConfig?.text || 'Lancer le Jackpot'}
              buttonColor={customColors.primary}
              backgroundImage={mockCampaign.gameConfig?.jackpot?.backgroundImage}
              containerBackgroundColor={jackpotColors.containerBackgroundColor}
              backgroundColor={jackpotColors.backgroundColor}
              borderColor={jackpotColors.borderColor}
              borderWidth={jackpotColors.borderWidth}
              slotBorderColor={jackpotColors.slotBorderColor}
              slotBorderWidth={jackpotColors.slotBorderWidth}
              slotBackgroundColor={jackpotColors.slotBackgroundColor}
            />
          </div>
        </div>
      );
    case 'scratch':
      return (
        <div style={centeredContainerStyle}>
          <div style={gameWrapperStyle}>
            <ScratchPreview
              config={mockCampaign.gameConfig?.scratch || {}}
              autoStart
            />
          </div>
        </div>
      );
    case 'dice':
      return (
        <div style={centeredContainerStyle}>
          <div style={gameWrapperStyle}>
            <DicePreview
              config={mockCampaign.gameConfig?.dice || {}}
            />
          </div>
        </div>
      );
    case 'form':
      return (
        <div style={centeredContainerStyle}>
          <div style={gameWrapperStyle}>
            <FormPreview
              campaign={synchronizedCampaign}
              gameSize={gameSize}
            />
          </div>
        </div>
      );
    default:
      return (
        <div style={centeredContainerStyle}>
          <div style={gameWrapperStyle}>
            <div className="text-center text-gray-500">
              <p>Type de jeu non supporté: {gameType}</p>
            </div>
          </div>
        </div>
      );
  }
};

export default GameRenderer;
