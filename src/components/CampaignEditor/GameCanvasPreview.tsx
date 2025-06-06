import React from 'react';
import Jackpot from '../GameTypes/Jackpot';
import { Quiz } from '../GameTypes';
import WheelPreview from '../GameTypes/WheelPreview';
import MemoryPreview from '../GameTypes/MemoryPreview';
import PuzzlePreview from '../GameTypes/PuzzlePreview';
import ScratchPreview from '../GameTypes/ScratchPreview';
import DicePreview from '../GameTypes/DicePreview';
import { GAME_SIZES, GameSize } from '../configurators/GameSizeSelector';

interface GameCanvasPreviewProps {
  campaign: any;
  className?: string;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const GameCanvasPreview: React.FC<GameCanvasPreviewProps> = ({
  campaign,
  className = "",
  previewDevice = 'desktop'
}) => {
  console.log('GameCanvasPreview received campaign:', campaign);
  console.log('Game config:', campaign.gameConfig);
  console.log('Button config:', campaign.buttonConfig);

  const gameBackgroundImage =
    campaign.gameConfig?.[campaign.type]?.backgroundImage ||
    campaign.design?.backgroundImage;
  const buttonLabel = campaign.gameConfig?.[campaign.type]?.buttonLabel || campaign.buttonConfig?.text || 'Jouer';
  const buttonColor = campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60';

  // Get game size and position from campaign with proper typing
  const gameSize: GameSize = (campaign.gameSize && Object.keys(GAME_SIZES).includes(campaign.gameSize))
    ? campaign.gameSize as GameSize
    : 'medium';
  const gamePosition = campaign.gamePosition || 'center';

  // Get dimensions based on game size
  const gameDimensions = GAME_SIZES[gameSize];

  console.log('Using gameSize:', gameSize, 'dimensions:', gameDimensions);
  console.log('Using gamePosition:', gamePosition);
  console.log('Using buttonLabel:', buttonLabel, 'buttonColor:', buttonColor);

  // Crop the wheel only on mobile when positioned left, right or bottom
  const isMobile = previewDevice === 'mobile';
  const isWheelGame = campaign.type === 'wheel';
  const isCroppablePosition = ['left', 'right', 'bottom'].includes(gamePosition);
  const shouldCropWheel = isMobile && isWheelGame && isCroppablePosition;

  // Calculate positioning styles based on gamePosition
  const getPositionStyles = () => {
    const baseStyles = {
      width: `${gameDimensions.width}px`,
      height: `${gameDimensions.height}px`,
      maxWidth: `${gameDimensions.width}px`,
      maxHeight: `${gameDimensions.height}px`,
    };

    // When cropping the wheel, let WheelContainer handle positioning completely
    if (shouldCropWheel) {
      return {
        width: '100%',
        height: '100%',
        position: 'relative' as const
      };
    }

    // Default positioning for non-cropped cases
    switch (gamePosition) {
      case 'top':
        return {
          ...baseStyles,
          alignSelf: 'flex-start',
          margin: '20px auto 0 auto'
        };
      case 'bottom':
        return {
          ...baseStyles,
          alignSelf: 'flex-end',
          margin: '0 auto 20px auto'
        };
      case 'left':
        return {
          ...baseStyles,
          alignSelf: 'center',
          margin: 'auto 0 auto 20px'
        };
      case 'right':
        return {
          ...baseStyles,
          alignSelf: 'center',
          margin: 'auto 20px auto 0'
        };
      case 'center':
      default:
        return {
          ...baseStyles,
          alignSelf: 'center',
          margin: 'auto'
        };
    }
  };

  const renderGame = () => {
    const gameContainerStyle = getPositionStyles();

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
              gamePosition={gamePosition}
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
              isPreview={true}
              instantWinConfig={campaign.gameConfig?.scratch?.instantWin || {
                mode: 'instant_winner' as const,
                winProbability: 0.1,
                maxWinners: 10,
                winnersCount: 0
              }}
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
      default:
        return (
          <div className="text-center text-gray-500 flex items-center justify-center h-full">
            <p className="text-sm">Type de jeu non pris en charge</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ minHeight: '600px' }}
      key={`game-preview-${gameSize}-${gamePosition}-${previewDevice}-${buttonColor}-${JSON.stringify(campaign.gameConfig?.[campaign.type])}`}
    >
      {/* Image de fond plein écran */}
      {gameBackgroundImage && (
        <img
          src={gameBackgroundImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Conteneur pour le jeu avec positionnement dynamique */}
      <div className="relative z-20 w-full h-full flex">
        {renderGame()}
      </div>
    </div>
  );
};

export default GameCanvasPreview;
