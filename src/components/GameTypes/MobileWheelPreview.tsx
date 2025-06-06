
import React from 'react';
import WheelCanvas from './MobileWheel/WheelCanvas';
import WheelDecorations from './MobileWheel/WheelDecorations';
import WheelPointer from './MobileWheel/WheelPointer';

interface MobileWheelPreviewProps {
  campaign: any;
  gamePosition?: 'left' | 'right' | 'center' | 'top' | 'bottom';
}

const CANVAS_SIZE = 280;

const MobileWheelPreview: React.FC<MobileWheelPreviewProps> = ({
  campaign,
  gamePosition = 'center'
}) => {
  const mobileRouletteConfig = campaign?.mobileConfig?.roulette || campaign?.config?.roulette || {};
  const segments = mobileRouletteConfig.segments || campaign?.config?.roulette?.segments || [];
  const centerImage = mobileRouletteConfig.centerImage || campaign?.config?.roulette?.centerImage;
  const theme = mobileRouletteConfig.theme || campaign?.config?.roulette?.theme || 'default';
  const borderColor = mobileRouletteConfig.borderColor || campaign?.config?.roulette?.borderColor || '#841b60';
  const pointerColor = mobileRouletteConfig.pointerColor || campaign?.config?.roulette?.pointerColor || '#841b60';

  const canvasSize = mobileRouletteConfig.size || mobileRouletteConfig.width || campaign?.config?.roulette?.size || campaign?.config?.roulette?.width || CANVAS_SIZE;

  if (segments.length === 0) {
    return null;
  }

  // Positionnement absolu fixe pour chaque position - complètement indépendant du contenu
  const getAbsoluteGameStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10,
      pointerEvents: 'none'
    };

    switch (gamePosition) {
      case 'left':
        return {
          ...baseStyle,
          left: `-${canvasSize / 2}px`, // Toujours à moitié cachée
          top: '50%',
          transform: 'translateY(-50%)',
          width: canvasSize,
          height: canvasSize
        };
      
      case 'right':
        return {
          ...baseStyle,
          right: `-${canvasSize / 2}px`, // Toujours à moitié cachée
          top: '50%',
          transform: 'translateY(-50%)',
          width: canvasSize,
          height: canvasSize
        };
      
      case 'top':
        return {
          ...baseStyle,
          top: `-${canvasSize / 2}px`, // Toujours à moitié cachée
          left: '50%',
          transform: 'translateX(-50%)',
          width: canvasSize,
          height: canvasSize
        };
      
      case 'bottom':
        return {
          ...baseStyle,
          bottom: `-${canvasSize / 2}px`, // Toujours à moitié cachée
          left: '50%',
          transform: 'translateX(-50%)',
          width: canvasSize,
          height: canvasSize
        };
      
      case 'center':
      default:
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: canvasSize,
          height: canvasSize
        };
    }
  };

  // Détermine si on doit couper la roue (positions left/right/bottom)
  const shouldCropWheel = ['left', 'right', 'bottom'].includes(gamePosition);

  const containerWidth =
    shouldCropWheel && (gamePosition === 'left' || gamePosition === 'right')
      ? canvasSize / 2
      : canvasSize;

  const containerHeight =
    shouldCropWheel && gamePosition === 'bottom' ? canvasSize / 2 : canvasSize;
  
  // Offset pour le canvas dans le conteneur
  const getCanvasOffset = () => {
    if (!shouldCropWheel) return '0px';
    if (gamePosition === 'right') return `-${canvasSize / 2}px`;
    return '0px';
  };

  const renderWheelContainer = () => (
    <div style={{ position: 'relative', width: containerWidth, height: containerHeight, overflow: 'hidden' }}>
      <WheelCanvas
        segments={segments}
        centerImage={centerImage}
        theme={theme}
        borderColor={borderColor}
        canvasSize={canvasSize}
        offset={getCanvasOffset()}
        position={
          gamePosition === 'left'
            ? 'gauche'
            : gamePosition === 'right'
            ? 'droite'
            : gamePosition === 'bottom'
            ? 'bas'
            : 'centre'
        }
      />
      
      <WheelDecorations
        theme={theme}
        canvasSize={canvasSize}
        offset={getCanvasOffset()}
      />
      
      <WheelPointer
        pointerColor={pointerColor}
        gamePosition={gamePosition}
        containerWidth={containerWidth}
        canvasSize={canvasSize}
        shouldCropWheel={shouldCropWheel}
      />
    </div>
  );

  return (
    <div style={getAbsoluteGameStyle()}>
      {renderWheelContainer()}
    </div>
  );
};

export default MobileWheelPreview;
