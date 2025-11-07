
import React, { useCallback, memo, useState, useMemo } from 'react';
import DeviceFrame from './DeviceFrame';
import GameRenderer from './GameRenderer';
import GamePositioner from './GamePositioner';
import GameConfigProvider from './GameConfigProvider';
import PreviewErrorBoundary from './ErrorBoundary';
import PreviewFeedback from './PreviewFeedback';
import DeviceTransition from './DeviceTransition';
import InteractiveDragDropOverlay from './InteractiveDragDropOverlay';
import CustomElementsRenderer from './CustomElementsRenderer';
import { useUniversalResponsive } from '../../../hooks/useUniversalResponsive';

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
  
  // Système responsif pour les éléments customisés
  const { applyAutoResponsive, getPropertiesForDevice } = useUniversalResponsive('desktop');

  // Convertir les textes en format responsif
  const responsiveTexts = useMemo(() => {
    if (!campaign?.design?.customTexts) return [];
    const convertedTexts = campaign.design.customTexts.map((text: any) => ({
      ...text,
      type: 'text' as const,
      x: text.x || 0,
      y: text.y || 0,
      fontSize: text.fontSize || 16,
      textAlign: (text.textAlign || 'left') as 'left' | 'center' | 'right'
    }));
    return applyAutoResponsive(convertedTexts);
  }, [campaign?.design?.customTexts, applyAutoResponsive]);

  // Convertir les images en format responsif
  const responsiveImages = useMemo(() => {
    if (!campaign?.design?.customImages) return [];
    const convertedImages = campaign.design.customImages.map((image: any) => ({
      ...image,
      type: 'image' as const,
      x: image.x || 0,
      y: image.y || 0,
      width: image.width || 150,
      height: image.height || 150
    }));
    return applyAutoResponsive(convertedImages);
  }, [campaign?.design?.customImages, applyAutoResponsive]);

  // Préparer les éléments pour CustomElementsRenderer
  const customTextsForRenderer = useMemo(() => {
    return responsiveTexts.map((text: any) => {
      const textProps = getPropertiesForDevice(text, previewDevice);
      return { ...text, ...textProps };
    });
  }, [responsiveTexts, getPropertiesForDevice, previewDevice]);

  const customImagesForRenderer = useMemo(() => {
    return responsiveImages.map((image: any) => {
      const imageProps = getPropertiesForDevice(image, previewDevice);
      return { ...image, ...imageProps };
    });
  }, [responsiveImages, getPropertiesForDevice, previewDevice]);

  // Size map pour le rendu responsive
  const sizeMap = useMemo(() => ({
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px'
  }), []);
  

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

  // Removed device-dependent vertical offset to unify coordinate systems with editor


  // Apply vertical offset after GamePositioner to ensure it's not overridden by wheel-specific transforms
  const renderPreviewContent = (gameConfig: any) => (
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

      {/* Neutral relative container to anchor absolutely positioned custom elements (no offset) */}
      <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 10 }}>
        <CustomElementsRenderer
          customTexts={customTextsForRenderer}
          customImages={customImagesForRenderer}
          previewDevice={previewDevice}
          sizeMap={sizeMap}
        />

        {setCampaign && (
          <InteractiveDragDropOverlay
            campaign={campaign}
            setCampaign={setCampaign}
            previewDevice={previewDevice}
            isEnabled={true}
          />
        )}
      </div>
    </DeviceFrame>
  );

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 flex items-center justify-center relative">
        <PreviewErrorBoundary onError={handleError}>
          <DeviceTransition device={previewDevice} isChanging={isChangingDevice}>
            <GameConfigProvider campaign={campaign}>
              {(gameConfig) => renderPreviewContent(gameConfig)}
            </GameConfigProvider>
          </DeviceTransition>
          
          {/* Feedback overlay - NE BLOQUE PAS l'affichage du contenu */}
          {error && (
            <PreviewFeedback
              device={previewDevice}
              isLoading={false}
              error={error}
              onClose={clearError}
              showRealSizeIndicator={false}
            />
          )}
        </PreviewErrorBoundary>
      </div>
    </div>
  );
};

export default memo(GameCanvasPreview);
