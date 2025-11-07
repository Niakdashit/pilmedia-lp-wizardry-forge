
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
  showValidationMessage: boolean;
  onWheelClick: () => void;
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
  showValidationMessage,
  onWheelClick
}) => {
  return (
    <div className="flex items-center justify-center relative cursor-pointer" onClick={onWheelClick} style={{ willChange: 'transform, opacity', transform: 'translateZ(0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', contain: 'layout paint size' }}>
      <div className="relative flex items-center justify-center">
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
          offset="0px"
        />
        
        {/* Pointer centré au-dessus de la roue */}
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 z-10 pointer-events-none"
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
            <polygon
              points="20,55 30,25 10,25"
              fill="rgba(255, 255, 255, 0.3)"
            />
          </svg>
        </div>
      </div>

      {showValidationMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in font-bold">
            ✓ Formulaire validé !
          </div>
        </div>
      )}
    </div>
  );
};

export default WheelPreviewContent;
