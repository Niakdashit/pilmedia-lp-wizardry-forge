import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ScratchCardCanvasProps, ScratchCard } from '../types';
import { scratchCardStateHelpers } from '../store';
import { useScratchCard } from '../hooks/useScratchCard';
import { getDeviceDimensions } from '@/utils/deviceDimensions';
import confetti from 'canvas-confetti';

const ScratchCardItem: React.FC<{
  card: ScratchCard;
  globalCover?: any;
  globalReveal?: any;
  brushRadius: number;
  threshold: number;
  mode: 'edit' | 'preview';
  onProgress: (progress: number) => void;
  onRevealed: () => void;
  disabled?: boolean;
}> = ({
  card,
  globalCover,
  globalReveal,
  brushRadius,
  threshold,
  mode,
  onProgress,
  onRevealed,
  disabled = false
}) => {
  const coverRef = useRef<HTMLDivElement>(null);
  const {
    canvasRef,
    isScratching,
    progress,
    isRevealed,
    hasStarted,
    initializeCanvas,
    startScratching,
    continueScratching,
    stopScratching,
    resetCard
  } = useScratchCard({
    card,
    brushRadius,
    threshold,
    onProgress,
    onRevealed,
    disabled
  });

  // Get final cover and reveal content
  const finalCover = scratchCardStateHelpers.getCardCover(card, globalCover);
  const finalReveal = scratchCardStateHelpers.getCardReveal(card, globalReveal);

  // Initialize canvas when mounted
  useEffect(() => {
    const canvas = canvasRef.current;
    const cover = coverRef.current;
    if (canvas && cover) {
      const resizeCanvas = () => {
        initializeCanvas(canvas, cover);
      };
      
      // Initialize immediately
      resizeCanvas();
      
      // Handle resize
      const resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(cover);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [initializeCanvas, finalCover]);

  // Reset when card changes
  useEffect(() => {
    if (card.progress === 0 && card.revealed === false) {
      resetCard();
    }
  }, [card.progress, card.revealed, resetCard]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startScratching(e.nativeEvent);
  }, [startScratching]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    continueScratching(e.nativeEvent);
  }, [continueScratching]);

  const handlePointerUp = useCallback(() => {
    stopScratching();
  }, [stopScratching]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startScratching(e.nativeEvent);
  }, [startScratching]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    continueScratching(e.nativeEvent);
  }, [continueScratching]);

  const handleTouchEnd = useCallback(() => {
    stopScratching();
  }, [stopScratching]);

  return (
    <div className={`sc-card ${isRevealed ? 'sc-card--revealed' : ''} ${mode === 'edit' ? 'sc-card--edit' : ''}`}>
      {/* Background content (revealed content) */}
      <div className="sc-card__content">
        {finalReveal.type === 'image' ? (
          <img 
            src={finalReveal.url} 
            alt={finalReveal.alt || 'Contenu révélé'} 
            className="sc-card__reveal-image"
          />
        ) : (
          <div 
            className="sc-card__reveal-text"
            style={{
              fontSize: finalReveal.style?.fontSize ? `${finalReveal.style.fontSize}px` : '16px',
              fontWeight: finalReveal.style?.fontWeight || 400,
              textAlign: finalReveal.style?.align || 'center'
            }}
          >
            {finalReveal.value}
          </div>
        )}
      </div>

      {/* Cover layer */}
      <div 
        ref={coverRef}
        className="sc-card__cover"
        style={{
          backgroundColor: finalCover.type === 'color' ? finalCover.value : 'transparent',
          backgroundImage: finalCover.type === 'image' ? `url(${finalCover.url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Scratch canvas overlay */}
        <canvas
          ref={canvasRef}
          className="sc-card__canvas"
          onPointerDown={!disabled ? handlePointerDown : undefined}
          onPointerMove={!disabled ? handlePointerMove : undefined}
          onPointerUp={!disabled ? handlePointerUp : undefined}
          onPointerLeave={!disabled ? handlePointerUp : undefined}
          onTouchStart={!disabled ? handleTouchStart : undefined}
          onTouchMove={!disabled ? handleTouchMove : undefined}
          onTouchEnd={!disabled ? handleTouchEnd : undefined}
          style={{
            touchAction: 'none',
            cursor: disabled ? 'not-allowed' : (isScratching ? 'grabbing' : 'grab')
          }}
        />
      </div>

      {/* Edit mode overlays */}
      {mode === 'edit' && (
        <div className="sc-card__edit-overlay">
          <div className="sc-card__edit-info">
            <span className="sc-card__title">{card.title}</span>
            {card.isWinner && <span className="sc-card__winner">🏆</span>}
          </div>
        </div>
      )}

      {/* Progress indicator in edit mode */}
      {mode === 'edit' && hasStarted && !isRevealed && (
        <div className="sc-card__progress">
          <div className="sc-card__progress-bar">
            <div 
              className="sc-card__progress-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="sc-card__progress-text">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

export const ScratchCardCanvas: React.FC<ScratchCardCanvasProps> = ({
  mode,
  state,
  onStateChange,
  onCardProgress,
  onCardRevealed,
  onReset,
  width,
  height,
  device = 'desktop'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Get device dimensions if not specified
  const dims = device ? getDeviceDimensions(device) : { width: width || 800, height: height || 600 };
  const containerWidth = width || dims.width;
  const containerHeight = height || dims.height;

  // Handle card progress
  const handleCardProgress = useCallback((cardId: string, progress: number) => {
    // Update card progress in state
    if (onStateChange) {
      const newState = scratchCardStateHelpers.updateCard(state, cardId, { progress });
      onStateChange(newState);
    }
    onCardProgress?.(cardId, progress);
  }, [state, onStateChange, onCardProgress]);

  // Handle card revealed
  const handleCardRevealed = useCallback((cardId: string) => {
    const card = state.cards.find(c => c.id === cardId);
    
    // Update card as revealed in state
    if (onStateChange) {
      const newState = scratchCardStateHelpers.updateCard(state, cardId, { revealed: true });
      onStateChange(newState);
    }
    
    // Trigger confetti for winners
    if (card?.isWinner && state.settings.effects?.confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    onCardRevealed?.(cardId);
  }, [state, onStateChange, onCardRevealed]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (onStateChange) {
      const newState = scratchCardStateHelpers.resetCards(state);
      onStateChange(newState);
    }
    setActiveCardId(null);
    onReset?.();
  }, [state, onStateChange, onReset]);

  // Calculate grid layout
  const { settings, cards } = state;
  const { grid } = settings;
  const cardCount = cards.length;
  
  // Dynamic columns based on card count, with minimum of specified cols
  const cols = Math.max(grid.cols, Math.min(cardCount, 6));
  const rows = Math.ceil(cardCount / cols);
  
  // Calculate card dimensions
  const availableWidth = containerWidth - (grid.gap * (cols - 1)) - 32; // 32px for padding
  const availableHeight = containerHeight - (grid.gap * (rows - 1)) - 32;
  
  const cardWidth = Math.floor(availableWidth / cols);
  const cardHeight = Math.floor(availableHeight / rows);

  return (
    <div 
      ref={containerRef}
      className="sc-canvas"
      style={{
        width: containerWidth,
        height: containerHeight,
        padding: '16px',
        position: 'relative'
      }}
    >
      {/* Reset button for edit mode */}
      {mode === 'edit' && (
        <button 
          onClick={handleReset}
          className="sc-canvas__reset-btn"
        >
          Reset Cards
        </button>
      )}

      {/* Cards grid */}
      <div 
        className="sc-canvas__grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cardWidth}px)`,
          gridTemplateRows: `repeat(${rows}, ${cardHeight}px)`,
          gap: `${grid.gap}px`,
          justifyContent: 'center',
          alignContent: 'center',
          height: '100%'
        }}
      >
        {cards.map((card) => (
          <ScratchCardItem
            key={card.id}
            card={card}
            globalCover={settings.globalCover}
            globalReveal={settings.globalReveal}
            brushRadius={settings.brush.radius}
            threshold={settings.threshold}
            mode={mode}
            onProgress={(progress) => handleCardProgress(card.id, progress)}
            onRevealed={() => handleCardRevealed(card.id)}
            disabled={activeCardId !== null && activeCardId !== card.id && mode === 'preview'}
          />
        ))}
      </div>
    </div>
  );
};