import React from 'react';
import WheelPreview from '../../GameTypes/WheelPreview';
import { Jackpot } from '../../GameTypes';
import ScratchPreview from '../../GameTypes/ScratchPreview';
import DicePreview from '../../GameTypes/DicePreview';
import FormPreview from '../../GameTypes/FormPreview';

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
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const GameRenderer: React.FC<GameRendererProps> = ({
  gameType,
  mockCampaign,
  customColors,
  jackpotColors,
  gameSize = 'large',
  gamePosition = 'center',
  previewDevice = 'desktop'
}) => {

  // Synchroniser les couleurs de la roue avec les couleurs personnalisées
  const synchronizedCampaign = {
    ...mockCampaign,
    config: {
      ...mockCampaign.config,
      roulette: {
        ...mockCampaign.config?.roulette,
        borderColor: customColors.primary,
        borderOutlineColor: customColors.accent || customColors.secondary,
        segmentColor1: customColors.primary,
        segmentColor2: customColors.secondary,
        segments: mockCampaign.config?.roulette?.segments?.map((segment: any, index: number) => ({
          ...segment,
          color: index % 2 === 0 ? customColors.primary : customColors.secondary
        })) || []
      }
    },
    design: {
      ...mockCampaign.design,
      customColors: customColors
    },
    buttonConfig: {
      ...mockCampaign.buttonConfig,
      color: customColors.primary,
      borderColor: customColors.primary
    }
  };

  switch (gameType) {
    case 'wheel':
      return (
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
      );

    case 'jackpot':
      return (
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
      );

    case 'scratch':
      return (
        <ScratchPreview
          config={mockCampaign.gameConfig?.scratch || {}}
          autoStart
        />
      );

    case 'dice':
      return (
        <DicePreview 
          config={mockCampaign.gameConfig?.dice || {}}
        />
      );

    case 'form':
      return (
        <FormPreview
          campaign={synchronizedCampaign}
          gameSize={gameSize}
        />
      );

    default:
      return (
        <div className="text-center text-gray-500">
          <p>Type de jeu non supporté: {gameType}</p>
        </div>
      );
  }
};

export default GameRenderer;
