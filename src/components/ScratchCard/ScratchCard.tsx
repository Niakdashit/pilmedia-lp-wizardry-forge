import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScratchCardProps, ScratchCardState } from './types';
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

  // Simplified scratch functionality
  const handleScratch = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!canvasRef.current || disabled) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : (e as any).nativeEvent.clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : (e as any).nativeEvent.clientY) - rect.top;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [disabled, brushSize]);

  const getScratchPercentage = useCallback(() => {
    if (!canvasRef.current) return 0;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return 0;
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }
    
    return (transparentPixels / (pixels.length / 4)) * 100;
  }, [width, height]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = scratchColor;
        ctx.fillRect(0, 0, width, height);
      }
    }
  }, [scratchColor, width, height]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    setState(prev => ({ ...prev, isScratching: true, hasStarted: true }));
    handleScratch(e);
  }, [disabled, handleScratch]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!state.isScratching || disabled) return;
    handleScratch(e);
    const percentage = getScratchPercentage();
    setState(prev => ({ ...prev, scratchPercentage: percentage }));
  }, [state.isScratching, disabled, handleScratch, getScratchPercentage]);

  const handleMouseUp = useCallback(() => {
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