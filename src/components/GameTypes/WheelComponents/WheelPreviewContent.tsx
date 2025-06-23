
import React from 'react';
import ValidationMessage from '../../common/ValidationMessage';
import WheelCanvas from './WheelCanvas';
import WheelPointer from './WheelPointer';
import WheelDecorations from './WheelDecorations';
import WheelInteractionHandler from './WheelInteractionHandler';

interface WheelPreviewContentProps {
  segments: any[];
  rotation: number;
  centerImage?: string;
  centerLogo?: string;
  theme: string;
  customColors?: any;
  borderColor: string;
  borderOutlineColor: string;
  canvasSize: number;
  containerWidth: number;
  containerHeight: number;
  pointerSize: number;
  shouldCropWheel: boolean;
  gamePosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
  formValidated: boolean;
  showValidationMessage: boolean;
  onWheelClick: () => void;
  /**
   * Display the default radial shadow behind the wheel.
   * Enabled by default for a subtle depth effect.
   */
  showShadow?: boolean;
}

const WheelPreviewContent: React.FC<WheelPreviewContentProps> = ({
  segments,
  rotation,
  centerImage,
  centerLogo,
  theme,
  customColors,
  borderColor,
  borderOutlineColor,
  canvasSize,
  containerWidth,
  containerHeight,
  pointerSize,
  shouldCropWheel,
  gamePosition,
  formValidated,
  showValidationMessage,
  onWheelClick,
  showShadow = true
}) => {
  // Assurer que le canvas ne dépasse jamais du conteneur
  const constrainedCanvasSize = Math.min(
    canvasSize,
    containerWidth - 20,
    containerHeight - 20
  );

  const getContainerStyle = (): React.CSSProperties => {
    return {
      position: 'relative',
      width: containerWidth,
      height: containerHeight,
      maxWidth: containerWidth,
      maxHeight: containerHeight,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box'
    };
  };

  const getWheelOffset = () => {
    if (!shouldCropWheel) return { left: 0, top: 0 };
    
    switch (gamePosition) {
      case 'left':
        return { left: -constrainedCanvasSize * 0.4, top: 0 };
      case 'right':
        return { left: constrainedCanvasSize * 0.4, top: 0 };
      case 'bottom':
        return { left: 0, top: constrainedCanvasSize * 0.3 };
      default:
        return { left: 0, top: 0 };
    }
  };

  const wheelOffset = getWheelOffset();

  return (
    <div style={getContainerStyle()}>
      {/* Ombre de la roue */}
      {showShadow && (
        <div
          style={{
            position: 'absolute',
            width: constrainedCanvasSize - 20,
            height: constrainedCanvasSize - 20,
            left: wheelOffset.left + 10,
            top: wheelOffset.top + 15,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 50%, transparent 70%)',
            filter: 'blur(8px)',
            zIndex: 0
          }}
        />
      )}
      
      <WheelInteractionHandler
        formValidated={formValidated}
        onWheelClick={onWheelClick}
      >
        <div 
          style={{
            position: 'relative',
            left: wheelOffset.left,
            top: wheelOffset.top,
            width: constrainedCanvasSize,
            height: constrainedCanvasSize,
            maxWidth: constrainedCanvasSize,
            maxHeight: constrainedCanvasSize,
            overflow: 'hidden'
          }}
        >
          <WheelCanvas
            segments={segments}
            rotation={rotation}
            centerImage={centerImage}
            centerLogo={centerLogo}
            theme={theme}
            customColors={customColors}
            borderColor={borderColor}
            borderOutlineColor={borderOutlineColor}
            canvasSize={constrainedCanvasSize}
            offset="0px"
          />
          
          <WheelDecorations
            theme={theme}
            canvasSize={constrainedCanvasSize}
            shouldCropWheel={shouldCropWheel}
            gamePosition={gamePosition}
          />
          
          <WheelPointer
            canvasSize={constrainedCanvasSize}
            shouldCropWheel={shouldCropWheel}
            gamePosition={gamePosition}
            pointerSize={Math.min(pointerSize, constrainedCanvasSize / 20)}
          />
        </div>
      </WheelInteractionHandler>

      <ValidationMessage
        show={showValidationMessage}
        message="Formulaire validé ! Vous pouvez maintenant jouer."
        type="success"
      />
    </div>
  );
};

export default WheelPreviewContent;
