
import React, { useRef } from 'react';
import WheelPremiumRenderer from './WheelPremiumRenderer';
import { useWheelAnimations } from './WheelAnimations';

interface Segment {
  label: string;
  color?: string;
  image?: string | null;
}

interface WheelCanvasProps {
  segments: Segment[];
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
  borderColor?: string;
  borderOutlineColor?: string;
  canvasSize: number;
  offset: string;
}

const WheelCanvas: React.FC<WheelCanvasProps> = ({
  segments,
  rotation,
  spinning = false,
  centerImage,
  centerLogo,
  theme,
  customColors,
  borderColor = '#841b60',
  borderOutlineColor = '#FFD700',
  canvasSize,
  offset
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null);

  // Use premium animations
  useWheelAnimations({
    spinning,
    rotation,
    canvasRef,
    shadowCanvasRef
  });

  return (
    <div style={{ position: 'relative' }}>
      <WheelPremiumRenderer
        segments={segments}
        rotation={rotation}
        centerImage={centerImage}
        centerLogo={centerLogo}
        theme={theme}
        customColors={customColors}
        borderColor={borderColor}
        borderOutlineColor={borderOutlineColor}
        canvasSize={canvasSize}
        offset={offset}
        spinning={spinning}
        canvasRef={canvasRef}
        shadowCanvasRef={shadowCanvasRef}
      />
    </div>
  );
};

export default WheelCanvas;
