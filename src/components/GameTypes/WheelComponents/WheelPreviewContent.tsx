
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
  shouldCropWheel: boolean;
  gamePosition: string;
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
  showShadow = false
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
            width: canvasSize + 30,
            height: canvasSize + 30,
            background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
            top: '15px',
            left: `calc(50% - ${(canvasSize + 30) / 2}px)`,
            zIndex: 0,
            filter: 'blur(12px)'
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
      
      {/* Modern pointer with golden style */}
      <div
        style={{
          position: 'absolute',
          left: shouldCropWheel && gamePosition === 'left' 
            ? `${containerWidth - 20}px`
            : shouldCropWheel && gamePosition === 'right'
            ? '-20px'
            : `${canvasSize / 2 - 20}px`,
          top: '-25px',
          width: '40px',
          height: '60px',
          zIndex: 3,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <svg width="40" height="60">
          <defs>
            <linearGradient id="modernPointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF700" />
              <stop offset="30%" stopColor="#FFD700" />
              <stop offset="70%" stopColor="#DAA520" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
            <filter id="modernPointerShadow">
              <feDropShadow dx="3" dy="3" stdDeviation="4" floodOpacity="0.4"/>
            </filter>
          </defs>
          <polygon
            points="20,60 35,20 5,20"
            fill="url(#modernPointerGradient)"
            stroke="#FFFFFF"
            strokeWidth="2"
            filter="url(#modernPointerShadow)"
          />
          {/* Highlight on pointer */}
          <polygon
            points="20,55 30,25 10,25"
            fill="rgba(255, 255, 255, 0.3)"
          />
        </svg>
      </div>

      {showValidationMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in font-bold">
            ✓ Formulaire validé !
          </div>
        </div>
      )}
    </div>
  );
};

export default WheelPreviewContent;
