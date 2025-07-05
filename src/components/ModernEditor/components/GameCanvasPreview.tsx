import React, { useCallback, memo, useState } from 'react';
import DeviceFrame from './DeviceFrame';
import GameRenderer from './GameRenderer';
import GamePositioner from './GamePositioner';
import GameConfigProvider from './GameConfigProvider';
import PreviewErrorBoundary from './ErrorBoundary';
import PreviewFeedback from './PreviewFeedback';
import DeviceTransition from './DeviceTransition';

interface GameCanvasPreviewProps {
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  disableForm?: boolean;
  onGameFinish?: (result: any) => void;
  isLoading?: boolean;
}

const GameCanvasPreview: React.FC<GameCanvasPreviewProps> = ({
  campaign,
  previewDevice,
  disableForm = true,
  onGameFinish,
  isLoading = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isChangingDevice, setIsChangingDevice] = useState(false);

  // Callback optimisé pour la fin de jeu
  const handleGameFinish = useCallback((result: any) => {
    console.log('GameCanvasPreview - Jeu terminé avec résultat:', result);
    onGameFinish?.(result);
  }, [onGameFinish]);

  // Handle device changes with transition
  const handleDeviceTransition = useCallback(() => {
    setIsChangingDevice(true);
    setTimeout(() => setIsChangingDevice(false), 300);
  }, []);

  const handleError = useCallback((error: Error) => {
    setError(error.message);
    console.error('GameCanvasPreview Error:', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    handleDeviceTransition();
  }, [previewDevice, handleDeviceTransition]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <PreviewErrorBoundary onError={handleError}>
        <DeviceTransition device={previewDevice} isChanging={isChangingDevice}>
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
        </DeviceTransition>
        
        {/* Feedback overlay */}
        <PreviewFeedback
          device={previewDevice}
          isLoading={isLoading}
          error={error}
          onClose={clearError}
          showRealSizeIndicator={true}
        />
      </PreviewErrorBoundary>
    </div>
  );
};

export default memo(GameCanvasPreview);