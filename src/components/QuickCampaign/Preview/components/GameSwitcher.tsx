
import React from 'react';
import WheelPreview from '../../../GameTypes/WheelPreview';
import { Jackpot } from '../../../GameTypes';
import QuizPreview from '../../../GameTypes/QuizPreview';
import ScratchPreview from '../../../GameTypes/ScratchPreview';
import DicePreview from '../../../GameTypes/DicePreview';
import FormPreview from '../../../GameTypes/FormPreview';
import AdvancedWheelRenderer from '../AdvancedWheelRenderer';
import { useQuickCampaignStore } from '../../../../stores/quickCampaignStore';
import { calculateConstrainedSize } from '../utils/previewConstraints';

interface GameSwitcherProps {
  gameType: string;
  synchronizedCampaign: any;
  mockCampaign: any;
  finalColors: {
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
  gameSize: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  containerStyle: React.CSSProperties;
  renderKey: string;
}

const GameSwitcher: React.FC<GameSwitcherProps> = ({
  gameType,
  synchronizedCampaign,
  mockCampaign,
  finalColors,
  jackpotColors,
  gameSize,
  gamePosition,
  previewDevice,
  containerStyle,
  renderKey
}) => {
  const { advancedMode } = useQuickCampaignStore();

  // Calculer les dimensions contraintes pour le conteneur
  const containerWidth = containerStyle.maxWidth ? 
    parseInt(containerStyle.maxWidth.toString()) : 800;
  const containerHeight = containerStyle.maxHeight ? 
    parseInt(containerStyle.maxHeight.toString()) : 600;

  const gameConstraints = calculateConstrainedSize(
    containerWidth,
    containerHeight,
    gameType,
    40
  );

  const baseContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    maxWidth: `${gameConstraints.width}px`,
    maxHeight: `${gameConstraints.height}px`,
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative',
  };

  const gameContentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    maxWidth: `${gameConstraints.width - 40}px`,
    maxHeight: `${gameConstraints.height - 40}px`,
    overflow: 'hidden',
  };

  switch (gameType) {
    case 'wheel':
      const wheelContent = (
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
          key={renderKey}
          showShadow={false}
        />
      );

      return (
        <div style={baseContainerStyle}>
          <div style={gameContentStyle}>
            {advancedMode ? (
              <AdvancedWheelRenderer>
                {wheelContent}
              </AdvancedWheelRenderer>
            ) : (
              wheelContent
            )}
          </div>
        </div>
      );

    case 'jackpot':
      return (
        <div style={baseContainerStyle}>
          <div style={gameContentStyle}>
            <Jackpot
              isPreview={true}
              instantWinConfig={mockCampaign.gameConfig?.jackpot?.instantWin || {
                mode: "instant_winner" as const,
                winProbability: 0.1,
                maxWinners: 10,
                winnersCount: 0
              }}
              buttonLabel={mockCampaign.gameConfig?.jackpot?.buttonLabel || 'Lancer le Jackpot'}
              buttonColor={finalColors.primary}
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

    case 'quiz':
      return (
        <div style={baseContainerStyle}>
          <div style={{
            ...gameContentStyle,
            maxWidth: `${Math.min(gameConstraints.width - 40, 600)}px`,
          }}>
            <QuizPreview
              config={mockCampaign.gameConfig?.quiz || {
                questions: [
                  {
                    id: 1,
                    text: 'Question exemple',
                    type: 'multiple',
                    options: [
                      { id: 1, text: 'Option A', isCorrect: false },
                      { id: 2, text: 'Option B', isCorrect: true }
                    ]
                  }
                ]
              }}
              design={synchronizedCampaign.design}
              key={renderKey}
            />
          </div>
        </div>
      );

    case 'scratch':
      return (
        <div style={baseContainerStyle}>
          <div style={gameContentStyle}>
            <ScratchPreview
              config={mockCampaign.gameConfig?.scratch || {}}
              autoStart
            />
          </div>
        </div>
      );

    case 'dice':
      return (
        <div style={baseContainerStyle}>
          <div style={gameContentStyle}>
            <DicePreview
              config={mockCampaign.gameConfig?.dice || {}}
            />
          </div>
        </div>
      );

    case 'form':
      return (
        <div style={baseContainerStyle}>
          <div style={gameContentStyle}>
            <FormPreview
              campaign={synchronizedCampaign}
              gameSize={gameSize}
            />
          </div>
        </div>
      );

    default:
      return (
        <div style={baseContainerStyle}>
          <div style={gameContentStyle}>
            <div className="text-center text-gray-500 p-4">
              <p>Type de jeu non supporté: {gameType}</p>
            </div>
          </div>
        </div>
      );
  }
};

export default GameSwitcher;
