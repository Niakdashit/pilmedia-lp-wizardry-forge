
import { useState, useRef, useEffect } from 'react';

interface UseScratchCardProps {
  gameStarted: boolean;
  canScratch: boolean;
  onCardFinish: (result: 'win' | 'lose') => void;
  onScratchStart: () => void;
  config: any;
  card: any;
  width: number;
  height: number;
  index: number;
}

export const useScratchCard = ({
  gameStarted,
  canScratch,
  onCardFinish,
  onScratchStart,
  config,
  card,
  width,
  height,
  index
}: UseScratchCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [hasNotifiedResult, setHasNotifiedResult] = useState(false);
  const [hasScratchStarted, setHasScratchStarted] = useState(false);
  const [showRevealContent, setShowRevealContent] = useState(false);

  // Calculate result when game starts
  useEffect(() => {
    if (gameStarted && !result) {
      const gameResult = Math.random() > 0.7 ? 'win' : 'lose';
      setResult(gameResult);
    }
  }, [gameStarted, result]);

  // Setup canvas and scratch functionality
  useEffect(() => {
    if (canvasRef.current && canScratch && !isRevealed && result) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;

      const surface = card.scratchSurface || config?.scratchSurface;
      
      if (surface) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.onerror = () => {
          console.error('Failed to load scratch surface image:', surface);
          drawDefaultSurface(ctx);
        };
        img.src = surface;
      } else {
        drawDefaultSurface(ctx);
      }

      function drawDefaultSurface(ctx: CanvasRenderingContext2D) {
        const scratchColor = card.scratchColor || config?.scratchColor || '#C0C0C0';
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, scratchColor);
        gradient.addColorStop(0.5, scratchColor + 'DD');
        gradient.addColorStop(1, scratchColor + 'BB');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#999';
        ctx.font = `${Math.max(12, width * 0.06)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('Grattez ici', canvas.width / 2, canvas.height / 2 - 5);
        ctx.fillText('pour découvrir', canvas.width / 2, canvas.height / 2 + 10);
      }

      let isDrawing = false;

      const getXY = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
          return {
            x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
            y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height)
          };
        }
        return {
          x: (e.clientX - rect.left) * (canvas.width / rect.width),
          y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
      };

      const scratch = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing) return;
        
        const { x, y } = getXY(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(10, width * 0.08), 0, Math.PI * 2);
        ctx.fill();

        if (!hasScratchStarted) {
          setHasScratchStarted(true);
          setShowRevealContent(true);
          onScratchStart();
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] === 0) transparentPixels++;
        }
        
        const percentage = (transparentPixels / (pixels.length / 4)) * 100;
        setScratchPercentage(Math.round(percentage));

        const requiredPercent = config?.scratchArea || 70;
        if (percentage >= requiredPercent && !isRevealed && !hasNotifiedResult) {
          setIsRevealed(true);
          setHasNotifiedResult(true);
          if (onCardFinish && result) {
            setTimeout(() => onCardFinish(result), 500);
          }
        }
      };

      const startDrawing = (e: Event) => {
        e.preventDefault();
        isDrawing = true;
      };

      const stopDrawing = () => isDrawing = false;

      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', scratch);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing);
      canvas.addEventListener('touchstart', startDrawing);
      canvas.addEventListener('touchmove', scratch);
      canvas.addEventListener('touchend', stopDrawing);

      return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', scratch);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', scratch);
        canvas.removeEventListener('touchend', stopDrawing);
      };
    }
  }, [config, isRevealed, canScratch, result, width, height, onCardFinish, card, hasNotifiedResult, hasScratchStarted, onScratchStart, index]);

  return {
    canvasRef,
    isRevealed,
    scratchPercentage,
    result,
    showRevealContent
  };
};
