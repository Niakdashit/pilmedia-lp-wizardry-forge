import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useScratchCardStore } from './state/scratchcard.store';
import { ScratchCard, Cover, Reveal } from './state/types';

interface ScratchCardCanvasProps {
  previewMode?: boolean;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}

const ScratchCardCanvas: React.FC<ScratchCardCanvasProps> = ({
  previewMode = false,
  selectedDevice = 'desktop'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Store state
  const { config, updateCardProgress, revealCard, resetAllCards } = useScratchCardStore();
  const { cards, grid, brush, threshold, globalCover, globalReveal } = config;

  console.log(`🔧 ScratchCardCanvas render - threshold: ${(threshold * 100).toFixed(1)}%`);
  console.log(`🔧 ScratchCardCanvas render - updateCardProgress function:`, typeof updateCardProgress);

  // State to force re-render on window resize
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Responsive dimensions - ensure all cards fit completely without being cut off
  const containerDimensions = useMemo(() => {
    const viewportWidth = windowSize.width;
    const viewportHeight = windowSize.height;

    const isMobile = selectedDevice === 'mobile' || viewportWidth < 768;
    const isTablet = selectedDevice === 'tablet' || (viewportWidth >= 768 && viewportWidth < 1024);

    // Local copy que l'on peut modifier
    const localGrid = { ...grid };

    // Mise à l'échelle des marges/espaces par device
    let headerHeight = 80;
    let sidebarWidth = 280;
    let containerPadding = 40;
    let gridGap = grid.gap;

    if (isMobile) {
      headerHeight = 60;
      sidebarWidth = 0;
      containerPadding = 20;
      gridGap = 12;

      // Forcer 1 colonne sur mobile
      localGrid.cols = 1;
      localGrid.rows = Math.ceil(cards.length / localGrid.cols);
    } else if (isTablet) {
      sidebarWidth = 260;
      containerPadding = 30;
      gridGap = 16;

      // Limiter à 2 colonnes sur tablette
      localGrid.cols = Math.min(localGrid.cols, 2);
      localGrid.rows = Math.ceil(cards.length / localGrid.cols);
    }

    // Espace réellement disponible
    const availableWidth = viewportWidth - sidebarWidth - containerPadding * 2;
    const availableHeight = viewportHeight - headerHeight - containerPadding * 2;

    // Espace pris par les gaps
    const totalGapWidth = gridGap * Math.max(0, localGrid.cols - 1);
    const totalGapHeight = gridGap * Math.max(0, localGrid.rows - 1);

    const cardSpaceWidth = availableWidth - totalGapWidth;
    const cardSpaceHeight = availableHeight - totalGapHeight;

    // Bornes max par carte
    let maxCardWidth: number;
    let maxCardHeight: number;

    if (isMobile) {
      const mobileCardWidth = Math.min(cardSpaceWidth * 0.7, 280);
      maxCardWidth = Math.floor(mobileCardWidth);
      maxCardHeight = Math.floor(cardSpaceHeight / localGrid.rows);
    } else {
      maxCardWidth = Math.floor(cardSpaceWidth / localGrid.cols);
      maxCardHeight = Math.floor(cardSpaceHeight / localGrid.rows);
    }

    console.log(`📐 Viewport: ${viewportWidth}x${viewportHeight}`);
    console.log(`📐 Available space: ${availableWidth}x${availableHeight}`);
    console.log(`📐 Card space after gaps: ${cardSpaceWidth}x${cardSpaceHeight}`);
    console.log(`📐 Max card size: ${maxCardWidth}x${maxCardHeight}`);
    console.log(`📱 Device detection: isMobile=${isMobile}, isTablet=${isTablet}, selectedDevice=${selectedDevice}`);

    // Dimensions finales d'une carte
    let cardWidth: number;
    let cardHeight: number;

    if (grid.cardShape === 'vertical-rectangle') {
      // 3:2 (vertical)
      const widthBasedHeight = maxCardWidth * 1.5;
      const heightBasedWidth = maxCardHeight / 1.5;

      if (widthBasedHeight <= maxCardHeight) {
        cardWidth = maxCardWidth;
        cardHeight = widthBasedHeight;
      } else {
        cardWidth = heightBasedWidth;
        cardHeight = maxCardHeight;
      }
    } else {
      // Carré
      const squareSize = Math.min(maxCardWidth, maxCardHeight);
      cardWidth = squareSize;
      cardHeight = squareSize;
    }

    // Taille mini utilisable
    const minSize = isMobile ? 120 : 150;
    if (cardWidth < minSize || cardHeight < minSize) {
      const scale = minSize / Math.min(cardWidth, cardHeight);
      cardWidth *= scale;
      cardHeight *= scale;
    }

    // Dimensions finales du conteneur/grille
    const containerWidth = cardWidth * localGrid.cols + totalGapWidth;
    const containerHeight = cardHeight * localGrid.rows + totalGapHeight;

    console.log(`🎴 Final card: ${cardWidth.toFixed(1)}x${cardHeight.toFixed(1)}`);
    console.log(`🎴 Final container: ${containerWidth.toFixed(1)}x${containerHeight.toFixed(1)}`);

    return {
      containerWidth,
      containerHeight,
      cardWidth,
      cardHeight,
      isMobile,
      isTablet,
      localGrid,
      gridGap
    };
  }, [windowSize, grid, cards.length, selectedDevice]);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      console.log('🔄 Window resized, recalculating card dimensions');
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        console.log('📱 Orientation changed, recalculating card dimensions');
      }, 100);
    };

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const visualViewport = window.visualViewport;
        console.log(`📱 Visual viewport changed: ${visualViewport.width}x${visualViewport.height}`);
        setWindowSize(prev => ({ ...prev })); // Trigger re-render
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
    };
  }, []);

  // Initialize scratch cards
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Render individual scratch card
  const renderScratchCard = useCallback((card: ScratchCard, index: number) => {
    // ⚠️ Utiliser les colonnes/espaces recalculés (localGrid + gridGap)
    const row = Math.floor(index / containerDimensions.localGrid.cols);
    const col = index % containerDimensions.localGrid.cols;

    const x = col * (containerDimensions.cardWidth + containerDimensions.gridGap);
    const y = row * (containerDimensions.cardHeight + containerDimensions.gridGap);

    const cardCover = card.cover || globalCover;
    const cardReveal = card.reveal || globalReveal;

    return (
      <ScratchCardItem
        key={card.id}
        card={card}
        cover={cardCover}
        reveal={cardReveal}
        x={x}
        y={y}
        width={containerDimensions.cardWidth}
        height={containerDimensions.cardHeight}
        borderRadius={grid.borderRadius}
        brushRadius={brush.radius}
        threshold={card.threshold || threshold}
        onProgressUpdate={(progress) => {
          console.log(`🔗 ScratchCardCanvas onProgressUpdate called with: ${(progress * 100).toFixed(1)}% for card ${card.id}`);
          updateCardProgress(card.id, progress);
        }}
        onReveal={() => revealCard(card.id)}
        previewMode={previewMode}
      />
    );
  }, [
    containerDimensions,
    globalCover,
    globalReveal,
    grid.borderRadius,
    brush.radius,
    threshold,
    updateCardProgress,
    revealCard,
    previewMode
  ]);

  return (
    <div
      ref={containerRef}
      className="sc-canvas-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0
      }}
    >
      {/* Reset button (visible only in edit mode) */}
      {!previewMode && (
        <button
          onClick={resetAllCards}
          className="sc-reset-button"
          style={{
            position: 'absolute',
            top: containerDimensions.isMobile ? -5 : -10,
            right: containerDimensions.isMobile ? -5 : -10,
            zIndex: 20,
            padding: containerDimensions.isMobile ? '6px 8px' : '8px 12px',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: containerDimensions.isMobile ? '11px' : '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Reset
        </button>
      )}

      {/* Scratch cards grid */}
      <div
        style={{
          // ✅ Ce wrapper devient le “containing block” des cartes absoutes
          position: 'relative',
          width: `${containerDimensions.containerWidth}px`,
          height: `${containerDimensions.containerHeight}px`,

          // On peut garder grid (esthétique/outils), mais les cartes sont positionnées en absolu
          display: 'grid',
          gridTemplateColumns: `repeat(${containerDimensions.localGrid.cols}, ${containerDimensions.cardWidth}px)`,
          gridTemplateRows: `repeat(${containerDimensions.localGrid.rows}, ${containerDimensions.cardHeight}px)`,
          gap: `${containerDimensions.gridGap}px`,

          // ❌ Ne plus centrer en absolu sur mobile, le parent flex le fait déjà
        }}
      >
        {cards
          .slice(0, containerDimensions.localGrid.rows * containerDimensions.localGrid.cols)
          .map(renderScratchCard)}
      </div>
    </div>
  );
};

