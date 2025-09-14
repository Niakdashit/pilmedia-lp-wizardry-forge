
import { useCallback, useRef } from 'react';

interface ScratchCanvasConfig {
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  onProgressChange?: (progress: number) => void;
  scratchRadius?: number;
  scratchColor?: string;
  brushSize?: number;
  threshold?: number;
  onComplete?: (percentage: number) => void;
}

export const useScratchCanvas = ({
  canvasRef,
  onProgressChange,
  scratchRadius = 20,
  scratchColor = '#C0C0C0'
}: ScratchCanvasConfig) => {
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentCanvasRef = canvasRef || internalCanvasRef;
  const isScratching = useRef(false);
  const lastPercentage = useRef(0);
  const isInitialized = useRef(false);

  const adjustColor = (color: string, amount: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const initCanvas = useCallback((canvas: HTMLCanvasElement, config: {
    width: number;
    height: number;
    scratchTexture?: string;
    opacity?: number;
  }) => {
    internalCanvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas
    canvas.width = config.width;
    canvas.height = config.height;

    // Couleur de grattage par défaut
    const scratchColor = config.scratchTexture === 'gold' ? '#FFD700' : 
                        config.scratchTexture === 'bronze' ? '#CD7F32' : '#C0C0C0';

    // Création de la surface à gratter
    const gradient = ctx.createLinearGradient(0, 0, config.width, config.height);
    gradient.addColorStop(0, scratchColor);
    gradient.addColorStop(0.5, adjustColor(scratchColor, -20));
    gradient.addColorStop(1, adjustColor(scratchColor, -40));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.width, config.height);

    // Ajout d'une texture subtile
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
      ctx.fillRect(
        Math.random() * config.width,
        Math.random() * config.height,
        1,
        1
      );
    }

    // Texte d'instruction
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = `${Math.max(12, config.width * 0.04)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Grattez pour découvrir', config.width / 2, config.height / 2 - 5);
    ctx.fillText('votre gain !', config.width / 2, config.height / 2 + 15);

    isInitialized.current = true;
  }, []);

  const scratch = useCallback((x: number, y: number) => {
    const canvas = currentCanvasRef.current;
    if (!canvas || !isInitialized.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, scratchRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Calculer le pourcentage gratté
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const percentage = transparentPixels / (pixels.length / 4);
    onProgressChange?.(percentage);
    lastPercentage.current = percentage;
  }, [scratchRadius, onProgressChange]);

  const startScratching = useCallback((x: number, y: number) => {
    isScratching.current = true;
    scratch(x, y);
  }, [scratch]);

  const stopScratching = useCallback(() => {
    isScratching.current = false;
  }, []);

  const resetScratch = useCallback(() => {
    const canvas = currentCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redessiner la surface de grattage
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    lastPercentage.current = 0;
    onProgressChange?.(0);
    isInitialized.current = false;
  }, [onProgressChange]);

  const getProgress = useCallback(() => {
    return lastPercentage.current;
  }, []);

  return {
    initCanvas,
    startScratching,
    scratch,
    stopScratching,
    resetScratch,
    getProgress,
    handleScratch: scratch,
    getScratchPercentage: getProgress
  };
};
