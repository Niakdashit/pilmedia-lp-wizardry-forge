import React from 'react';
import WheelCanvas from './WheelCanvas';

interface WheelPreviewContentProps {
  segments: any[];
  rotation: number;
  spinning?: boolean;
  centerImage?: string;
  centerLogo?: string;
  theme: string;
  customColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  borderColor: string;
  borderOutlineColor: string;
  canvasSize: number;
  containerWidth: number;
  containerHeight: number;
  pointerSize: number;
  shouldCropWheel: boolean;
  gamePosition: string;
  formValidated: boolean;
  showValidationMessage: boolean;
  onWheelClick: () => void;
  showShadow?: boolean;
}

const WheelPreviewContent: React.FC<WheelPreviewContentProps> = ({
  segments,
  rotation,
  spinning = false,
  centerImage,
  centerLogo,
  theme,
  customColors,
  borderColor,
  borderOutlineColor,
  canvasSize,
  containerWidth,
  containerHeight,
  shouldCropWheel,
  gamePosition,
  showValidationMessage,
  onWheelClick,
  showShadow = true
}) => {
  const offset = shouldCropWheel && gamePosition !== 'center' 
    ? `${(containerWidth - canvasSize) / 2}px`
    : '0px';

  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer"
      style={{
        width: containerWidth,
        height: containerHeight,
        overflow: shouldCropWheel ? 'hidden' : 'visible'
      }}
      onClick={onWheelClick}
    >
      {showShadow && !shouldCropWheel && (
        <div
          className="absolute rounded-full"
          style={{
            width: canvasSize + 20,
            height: canvasSize + 20,
            background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 70%, transparent 100%)',
            top: '10px',
            left: `calc(50% - ${(canvasSize + 20) / 2}px)`,
            zIndex: 0,
            filter: 'blur(8px)'
          }}
        />
      )}

      <WheelCanvas
        segments={segments}
        rotation={rotation}
        spinning={spinning}
        centerImage={centerImage}
        centerLogo={centerLogo}
        theme={theme}
        customColors={customColors}
        borderColor={borderColor}
        borderOutlineColor={borderOutlineColor}
        canvasSize={canvasSize}
        offset={offset}
      />
      
      <div
        style={{
          position: 'absolute',
          left: shouldCropWheel && gamePosition === 'left' 
            ? `${containerWidth - 15}px`
            : shouldCropWheel && gamePosition === 'right'
            ? '-15px'
            : `${canvasSize / 2 - 15}px`,
          top: '-20px',
          width: '30px',
          height: '50px',
          zIndex: 3,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <svg width="30" height="50">
          <defs>
            <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor={borderOutlineColor} />
              <stop offset="100%" stopColor={borderColor} />
            </linearGradient>
            <filter id="pointerShadow">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <polygon
            points="15,50 27,15 3,15"
            fill="url(#pointerGradient)"
            stroke="#000000"
            strokeWidth="1"
            filter="url(#pointerShadow)"
          />
        </svg>
      </div>

      {showValidationMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            ✓ Formulaire validé !
          </div>
        </div>
      )}
    </div>
  );
};

export default WheelPreviewContent;
