
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
    handleScratch,
    getScratchPercentage,
    clearCanvas
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
      initCanvas(width, height);
    }
  }, [width, height, initCanvas]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    setState(prev => ({ ...prev, isScratching: true, hasStarted: true }));
    handleScratch(e.nativeEvent);
  }, [disabled, handleScratch]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!state.isScratching || disabled) return;
    handleScratch(e.nativeEvent);
    const percentage = getScratchPercentage();
    setState(prev => ({ ...prev, scratchPercentage: percentage }));
  }, [state.isScratching, disabled, handleScratch, getScratchPercentage]);

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
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      handleScratch(mouseEvent);
    }
  }, [disabled, handleScratch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!state.isScratching || disabled) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      handleScratch(mouseEvent);
      const percentage = getScratchPercentage();
      setState(prev => ({ ...prev, scratchPercentage: percentage }));
    }
  }, [state.isScratching, disabled, handleScratch, getScratchPercentage]);

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
