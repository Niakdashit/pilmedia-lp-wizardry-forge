
import React from 'react';
import Jackpot from '../GameTypes/Jackpot';
import QuizPreview from '../GameTypes/QuizPreview';
import WheelPreview from '../GameTypes/WheelPreview';
import MemoryPreview from '../GameTypes/MemoryPreview';
import PuzzlePreview from '../GameTypes/PuzzlePreview';
import ScratchPreview from '../GameTypes/ScratchPreview';
import DicePreview from '../GameTypes/DicePreview';
import FormPreview from '../GameTypes/FormPreview';
import { GameSize } from '../configurators/GameSizeSelector';
import { useGamePositionCalculator } from './GamePositionCalculator';
import useCenteredStyles from '../../hooks/useCenteredStyles';
import { createSynchronizedQuizCampaign } from '../../utils/quizConfigSync';

interface GameRendererProps {
  campaign: any;
  gameSize: GameSize;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  buttonLabel: string;
  buttonColor: string;
  gameBackgroundImage?: string;
}

const GameRenderer: React.FC<GameRendererProps> = ({
  campaign,
  gameSize,
  previewDevice,
  buttonLabel,
  buttonColor,
  gameBackgroundImage
}) => {
  const { containerStyle, wrapperStyle } = useCenteredStyles();
  const gamePosition = campaign.gamePosition || 'center';
  const { getPositionStyles } = useGamePositionCalculator({
    gameSize,
    gamePosition,
    shouldCropWheel: false
  });

  const baseContainerStyle = {
    ...containerStyle,
    minHeight: '400px',
    padding: '20px',
    boxSizing: 'border-box' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  const baseWrapperStyle = {
    ...wrapperStyle,
    ...getPositionStyles(),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  };

  // Utiliser le système de synchronisation pour le quiz
  const enhancedCampaign = campaign.type === 'quiz' 
    ? createSynchronizedQuizCampaign(campaign)
    : campaign;

  switch (campaign.type) {
    case 'jackpot':
      return (
        <div style={baseContainerStyle}>
          <div style={baseWrapperStyle}>
            <Jackpot
              isPreview={true}
              instantWinConfig={{
                mode: 'instant_winner' as const,
                winProbability: campaign.gameConfig?.jackpot?.instantWin?.winProbability || 0.05,
                maxWinners: campaign.gameConfig?.jackpot?.instantWin?.maxWinners,
                winnersCount: 0
              }}
              buttonLabel={buttonLabel}
              buttonColor={buttonColor}
              backgroundImage={gameBackgroundImage}
              containerBackgroundColor={campaign.gameConfig?.jackpot?.containerBackgroundColor || '#1f2937'}
              backgroundColor={campaign.gameConfig?.jackpot?.backgroundColor || '#c4b5fd30'}
              borderColor={campaign.gameConfig?.jackpot?.borderColor || '#8b5cf6'}
              borderWidth={campaign.gameConfig?.jackpot?.borderWidth || 3}
              slotBorderColor={campaign.gameConfig?.jackpot?.slotBorderColor || '#a78bfa'}
              slotBorderWidth={campaign.gameConfig?.jackpot?.slotBorderWidth || 2}
              slotBackgroundColor={campaign.gameConfig?.jackpot?.slotBackgroundColor || '#ffffff'}
            />
          </div>
        </div>
      );

    case 'quiz':
      return (
        <div style={baseContainerStyle}>
          <div style={baseWrapperStyle}>
            <div style={{ 
              width: '100%', 
              maxWidth: '800px', 
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <QuizPreview
                config={enhancedCampaign.gameConfig?.quiz || {}}
                design={enhancedCampaign.design}
              />
            </div>
          </div>
        </div>
      );

    case 'wheel':
      return (
        <div style={baseContainerStyle}>
          <div style={baseWrapperStyle}>
            <WheelPreview
              campaign={campaign}
              config={{
                mode: 'instant_winner' as const,
                winProbability: campaign.gameConfig?.wheel?.winProbability || 0.1,
                maxWinners: campaign.gameConfig?.wheel?.maxWinners,
                winnersCount: 0
              }}
              onFinish={() => {}}
              gameSize={gameSize}
              gamePosition={gamePosition}
              previewDevice={previewDevice}
              key={`${gameSize}-center-${previewDevice}-${JSON.stringify(campaign.gameConfig?.wheel)}`}
            />
          </div>
        </div>
      );

    case 'scratch':
      return (
        <div style={baseContainerStyle}>
          <div style={baseWrapperStyle}>
            <ScratchPreview
              config={campaign.gameConfig?.scratch || {}}
              buttonLabel={buttonLabel}
              buttonColor={buttonColor}
              gameSize={gameSize}
              autoStart
            />
          </div>
        </div>
      );

    case 'memory':
      return (
        <div style={baseContainerStyle}>
          <div style={baseWrapperStyle}>
            <MemoryPreview config={campaign.gameConfig?.memory || {}} />
          </div>
        </div>
      );

    case 'puzzle':
      return (
        <div style={baseContainerStyle}>
          <div style={baseWrapperStyle}>
            <PuzzlePreview config={campaign.gameConfig?.puzzle || {}} />
          </div>
        </div>
      );

    case 'dice':
      return (
        <div style={baseContainerStyle}>
          <div style={baseWrapperStyle}>
            <DicePreview config={campaign.gameConfig?.dice || {}} />
          </div>
        </div>
      );

    case 'form':
      return (
        <div style={baseContainerStyle}>
          <div style={baseWrapperStyle}>
            <FormPreview
              campaign={campaign}
              gameSize={gameSize}
            />
          </div>
        </div>
      );

    default:
      return (
        <div style={baseContainerStyle}>
          <div style={baseWrapperStyle}>
            <div className="text-center text-gray-500 flex items-center justify-center h-full">
              <p className="text-sm">Type de jeu non pris en charge</p>
            </div>
          </div>
        </div>
      );
  }
};

export default GameRenderer;
