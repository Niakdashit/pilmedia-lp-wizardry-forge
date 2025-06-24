
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
  borderColor = '#FF4444',
  borderOutlineColor = '#FFD700',
  canvasSize,
  offset,
  spinning = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null);
  const [gradients, setGradients] = useState<any>(null);

  const drawModernFortuneWheel = () => {
    const canvas = canvasRef.current;
    const shadowCanvas = shadowCanvasRef.current;
    if (!canvas || !shadowCanvas || segments.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const shadowCtx = shadowCanvas.getContext('2d');
    if (!ctx || !shadowCtx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 60;

    // Clear both canvases
    ctx.clearRect(0, 0, size, size);
    shadowCtx.clearRect(0, 0, size, size);

    // Create gradients if needed
    if (!gradients) {
      setGradients(createWheelGradients(ctx, center, radius, theme, customColors));
      return;
    }

    // Draw shadow layer
    drawWheelShadow(shadowCtx, center, radius);

    // Draw modern segments with vibrant colors
    drawModernWheelSegments({
      ctx,
      segments,
      rotation,
      center,
      radius,
      size,
      theme,
      customColors,
      borderOutlineColor,
      spinning
    });

    // Draw modern metallic borders
    drawModernBorders(ctx, center, radius, borderColor, borderOutlineColor);

    // Draw golden metallic center
    drawGoldenMetallicCenter(ctx, center, centerImage, centerLogo);

    // Add spinning effects if active
    if (spinning) {
      addModernSpinningEffects(ctx, center, radius);
    }
  };

  const drawWheelShadow = (ctx: CanvasRenderingContext2D, center: number, radius: number) => {
    // Main shadow
    ctx.beginPath();
    ctx.arc(center, center + 12, radius + 40, 0, 2 * Math.PI);
    const shadowGradient = ctx.createRadialGradient(center, center + 12, 0, center, center + 12, radius + 40);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    shadowGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGradient;
    ctx.fill();
  };

  const drawModernWheelSegments = ({
    ctx,
    segments,
    rotation,
    center,
    radius,
    size,
    theme,
    customColors,
    borderOutlineColor,
    spinning
  }: any) => {
    const total = segments.length;
    const anglePerSlice = (2 * Math.PI) / total;
    
    // Modern vibrant colors matching the reference image
    const modernColors = [
      '#FF4444', // Red
      '#4CAF50', // Green  
      '#2196F3', // Blue
      '#FF9800', // Orange
      '#9C27B0', // Purple
      '#00BCD4', // Cyan
      '#8BC34A', // Light Green
      '#FFC107'  // Amber
    ];

    const themeColors = customColors && customColors.primary ? 
      [customColors.primary, customColors.secondary, customColors.accent || customColors.secondary] :
      modernColors;

    segments.forEach((seg: Segment, i: number) => {
      const startAngle = i * anglePerSlice + rotation;
      const endAngle = startAngle + anglePerSlice;

      // Create vibrant gradient for each segment
      const segmentColor = seg.color || themeColors[i % themeColors.length];
      const segmentGradient = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius + 20);
      
      // Bright, vibrant gradient
      segmentGradient.addColorStop(0, lightenColor(segmentColor, 50));
      segmentGradient.addColorStop(0.5, segmentColor);
      segmentGradient.addColorStop(0.8, darkenColor(segmentColor, 10));
      segmentGradient.addColorStop(1, darkenColor(segmentColor, 30));

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius + 20, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segmentGradient;
      ctx.fill();

      // Add glossy highlight
      const highlightGradient = ctx.createRadialGradient(center, center, 0, center, center, radius + 15);
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      highlightGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius + 15, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      // Draw white separator lines
      drawModernSeparator(ctx, center, radius, startAngle);

      // Draw modern text
      drawModernText(ctx, seg.label, center, radius, startAngle, anglePerSlice, size);
    });
  };

  const drawModernSeparator = (ctx: CanvasRenderingContext2D, center: number, radius: number, angle: number) => {
    const innerRadius = 50;
    const outerRadius = radius + 20;
    
    // White separator line
    ctx.beginPath();
    ctx.moveTo(
      center + innerRadius * Math.cos(angle),
      center + innerRadius * Math.sin(angle)
    );
    ctx.lineTo(
      center + outerRadius * Math.cos(angle),
      center + outerRadius * Math.sin(angle)
    );
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  };

  const drawModernText = (ctx: CanvasRenderingContext2D, text: string, center: number, radius: number, startAngle: number, anglePerSlice: number, size: number) => {
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + anglePerSlice / 2);
    
    const fontSize = Math.max(16, size * 0.04);
    ctx.font = `bold ${fontSize}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    
    // White text with black outline for visibility
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeText(text, radius - 40, 8);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, radius - 40, 8);
    
    ctx.restore();
  };

  const drawModernBorders = (ctx: CanvasRenderingContext2D, center: number, radius: number, borderColor: string, borderOutlineColor: string) => {
    // Outer red border ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 35, 0, 2 * Math.PI);
    const outerGradient = ctx.createLinearGradient(0, center - radius - 35, 0, center + radius + 35);
    outerGradient.addColorStop(0, lightenColor(borderColor, 30));
    outerGradient.addColorStop(0.5, borderColor);
    outerGradient.addColorStop(1, darkenColor(borderColor, 20));
    ctx.lineWidth = 16;
    ctx.strokeStyle = outerGradient;
    ctx.stroke();

    // Golden studs/bolts around the border
    const numStuds = 12;
    for (let i = 0; i < numStuds; i++) {
      const angle = (i / numStuds) * 2 * Math.PI;
      const studX = center + (radius + 35) * Math.cos(angle);
      const studY = center + (radius + 35) * Math.sin(angle);
      
      // Golden stud
      ctx.beginPath();
      ctx.arc(studX, studY, 6, 0, 2 * Math.PI);
      const studGradient = ctx.createRadialGradient(studX, studY, 0, studX, studY, 6);
      studGradient.addColorStop(0, '#FFF700');
      studGradient.addColorStop(0.7, '#FFD700');
      studGradient.addColorStop(1, '#B8860B');
      ctx.fillStyle = studGradient;
      ctx.fill();
      
      // Stud highlight
      ctx.beginPath();
      ctx.arc(studX - 2, studY - 2, 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }

    // Inner white border
    ctx.beginPath();
    ctx.arc(center, center, radius + 22, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  };

  const drawGoldenMetallicCenter = (ctx: CanvasRenderingContext2D, center: number, centerImage?: string, centerLogo?: string) => {
    const centerRadius = 45;
    
    // Golden metallic center base
    ctx.beginPath();
    ctx.arc(center, center, centerRadius, 0, 2 * Math.PI);
    const centerGradient = ctx.createRadialGradient(center, center, 0, center, center, centerRadius);
    centerGradient.addColorStop(0, '#FFF700');
    centerGradient.addColorStop(0.3, '#FFD700');
    centerGradient.addColorStop(0.7, '#DAA520');
    centerGradient.addColorStop(1, '#B8860B');
    ctx.fillStyle = centerGradient;
    ctx.fill();

    // Metallic rings
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(center, center, centerRadius - (i * 8), 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.3)';
      ctx.stroke();
    }

    // Center highlight
    ctx.beginPath();
    ctx.arc(center - 12, center - 12, centerRadius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();

    // Logo if provided
    const logoToDisplay = centerLogo || centerImage;
    if (logoToDisplay) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, centerRadius - 8, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, center - (centerRadius - 8), center - (centerRadius - 8), (centerRadius - 8) * 2, (centerRadius - 8) * 2);
        ctx.restore();
      };
      img.src = logoToDisplay;
    }
  };

  const addModernSpinningEffects = (ctx: CanvasRenderingContext2D, center: number, radius: number) => {
    // Motion blur rings
    ctx.save();
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(center, center, radius + 25 - i * 3, 0, 2 * Math.PI);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    }
    ctx.restore();

    // Sparkle effects
    const sparkleCount = 8;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Date.now() * 0.008 + i * 45) * Math.PI / 180;
      const sparkleX = center + (radius + 45) * Math.cos(angle);
      const sparkleY = center + (radius + 45) * Math.sin(angle);
      
      ctx.save();
      ctx.translate(sparkleX, sparkleY);
      ctx.rotate(angle);
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(2, -2);
      ctx.lineTo(6, 0);
      ctx.lineTo(2, 2);
      ctx.lineTo(0, 6);
      ctx.lineTo(-2, 2);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-2, -2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  // Utility functions for color manipulation
  const lightenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const darkenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  };

  useEffect(() => {
    drawModernFortuneWheel();
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
          filter: 'blur(6px)',
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
          filter: spinning ? 'brightness(1.2) contrast(1.1) saturate(1.2)' : 'none',
          transition: 'filter 0.3s ease',
        }}
        className="rounded-full"
      />
    </div>
  );
};

export default WheelPremiumRenderer;
