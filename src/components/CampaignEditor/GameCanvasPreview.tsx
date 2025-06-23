
import React from 'react';
import GameRenderer from './GameRenderer';
import { GameSize, GAME_SIZES } from '../configurators/GameSizeSelector';
import { getCampaignBackgroundImage } from '../../utils/background';

interface GameCanvasPreviewProps {
  campaign: any;
  gameSize: GameSize;
  gameBackgroundImage?: string;
  className?: string;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const GameCanvasPreview: React.FC<GameCanvasPreviewProps> = ({
  campaign,
  gameSize,
  gameBackgroundImage,
  className = '',
  previewDevice = 'desktop'
}) => {
  // Résoudre l'image de fond à afficher (priorité à la prop, fallback sur config)
  const resolvedBackground =
    gameBackgroundImage || getCampaignBackgroundImage(campaign, previewDevice);

  const getContainerClasses = () => {
    const baseClasses = "bg-white border-2 border-gray-200 overflow-hidden";
    
    if (previewDevice === 'mobile') {
      return `${baseClasses} rounded-3xl shadow-2xl`;
    } else if (previewDevice === 'tablet') {
      return `${baseClasses} rounded-2xl shadow-xl`;
    } else {
      return `${baseClasses} rounded-xl shadow-lg`;
    }
  };

  const getContainerStyle = () => {
    const dimensions = GAME_SIZES[gameSize];
    const baseMinHeight = Math.max(dimensions.height + 100, 400);

    const baseStyle: React.CSSProperties = {
      minHeight: `${baseMinHeight}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    };

    if (previewDevice === 'mobile') {
      return {
        ...baseStyle,
        padding: '16px',
        minHeight: `${Math.max(baseMinHeight, 600)}px`
      };
    } else if (previewDevice === 'tablet') {
      return {
        ...baseStyle,
        padding: '24px',
        minHeight: `${Math.max(baseMinHeight, 500)}px`
      };
    }

    return {
      ...baseStyle,
      padding: '32px',
      minHeight: `${baseMinHeight}px`
    };
  };

  return (
    <div 
      className={`${getContainerClasses()} ${className}`}
      style={getContainerStyle()}
    >
      <GameRenderer
        campaign={campaign}
        gameSize={gameSize}
        previewDevice={previewDevice}
        buttonLabel={campaign.buttonConfig?.text || campaign.gameConfig?.[campaign.type]?.buttonLabel}
        buttonColor={campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60'}
        gameBackgroundImage={resolvedBackground}
        className="w-full h-full flex items-center justify-center"
      />
    </div>
  );
};

export default GameCanvasPreview;
