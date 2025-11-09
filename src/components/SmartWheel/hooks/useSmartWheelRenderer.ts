import { useEffect, useRef, useState, useMemo } from 'react';
import { WheelSegment, WheelTheme, WheelState } from '../types';
import { getBorderStyle, createMetallicGradient, createNeonEffect, renderGoldBorder, createRoyalRouletteEffect, createRainbowGradient } from '../utils/borderStyles';

interface UseSmartWheelRendererProps {
  segments: WheelSegment[];
  theme: WheelTheme;
  wheelState?: Partial<WheelState>;
  size: number;
  borderStyle?: string;
  customBorderColor?: string;
  customBorderWidth?: number;
  showBulbs?: boolean;
  /** When true, disables pointer wobble/deflection animation */
  disablePointerAnimation?: boolean;
  brandColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
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
  disablePointerAnimation,
  brandColors,

}: UseSmartWheelRendererProps) => {
  // Central bulb count used for visuals and pointer collisions
  const BULB_COUNT = 15;
  // Pointer visual scale multiplier
  const POINTER_SCALE = 1.22825; // reduced by 15% from 1.445
  // Invisible ratchet notches for pointer tip collisions (independent from bulbs)
  const NOTCH_COUNT = 36; // number of invisible notches around the rim
  const NOTCH_PHASE_DEG = 0; // phase offset if we need to align to art later
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationTime, setAnimationTime] = useState(0);
  
  // Pointer animation (wobble/deflection)
  const pointerAngleRef = useRef(0); // radians
  const prevTimestampRef = useRef<number>(0);
  const prevRotationRef = useRef<number>(0); // degrees
  const rotationRef = useRef<number>(0);
  const spinningRef = useRef<boolean>(false);
  const pointerVelRef = useRef(0); // rad/s
  const prevBoundaryIndexRef = useRef<number | null>(null);
  const segAngleDegRef = useRef<number>(360); // actually bulb step angle
  const segCountRef = useRef<number>(1); // actually bulb count
  // Pointer and Center assets
  const pointerImgRef = useRef<HTMLImageElement | null>(null);
  const pointerImgReadyRef = useRef(false);
  const pointerLoadingRef = useRef(true);
  
  // Center image asset support
  const CENTER_SCALE = 0.10;
  
  // Helpers: choose default asset candidates based on style
  const isSilverStyle = (name: string) => name.toLowerCase().includes('silver');
  const getPointerSourcesForStyle = (name: string): string[] => {
    if (isSilverStyle(name)) {
      return [
        '/assets/wheel/pointer-silver.svg',
        '/assets/wheel/pointer.svg'
      ];
    }
    return ['/assets/wheel/pointer.svg'];
  };
  const getCenterSourcesForStyle = (name: string): string[] => {
    // Prefer PNG first to avoid 404 noise when only PNG is present locally
    const base = ['/assets/wheel/center.png', '/assets/wheel/center.svg'];
    if (isSilverStyle(name)) {
      return [
        '/assets/wheel/center-silver.png',
        '/assets/wheel/center-silver.svg',
        ...base
      ];
    }
    return base;
  };
  const centerImgRef = useRef<HTMLImageElement | null>(null);
  const centerImgReadyRef = useRef(false);
  const [centerImgReady, setCenterImgReady] = useState(false);
  const centerLoadingRef = useRef(true);

  // (Removed) Image-based ring cache eliminated to avoid any deferred loading
  
  // Cache pour les icônes des segments (images par segment)
  const segmentIconCacheRef = useRef<Map<string, { img: HTMLImageElement; ready: boolean; loading: boolean; failed?: boolean }>>(new Map());
  // Cache pour les anneaux (templates) de bordure pattern (ex: or/argent)
  const ringImageCacheRef = useRef<Map<string, { img: HTMLImageElement; ready: boolean; loading: boolean; failed?: boolean }>>(new Map());
  
  // Initialize with default wheel state if not provided
  const safeWheelState: WheelState = useMemo(() => ({
    isSpinning: false,
    rotation: 0,
    targetRotation: 0,
    currentSegment: null,
    ...(wheelState || {}) // Handle case where wheelState is undefined
  }), [wheelState]);

  // Keep refs in sync without retriggering RAF setup
  useEffect(() => { 
    rotationRef.current = safeWheelState.rotation; 
  }, [safeWheelState.rotation]);
  
  useEffect(() => { 
    spinningRef.current = safeWheelState.isSpinning; 
  }, [safeWheelState.isSpinning]);
  // Physics step uses invisible notches, not bulbs
  useEffect(() => {
    const count = Math.max(1, NOTCH_COUNT);
    segCountRef.current = count;
    segAngleDegRef.current = 360 / count;
  }, [NOTCH_COUNT]);

  // Preload pointer asset; reload when style changes to pick silver defaults when applicable
  useEffect(() => {
    let canceled = false;
    pointerLoadingRef.current = true;
    pointerImgReadyRef.current = false;
    pointerImgRef.current = null;
    const sources = getPointerSourcesForStyle(borderStyle);
    (async () => {
      for (const src of sources) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const ok = await new Promise<boolean>((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
        });
        if (canceled) return;
        if (ok) {
          pointerImgRef.current = img;
          pointerImgReadyRef.current = true;
          pointerLoadingRef.current = false;
          return;
        }
      }
      if (!canceled) {
        pointerImgReadyRef.current = false;
        pointerLoadingRef.current = false; // finished loading attempt, but not available
      }
    })();
    return () => { canceled = true; };
  }, [borderStyle]);

  // Preload center image (svg/png) with silver defaults when applicable; reload when style changes
  useEffect(() => {
    let canceled = false;
    (async () => {
      centerLoadingRef.current = true;
      centerImgRef.current = null;
      centerImgReadyRef.current = false;
      setCenterImgReady(false);
      const sources = getCenterSourcesForStyle(borderStyle);
      for (const src of sources) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const ok = await new Promise<boolean>((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
        });
        if (canceled) return;
        if (ok) {
          centerImgRef.current = img;
          centerImgReadyRef.current = true;
          setCenterImgReady(true);
          centerLoadingRef.current = false;
          return;
        }
      }
      if (!canceled) {
        centerImgReadyRef.current = false;
        setCenterImgReady(false);
        centerLoadingRef.current = false; // loading finished, asset not found
      }
    })();
    return () => { canceled = true; };
  }, [borderStyle]);

  // Animation frame pour les effets animés (désactivable)
  useEffect(() => {
    let animationId: number | null = null;

    const animate = (timestamp: number) => {
      const prevTs = prevTimestampRef.current || timestamp - 16;
      const dtMs = Math.max(1, timestamp - prevTs);
      const dt = dtMs / 1000; // seconds

      const shouldFreezePointer = disablePointerAnimation || spinningRef.current;

      if (shouldFreezePointer) {
        // Keep pointer strictly static at neutral angle
        pointerVelRef.current = 0;
        pointerAngleRef.current = 0; // neutral straight-down
        prevBoundaryIndexRef.current = null; // reset notch tracking to avoid a big impulse after
      } else {
        // Detect invisible ratchet notch crossings (pointer tip hits notches)
        const stepDeg = segAngleDegRef.current;
        const segCount = segCountRef.current;
        const currRot = rotationRef.current; // degrees
        const prevRot = prevRotationRef.current;
        const phasedRot = currRot + NOTCH_PHASE_DEG; // allow aligning notches to art
        const currIndex = Math.floor((((phasedRot % 360) + 360) % 360) / stepDeg);
        if (prevBoundaryIndexRef.current === null) prevBoundaryIndexRef.current = currIndex;
        const prevIndex = prevBoundaryIndexRef.current!;

        if (currIndex !== prevIndex) {
          // Direction based on rotation delta
          const dRot = currRot - prevRot;
          const dir = dRot >= 0 ? 1 : -1; // +1 clockwise, -1 counter
          // Number of notches crossed (robust across large deltas)
          const rawDiff = currIndex - prevIndex;
          let diff = rawDiff;
          if (diff > segCount / 2) diff -= segCount;
          if (diff < -segCount / 2) diff += segCount;
          const steps = Math.max(1, Math.abs(diff));
          // Clicky impulse: stronger at higher speed, but still present when slow
          const stepDegLocal = segAngleDegRef.current;
          const speedRatio = Math.min(2, Math.abs(dRot) / Math.max(1e-3, stepDegLocal));
          const speedFactor = 0.35 + 0.65 * Math.sqrt(speedRatio); // sqrt for smoother response
          const baseImpulse = 0.22; // ~12.6° equivalent impulse
          const impulse = (-dir) * baseImpulse * speedFactor;
          for (let i = 0; i < steps; i++) pointerVelRef.current += impulse;
          prevBoundaryIndexRef.current = currIndex;
        }

        // Spring-damper toward a slight downward rest angle to mimic gravity on the tip
        const REST_ANGLE = -0.08; // radians (~-4.6°)
        const k = 32; // spring stiffness
        const c = 7;  // damping
        const delta = (pointerAngleRef.current - REST_ANGLE);
        const accel = (-k * delta) - (c * pointerVelRef.current);
        pointerVelRef.current += accel * dt;
        pointerAngleRef.current += pointerVelRef.current * dt;

        // Clamp around rest to avoid extreme rotation
        const maxRad = 0.5; // ~28.6° excursion around REST_ANGLE
        if (pointerAngleRef.current > REST_ANGLE + maxRad) pointerAngleRef.current = REST_ANGLE + maxRad;
        if (pointerAngleRef.current < REST_ANGLE - maxRad) pointerAngleRef.current = REST_ANGLE - maxRad;
      }

      // Keep timers in sync and trigger redraw for border animations
      prevRotationRef.current = rotationRef.current;
      prevTimestampRef.current = timestamp;
      setAnimationTime(timestamp);
      animationId = requestAnimationFrame(animate);
    };

    // Always run RAF to ensure sparkle/gradient animations update
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [borderStyle, disablePointerAnimation]);

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

    const count = BULB_COUNT;
    // Réduire la taille des ampoules pour un rendu plus fin
    const bulbRadius = Math.max(1.5 * scaleFactor, Math.min(5 * scaleFactor, borderW * 0.18));
    const startAngle = -Math.PI / 2; // aligné sur le pointeur en haut

    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i * 2 * Math.PI) / count + (safeWheelState.rotation * Math.PI / 180);
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

    // Déterminer si le style courant est un template pattern (ex: goldRing/silverRing)
    const styleForSegments = getBorderStyle(borderStyle);
    const isPatternStyle = styleForSegments.type === 'pattern';
    drawBackground(ctx, centerX, centerY, borderRadius, theme);

    // Dessiner les segments
    if (segments.length > 0) {
      drawSegments(ctx, segments, centerX, centerY, maxRadius, safeWheelState, theme, !!isPatternStyle);
    }

    // Dessiner les bordures stylisées (bordures statiques, pas d'animation)
    drawStyledBorder(ctx, centerX, centerY, borderRadius, borderStyle, 0, customBorderWidth);

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

  }, [segments, theme, safeWheelState, size, borderStyle, animationTime, showBulbs, customBorderWidth]);



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

  const drawSegments = (
    ctx: CanvasRenderingContext2D,
    segments: WheelSegment[],
    centerX: number,
    centerY: number,
    radius: number,
    wheelState: WheelState,
    theme: WheelTheme,
    isPatternBorder: boolean
  ) => {
    const anglePerSegment = (2 * Math.PI) / segments.length;
    // Debug flag to print the resolved colors actually used for rendering once per draw
    const DEBUG_SEGMENTS = !!(globalThis as any)?.__DEBUG_WHEEL_SEGMENTS__;
    const usedColors: string[] = DEBUG_SEGMENTS ? [] : [];
    
    segments.forEach((segment, index) => {
      const startAngle = (index * anglePerSegment) + (wheelState.rotation * Math.PI / 180);
      const endAngle = startAngle + anglePerSegment;
      
      // Couleur du segment - forcer l'utilisation de brandColors si le segment a la couleur par défaut
      let segmentColor = segment.color;
      
      if (segment.color === '#44444d' && brandColors?.primary) {
        segmentColor = brandColors.primary;
      } else if (!segmentColor) {
        segmentColor = index % 2 === 0 ? theme.colors.primary : theme.colors.secondary;
      }
      
      if (DEBUG_SEGMENTS) usedColors.push(segmentColor);

      // Dessiner le segment - utiliser le rayon complet
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Utiliser toujours des couleurs nettes, pas de dégradé
      ctx.fillStyle = segmentColor;
      
      ctx.fill();

      // Désactivation complète des bordures blanches
      // Les séparateurs sont gérés séparément

      // Tracer uniquement les séparateurs pour tous les styles
      ctx.save();
      ctx.strokeStyle = isPatternBorder ? 'rgba(0,0,0,0.2)' : theme.colors.background;
      ctx.lineWidth = 1;
      
      // Ligne au début du segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(startAngle),
        centerY + radius * Math.sin(startAngle)
      );
      ctx.stroke();
      
      ctx.restore();
      ctx.restore();

      // Dessiner une icône par segment si disponible (imageUrl mappé vers segment.icon)
      const segmentWithImage = segment as any;
      // Fallback: considérer qu'un segment est image si imageUrl OU icon existent
      const hasImageUrl = typeof segmentWithImage.imageUrl === 'string' && segmentWithImage.imageUrl.length > 0;
      const hasIcon = typeof segmentWithImage.icon === 'string' && segmentWithImage.icon.length > 0;
      const isImageSegment = (segmentWithImage.contentType === 'image') || hasImageUrl || hasIcon;
      const imageUrl = hasImageUrl ? segmentWithImage.imageUrl : (hasIcon ? segmentWithImage.icon : undefined);
      
      // Image segment detection (logging removed for performance)
      if (imageUrl && typeof imageUrl === 'string' && isImageSegment) {
        
        const cache = segmentIconCacheRef.current;
        let entry = cache.get(imageUrl);
        if (!entry) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          entry = { img, ready: false, loading: true };
          cache.set(imageUrl, entry);
          img.onload = () => {
            const e = cache.get(imageUrl);
            if (e) {
              e.ready = true;
              e.loading = false;
            }
          };
          img.onerror = () => {
            const e = cache.get(imageUrl);
            if (e) {
              e.ready = false;
              e.loading = false;
              e.failed = true;
            }
            console.error('❌ Failed to load segment image for:', segmentWithImage.id, imageUrl.substring(0, 100));
          };
          img.src = imageUrl;
        }
        
        if (entry && entry.ready && !entry.failed) {
          
          // Positionner l'image au centre du segment
          const midAngle = startAngle + anglePerSegment / 2;
          const iconRadius = Math.max(20 * 0.75, size * 0.12 * 0.75); // Réduction de 25% du conteneur d'image
          const dist = radius * 0.65; // Position centrale dans le segment
          const iconX = centerX + dist * Math.cos(midAngle);
          const iconY = centerY + dist * Math.sin(midAngle);

          ctx.save();
          
          // Créer un clip circulaire SANS bordure ni fond
          ctx.beginPath();
          ctx.arc(iconX, iconY, iconRadius, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();

          // Remplissage interne avec la couleur du segment pour éviter l'effet de halo noir
          // (non visible comme bordure car totalement sous l'image et dans le clip)
          ctx.fillStyle = segmentColor;
          ctx.beginPath();
          ctx.arc(iconX, iconY, iconRadius, 0, 2 * Math.PI);
          ctx.fill();
          
          // Créer un masque circulaire pour l'icône
          ctx.save();
          ctx.beginPath();
          ctx.arc(iconX, iconY, iconRadius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          // Calculer les dimensions pour remplir le cercle en maintenant le ratio
          const imgAspect = entry.img.width / entry.img.height;
          let drawWidth, drawHeight;
          
          if (imgAspect > 1) {
            // Image plus large que haute
            drawWidth = iconRadius * 2 * imgAspect;
            drawHeight = iconRadius * 2;
          } else {
            // Image plus haute que large ou carrée
            drawWidth = iconRadius * 2;
            drawHeight = (iconRadius * 2) / imgAspect;
          }
          
          // Centrer l'image dans le cercle
          const x = iconX - drawWidth / 2;
          const y = iconY - drawHeight / 2;
          
          // Activer le lissage de haute qualité
          ctx.imageSmoothingEnabled = true;
          try { (ctx as any).imageSmoothingQuality = 'high'; } catch {}
          
          // Dessiner l'image
          ctx.drawImage(entry.img, x, y, drawWidth, drawHeight);
          ctx.restore();
          
          ctx.restore();
        }
      }
      
      // Gestion de l'indicateur de chargement pour les segments image
      if (isImageSegment && imageUrl && typeof imageUrl === 'string') {
        const cache = segmentIconCacheRef.current;
        const entry = cache.get(imageUrl);
        
        if (entry && entry.loading) {
          // Afficher un indicateur de chargement
          const midAngle = startAngle + anglePerSegment / 2;
          const iconRadius = Math.max(20 * 0.75, size * 0.12 * 0.75);
          const dist = radius * 0.65;
          const iconX = centerX + dist * Math.cos(midAngle);
          const iconY = centerY + dist * Math.sin(midAngle);

          ctx.save();
          // Indicateur de chargement minimal sans fond blanc
          ctx.strokeStyle = '#ccc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(iconX, iconY, iconRadius * 0.7, 0, Math.PI);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Dessiner le texte seulement si ce n'est pas un segment image
      const shouldDrawText = !isImageSegment;
      
      if (shouldDrawText) {
        drawSegmentText(ctx, segment, centerX, centerY, radius, startAngle, anglePerSegment, theme);
      }
    });

    if (DEBUG_SEGMENTS) {
      try {
        console.log('🖌️ useSmartWheelRenderer - Used segment colors:', usedColors);
      } catch {}
    }
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

    // Utiliser la couleur personnalisée si fournie, quel que soit le style
    const getBorderColor = (index: number = 0) => {
      if (customBorderColor) return customBorderColor;
      return borderStyleConfig.colors[index];
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
    } 
    // Gestion des styles 'pattern' sans chargement d'images: rendu statique immédiat
    else if (borderStyleConfig.type === 'pattern') {
      // Rendu des templates image (anneau) : dessiner au-dessus du bord des segments
      // en découpant un anneau [outerR, innerR] et en mappant l'image dessus
      const imgSrc = borderStyleConfig.imageSrc;
      if (imgSrc) {
        const cache = ringImageCacheRef.current;
        let entry = cache.get(imgSrc);
        if (!entry) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          entry = { img, ready: false, loading: true };
          cache.set(imgSrc, entry);
          img.onload = () => {
            const e = cache.get(imgSrc);
            if (e) { e.ready = true; e.loading = false; }
          };
          img.onerror = () => {
            const e = cache.get(imgSrc);
            if (e) { e.ready = false; e.loading = false; e.failed = true; }
            console.error('Failed to load border ring image:', imgSrc);
          };
          img.src = imgSrc;
        }

        if (entry && entry.ready && !entry.failed) {
          // Taille du motif pour couvrir toute la roue
          const drawSize = size * 1.1;
          
          // Position centrée
          const x = centerX - drawSize/2;
          const y = centerY - drawSize/2;
          
          // Rendu direct
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(entry.img, x, y, drawSize, drawSize);
          
          // Contour pour éviter les artefacts
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = 'transparent';
          ctx.lineWidth = 5;
          ctx.stroke();
        } else {
          // Fallback visuel pendant le chargement: simple dégradé métallique
          const metallicGradient = createMetallicGradient(ctx, borderStyleConfig.colors, centerX, centerY, radius);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = metallicGradient;
          ctx.lineWidth = borderWidth;
          ctx.lineJoin = 'miter';
          ctx.lineCap = 'square';
          ctx.stroke();
        }
      } else {
        // Si aucune image définie, fallback sur un dégradé métallique
        const metallicGradient = createMetallicGradient(ctx, borderStyleConfig.colors, centerX, centerY, radius);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = metallicGradient;
        ctx.lineWidth = borderWidth;
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'square';
        ctx.stroke();
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
    const segmentAny = segment as any;
    
    // Ne pas dessiner le texte si c'est un segment image
    if (segmentAny.contentType === 'image') {
      return;
    }
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + anglePerSegment / 2);
    
    // Utiliser la couleur de texte du segment ou calculer automatiquement
    const textColor = segmentAny.textColor || segment.textColor || 
      (segmentAny.color === '#ffffff' ? '#000000' : '#ffffff') || 
      theme.colors.text;
    
    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.max(12, size * 0.03)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (theme.effects.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
    }
    
    // Utiliser le label du segment
    const label = segmentAny.label || segment.label || '';
    ctx.fillText(label, radius * 0.7, 0);
    ctx.restore();
  };

  const drawCenter = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number, theme: WheelTheme) => {
    const centerRadius = size * CENTER_SCALE;

    // If still loading the center asset, draw nothing to avoid temporary wrong visuals
    if (centerLoadingRef.current) {
      return;
    }

    // If a custom center image is available, draw it clipped in a circle and skip the ring stroke
    if (centerImgReadyRef.current && centerImgRef.current) {
      const img = centerImgRef.current;
      const naturalW = img.naturalWidth || 512;
      const naturalH = img.naturalHeight || 512;
      const aspect = naturalW / Math.max(1, naturalH);
      const drawW = centerRadius * 2;
      const drawH = drawW / aspect;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
      ctx.restore();
      return; // do not draw gradient ring when custom image is present
    }

    // Fallback: procedural silver center when silver style is active, else theme-based
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    const silverMode = borderStyle.toLowerCase().includes('silver');
    if (silverMode) {
      const g = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
      g.addColorStop(0, '#f2f2f2');
      g.addColorStop(0.5, '#cfcfcf');
      g.addColorStop(1, '#a6a6a6');
      ctx.fillStyle = g;
    } else if (theme.effects.gradient) {
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
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
    const scaleFactor = size / 200;
    const gap = Math.max(6 * scaleFactor, 4);

    // Size responsive and safe against top clipping
    const basePointerHeight = Math.max(18, size * 0.12);
    const desiredPointerHeight = basePointerHeight * POINTER_SCALE;
    const tipYBase = centerY - radius + gap;
    const maxHeightBase = tipYBase - 2; // margin from top edge
    const overflow = Math.max(0, desiredPointerHeight - maxHeightBase);
    const tipY = tipYBase + overflow; // push down to keep full pointer visible
    const maxHeight = tipY - 2;
    let pointerHeight = Math.min(desiredPointerHeight, Math.max(10, maxHeight));
    const pointerWidth = Math.max(10, pointerHeight * 0.6);

    ctx.save();
    ctx.translate(centerX, tipY);
    // Apply animated wobble/deflection
    ctx.rotate(pointerAngleRef.current);

    // If pointer asset is still loading, skip drawing to avoid showing fallback temporarily
    if (pointerLoadingRef.current) {
      ctx.restore();
      return;
    }

    // If SVG is loaded, draw it. Otherwise fallback to the procedural pointer.
    if (pointerImgReadyRef.current && pointerImgRef.current) {
      // Soft drop shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 6 * scaleFactor;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2 * scaleFactor;

      const img = pointerImgRef.current;
      const naturalW = img.naturalWidth || 500;
      const naturalH = img.naturalHeight || 500;
      const aspect = naturalW / Math.max(1, naturalH);
      const drawH = pointerHeight;
      const drawW = Math.max(10, drawH * aspect);
      // Anchor: horizontally centered, tip at current origin (0,0) => draw from y=-drawH
      ctx.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
      ctx.restore();
    } else {
      // Fallback: procedural pointer (silver when silver style active, else gold)
      // Soft drop shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 6 * scaleFactor;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2 * scaleFactor;

      // Main gold gradient
      const mainGradient = ctx.createLinearGradient(
        -pointerWidth, -pointerHeight,
        pointerWidth, 0
      );
      const silverMode = borderStyle.toLowerCase().includes('silver');
      if (silverMode) {
        mainGradient.addColorStop(0, '#6e6e6e');
        mainGradient.addColorStop(0.25, '#9e9e9e');
        mainGradient.addColorStop(0.5, '#c0c0c0');
        mainGradient.addColorStop(0.75, '#e0e0e0');
        mainGradient.addColorStop(1, '#f5f5f5');
      } else {
        mainGradient.addColorStop(0, '#8a6c10');
        mainGradient.addColorStop(0.25, '#b8860b');
        mainGradient.addColorStop(0.5, '#daa520');
        mainGradient.addColorStop(0.75, '#ffd700');
        mainGradient.addColorStop(1, '#ffe680');
      }

      // Pointer shape (downward tip)
      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-pointerWidth, -pointerHeight);
      ctx.lineTo(pointerWidth, -pointerHeight);
      ctx.closePath();
      ctx.fill();

      // Reset shadow for borders/highlights
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Thick border (silver or gold)
      const borderGradient = ctx.createLinearGradient(
        -pointerWidth, -pointerHeight,
        pointerWidth, 0
      );
      if (silverMode) {
        borderGradient.addColorStop(0, '#9a9a9a');
        borderGradient.addColorStop(0.5, '#c8c8c8');
        borderGradient.addColorStop(1, '#f0f0f0');
      } else {
        borderGradient.addColorStop(0, '#B8860B');
        borderGradient.addColorStop(0.5, '#DAA520');
        borderGradient.addColorStop(1, '#FFD700');
      }

      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 4 * scaleFactor;
      ctx.lineJoin = 'miter';
      ctx.lineCap = 'square';
      ctx.stroke();

      // Metallic highlight band
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

      // Side sheen (left)
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

      // Central sparkle
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

      // Micro-bevel at tip
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.5 * scaleFactor;
      ctx.beginPath();
      ctx.moveTo(0, -pointerHeight * 0.04);
      ctx.lineTo(0, -pointerHeight * 0.16);
      ctx.stroke();

      ctx.restore();
    }
  };

  return { canvasRef, centerImgReady };
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
