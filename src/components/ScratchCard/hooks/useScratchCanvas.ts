
import { useCallback, useRef } from 'react';
import { ScratchCanvasHookProps } from '../types';

export const useScratchCanvas = ({
  canvasRef,
  scratchColor,
  brushSize,
  threshold,
  onComplete
}: ScratchCanvasHookProps) => {
  const isInitialized = useRef(false);
  const lastPercentage = useRef(0);

  const initCanvas = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas
    canvas.width = width;
    canvas.height = height;

    // Création de la surface à gratter
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, scratchColor);
    gradient.addColorStop(0.5, adjustColor(scratchColor, -20));
    gradient.addColorStop(1, adjustColor(scratchColor, -40));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Ajout d'une texture subtile
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        1,
        1
      );
    }

    // Texte d'instruction
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = `${Math.max(12, width * 0.04)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Grattez pour découvrir', width / 2, height / 2 - 5);
    ctx.fillText('votre gain !', width / 2, height / 2 + 15);

    isInitialized.current = true;
  }, [scratchColor]);

  const handleScratch = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !isInitialized.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    // Configuration du pinceau
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    // Ajout d'un effet de dégradé au grattage
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushSize);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  }, [brushSize]);

  const getScratchPercentage = useCallback((): number => {
    const canvas = canvasRef.current;
    if (!canvas || !isInitialized.current) return 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) { // Alpha < 50%
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / (pixels.length / 4)) * 100;
    
    // Déclencher onComplete seulement une fois
    if (percentage >= threshold && lastPercentage.current < threshold) {
      setTimeout(() => onComplete(percentage), 100);
    }
    
    lastPercentage.current = percentage;
    return Math.round(percentage);
  }, [threshold, onComplete]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isInitialized.current = false;
    lastPercentage.current = 0;
  }, []);

  return {
    initCanvas,
    handleScratch,
    getScratchPercentage,
    clearCanvas
  };
};

// Fonction utilitaire pour ajuster la couleur
function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}
