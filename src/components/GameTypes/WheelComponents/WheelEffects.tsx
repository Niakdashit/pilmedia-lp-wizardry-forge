
import { getThemeColors } from './WheelThemes';

interface Segment {
  label: string;
  color?: string;
  image?: string | null;
}

interface DrawPremiumWheelSegmentsProps {
  ctx: CanvasRenderingContext2D;
  segments: Segment[];
  rotation: number;
  center: number;
  radius: number;
  size: number;
  theme: string;
  customColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  borderOutlineColor: string;
  gradients: any;
  spinning: boolean;
}

export const drawPremiumWheelSegments = ({
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
}: DrawPremiumWheelSegmentsProps) => {
  const total = segments.length;
  const anglePerSlice = (2 * Math.PI) / total;
  
  const themeColors = customColors && customColors.primary ? 
    [customColors.primary, customColors.secondary, customColors.accent || customColors.secondary] :
    getThemeColors(theme);

  segments.forEach((seg: Segment, i: number) => {
    const startAngle = i * anglePerSlice + rotation;
    const endAngle = startAngle + anglePerSlice;

    // Create segment gradient
    const segmentColor = seg.color || themeColors[i % themeColors.length];
    const segmentGradient = ctx.createRadialGradient(center, center, 0, center, center, radius + 15);
    
    // Add premium gradient stops
    segmentGradient.addColorStop(0, lightenColor(segmentColor, 40));
    segmentGradient.addColorStop(0.3, segmentColor);
    segmentGradient.addColorStop(0.8, darkenColor(segmentColor, 20));
    segmentGradient.addColorStop(1, darkenColor(segmentColor, 40));

    // Draw segment with gradient
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius + 15, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segmentGradient;
    ctx.fill();

    // Add inner highlight
    const highlightGradient = ctx.createRadialGradient(center, center, radius * 0.7, center, center, radius + 10);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius + 10, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = highlightGradient;
    ctx.fill();

    // Draw premium separator
    drawPremiumSeparator(ctx, center, radius, startAngle, borderOutlineColor);

    // Draw enhanced text
    drawPremiumText(ctx, seg.label, center, radius, startAngle, anglePerSlice, size);

    // Draw image if present
    if (seg.image) {
      drawSegmentImage(ctx, seg.image, center, radius, startAngle, anglePerSlice, size);
    }

    // Add spinning glow effect
    if (spinning) {
      addSegmentGlow(ctx, center, radius, startAngle, endAngle, segmentColor);
    }
  });
};

const drawPremiumSeparator = (ctx: CanvasRenderingContext2D, center: number, radius: number, angle: number, borderOutlineColor: string) => {
  const innerRadius = 30;
  const outerRadius = radius + 15;
  
  // Main separator line
  ctx.beginPath();
  ctx.moveTo(
    center + innerRadius * Math.cos(angle),
    center + innerRadius * Math.sin(angle)
  );
  ctx.lineTo(
    center + outerRadius * Math.cos(angle),
    center + outerRadius * Math.sin(angle)
  );
  ctx.lineWidth = 3;
  ctx.strokeStyle = borderOutlineColor;
  ctx.stroke();

  // Highlight line
  ctx.beginPath();
  ctx.moveTo(
    center + (innerRadius + 2) * Math.cos(angle),
    center + (innerRadius + 2) * Math.sin(angle)
  );
  ctx.lineTo(
    center + (outerRadius - 2) * Math.cos(angle),
    center + (outerRadius - 2) * Math.sin(angle)
  );
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.stroke();
};

const drawPremiumText = (ctx: CanvasRenderingContext2D, text: string, center: number, radius: number, startAngle: number, anglePerSlice: number, size: number) => {
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(startAngle + anglePerSlice / 2);
  
  const fontSize = Math.max(12, size * 0.035);
  ctx.font = `bold ${fontSize}px "Arial", sans-serif`;
  ctx.textAlign = 'center';
  
  // Text shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillText(text, radius - 35 + 1, 1);
  
  // Main text with gradient
  const textGradient = ctx.createLinearGradient(0, -fontSize/2, 0, fontSize/2);
  textGradient.addColorStop(0, '#ffffff');
  textGradient.addColorStop(0.5, '#f0f0f0');
  textGradient.addColorStop(1, '#d0d0d0');
  ctx.fillStyle = textGradient;
  ctx.fillText(text, radius - 35, 0);
  
  // Text outline
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeText(text, radius - 35, 0);
  
  ctx.restore();
};

const drawSegmentImage = (ctx: CanvasRenderingContext2D, imageSrc: string, center: number, radius: number, startAngle: number, anglePerSlice: number, size: number) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const angle = startAngle + anglePerSlice / 2;
    const distance = radius - 60;
    const imgSize = Math.max(40, size * 0.12);
    const x = center + distance * Math.cos(angle) - imgSize / 2;
    const y = center + distance * Math.sin(angle) - imgSize / 2;

    ctx.save();
    
    // Image shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Clip to circle
    ctx.beginPath();
    ctx.arc(x + imgSize / 2, y + imgSize / 2, imgSize / 2, 0, 2 * Math.PI);
    ctx.clip();
    
    ctx.drawImage(img, x, y, imgSize, imgSize);
    
    // Add border to image
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x + imgSize / 2, y + imgSize / 2, imgSize / 2, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  };
  img.src = imageSrc;
};

const addSegmentGlow = (ctx: CanvasRenderingContext2D, center: number, radius: number, startAngle: number, endAngle: number, color: string) => {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(center, center, radius + 20, startAngle, endAngle);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  
  ctx.restore();
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
