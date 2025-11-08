
import React, { useRef } from 'react';
import WheelPremiumRenderer from './WheelPremiumRenderer';


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
  borderColor = '#E0004D',
  borderOutlineColor = '#FFD700',
  canvasSize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        spinning={spinning}
        canvasRef={canvasRef}
      />
    </div>
  );
};

export default WheelCanvas;
