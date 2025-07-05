
import React, { useCallback, memo, useState } from 'react';
import DeviceFrame from './DeviceFrame';
import GameRenderer from './GameRenderer';
import GamePositioner from './GamePositioner';
import GameConfigProvider from './GameConfigProvider';
import PreviewErrorBoundary from './ErrorBoundary';
import PreviewFeedback from './PreviewFeedback';
import DeviceTransition from './DeviceTransition';
import InteractiveDragDropOverlay from './InteractiveDragDropOverlay';
import DragDropToggle from './DragDropToggle';
import CustomElementsRenderer from './CustomElementsRenderer';

interface GameCanvasPreviewProps {
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  disableForm?: boolean;
  onGameFinish?: (result: any) => void;
  isLoading?: boolean;
  setCampaign?: (updater: (prev: any) => any) => void;
}

const GameCanvasPreview: React.FC<GameCanvasPreviewProps> = ({
  campaign,
  previewDevice,
  disableForm = true,
  onGameFinish,
  isLoading = false,
  setCampaign
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isChangingDevice, setIsChangingDevice] = useState(false);
  const [isDragDropEnabled, setIsDragDropEnabled] = useState(false);

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

  const hasCustomElements = (campaign.design?.customTexts?.length > 0) || (campaign.design?.customImages?.length > 0);

  const sizeMap: Record<string, string> = {
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '28px',
    '5xl': '32px',
    '6xl': '36px',
    '7xl': '48px',
    '8xl': '60px',
    '9xl': '72px'
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Drag & Drop Toggle - only show if we have custom elements and setCampaign is available */}
      {hasCustomElements && setCampaign && (
        <div className="absolute top-2 right-2 z-30">
          <DragDropToggle
            isEnabled={isDragDropEnabled}
            onToggle={setIsDragDropEnabled}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center relative">
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
                    
                    {/* Always render custom elements when not in interactive mode */}
                    {!isDragDropEnabled && (
                      <CustomElementsRenderer
                        customTexts={campaign.design?.customTexts || []}
                        customImages={campaign.design?.customImages || []}
                        previewDevice={previewDevice}
                        sizeMap={sizeMap}
                      />
                    )}
                  </GamePositioner>
                  
                  {/* Interactive overlay when drag&drop is enabled */}
                  {isDragDropEnabled && setCampaign && (
                    <InteractiveDragDropOverlay
                      campaign={campaign}
                      setCampaign={setCampaign}
                      previewDevice={previewDevice}
                      isEnabled={isDragDropEnabled}
                    />
                  )}
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
    </div>
  );
};

export default memo(GameCanvasPreview);
