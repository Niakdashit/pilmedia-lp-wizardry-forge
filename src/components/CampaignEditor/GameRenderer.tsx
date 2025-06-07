
import React from 'react';
import Jackpot from '../GameTypes/Jackpot';
import { Quiz } from '../GameTypes';
import WheelPreview from '../GameTypes/WheelPreview';
import MemoryPreview from '../GameTypes/MemoryPreview';
import PuzzlePreview from '../GameTypes/PuzzlePreview';
import ScratchPreview from '../GameTypes/ScratchPreview';
import DicePreview from '../GameTypes/DicePreview';
import FormPreview from '../GameTypes/FormPreview';
import { GameSize } from '../configurators/GameSizeSelector';

interface GameRendererProps {
  campaign: any;
  gameSize: GameSize;
  gamePosition: string;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  gameContainerStyle: any;
  buttonLabel: string;
  buttonColor: string;
  gameBackgroundImage?: string;
}

const GameRenderer: React.FC<GameRendererProps> = ({
  campaign,
  gameSize,
  gamePosition,
  previewDevice,
  gameContainerStyle,
  buttonLabel,
  buttonColor,
  gameBackgroundImage
}) => {
  // Ensure gamePosition is properly typed for WheelPreview
  const validGamePosition = (['top', 'center', 'bottom', 'left', 'right'].includes(gamePosition) 
    ? gamePosition 
    : 'center') as 'top' | 'center' | 'bottom' | 'left' | 'right';

  switch (campaign.type) {
    case 'jackpot':
      return (
        <div style={gameContainerStyle}>
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
      );
    case 'quiz':
      return (
        <div style={gameContainerStyle}>
          <Quiz config={campaign.gameConfig?.quiz || {}} onConfigChange={() => {}} />
        </div>
      );
    case 'wheel':
      return (
        <div style={gameContainerStyle}>
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
            gamePosition={validGamePosition}
            previewDevice={previewDevice}
            key={`${gameSize}-${gamePosition}-${previewDevice}-${JSON.stringify(campaign.gameConfig?.wheel)}`}
          />
        </div>
      );
    case 'scratch':
      return (
        <div style={gameContainerStyle}>
          <ScratchPreview
            config={campaign.gameConfig?.scratch || {}}
            buttonLabel={buttonLabel}
            buttonColor={buttonColor}
            gameSize={gameSize}
            autoStart
          />
        </div>
      );
    case 'memory':
      return (
        <div style={gameContainerStyle}>
          <MemoryPreview config={campaign.gameConfig?.memory || {}} />
        </div>
      );
    case 'puzzle':
      return (
        <div style={gameContainerStyle}>
          <PuzzlePreview config={campaign.gameConfig?.puzzle || {}} />
        </div>
      );
    case 'dice':
      return (
        <div style={gameContainerStyle}>
          <DicePreview config={campaign.gameConfig?.dice || {}} />
        </div>
      );
    case 'form':
      return (
        <div style={gameContainerStyle}>
          <FormPreview
            campaign={campaign}
            gameSize={gameSize}
          />
        </div>
      );
    default:
      return (
        <div className="text-center text-gray-500 flex items-center justify-center h-full">
          <p className="text-sm">Type de jeu non pris en charge</p>
        </div>
      );
  }
};

export default GameRenderer;
