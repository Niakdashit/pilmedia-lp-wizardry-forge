
import React from 'react';
import WheelPreview from '../../GameTypes/WheelPreview';
import QuizPreview from '../../GameTypes/QuizPreview';
import ScratchPreview from '../../GameTypes/ScratchPreview';
import JackpotPreview from '../../GameTypes/JackpotPreview';
import type { DeviceType, EditorConfig } from '../GameEditorLayout';

interface GameRendererProps {
  gameType: string;
  config: EditorConfig;
  device: DeviceType;
  onResult?: (result: { id: string; label: string; color: string }) => void;
  isMode1?: boolean;
}

const GameRenderer: React.FC<GameRendererProps> = ({ gameType, config, device }) => {
  console.log('🎮 GameRenderer - Rendu du jeu:', {
    gameType,
    device,
    hasBackground: !!(config.design?.backgroundUrl || config.design?.backgroundImage)
  });

  const commonProps = {
    campaign: config,
    config: {
      mode: 'instant_winner' as const,
      winProbability: 0.5,
      winnersCount: 0
    },
    previewDevice: device,
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
