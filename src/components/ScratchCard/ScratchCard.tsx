import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScratchCardProps, ScratchCardState } from './types';
import { useScratchCanvas } from './hooks/useScratchCanvas';
import { ScratchCardOverlay } from './components/ScratchCardOverlay';
import { ScratchCardContent } from './components/ScratchCardContent';
import { ScratchCardProgress } from './components/ScratchCardProgress';
import './ScratchCard.css';

export const ScratchCard: React.FC<ScratchCardProps> = ({
  width = 300,
  height = 200,
  scratchColor = '#C0C0C0',
  revealContent,
  onComplete,
  threshold = 70,
  brushSize = 20,
  disabled = false,
  showProgress = true,
  animationDuration = 300,
  brandConfig,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<ScratchCardState>({
    isScratching: false,
    scratchPercentage: 0,
    isCompleted: false,
    hasStarted: false
  });

  const {
    initCanvas,
    startScratching,
    scratch,
    getProgress
  } = useScratchCanvas({
    canvasRef,
    scratchColor,
    brushSize,
    threshold,
    onComplete: useCallback((percentage: number) => {
      setState(prev => ({ ...prev, isCompleted: true, scratchPercentage: percentage }));
      onComplete?.(percentage);
    }, [onComplete])
  });

  useEffect(() => {
    if (canvasRef.current) {
      initCanvas(canvasRef.current, {
        width,
        height,
        scratchTexture: scratchColor,
        opacity: 1
      });
    }
  }, [width, height, initCanvas, scratchColor]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    setState(prev => ({ ...prev, isScratching: true, hasStarted: true }));
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      startScratching(x, y);
    }
  }, [disabled, startScratching]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!state.isScratching || disabled) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      scratch(x, y);
      const percentage = getProgress();
      setState(prev => ({ ...prev, scratchPercentage: percentage }));
    }
  }, [state.isScratching, disabled, scratch, getProgress]);

  const handleMouseUp = useCallback(() => {
    setState(prev => ({ ...prev, isScratching: false }));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    setState(prev => ({ ...prev, isScratching: true, hasStarted: true }));
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      startScratching(x, y);
    }
  }, [disabled, startScratching]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!state.isScratching || disabled) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      scratch(x, y);
      const percentage = getProgress();
      setState(prev => ({ ...prev, scratchPercentage: percentage }));
    }
  }, [state.isScratching, disabled, scratch, getProgress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isScratching: false }));
  }, []);

  return (
    <div 
      className={`scratch-card ${className}`}
      style={{ 
        width, 
        height,
        position: 'relative',
        borderRadius: brandConfig?.borderRadius || '12px',
        overflow: 'hidden',
        boxShadow: brandConfig?.shadow || '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Contenu révélé en arrière-plan */}
      <ScratchCardContent 
        content={revealContent}
        brandConfig={brandConfig}
        isCompleted={state.isCompleted}
      />

      {/* Canvas de grattage par-dessus */}
      <canvas
        ref={canvasRef}
        className="scratch-canvas"
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: disabled ? 'not-allowed' : (state.isScratching ? 'grabbing' : 'grab'),
          touchAction: 'none'
        }}
      />

      {/* Overlay pour les états et animations */}
      <ScratchCardOverlay
        state={state}
        disabled={disabled}
        brandConfig={brandConfig}
        animationDuration={animationDuration}
      />

      {/* Barre de progression */}
      {showProgress && state.hasStarted && !state.isCompleted && (
        <ScratchCardProgress
          percentage={state.scratchPercentage}
          brandConfig={brandConfig}
        />
      )}
    </div>
  );
};
