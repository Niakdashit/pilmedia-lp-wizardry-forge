import React from 'react';
import GameRenderer from './GameRenderer';
import { useGamePositionCalculator } from './GamePositionCalculator';
import { GAME_SIZES, GameSize } from '../configurators/GameSizeSelector';
import MobilePreview from './Mobile/MobilePreview';
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
  if (previewDevice === 'mobile' || previewDevice === 'tablet') {
    return (
      <div className={`w-full h-full ${className}`}>
        <MobilePreview campaign={campaign} previewMode={previewDevice} />
      </div>
    );
  }
  const baseBackgroundImage = campaign.gameConfig?.[campaign.type]?.backgroundImage || campaign.design?.backgroundImage;
  const mobileBackgroundImage = campaign.design?.mobileBackgroundImage;
  const gameBackgroundImage = previewDevice === 'mobile' && mobileBackgroundImage
    ? mobileBackgroundImage
    : baseBackgroundImage;
  const buttonLabel = campaign.gameConfig?.[campaign.type]?.buttonLabel || campaign.buttonConfig?.text || 'Jouer';
  const buttonColor = campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60';

  // Get game size and position from campaign with proper typing
  const gameSize: GameSize = campaign.gameSize && Object.keys(GAME_SIZES).includes(campaign.gameSize) ? campaign.gameSize as GameSize : 'medium';
  const gamePosition = campaign.gamePosition || 'center';

  // Check if we should crop the wheel on mobile for left/right/bottom positions
  const isWheelGame = campaign.type === 'wheel';
  const isMobile = previewDevice === 'mobile';
  const isCroppablePosition = ['left', 'right', 'bottom'].includes(gamePosition);
  const shouldCropWheel = isMobile && isWheelGame && isCroppablePosition;
  const {
    getPositionStyles
  } = useGamePositionCalculator({
    gameSize,
    gamePosition,
    shouldCropWheel
  });
  const gameContainerStyle = getPositionStyles();
  return <div className={`relative w-full h-full overflow-hidden ${className}`} style={{
    minHeight: '600px'
  }} key={`game-preview-${gameSize}-${gamePosition}-${previewDevice}-${buttonColor}-${JSON.stringify(campaign.gameConfig?.[campaign.type])}`}>
      {/* Image de fond plein écran */}
      {gameBackgroundImage && <img src={gameBackgroundImage} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" style={{
      pointerEvents: 'none'
    }} />}

      {/* Conteneur pour le jeu avec positionnement dynamique */}
      <div className="relative z-20 w-full h-full flex my-0 py-0">
        <GameRenderer campaign={campaign} gameSize={gameSize} gamePosition={gamePosition} previewDevice={previewDevice} gameContainerStyle={gameContainerStyle} buttonLabel={buttonLabel} buttonColor={buttonColor} gameBackgroundImage={gameBackgroundImage} />
      </div>
    </div>;
};
export default GameCanvasPreview;