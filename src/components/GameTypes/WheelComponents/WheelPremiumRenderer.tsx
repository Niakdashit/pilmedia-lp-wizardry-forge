
import React, { useRef, useEffect, useState } from 'react';
import { drawPremiumWheelSegments } from './WheelEffects';
import { createWheelGradients } from './WheelGradients';

interface Segment {
  label: string;
  color?: string;
  image?: string | null;
}

interface WheelPremiumRendererProps {
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
  spinning?: boolean;
}

const WheelPremiumRenderer: React.FC<WheelPremiumRendererProps> = ({
  segments,
  rotation,
  centerImage,
  centerLogo,
  theme,
  customColors,
  borderColor = '#841b60',
  borderOutlineColor = '#FFD700',
  canvasSize,
  offset,
  spinning = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null);
  const [gradients, setGradients] = useState<any>(null);

  const drawPremiumWheel = () => {
    const canvas = canvasRef.current;
    const shadowCanvas = shadowCanvasRef.current;
    if (!canvas || !shadowCanvas || segments.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const shadowCtx = shadowCanvas.getContext('2d');
    if (!ctx || !shadowCtx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 40;

    // Clear both canvases
    ctx.clearRect(0, 0, size, size);
    shadowCtx.clearRect(0, 0, size, size);

    // Create or update gradients
    if (!gradients) {
      setGradients(createWheelGradients(ctx, center, radius, theme, customColors));
      return;
    }

    // Draw shadow layer first
    drawWheelShadow(shadowCtx, center, radius);

    // Draw premium segments with advanced effects
    drawPremiumWheelSegments({
      ctx,
      segments,
      rotation,
      center,
      radius,
      size,
      theme,
      customColors,
      borderOutlineColor,
      gradients,
      spinning
    });

    // Draw premium borders with 3D effect
    drawPremiumBorders(ctx, center, radius, borderColor, borderOutlineColor);

    // Draw premium center with depth
    drawPremiumCenter(ctx, center, centerImage, centerLogo, borderOutlineColor);

    // Add spinning effects if active
    if (spinning) {
      addSpinningEffects(ctx, center, radius);
    }
  };

  const drawWheelShadow = (ctx: CanvasRenderingContext2D, center: number, radius: number) => {
    // Outer shadow
    ctx.beginPath();
    ctx.arc(center, center + 8, radius + 20, 0, 2 * Math.PI);
    const shadowGradient = ctx.createRadialGradient(center, center + 8, 0, center, center + 8, radius + 20);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    shadowGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGradient;
    ctx.fill();
  };

  const drawPremiumBorders = (ctx: CanvasRenderingContext2D, center: number, radius: number, borderColor: string, borderOutlineColor: string) => {
    // Outer metallic ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 25, 0, 2 * Math.PI);
    const outerGradient = ctx.createLinearGradient(0, 0, 0, center * 2);
    outerGradient.addColorStop(0, '#ffffff');
    outerGradient.addColorStop(0.3, borderOutlineColor);
    outerGradient.addColorStop(0.7, borderColor);
    outerGradient.addColorStop(1, '#000000');
    ctx.lineWidth = 12;
    ctx.strokeStyle = outerGradient;
    ctx.stroke();

    // Inner highlight ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 18, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();

    // Inner shadow ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 15, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.stroke();
  };

  const drawPremiumCenter = (ctx: CanvasRenderingContext2D, center: number, centerImage?: string, centerLogo?: string, borderOutlineColor?: string) => {
    const centerRadius = 35;
    
    // Center shadow
    ctx.beginPath();
    ctx.arc(center + 2, center + 2, centerRadius + 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Center base with gradient
    ctx.beginPath();
    ctx.arc(center, center, centerRadius + 3, 0, 2 * Math.PI);
    const centerGradient = ctx.createRadialGradient(center, center, 0, center, center, centerRadius + 3);
    centerGradient.addColorStop(0, '#ffffff');
    centerGradient.addColorStop(0.7, borderOutlineColor || '#FFD700');
    centerGradient.addColorStop(1, '#cccccc');
    ctx.fillStyle = centerGradient;
    ctx.fill();

    // Center highlight
    ctx.beginPath();
    ctx.arc(center - 8, center - 8, centerRadius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    const logoToDisplay = centerLogo || centerImage;
    if (logoToDisplay) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, centerRadius - 3, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, center - (centerRadius - 3), center - (centerRadius - 3), (centerRadius - 3) * 2, (centerRadius - 3) * 2);
        ctx.restore();
      };
      img.src = logoToDisplay;
    }
  };

  const addSpinningEffects = (ctx: CanvasRenderingContext2D, center: number, radius: number) => {
    // Motion blur effect
    ctx.save();
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(center, center, radius + 15 - i, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
    ctx.restore();

    // Sparkle effects
    for (let i = 0; i < 8; i++) {
      const angle = (Date.now() * 0.01 + i * 45) * Math.PI / 180;
      const sparkleX = center + (radius + 30) * Math.cos(angle);
      const sparkleY = center + (radius + 30) * Math.sin(angle);
      
      ctx.save();
      ctx.translate(sparkleX, sparkleY);
      ctx.rotate(angle);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(1, -1);
      ctx.lineTo(4, 0);
      ctx.lineTo(1, 1);
      ctx.lineTo(0, 4);
      ctx.lineTo(-1, 1);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-1, -1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  useEffect(() => {
    drawPremiumWheel();
  }, [segments, rotation, centerImage, centerLogo, theme, customColors, borderColor, borderOutlineColor, canvasSize, spinning, gradients]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Shadow layer */}
      <canvas
        ref={shadowCanvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          position: 'absolute',
          left: offset,
          top: 0,
          zIndex: 0,
          filter: 'blur(4px)',
        }}
        className="rounded-full"
      />
      
      {/* Main wheel */}
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          position: 'absolute',
          left: offset,
          top: 0,
          zIndex: 1,
          filter: spinning ? 'brightness(1.1) contrast(1.1)' : 'none',
          transition: 'filter 0.3s ease',
        }}
        className="rounded-full"
      />
    </div>
  );
};

export default WheelPremiumRenderer;
