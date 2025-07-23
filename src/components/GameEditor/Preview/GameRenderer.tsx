
import React from 'react';
import WheelPreview from '../../GameTypes/WheelComponents/WheelPreview';
import QuizPreview from '../../GameTypes/QuizComponents/QuizPreview';
import ScratchPreview from '../../GameTypes/ScratchComponents/ScratchPreview';
import JackpotPreview from '../../GameTypes/JackpotComponents/JackpotPreview';
import type { DeviceType, EditorConfig } from '../GameEditorLayout';

interface GameRendererProps {
  gameType: string;
  config: EditorConfig;
  device: DeviceType;
}

const GameRenderer: React.FC<GameRendererProps> = ({ gameType, config, device }) => {
  console.log('🎮 GameRenderer - Rendu du jeu:', {
    gameType,
    device,
    hasBackground: !!config.design?.backgroundImage
  });

  const commonProps = {
    device,
    config,
    style: {
      position: 'relative' as const,
      zIndex: 10, // Z-index plus bas que les textes
      pointerEvents: 'auto' as const
    }
  };

  switch (gameType) {
    case 'wheel':
      return <WheelPreview {...commonProps} />;
    case 'quiz':
      return <QuizPreview {...commonProps} />;
    case 'scratch':
      return <ScratchPreview {...commonProps} />;
    case 'jackpot':
      return <JackpotPreview {...commonProps} />;
    default:
      return (
        <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">Type de jeu non supporté: {gameType}</p>
        </div>
      );
  }
};

export default GameRenderer;
