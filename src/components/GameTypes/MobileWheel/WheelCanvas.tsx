
import React, { useRef, useEffect } from 'react';

interface Segment {
  label: string;
  chance: number;
  color?: string;
  image?: File | null;
}

interface WheelCanvasProps {
  segments: Segment[];
  centerImage?: File | null;
  theme: string;
  borderColor: string;
  canvasSize: number;
  offset: string;
}

const WheelCanvas: React.FC<WheelCanvasProps> = ({
  segments,
  centerImage,
  theme,
  borderColor,
  canvasSize,
  offset
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotation = 0;

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 15;
    const total = segments.length;
    const anglePerSlice = (2 * Math.PI) / total;
    const themeColors = getThemeColors(theme);

    ctx.clearRect(0, 0, size, size);

    if (theme === 'default') {
      ctx.beginPath();
      ctx.arc(center, center, radius + 6, 0, 2 * Math.PI);
      ctx.lineWidth = 8;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

    segments.forEach((seg: Segment, i: number) => {
      const startAngle = i * anglePerSlice + rotation;
      const endAngle = startAngle + anglePerSlice;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color || themeColors[i % themeColors.length];
      ctx.fill();

      // Fixed: Check if seg.image is a valid File object before creating object URL
      if (seg.image && seg.image instanceof File) {
        const img = new Image();
        img.onload = () => {
          const angle = startAngle + anglePerSlice / 2;
          const distance = radius - 30;
          const imgSize = 40;
          const x = center + distance * Math.cos(angle) - imgSize / 2;
          const y = center + distance * Math.sin(angle) - imgSize / 2;

          ctx.save();
          ctx.beginPath();
          ctx.arc(x + imgSize / 2, y + imgSize / 2, imgSize / 2, 0, 2 * Math.PI);
          ctx.clip();

          // Anti-fringe: remplir sous l'image avec la couleur du segment et activer le lissage
          const segmentColor = seg.color || themeColors[i % themeColors.length];
          ctx.fillStyle = segmentColor;
          ctx.beginPath();
          ctx.arc(x + imgSize / 2, y + imgSize / 2, imgSize / 2, 0, 2 * Math.PI);
          ctx.fill();

          ctx.imageSmoothingEnabled = true;
          try { (ctx as any).imageSmoothingQuality = 'high'; } catch {}
          const scale = 1.02;
          const w = imgSize * scale;
          const h = imgSize * scale;
          const dx = x - (w - imgSize) / 2;
          const dy = y - (h - imgSize) / 2;
          ctx.drawImage(img, dx, dy, w, h);
          ctx.restore();
        };
        img.src = URL.createObjectURL(seg.image);
      }

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + anglePerSlice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(seg.label, radius - 15, 3);
      ctx.restore();
    });

    // Fixed: Check if centerImage is a valid File object before creating object URL
    if (centerImage && centerImage instanceof File) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, 30, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, center - 30, center - 30, 60, 60);
        ctx.restore();
      };
      img.src = URL.createObjectURL(centerImage);
    } else {
      ctx.beginPath();
      ctx.arc(center, center, 30, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  useEffect(() => {
    drawWheel();
  }, [segments, centerImage, theme, borderColor, canvasSize]);

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
      className="rounded-full shadow-lg"
    />
  );
};

function getThemeColors(theme: string): string[] {
  switch (theme) {
    case 'promo': return ['#FFD700', '#841b60', '#FF6F61'];
    case 'food': return ['#f4d35e', '#ee964b', '#e63946'];
    case 'casino': return ['#000000', '#FFD7 золотой', '#FF0000'];
    case 'child': return ['#fcd5ce', '#cdb4db', '#b5ead7'];
    case 'gaming': return ['#1f1f2e', '#841bff', '#13aae2'];
    case 'luxury': return ['#0d0d0d', '#d4af37', '#ffffff'];
    case 'halloween': return ['#ff7518', '#1b1b1b', '#fffacd'];
    case 'noel': return ['#e74c3c', '#27ae60', '#fff'];
    default: return ['#f9e5e5', '#dbeaff', '#e8f9e6', '#fff1e6', '#e6ffe6'];
  }
}

export default WheelCanvas;