// Individual scratch card component
interface ScratchCardItemProps {
  card: ScratchCard;
  cover?: Cover;
  reveal?: Reveal;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  brushRadius: number;
  threshold: number;
  onProgressUpdate: (progress: number) => void;
  onReveal: () => void;
  previewMode: boolean;
}

const ScratchCardItem: React.FC<ScratchCardItemProps> = ({
  card,
  cover,
  reveal,
  x,
  y,
  width,
  height,
  borderRadius,
  brushRadius,
  threshold,
  onProgressUpdate,
  onReveal,
  previewMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [lastProgress, setLastProgress] = useState(0);
  const initialOpaquePixelsRef = useRef<number>(0);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    if (!ctx || !overlayCtx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    overlayCanvas.width = width;
    overlayCanvas.height = height;

    // Optimize for frequent read operations
    if ('willReadFrequently' in ctx) {
      (ctx as any).willReadFrequently = true;
    }
    if ('willReadFrequently' in overlayCtx) {
      (overlayCtx as any).willReadFrequently = true;
    }

    // Draw reveal content (background)
    drawRevealContent(ctx, reveal, width, height);

    // Draw cover (overlay) - only if not revealed and not currently scratching
    if (!card.revealed && !isScratching) {
      drawCoverContent(overlayCtx, cover, width, height);

      if (initialOpaquePixelsRef.current === 0) {
        try {
          const baselinePixels = countOpaquePixels(overlayCtx, width, height, 10);
          console.log(
            `🎯 Establishing baseline for card ${card.id}: ${baselinePixels} opaque pixels out of ${width * height} total (${(
              (baselinePixels / (width * height)) *
              100
            ).toFixed(1)}%)`
          );
          initialOpaquePixelsRef.current = baselinePixels;
        } catch (err) {
          console.warn(`⚠️ Failed to establish baseline for card ${card.id}:`, err);
        }
      }
    }
  }, [card.id, cover, reveal, width, height]); // OK

  // Draw reveal content
  const drawRevealContent = (ctx: CanvasRenderingContext2D, reveal?: Reveal, w?: number, h?: number) => {
    if (!ctx || !w || !h) return;

    ctx.clearRect(0, 0, w, h);

    if (reveal?.type === 'image' && reveal.url) {
      const img = new Image();
      img.onload = () => {
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = w / h;

        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspectRatio > canvasAspectRatio) {
          drawWidth = w;
          drawHeight = w / imgAspectRatio;
          drawX = 0;
          drawY = (h - drawHeight) / 2;
        } else {
          drawHeight = h;
          drawWidth = h * imgAspectRatio;
          drawX = (w - drawWidth) / 2;
          drawY = 0;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      };
      img.src = reveal.url;
    } else if (reveal?.type === 'text') {
      const style = reveal.style || {};
      ctx.fillStyle = style.color || '#333333';
      ctx.font = `${style.fontWeight || 400} ${style.fontSize || 16}px Inter, sans-serif`;
      ctx.textAlign = (style.align || 'center') as CanvasTextAlign;

      const textX = style.align === 'left' ? 10 : style.align === 'right' ? w - 10 : w / 2;
      const textY = h / 2;

      ctx.fillText(reveal.value, textX, textY);
    }
  };

  // Draw cover content
  const drawCoverContent = (ctx: CanvasRenderingContext2D, cover?: Cover, w?: number, h?: number) => {
    if (!ctx || !w || !h) return;

    if (cover?.type === 'image' && cover.url) {
      const img = new Image();
      img.onload = () => {
        const opacity = (cover as any).opacity || 1;
        ctx.globalAlpha = opacity;

        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = w / h;

        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspectRatio > canvasAspectRatio) {
          drawWidth = w;
          drawHeight = w / imgAspectRatio;
          drawX = 0;
          drawY = (h - drawHeight) / 2;
        } else {
          drawHeight = h;
          drawWidth = h * imgAspectRatio;
          drawX = (w - drawWidth) / 2;
          drawY = 0;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.globalAlpha = 1;
      };
      img.src = cover.url;
    } else if (cover?.type === 'color') {
      const opacity = (cover as any).opacity || 1;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = cover.value;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  };

  // Scratch functionality
  const handlePointerDown = (e: React.PointerEvent) => {
    if (card.revealed || previewMode) return;

    e.stopPropagation();
    e.preventDefault();

    setIsScratching(true);
    const canvas = overlayCanvasRef.current;
    if (canvas) {
      canvas.setPointerCapture(e.pointerId);
      scratch(e);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScratching || card.revealed) return;

    e.stopPropagation();
    e.preventDefault();

    scratch(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsScratching(false);
  };

  const scratch = (e: React.PointerEvent) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    let canvasX = e.clientX - rect.left;
    let canvasY = e.clientY - rect.top;

    // Recherche des transform du parent
    let parentElement = canvas.parentElement;
    let cumulativeScale = 1;
    let cumulativeTranslateX = 0;
    let cumulativeTranslateY = 0;

    while (parentElement && parentElement !== document.body) {
      const style = window.getComputedStyle(parentElement);
      const transform = style.transform || (style as any).webkitTransform;

      if (transform && transform !== 'none') {
        const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
        if (matrixMatch) {
          const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
          if (values.length >= 6) {
            cumulativeScale *= values[0];
            cumulativeTranslateX += values[4];
            cumulativeTranslateY += values[5];
          }
        }

        const scaleMatch = transform.match(/scale\(([^)]+)\)/);
        if (scaleMatch) {
          const scaleValue = parseFloat(scaleMatch[1]);
          cumulativeScale *= scaleValue;
        }
      }

      const zoomValue =
        (parentElement as HTMLElement).style.getPropertyValue('--zoom') ||
        (parentElement as any).dataset?.zoom ||
        style.getPropertyValue('zoom');

      if (zoomValue && zoomValue !== '1' && zoomValue !== 'normal') {
        const parsed = parseFloat(zoomValue);
        if (!Number.isNaN(parsed)) cumulativeScale *= parsed;
      }

      parentElement = parentElement.parentElement;
    }

    if (cumulativeScale !== 1) {
      canvasX = canvasX / cumulativeScale;
      canvasY = canvasY / cumulativeScale;
    }

    if (cumulativeTranslateX !== 0 || cumulativeTranslateY !== 0) {
      canvasX = canvasX - cumulativeTranslateX;
      canvasY = canvasY - cumulativeTranslateY;
    }

    console.log(
      `🎨 Scratch coords: screen(${e.clientX}, ${e.clientY}) -> canvas(${canvasX.toFixed(
        1
      )}, ${canvasY.toFixed(1)}) | Scale: ${cumulativeScale.toFixed(2)}`
    );

    canvasX = Math.max(0, Math.min(canvasX, width));
    canvasY = Math.max(0, Math.min(canvasY, height));

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, brushRadius, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(() => {
      const progress = calculateScratchProgress(ctx, overlayCanvasRef.current!, width, height);

      console.log(`🎯 Scratch progress: ${(progress * 100).toFixed(1)}% | Threshold: ${(threshold * 100).toFixed(1)}%`);

      if (Math.abs(progress - lastProgress) > 0.01) {
        setLastProgress(progress);
        console.log(`📤 Calling onProgressUpdate with progress: ${(progress * 100).toFixed(1)}%`);
        onProgressUpdate(progress);
      }
    });
  };

  const countOpaquePixels = (ctx: CanvasRenderingContext2D, w: number, h: number, alphaThreshold: number): number => {
    const { data } = ctx.getImageData(0, 0, w, h);
    let count = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > alphaThreshold) count++;
    }
    return count;
  };

  const calculateScratchProgress = (
    ctx: CanvasRenderingContext2D,
    overlayEl: HTMLCanvasElement,
    w: number,
    h: number
  ): number => {
    if (!initialOpaquePixelsRef.current || initialOpaquePixelsRef.current <= 0) {
      try {
        const overlayCtx = overlayEl.getContext('2d');
        if (overlayCtx) {
          const baselinePixels = countOpaquePixels(overlayCtx, w, h, 10);
          console.log(`🎯 Measuring baseline for card ${card.id}: ${baselinePixels} pixels`);
          initialOpaquePixelsRef.current = baselinePixels;
        }
      } catch (err) {
        console.warn(`⚠️ Could not measure baseline for card ${card.id}:`, err);
        return 0;
      }
    }

    const baseline = initialOpaquePixelsRef.current;
    if (!baseline || baseline <= 0) {
      console.log(`⚠️ No baseline available for card ${card.id}, returning 0 progress`);
      return 0;
    }

    const remainingOpaque = countOpaquePixels(ctx, w, h, 10);
    const scratched = Math.max(0, baseline - remainingOpaque);
    const progress = Math.min(1, scratched / baseline);

    console.log(`📊 Card ${card.id}: scratched=${scratched}, baseline=${baseline}, progress=${(progress * 100).toFixed(1)}%`);
    return progress;
  };

  return (
    <div
      className="sc-card"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        borderRadius,
        overflow: 'hidden',
        background: 'white',
        cursor: card.revealed || previewMode ? 'default' : 'crosshair'
      }}
    >
      {/* Reveal content (background) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />

      {/* Cover overlay */}
      {!card.revealed && (
        <canvas
          ref={overlayCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            touchAction: 'none'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      )}

      {/* Winner indicator */}
      {card.revealed && card.isWinner && (
        <div
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            background: '#4CAF50',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 600
          }}
        >
          WIN
        </div>
      )}
    </div>
  );
};

ScratchCardCanvas.displayName = 'ScratchCardCanvas';

export default ScratchCardCanvas;
