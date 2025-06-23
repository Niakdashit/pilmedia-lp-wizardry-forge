
import React from 'react';
import GameRenderer from './GameRenderer';
import { GameSize, GAME_SIZES } from '../configurators/GameSizeSelector';
import { getCampaignBackgroundImage } from '../../utils/background';

interface GameCanvasPreviewProps {
  campaign: any;
  gameSize: GameSize;
  gameBackgroundImage?: string;
  /**
   * Display a dark overlay between the background image and the game.
   * Defaults to false to show the raw background.
   */
  showBackgroundOverlay?: boolean;
  className?: string;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const GameCanvasPreview: React.FC<GameCanvasPreviewProps> = ({
  campaign,
  gameSize,
  gameBackgroundImage,
  className = '',
  previewDevice = 'desktop',
  showBackgroundOverlay = false
}) => {
  // Résoudre l'image de fond à afficher (priorité à la prop, fallback sur config)
  const resolvedBackground =
    gameBackgroundImage || getCampaignBackgroundImage(campaign, previewDevice);

  const getContainerClasses = () => {
    const baseClasses = "bg-white border-2 border-gray-200 overflow-auto";
    
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
    // Augmenter significativement la hauteur minimale pour éviter les coupures
    const baseMinHeight = Math.max(dimensions.height + 200, 600);

    const baseStyle: React.CSSProperties = {
      minHeight: `${baseMinHeight}px`,
      maxHeight: '90vh', // Limiter à 90% de la hauteur viewport
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: '100%'
    };

    if (previewDevice === 'mobile') {
      return {
        ...baseStyle,
        padding: '20px',
        minHeight: `${Math.max(baseMinHeight, 700)}px`
      };
    } else if (previewDevice === 'tablet') {
      return {
        ...baseStyle,
        padding: '24px',
        minHeight: `${Math.max(baseMinHeight, 650)}px`
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
        gameBackgroundImage={resolvedBackground}
        showBackgroundOverlay={showBackgroundOverlay}
        className="w-full h-full flex items-center justify-center"
      />
    </div>
  );
};

export default GameCanvasPreview;
