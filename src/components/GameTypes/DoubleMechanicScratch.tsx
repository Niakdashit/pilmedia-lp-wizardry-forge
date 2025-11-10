import React, { useState, useRef, useEffect } from 'react';
import { checkDoubleMechanic, getClaimedPrizes, markPrizeAsClaimed } from '@/services/DoubleMechanicService';

interface DoubleMechanicScratchProps {
  config?: any;
  campaign?: any;
  isPreview?: boolean;
  onFinish?: (result: 'win' | 'lose') => void;
}

/**
 * Composant Carte à Gratter avec système de double mécanique
 * - Mécanique perdante par défaut (100% perdant)
 * - Mécanique gagnante activée uniquement à des dates/heures précises
 */
const DoubleMechanicScratch: React.FC<DoubleMechanicScratchProps> = ({
  config = {},
  campaign,
  isPreview = false,
  onFinish
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [mechanicType, setMechanicType] = useState<'losing' | 'winning'>('losing');
  const [selectedPrize, setSelectedPrize] = useState<any>(null);

  // Récupérer les lots programmés depuis les paramètres de campagne
  const timedPrizes = campaign?.settings?.dotation?.timed_prizes || [];
  const campaignId = campaign?.id || '';

  // Vérifier quelle mécanique utiliser au chargement
  useEffect(() => {
    if (isPreview) {
      // En mode preview, toujours perdant
      setMechanicType('losing');
      console.log('🎮 [DoubleMechanicScratch] Preview mode - using losing mechanic');
      return;
    }

    // Récupérer les lots déjà réclamés
    const claimedPrizeIds = getClaimedPrizes(campaignId);

    // Récupérer la probabilité de base
    const baseProbability = campaign?.settings?.dotation?.base_probability || 10;

    // Vérifier si on doit gagner (soit probabilité de base, soit lot programmé)
    const result = checkDoubleMechanic(timedPrizes, claimedPrizeIds, baseProbability);

    console.log('🎯 [DoubleMechanicScratch] Mechanic check result:', result);

    if (result.shouldWin && result.isTimedPrize && result.prizeId) {
      setMechanicType('winning');
      setSelectedPrize({
        id: result.prizeId,
        name: result.prizeName,
        description: result.prizeDescription
      });
      console.log('🎉 [DoubleMechanicScratch] TIMED PRIZE MECHANIC ACTIVATED!', result);
    } else if (result.shouldWin && !result.isTimedPrize) {
      setMechanicType('winning');
      setSelectedPrize(null);
      console.log('✅ [DoubleMechanicScratch] Base probability WIN!', result);
    } else {
      setMechanicType('losing');
      setSelectedPrize(null);
      console.log('❌ [DoubleMechanicScratch] Using losing mechanic:', result.reason);
    }
  }, [campaignId, timedPrizes, isPreview]);

  // Initialiser le canvas
  useEffect(() => {
    if (canvasRef.current && !isRevealed) {
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

        if (percentage >= (config?.requiredScratchPercent || 70) && !isRevealed) {
          setIsRevealed(true);
          handleReveal();
        }
      };

      const startDrawing = (e: MouseEvent | TouchEvent) => {
        isDrawing = true;
        scratch(e);
      };

      const stopDrawing = () => {
        isDrawing = false;
      };

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
  }, [config, isRevealed]);

  // Gérer la révélation
  const handleReveal = () => {
    console.log('🎲 [DoubleMechanicScratch] Card revealed:', { mechanicType, selectedPrize });

    if (mechanicType === 'winning' && selectedPrize) {
      // Marquer le lot comme réclamé
      markPrizeAsClaimed(campaignId, selectedPrize.id);
      console.log('✅ [DoubleMechanicScratch] Prize claimed:', selectedPrize);

      // Notifier le gain
      if (onFinish) {
        onFinish('win');
      }
    } else {
      // Notifier la perte
      if (onFinish) {
        onFinish('lose');
      }
      console.log('❌ [DoubleMechanicScratch] Player lost');
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Indicateur de debug (seulement en dev) */}
      {process.env.NODE_ENV === 'development' && !isPreview && (
        <div className="absolute top-2 right-2 z-50 bg-black/80 text-white px-3 py-1 rounded-lg text-xs font-mono">
          {mechanicType === 'winning' ? '🎉 GAGNANT' : '❌ PERDANT'}
        </div>
      )}

      <div className="relative bg-white rounded-lg shadow-lg p-6">
        {/* Contenu révélé */}
        <div className="relative w-full h-64 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden">
          {mechanicType === 'winning' && selectedPrize ? (
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">Félicitations !</h2>
              <p className="text-xl font-semibold text-gray-800">{selectedPrize.name}</p>
              {selectedPrize.description && (
                <p className="text-sm text-gray-600 mt-2">{selectedPrize.description}</p>
              )}
            </div>
          ) : (
            <div className="text-center p-6">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-3xl font-bold text-red-600 mb-2">Dommage !</h2>
              <p className="text-lg text-gray-700">Vous n'avez pas gagné cette fois</p>
              <p className="text-sm text-gray-500 mt-2">Retentez votre chance prochainement</p>
            </div>
          )}

          {/* Canvas de grattage */}
          {!isRevealed && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-pointer"
              style={{ touchAction: 'none' }}
            />
          )}
        </div>

        {!isRevealed && (
          <p className="text-center text-sm text-gray-600 mt-4">
            Grattez la zone ci-dessus pour découvrir votre résultat
          </p>
        )}
      </div>
    </div>
  );
};

export default DoubleMechanicScratch;
