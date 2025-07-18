
import { useEffect, useRef, useState } from 'react';
import { WheelSegment, WheelTheme, WheelState } from '../types';
import { getBorderStyle, createMetallicGradient, createNeonEffect, createRainbowGradient } from '../utils/borderStyles';

interface UseSmartWheelRendererProps {
  segments: WheelSegment[];
  theme: WheelTheme;
  wheelState: WheelState;
  size: number;
  borderStyle?: string;
}

export const useSmartWheelRenderer = ({
  segments,
  theme,
  wheelState,
  size,
  borderStyle = 'classic'
}: UseSmartWheelRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationTime, setAnimationTime] = useState(0);

  // Animation frame pour les effets animés
  useEffect(() => {
    let animationId: number;
    
    const animate = (timestamp: number) => {
      setAnimationTime(timestamp);
      animationId = requestAnimationFrame(animate);
    };
    
    const borderStyleConfig = getBorderStyle(borderStyle);
    if (borderStyleConfig.effects.animated) {
      animationId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [borderStyle]);

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
    const maxRadius = (size / 2) - 20;
    const borderRadius = maxRadius + 10;

    // Effacer le canvas
    ctx.clearRect(0, 0, size, size);

    // Dessiner l'arrière-plan
    drawBackground(ctx, centerX, centerY, borderRadius, theme);

    // Dessiner les segments
    if (segments.length > 0) {
      drawSegments(ctx, segments, centerX, centerY, maxRadius, wheelState, theme);
    }

    // Dessiner les bordures stylisées
    drawStyledBorder(ctx, centerX, centerY, borderRadius, borderStyle, animationTime);

    // Dessiner l'ombre intérieure
    drawInnerShadow(ctx, centerX, centerY, maxRadius);

    // Dessiner le centre
    drawCenter(ctx, centerX, centerY, size, theme);

    // Dessiner le pointeur
    drawPointer(ctx, centerX, centerY, maxRadius, theme);

  }, [segments, theme, wheelState, size, borderStyle, animationTime]);

  const drawBackground = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, theme: WheelTheme) => {
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
  };

  const drawSegments = (ctx: CanvasRenderingContext2D, segments: WheelSegment[], centerX: number, centerY: number, radius: number, wheelState: WheelState, theme: WheelTheme) => {
    const anglePerSegment = (2 * Math.PI) / segments.length;
    
    segments.forEach((segment, index) => {
      const startAngle = (index * anglePerSegment) + (wheelState.rotation * Math.PI / 180);
      const endAngle = startAngle + anglePerSegment;
      
      // Couleur du segment
      const segmentColor = segment.color || 
        (index % 2 === 0 ? theme.colors.primary : theme.colors.secondary);

      // Dessiner le segment - utiliser le rayon complet
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

      // Bordure fine entre segments
      ctx.strokeStyle = theme.colors.background;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dessiner le texte
      drawSegmentText(ctx, segment, centerX, centerY, radius, startAngle, anglePerSegment, theme);
    });
  };

  const drawStyledBorder = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, borderStyleName: string, animationTime: number) => {
    const borderStyleConfig = getBorderStyle(borderStyleName);

    ctx.save();

    switch (borderStyleConfig.type) {
      case 'solid':
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = borderStyleConfig.colors[0];
        ctx.lineWidth = borderStyleConfig.width;
        if (borderStyleConfig.effects.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 10;
        }
        ctx.stroke();
        break;

      case 'metallic':
      case 'luxury':
        const metallicGradient = createMetallicGradient(ctx, borderStyleConfig.colors, centerX, centerY, radius);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = metallicGradient;
        ctx.lineWidth = borderStyleConfig.width;
        
        if (borderStyleConfig.effects.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 15;
        }
        
        ctx.stroke();

        // Effet métallique avec highlights
        if (borderStyleConfig.effects.metallic) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius - 2, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (borderStyleConfig.effects.glow) {
          createNeonEffect(ctx, centerX, centerY, radius, borderStyleConfig.colors[0], 0.5);
        }
        break;

      case 'neon':
        createNeonEffect(ctx, centerX, centerY, radius, borderStyleConfig.colors[0]);
        break;

      case 'gradient':
        if (borderStyleName === 'rainbow') {
          const rainbowGradient = createRainbowGradient(ctx, centerX, centerY, radius, animationTime);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = rainbowGradient;
          ctx.lineWidth = borderStyleConfig.width;
          ctx.stroke();
        } else {
          const gradient = ctx.createLinearGradient(
            centerX - radius, centerY - radius,
            centerX + radius, centerY + radius
          );
          borderStyleConfig.colors.forEach((color, index) => {
            gradient.addColorStop(index / (borderStyleConfig.colors.length - 1), color);
          });
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = borderStyleConfig.width;
          ctx.stroke();
        }

        if (borderStyleConfig.effects.glow) {
          createNeonEffect(ctx, centerX, centerY, radius, borderStyleConfig.colors[0], 0.3);
        }
        break;
    }

    ctx.restore();
  };

  // Nouvelle fonction pour dessiner l'ombre intérieure
  const drawInnerShadow = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    ctx.save();
    
    // Créer un gradient radial pour l'ombre intérieure
    const shadowGradient = ctx.createRadialGradient(
      centerX, centerY, radius - 15,
      centerX, centerY, radius
    );
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = shadowGradient;
    ctx.fill();
    
    ctx.restore();
  };

  const drawSegmentText = (ctx: CanvasRenderingContext2D, segment: WheelSegment, centerX: number, centerY: number, radius: number, startAngle: number, anglePerSegment: number, theme: WheelTheme) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + anglePerSegment / 2);
    
    ctx.fillStyle = segment.textColor || theme.colors.text;
    ctx.font = `bold ${Math.max(12, size * 0.03)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (theme.effects.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
    }
    
    ctx.fillText(segment.label, radius * 0.7, 0);
    ctx.restore();
  };

  const drawCenter = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number, theme: WheelTheme) => {
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
  };

  const drawPointer = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, theme: WheelTheme) => {
    ctx.save();
    
    // Positionner le pointeur pour qu'il touche presque les segments
    const pointerDistance = radius - 5; // Plus proche des segments
    ctx.translate(centerX, centerY - pointerDistance);
    
    // Taille augmentée du pointeur
    const pointerWidth = size * 0.04; // Largeur proportionnelle à la taille de la roue
    const pointerHeight = size * 0.08; // Hauteur proportionnelle à la taille de la roue
    
    // Dessiner l'ombre du pointeur
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Dessiner le pointeur principal
    ctx.fillStyle = theme.colors.accent;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-pointerWidth, -pointerHeight);
    ctx.lineTo(pointerWidth, -pointerHeight);
    ctx.closePath();
    ctx.fill();
    
    // Réinitialiser l'ombre
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Bordure du pointeur
    ctx.strokeStyle = theme.colors.border;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Ajouter un effet de brillance
    if (theme.effects.gradient) {
      const gradient = ctx.createLinearGradient(-pointerWidth, -pointerHeight, pointerWidth, 0);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-pointerWidth, -pointerHeight);
      ctx.lineTo(pointerWidth, -pointerHeight);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  };

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
