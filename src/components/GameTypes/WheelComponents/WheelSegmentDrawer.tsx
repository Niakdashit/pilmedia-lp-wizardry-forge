
import { getThemeColors } from './WheelThemes';

interface Segment {
  label: string;
  color?: string;
  image?: string | null;
}

interface WheelSegmentDrawerProps {
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
}

export const drawWheelSegments = ({
  ctx,
  segments,
  rotation,
  center,
  radius,
  size,
  theme,
  customColors,
  borderOutlineColor
}: WheelSegmentDrawerProps) => {
  const total = segments.length;
  const anglePerSlice = (2 * Math.PI) / total;
  
  // Use custom colors or fallback to theme colors
  const themeColors = customColors ? 
    [customColors.primary, customColors.secondary, customColors.accent || '#10b981'] :
    getThemeColors(theme);

  segments.forEach((seg: Segment, i: number) => {
    const startAngle = i * anglePerSlice + rotation;
    const endAngle = startAngle + anglePerSlice;

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius + 15, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color || themeColors[i % themeColors.length];
    ctx.fill();

    // Draw golden separator lines
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(
      center + (radius + 15) * Math.cos(startAngle),
      center + (radius + 15) * Math.sin(startAngle)
    );
    ctx.strokeStyle = borderOutlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + anglePerSlice / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.max(12, size * 0.04)}px Arial`;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeText(seg.label, radius - 30, 5);
    ctx.fillText(seg.label, radius - 30, 5);
    ctx.restore();

    if (seg.image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const angle = startAngle + anglePerSlice / 2;
        const distance = radius - 20;
        const imgSize = Math.max(40, size * 0.15);
        const x = center + distance * Math.cos(angle) - imgSize / 2;
        const y = center + distance * Math.sin(angle) - imgSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + imgSize / 2, y + imgSize / 2, imgSize / 2, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, x, y, imgSize, imgSize);
        ctx.restore();
      };
      img.src = seg.image;
    }
  });
};
