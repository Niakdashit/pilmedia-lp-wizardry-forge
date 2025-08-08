import { useEffect, useRef, useState } from 'react';
import { WheelSegment, WheelTheme, WheelState } from '../types';
import { getBorderStyle, createMetallicGradient, createNeonEffect, renderGoldBorder, createRoyalRouletteEffect, createRainbowGradient } from '../utils/borderStyles';

interface UseSmartWheelRendererProps {
  segments: WheelSegment[];
  theme: WheelTheme;
  wheelState: WheelState;
  size: number;
  borderStyle?: string;
  customBorderColor?: string;
  customBorderWidth?: number;
  showBulbs?: boolean;
}

export const useSmartWheelRenderer = ({
  segments,
  theme,
  wheelState,
  size,
  borderStyle = 'classic',
  customBorderColor,
  customBorderWidth,
  showBulbs,

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

  // Dessiner 15 petites ampoules blanches sur la bordure externe
  const drawBulbs = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    borderRadius: number,
    borderStyleName: string,
    customWidth?: number
  ) => {
    const style = getBorderStyle(borderStyleName);
    const scaleFactor = size / 200;
    const baseW = customWidth !== undefined ? customWidth : style.width;
    const borderW = baseW * scaleFactor;

    // Rayon de l'anneau où placer les ampoules (au centre de la bordure visuelle)
    const ringRadius = borderRadius;

    const count = 15;
    // Réduire la taille des ampoules pour un rendu plus fin
    const bulbRadius = Math.max(1.5 * scaleFactor, Math.min(5 * scaleFactor, borderW * 0.18));
    const startAngle = -Math.PI / 2; // aligné sur le pointeur en haut

    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i * 2 * Math.PI) / count;
      const x = centerX + ringRadius * Math.cos(angle);
      const y = centerY + ringRadius * Math.sin(angle);

      // halo léger
      ctx.save();
      ctx.shadowColor = 'rgba(255,255,255,0.85)';
      ctx.shadowBlur = 4 * scaleFactor;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, bulbRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      // petit highlight
      const highlightR = bulbRadius * 0.5;
      ctx.save();
      const grad = ctx.createRadialGradient(x - bulbRadius * 0.3, y - bulbRadius * 0.3, 0, x, y, bulbRadius);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x - bulbRadius * 0.25, y - bulbRadius * 0.25, highlightR, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }
  };

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
    drawStyledBorder(ctx, centerX, centerY, borderRadius, borderStyle, animationTime, customBorderWidth);

    // Dessiner l'ombre intérieure AVANT les ampoules pour ne pas les assombrir
    drawInnerShadow(ctx, centerX, centerY, maxRadius);

    // Dessiner les ampoules blanches sur la bordure (alignées avec le pointeur) AU-DESSUS de l'ombre
    if (showBulbs) {
      drawBulbs(ctx, centerX, centerY, borderRadius, borderStyle, customBorderWidth);
    }

    // Dessiner le centre
    drawCenter(ctx, centerX, centerY, size, theme);

    // Dessiner le pointeur
    drawPointer(ctx, centerX, centerY, maxRadius);

  }, [segments, theme, wheelState, size, borderStyle, animationTime, showBulbs, customBorderWidth]);



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

      // Utiliser toujours des couleurs nettes, pas de dégradé
      ctx.fillStyle = segmentColor;
      
      ctx.fill();

      // Bordure fine entre segments (largeur fixe, indépendante du curseur de bordure)
      ctx.save(); // Sauvegarder l'état du contexte
      ctx.strokeStyle = theme.colors.background;
      ctx.lineWidth = 2; // Toujours 2px fixe, jamais mise à l'échelle
      ctx.lineJoin = 'miter';
      ctx.lineCap = 'square';
      ctx.stroke();
      ctx.restore(); // Restaurer l'état du contexte

      // Dessiner le texte
      drawSegmentText(ctx, segment, centerX, centerY, radius, startAngle, anglePerSegment, theme);
    });
  };

  const drawStyledBorder = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, borderStyleName: string, animationTime: number, customWidth?: number) => {
    const borderStyleConfig = getBorderStyle(borderStyleName);
    
    // Calculer le facteur d'échelle basé sur la taille de la roue
    // Taille de référence : 200px (taille de base)
    const scaleFactor = size / 200;
    
    // Utiliser la largeur personnalisée si fournie, sinon la largeur du style
    const baseBorderWidth = customWidth !== undefined ? customWidth : borderStyleConfig.width;
    
    // Ajuster la largeur de bordure proportionnellement à l'échelle
    const borderWidth = baseBorderWidth * scaleFactor;

    // Utiliser la couleur personnalisée seulement pour le style "classique"
    const getBorderColor = (index: number = 0) => {
      // Pour tous les styles prédéfinis sauf "classic", toujours utiliser leurs couleurs définies
      if (borderStyleName !== 'classic') {
        return borderStyleConfig.colors[index];
      }
      // Pour "classic", utiliser la couleur personnalisée ou la couleur par défaut
      return customBorderColor || borderStyleConfig.colors[index];
    };

    ctx.save();

    // Gestion spéciale pour Royal Roulette
    if (borderStyleName === 'royalRoulette') {
      createRoyalRouletteEffect(ctx, centerX, centerY, radius, animationTime, size);
    } 
    // Gestion spéciale pour le style Or avec effets métalliques
    else if (borderStyleName === 'gold') {
      renderGoldBorder(ctx, centerX, centerY, radius, size);
    }
    // Gestion spéciale pour le style Argent avec effets métalliques
    else if (borderStyleName === 'silver') {
      const silverGradient = createMetallicGradient(ctx, borderStyleConfig.colors, centerX, centerY, radius);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = silverGradient;
      ctx.lineWidth = borderWidth;
      ctx.lineJoin = 'miter';
      ctx.lineCap = 'square';
      ctx.stroke();
      
      if (borderStyleConfig.effects.metallic) {
        // Effet métallique brillant pour l'argent
        createNeonEffect(ctx, centerX, centerY, radius, '#C0C0C0', 0.6);
      }
    } else {
      switch (borderStyleConfig.type) {
        case 'solid':
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = getBorderColor(0);
          ctx.lineWidth = borderWidth;
          ctx.lineJoin = 'miter';
          ctx.lineCap = 'square';
          if (borderStyleConfig.effects.shadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
          }
          ctx.stroke();
          break;

        case 'metallic':
        case 'luxury':
          // Pour les styles prédéfinis, toujours utiliser leurs couleurs définies
          const colors = borderStyleName !== 'classic' 
            ? borderStyleConfig.colors 
            : (customBorderColor ? [customBorderColor] : borderStyleConfig.colors);
          const metallicGradient = createMetallicGradient(ctx, colors, centerX, centerY, radius);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = metallicGradient;
          ctx.lineWidth = borderWidth;
          ctx.lineJoin = 'miter';
          ctx.lineCap = 'square';
          
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
            createNeonEffect(ctx, centerX, centerY, radius, getBorderColor(0), 0.5);
          }
          break;

        case 'neon':
          createNeonEffect(ctx, centerX, centerY, radius, getBorderColor(0));
          break;

        case 'gradient':
          if (borderStyleName === 'rainbow') {
            const rainbowGradient = createRainbowGradient(ctx, centerX, centerY, radius, animationTime);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = rainbowGradient;
            ctx.lineWidth = borderWidth;
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'square';
            ctx.stroke();
          } else {
            const gradient = ctx.createLinearGradient(
              centerX - radius, centerY - radius,
              centerX + radius, centerY + radius
            );
            const gradientColors = borderStyleName !== 'classic' 
              ? borderStyleConfig.colors 
              : (customBorderColor ? [customBorderColor] : borderStyleConfig.colors);
            gradientColors.forEach((color, index) => {
              const position = gradientColors.length === 1 ? 0 : index / (gradientColors.length - 1);
              gradient.addColorStop(position, color);
            });
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = borderWidth;
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'square';
            ctx.stroke();
          }

          if (borderStyleConfig.effects.glow) {
            createNeonEffect(ctx, centerX, centerY, radius, getBorderColor(0), 0.3);
          }
          break;
      }
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

  const drawPointer = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    ctx.save();
    
    // Positionner le pointeur pour qu'il touche presque les segments (style Burger King)
    const pointerDistance = radius - 8;
    ctx.translate(centerX, centerY - pointerDistance);
    
    // Taille du pointeur style Burger King (plus large et plus imposant)
    const pointerWidth = size * 0.06; // Plus large
    const pointerHeight = size * 0.12; // Plus haut et imposant
    const scaleFactor = size / 200;
    
    // === OMBRE PROFONDE STYLE BURGER KING ===
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 12 * scaleFactor;
    ctx.shadowOffsetX = 3 * scaleFactor;
    ctx.shadowOffsetY = 4 * scaleFactor;
    
    // === GRADIENT DORÉ/ORANGE PRINCIPAL ===
    const mainGradient = ctx.createLinearGradient(
      -pointerWidth, -pointerHeight,
      pointerWidth, 0
    );
    
    // Couleurs Burger King pour le pointeur
    mainGradient.addColorStop(0, '#D2691E'); // Orange foncé
    mainGradient.addColorStop(0.3, '#FF8C00'); // Orange vif
    mainGradient.addColorStop(0.5, '#FFD700'); // Or brillant
    mainGradient.addColorStop(0.7, '#FFA500'); // Orange doré
    mainGradient.addColorStop(1, '#FF7F00'); // Orange moyen
    
    // Dessiner le pointeur principal
    ctx.fillStyle = mainGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0); // Pointe vers le bas
    ctx.lineTo(-pointerWidth, -pointerHeight); // Coin gauche
    ctx.lineTo(pointerWidth, -pointerHeight); // Coin droit
    ctx.closePath();
    ctx.fill();
    
    // Réinitialiser l'ombre pour les effets suivants
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // === BORDURE DORÉE ÉPAISSE ===
    const borderGradient = ctx.createLinearGradient(
      -pointerWidth, -pointerHeight,
      pointerWidth, 0
    );
    borderGradient.addColorStop(0, '#B8860B'); // Or sombre
    borderGradient.addColorStop(0.5, '#DAA520'); // Or moyen
    borderGradient.addColorStop(1, '#FFD700'); // Or brillant
    
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 4 * scaleFactor; // Bordure plus épaisse
    ctx.lineJoin = 'miter';
    ctx.lineCap = 'square';
    ctx.stroke();
    
    // === EFFET MÉTALLIQUE BRILLANT ===
    const highlightGradient = ctx.createLinearGradient(
      -pointerWidth * 0.8, -pointerHeight * 0.9,
      pointerWidth * 0.8, -pointerHeight * 0.3
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.moveTo(0, -pointerHeight * 0.1);
    ctx.lineTo(-pointerWidth * 0.7, -pointerHeight * 0.8);
    ctx.lineTo(pointerWidth * 0.7, -pointerHeight * 0.8);
    ctx.closePath();
    ctx.fill();
    
    // === REFLET MÉTALLIQUE SUR LE CÔTÉ GAUCHE ===
    const sideHighlight = ctx.createLinearGradient(
      -pointerWidth, -pointerHeight,
      -pointerWidth * 0.5, -pointerHeight * 0.5
    );
    sideHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    sideHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = sideHighlight;
    ctx.beginPath();
    ctx.moveTo(0, -pointerHeight * 0.2);
    ctx.lineTo(-pointerWidth * 0.9, -pointerHeight * 0.9);
    ctx.lineTo(-pointerWidth * 0.6, -pointerHeight * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // === PETIT REFLET CENTRAL POUR L'EFFET PREMIUM ===
    const centerSparkle = ctx.createRadialGradient(
      0, -pointerHeight * 0.6, 0,
      0, -pointerHeight * 0.6, pointerWidth * 0.3
    );
    centerSparkle.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    centerSparkle.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = centerSparkle;
    ctx.beginPath();
    ctx.arc(0, -pointerHeight * 0.6, pointerWidth * 0.2, 0, 2 * Math.PI);
    ctx.fill();
    
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
