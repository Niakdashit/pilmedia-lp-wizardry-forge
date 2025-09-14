
import React from 'react';
import WheelCanvas from './MobileWheel/WheelCanvas';
import WheelDecorations from './MobileWheel/WheelDecorations';
import WheelPointer from './MobileWheel/WheelPointer';
import { GAME_SIZES, GameSize } from '../configurators/GameSizeSelector';

interface MobileWheelPreviewProps {
  campaign: any;
  gamePosition?: 'left' | 'right' | 'center' | 'top' | 'bottom';
  verticalOffset?: number;
  horizontalOffset?: number;
}

const DEFAULT_CANVAS_SIZE = 280;

const MobileWheelPreview: React.FC<MobileWheelPreviewProps> = ({
  campaign,
  gamePosition = 'center',
  verticalOffset = 0,
  horizontalOffset = 0
}) => {
  const mobileRouletteConfig = campaign?.mobileConfig?.roulette || {};
  const desktopRouletteConfig = campaign?.config?.roulette || {};
  const segments = desktopRouletteConfig.segments || [];
  const centerImage = desktopRouletteConfig.centerImage;
  const theme = desktopRouletteConfig.theme || 'default';
  const borderColor = desktopRouletteConfig.borderColor || '#841b60';
  const pointerColor = desktopRouletteConfig.pointerColor || '#841b60';
  const hideLaunchButton = campaign?.mobileConfig?.hideLaunchButton || false;

  // Get game size from campaign and calculate canvas size
  const gameSize: GameSize = campaign.gameSize || 'medium';
  const gameDimensions = GAME_SIZES[gameSize];
  
  // Scale the wheel size based on game size settings
  // Use the smaller dimension to maintain aspect ratio
  const scaleFactor = Math.min(gameDimensions.width, gameDimensions.height) / 400; // 400 is our reference size
  const calculatedCanvasSize = Math.max(200, Math.min(600, DEFAULT_CANVAS_SIZE * scaleFactor));

  const canvasSize =
    mobileRouletteConfig.size ||
    mobileRouletteConfig.width ||
    desktopRouletteConfig.size ||
    desktopRouletteConfig.width ||
    calculatedCanvasSize;

  if (segments.length === 0) {
    return null;
  }

  const getAbsoluteGameStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10,
      pointerEvents: 'none',
      width: canvasSize,
      height: canvasSize
    };

    switch (gamePosition) {
      case 'left':
        return {
          ...baseStyle,
          top: '50%',
          left: '0%',
          transform: `translate(${horizontalOffset}%, -50%)`
        };
      case 'right':
        return {
          ...baseStyle,
          top: '50%',
          right: '0%',
          transform: `translate(${horizontalOffset}%, -50%)`
        };
      case 'top':
        return {
          ...baseStyle,
          top: `${verticalOffset}%`,
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: `${-verticalOffset}%`,
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'center':
      default:
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${horizontalOffset}%), calc(-50% + ${verticalOffset}%))`
        };
    }
  };

  const getCanvasOffset = (): { top: string; left: string } => {
    return { top: '0px', left: '0px' };
  };

  const containerWidth = canvasSize;
  const containerHeight = canvasSize;
  const shouldCropWheel = false;
  const offset = getCanvasOffset();

  const renderWheelContainer = () => (
    <div style={{ 
      position: 'relative', 
      width: containerWidth, 
      height: containerHeight, 
      overflow: shouldCropWheel ? 'hidden' : 'visible' 
    }}>
      <div style={{ position: 'absolute', top: offset.top, left: offset.left }}>
        <WheelCanvas
          segments={segments}
          centerImage={centerImage}
          theme={theme}
          borderColor={borderColor}
          canvasSize={canvasSize}
          offset={offset.left}
        />
        <WheelDecorations
          theme={theme}
          canvasSize={canvasSize}
          offset={offset.left}
        />
      </div>

      {/* Center Launch Button - only show if external button is hidden */}
      {hideLaunchButton && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            pointerEvents: 'auto',
            backgroundColor: '#841b60',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: Math.max(40, canvasSize * 0.15),
            height: Math.max(40, canvasSize * 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.max(10, canvasSize * 0.035),
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          JOUER
        </div>
      )}

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
