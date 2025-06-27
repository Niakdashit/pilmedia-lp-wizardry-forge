
import { useEffect, useRef } from 'react';
import { WheelSegment, WheelTheme, WheelState } from '../types';

interface UseSmartWheelRendererProps {
  segments: WheelSegment[];
  theme: WheelTheme;
  wheelState: WheelState;
  size: number;
}

export const useSmartWheelRenderer = ({
  segments,
  theme,
  wheelState,
  size
}: UseSmartWheelRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurer le canvas
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = size * devicePixelRatio;
    canvas.height = size * devicePixelRatio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 40;

    // Effacer le canvas
    ctx.clearRect(0, 0, size, size);

    // Dessiner l'arrière-plan avec gradient si activé
    if (theme.effects.gradient) {
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius + 20);
      bgGradient.addColorStop(0, theme.colors.background);
      bgGradient.addColorStop(1, darkenColor(theme.colors.background, 0.1));
      ctx.fillStyle = bgGradient;
    } else {
      ctx.fillStyle = theme.colors.background;
    }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);
    ctx.fill();

    // Dessiner les segments
    if (segments.length > 0) {
      const anglePerSegment = (2 * Math.PI) / segments.length;
      
      segments.forEach((segment, index) => {
        const startAngle = (index * anglePerSegment) + (wheelState.rotation * Math.PI / 180);
        const endAngle = startAngle + anglePerSegment;
        
        // Couleur du segment
        const segmentColor = segment.color || 
          (index % 2 === 0 ? theme.colors.primary : theme.colors.secondary);

        // Dessiner le segment avec gradient si activé
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        if (theme.effects.gradient) {
          const gradient = ctx.createLinearGradient(
            centerX - radius, centerY - radius,
            centerX + radius, centerY + radius
          );
          gradient.addColorStop(0, segmentColor);
          gradient.addColorStop(1, darkenColor(segmentColor, 0.2));
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = segmentColor;
        }
        
        ctx.fill();

        // Bordure du segment
        ctx.strokeStyle = theme.colors.border;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dessiner le texte du segment
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSegment / 2);
        
        ctx.fillStyle = segment.textColor || theme.colors.text;
        ctx.font = `bold ${Math.max(12, size * 0.03)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Ombre du texte si activée
        if (theme.effects.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
        }
        
        ctx.fillText(segment.label, radius * 0.7, 0);
        ctx.restore();
      });
    }

    // Dessiner le centre
    const centerRadius = size * 0.08;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    
    if (theme.effects.gradient) {
      const centerGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, centerRadius
      );
      centerGradient.addColorStop(0, lightenColor(theme.colors.accent, 0.3));
      centerGradient.addColorStop(1, theme.colors.accent);
      ctx.fillStyle = centerGradient;
    } else {
      ctx.fillStyle = theme.colors.accent;
    }
    
    ctx.fill();
    ctx.strokeStyle = theme.colors.border;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dessiner le pointeur
    ctx.save();
    ctx.translate(centerX, centerY - radius - 10);
    ctx.fillStyle = theme.colors.accent;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -20);
    ctx.lineTo(10, -20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = theme.colors.border;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Effet de lueur si activé
    if (theme.effects.glow && wheelState.isSpinning) {
      ctx.shadowColor = theme.colors.accent;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = theme.colors.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);
      ctx.stroke();
    }

  }, [segments, theme, wheelState, size]);

  return { canvasRef };
};

// Utilitaires de couleur
const darkenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

const lightenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};
