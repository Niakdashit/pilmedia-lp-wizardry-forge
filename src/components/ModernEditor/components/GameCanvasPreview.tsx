import React, { useCallback, memo } from 'react';
import DeviceFrame from './DeviceFrame';
import GameRenderer from './GameRenderer';
import GamePositioner from './GamePositioner';
import GameConfigProvider from './GameConfigProvider';

interface GameCanvasPreviewProps {
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  disableForm?: boolean;
  onGameFinish?: (result: any) => void;
}

const GameCanvasPreview: React.FC<GameCanvasPreviewProps> = ({
  campaign,
  previewDevice,
  disableForm = true,
  onGameFinish
}) => {
  // Callback optimisé pour la fin de jeu
  const handleGameFinish = useCallback((result: any) => {
    console.log('GameCanvasPreview - Jeu terminé avec résultat:', result);
    onGameFinish?.(result);
  }, [onGameFinish]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <GameConfigProvider campaign={campaign}>
        {(gameConfig) => (
          <DeviceFrame device={previewDevice}>
            <GamePositioner campaign={campaign}>
              <GameRenderer
                campaign={campaign}
                gameConfig={gameConfig}
                previewDevice={previewDevice}
                disableForm={disableForm}
                onGameFinish={handleGameFinish}
              />
            </GamePositioner>
          </DeviceFrame>
        )}
      </GameConfigProvider>
    </div>
  );
};

export default memo(GameCanvasPreview);