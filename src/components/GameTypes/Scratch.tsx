import React, { useState, useRef, useEffect } from 'react';
import { Type } from 'lucide-react';
import ImageUpload from '../common/ImageUpload';

interface ScratchCardInstantWinConfig {
  mode: "instant_winner";
  winProbability: number; // entre 0 et 1
  maxWinners?: number;
  winnersCount?: number;
}

interface ScratchProps {
  config?: any;
  onConfigChange: (config: any) => void;
  isPreview?: boolean;
  instantWinConfig?: ScratchCardInstantWinConfig;
  onFinish?: (result: 'win' | 'lose') => void;
}

const Scratch: React.FC<ScratchProps> = ({
  config = {},
  onConfigChange,
  isPreview,
  instantWinConfig,
  onFinish
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchResult, setScratchResult] = useState<'win' | 'lose' | null>(null);

  // ----------- SCRATCH CANVAS INTERACTIF -----------
  useEffect(() => {
    if (isPreview && canvasRef.current && !isRevealed) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set up canvas
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Draw scratch layer
      ctx.fillStyle = config?.scratchColor || '#CCCCCC';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add pattern or texture
      if (config?.scratchPattern) {
        const pattern = new Image();
        pattern.onload = () => {
          const patternObj = ctx.createPattern(pattern, 'repeat');
          if (patternObj) {
            ctx.fillStyle = patternObj;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        };
        pattern.src = config.scratchPattern;
      }

      // Handle scratching
      let isDrawing = false;
      const scratchRadius = 20;

      const getXY = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
          return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top,
          };
        }
        return {
          x: (e as MouseEvent).clientX - rect.left,
          y: (e as MouseEvent).clientY - rect.top,
        };
      };

      const scratch = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing) return;
        const { x, y } = getXY(e);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, scratchRadius, 0, Math.PI * 2);
        ctx.fill();

        // Calculate scratch percentage
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] === 0) transparentPixels++;
        }

        const percentage = (transparentPixels / (pixels.length / 4)) * 100;

        if (
          percentage >= (config?.requiredScratchPercent || 70) &&
          !isRevealed
        ) {
          setIsRevealed(true);

          // ----------- INSTANT WIN LOGIC -----------
          let result: 'win' | 'lose' = 'lose';
          if (
            instantWinConfig &&
            instantWinConfig.mode === 'instant_winner' &&
            (!instantWinConfig.maxWinners || (instantWinConfig.winnersCount ?? 0) < instantWinConfig.maxWinners)
          ) {
            result =
              Math.random() < (instantWinConfig.winProbability ?? 0)
                ? 'win'
                : 'lose';
          }
          setScratchResult(result);
          if (typeof onFinish === 'function') onFinish(result);
        }
      };

      const startDrawing = () => (isDrawing = true);
      const stopDrawing = () => (isDrawing = false);

      // Mouse events
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', scratch);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing);

      // Touch events
      canvas.addEventListener('touchstart', startDrawing);
      canvas.addEventListener('touchmove', scratch);
      canvas.addEventListener('touchend', stopDrawing);

      // Cleanup
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
  }, [config, isPreview, isRevealed, instantWinConfig, onFinish]);

  // ----------- PREVIEW JSX -----------
  if (isPreview) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-video">
        <div className="absolute inset-0">
          <img
            src={config?.revealImage || ''}
            alt="Hidden content"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {!isRevealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full rounded-lg cursor-pointer"
          />
        )}

        {isRevealed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <p className="text-xl font-bold text-[#44444d]">
                {scratchResult === 'win'
                  ? config?.winMessage || 'Félicitations !'
                  : config?.loseMessage || 'Pas de chance ! Réessayez !'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------- ÉDITEUR JSX -----------
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image à révéler
        </label>
        <ImageUpload
          value={config?.revealImage}
          onChange={(value) => onConfigChange({ ...config, revealImage: value })}
          label="Sélectionnez l'image à révéler"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Couleur de la couche à gratter
          </label>
          <input
            type="color"
            value={config?.scratchColor || '#CCCCCC'}
            onChange={(e) =>
              onConfigChange({ ...config, scratchColor: e.target.value })
            }
            className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image de la couche à gratter
          </label>
          <ImageUpload
            value={config?.scratchImage}
            onChange={(value) => onConfigChange({ ...config, scratchImage: value })}
            label="Image de la couche à gratter"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Forme du masque
        </label>
        <select
          value={config?.maskShape || 'rectangle'}
          onChange={(e) =>
            onConfigChange({ ...config, maskShape: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Cercle</option>
          <option value="star">Étoile</option>
          <option value="heart">Cœur</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Curseur personnalisé
        </label>
        <ImageUpload
          value={config?.cursorImage}
          onChange={(value) => onConfigChange({ ...config, cursorImage: value })}
          label="Image du curseur"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pourcentage de grattage nécessaire
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="range"
              min="1"
              max="100"
              value={config?.requiredScratchPercent || 70}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  requiredScratchPercent: parseInt(e.target.value),
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#44444d]"
            />
          </div>
          <div className="w-16 relative">
            <input
              type="number"
              min="1"
              max="100"
              value={config?.requiredScratchPercent || 70}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  requiredScratchPercent: parseInt(e.target.value),
                })
              }
              className="w-full pl-2 pr-8 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              %
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message de victoire
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Type className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={config?.winMessage || 'Félicitations !'}
              onChange={(e) =>
                onConfigChange({ ...config, winMessage: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
              placeholder="Message de victoire"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message de défaite
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Type className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={config?.loseMessage || 'Pas de chance ! Réessayez !'}
              onChange={(e) =>
                onConfigChange({ ...config, loseMessage: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
              placeholder="Message de défaite"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scratch;
