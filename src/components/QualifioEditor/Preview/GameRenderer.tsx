
import React from 'react';
import type { DeviceType, EditorConfig } from '../QualifioEditorLayout';
import WheelContainer from './WheelContainer';

interface GameRendererProps {
  gameType?: string;
  config: EditorConfig;
  device: DeviceType;
}

const GameRenderer: React.FC<GameRendererProps> = ({ 
  gameType, 
  config, 
  device 
}) => {
  const currentGameType = gameType || config.gameType || 'wheel';

  if (currentGameType === 'wheel') {
    return (
      <WheelContainer
        device={device}
        config={config}
        isMode1={false}
        isVisible={true}
      />
    );
  }

  // Placeholder pour les autres types de jeux
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center p-8 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {currentGameType.charAt(0).toUpperCase() + currentGameType.slice(1)}
        </h3>
        <p className="text-gray-600">Jeu en développement</p>
      </div>
    </div>
  );
};

export default GameRenderer;
