
import React from 'react';
import WheelCanvas from './MobileWheel/WheelCanvas';
import WheelDecorations from './MobileWheel/WheelDecorations';
import WheelPointer from './MobileWheel/WheelPointer';
import { GAME_SIZES, GameSize } from '../configurators/GameSizeSelector';
import { WheelConfigService } from '../../services/WheelConfigService';

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
  // Canonical wheel config (mobile device) and standardized segments
  const wheelConfig = WheelConfigService.getCanonicalWheelConfig(
    campaign,
    campaign?.design?.extractedColors || [],
    {},
    { device: 'mobile', shouldCropWheel: false }
  );
  const standardizedSegments = React.useMemo(
    () => WheelConfigService.getStandardizedSegments(wheelConfig),
    [
      JSON.stringify(wheelConfig?.segments || []),
      wheelConfig.customColors?.primary,
      wheelConfig.brandColors?.primary,
      wheelConfig.customColors?.secondary,
      wheelConfig.brandColors?.secondary
    ]
  );
  // Map to MobileWheel canvas segment shape
  const segments = React.useMemo(
    () => standardizedSegments.map((s: any) => ({
      label: s.label,
      chance: typeof s.probability === 'number' ? s.probability : 1,
      color: s.color
    })),
    [standardizedSegments]
  );
  try {
    const ids = standardizedSegments.map((s: any, i: number) => s.id ?? String(i + 1));
    console.log('📱 MobileWheelPreview: standardized segments', {
      campaignId: campaign?.id,
      sourceCount: (wheelConfig?.segments || []).length,
      outCount: standardizedSegments.length,
      ids
    });
  } catch {}
  const theme = (campaign?.config?.roulette || {})?.theme || 'default';
  const borderColor = wheelConfig.borderColor;
  const pointerColor = wheelConfig.borderColor;
  const hideLaunchButton = campaign?.mobileConfig?.hideLaunchButton || false;

  // Get game size from campaign and calculate canvas size
  const gameSize: GameSize = campaign.gameSize || 'medium';
  const gameDimensions = GAME_SIZES[gameSize];
  
  // Scale the wheel size based on game size settings
  // Use the smaller dimension to maintain aspect ratio
  const scaleFactor = Math.min(gameDimensions.width, gameDimensions.height) / 400; // 400 is our reference size
  const calculatedCanvasSize = Math.max(200, Math.min(600, DEFAULT_CANVAS_SIZE * scaleFactor));

  const canvasSize = wheelConfig.size || calculatedCanvasSize;

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
          centerImage={undefined}
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
            backgroundColor: '#44444d',
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
