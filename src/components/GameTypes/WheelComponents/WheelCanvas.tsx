
import React, { useRef, useEffect } from 'react';
import { drawWheelSegments } from './WheelSegmentDrawer';
import { drawWheelCenter } from './WheelCenterDrawer';

interface Segment {
  label: string;
  color?: string;
  image?: string | null;
}

interface WheelCanvasProps {
  segments: Segment[];
  rotation: number;
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

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 25;

    ctx.clearRect(0, 0, size, size);

    // Draw segments
    drawWheelSegments({
      ctx,
      segments,
      rotation,
      center,
      radius,
      size,
      theme,
      customColors,
      borderOutlineColor
    });

    // Draw outer border - one solid arc after the segments with a slight shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 15, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = borderOutlineColor;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.stroke();
    ctx.restore();

    // Draw inner border
    ctx.beginPath();
    ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Draw center
    drawWheelCenter({
      ctx,
      center,
      size,
      centerImage,
      centerLogo,
      borderOutlineColor
    });
  };

  useEffect(() => {
    drawWheel();
  }, [segments, rotation, centerImage, centerLogo, theme, customColors, borderColor, borderOutlineColor, canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      style={{
        position: 'absolute',
        left: offset,
        top: 0,
        zIndex: 1,
        overflow: 'hidden',
      }}
      className="rounded-full"
    />
  );
};

export default WheelCanvas;
