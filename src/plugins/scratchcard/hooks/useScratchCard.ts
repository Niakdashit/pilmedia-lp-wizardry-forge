import { useCallback, useRef, useState } from 'react';
import { ScratchCard } from '../types';

interface UseScratchCardProps {
  card: ScratchCard;
  brushRadius: number;
  threshold: number;
  onProgress?: (progress: number) => void;
  onRevealed?: () => void;
  disabled?: boolean;
}

export const useScratchCard = ({
  card,
  brushRadius,
  threshold,
  onProgress,
  onRevealed,
  disabled = false
}: UseScratchCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [progress, setProgress] = useState(card.progress || 0);
  const [isRevealed, setIsRevealed] = useState(card.revealed || false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Initialize canvas overlay
  const initializeCanvas = useCallback((canvas: HTMLCanvasElement, coverElement: HTMLElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Scale context for HiDPI
    ctx.scale(dpr, dpr);
    
    // Create scratch overlay matching the cover
    ctx.fillStyle = '#C0C0C0'; // Default scratch color
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Add texture effect
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
      ctx.fillRect(
        Math.random() * rect.width,
        Math.random() * rect.height,
        1,
        1
      );
    }
    
    // Add instructions
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = `${Math.max(12, rect.width * 0.04)}px Arial`;
    ctx.textAlign = 'center';
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    ctx.fillText('Grattez pour', centerX, centerY - 8);
    ctx.fillText('découvrir !', centerX, centerY + 8);
    
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  // Scratch at specific coordinates
  const scratchAt = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || disabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Scale coordinates for HiDPI
    const scaledX = x * scaleX / window.devicePixelRatio;
    const scaledY = y * scaleY / window.devicePixelRatio;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushRadius * 2;

    // Draw line from last point if exists
    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(scaledX, scaledY);
      ctx.stroke();
    }

    // Draw circle at current point
    ctx.beginPath();
    ctx.arc(scaledX, scaledY, brushRadius, 0, Math.PI * 2);
    ctx.fill();

    lastPointRef.current = { x: scaledX, y: scaledY };

    // Calculate progress
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    let totalPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      totalPixels++;
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const newProgress = totalPixels > 0 ? transparentPixels / totalPixels : 0;
    setProgress(newProgress);
    onProgress?.(newProgress);

    // Check if threshold reached
    if (!isRevealed && newProgress >= threshold) {
      setIsRevealed(true);
      onRevealed?.();
      
      // Animate complete reveal
      animateCompleteReveal();
    }
  }, [brushRadius, threshold, disabled, isRevealed, onProgress, onRevealed]);

  // Animate complete reveal when threshold is reached
  const animateCompleteReveal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let alpha = 1;
    const animate = () => {
      alpha -= 0.1;
      
      if (alpha <= 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.pointerEvents = 'none';
        return;
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(192, 192, 192, ${alpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  // Get pointer coordinates relative to canvas
  const getPointerCoordinates = useCallback((e: PointerEvent | TouchEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

    if (clientX === undefined || clientY === undefined) return null;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  // Start scratching
  const startScratching = useCallback((e: PointerEvent | TouchEvent | MouseEvent) => {
    if (disabled || isRevealed) return;
    
    setIsScratching(true);
    setHasStarted(true);
    lastPointRef.current = null;
    
    const coords = getPointerCoordinates(e);
    if (coords) {
      scratchAt(coords.x, coords.y);
    }
    
    e.preventDefault();
  }, [disabled, isRevealed, getPointerCoordinates, scratchAt]);

  // Continue scratching
  const continueScratching = useCallback((e: PointerEvent | TouchEvent | MouseEvent) => {
    if (!isScratching || disabled || isRevealed) return;
    
    const coords = getPointerCoordinates(e);
    if (coords) {
      scratchAt(coords.x, coords.y);
    }
    
    e.preventDefault();
  }, [isScratching, disabled, isRevealed, getPointerCoordinates, scratchAt]);

  // Stop scratching
  const stopScratching = useCallback(() => {
    setIsScratching(false);
    lastPointRef.current = null;
  }, []);

  // Reset card
  const resetCard = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    
    setIsScratching(false);
    setProgress(0);
    setIsRevealed(false);
    setHasStarted(false);
    lastPointRef.current = null;
    
    // Redraw canvas overlay
    const canvas = canvasRef.current;
    if (canvas) {
      const coverElement = canvas.parentElement;
      if (coverElement) {
        initializeCanvas(canvas, coverElement as HTMLElement);
      }
    }
  }, [initializeCanvas]);

  return {
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
  };
};