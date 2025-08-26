
import React from 'react';
import { SmartWheel } from '../SmartWheel';
import { useGameSize } from '../../hooks/useGameSize';
import { usePrizeLogic } from '../../hooks/usePrizeLogic';
import type { CampaignConfig } from '../../types/PrizeSystem';

interface WheelProps {
  config: any;
  isPreview?: boolean;
  onComplete?: (prize: string) => void;
  onFinish?: (result: 'win' | 'lose') => void;
  onStart?: () => void;
  currentWinners?: number;
  maxWinners?: number;
  winRate?: number;
  disabled?: boolean;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  campaign?: any; // Ajouter le campaign pour récupérer le style de bordure
}

const Wheel: React.FC<WheelProps> = ({ 
  config, 
  isPreview = false, 
  onComplete, 
  onFinish,
  onStart,
  disabled = false,
  gameSize = 'small',
  campaign
}) => {
  const { getGameDimensions } = useGameSize(gameSize);
  const gameDimensions = getGameDimensions();
  
  // Configuration par défaut si aucune config fournie
  const defaultSegments = [
    { id: '1', label: 'Prix 1', color: '#ff6b6b' },
    { id: '2', label: 'Prix 2', color: '#4ecdc4' },
    { id: '3', label: 'Prix 3', color: '#45b7d1' },
    { id: '4', label: 'Prix 4', color: '#96ceb4' },
    { id: '5', label: 'Dommage', color: '#feca57' },
    { id: '6', label: 'Rejouer', color: '#ff9ff3' }
  ];

  // Utiliser le nouveau système centralisé
  const { segments: computedSegments } = usePrizeLogic({
    campaign: campaign as CampaignConfig,
    setCampaign: () => {} // Read-only
  });

  const segments = computedSegments.length > 0 ? computedSegments : defaultSegments;
  
  // Calculer la taille de la roue en fonction des dimensions du jeu
  const wheelSize = Math.min(gameDimensions.width, gameDimensions.height) - 40;

  // Utiliser directement les probabilités pré-calculées par le moteur central (ProbabilityEngine via SegmentManager)
  // Si tous les poids sont nuls (ex: aucune configuration), fallback à des poids égaux gérés côté animation (mode random)
  const segmentsWithWeights = React.useMemo(() => segments, [segments]);

  const handleResult = (segment: any) => {
    // Appeler onComplete si fourni (pour la compatibilité)
    if (onComplete) {
      onComplete(segment.label);
    }
    
    // Appeler onFinish si fourni (pour la cohérence avec les autres jeux)
    if (onFinish) {
      // Simuler un résultat win/lose - si c'est "Dommage" ou "Rejouer" = lose, sinon win
      const result = segment.label.toLowerCase().includes('dommage') || 
                    segment.label.toLowerCase().includes('rejouer') ? 'lose' : 'win';
      onFinish(result);
    }
  };

  const handleSpin = () => {
    if (onStart) {
      onStart();
    }
  };

  // Couleurs de marque par défaut
  const brandColors = {
    primary: '#841b60',
    secondary: '#4ecdc4',
    accent: '#45b7d1'
  };

  // Récupérer le style de bordure depuis la campaign ou utiliser le style par défaut
  const borderStyle = campaign?.design?.wheelBorderStyle || 
                      config?.wheel?.borderStyle || 
                      'classic';

  // Propagation de l'option d'ampoules depuis la campagne ou la config
  const showBulbs = (campaign?.design?.wheelConfig?.showBulbs ?? config?.wheel?.showBulbs) ?? false;

  // Résoudre les paramètres de spin (mode, vitesse, probabilité de gain)
  const resolvedSpinMode = 
    campaign?.gameConfig?.wheel?.mode ??
    config?.wheel?.mode ??
    config?.mode ??
    'random';

  const resolvedSpeed: 'slow' | 'medium' | 'fast' = 
    (campaign?.gameConfig?.wheel?.speed ??
    config?.wheel?.speed ??
    config?.speed ??
    'medium');

  const resolvedWinProbability = 
    (typeof campaign?.gameConfig?.wheel?.winProbability === 'number') ? campaign?.gameConfig?.wheel?.winProbability :
    (typeof config?.wheel?.winProbability === 'number') ? config?.wheel?.winProbability :
    (typeof config?.winProbability === 'number') ? config?.winProbability : undefined;

  // Si des poids non nuls sont présents, on bascule automatiquement en mode 'probability'
  const weightsMeta = React.useMemo(() => {
    const total = Array.isArray(segments)
      ? segments.reduce((sum: number, s: any) => sum + (typeof s?.probability === 'number' ? s.probability : 0), 0)
      : 0;
    const nonZero = Array.isArray(segments)
      ? segments.filter((s: any) => (s?.probability ?? 0) > 0).length
      : 0;
    return { total, nonZero };
  }, [segments]);

  const effectiveSpinMode = (resolvedSpinMode !== 'probability' && weightsMeta.total > 0 && weightsMeta.nonZero > 0)
    ? 'probability'
    : resolvedSpinMode;

  try {
    console.log('[Wheel] spin mode', { resolvedSpinMode, effectiveSpinMode, weightsMeta });
  } catch {}

  // Remove forced remounts to avoid interrupting ongoing spins.
  // SmartWheel's internal renderer listens to prop changes and will redraw as needed.

  if (!isPreview) {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Configuration de la roue disponible en mode aperçu</p>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center space-y-6"
      style={{
        width: `${gameDimensions.width}px`,
        height: `${gameDimensions.height}px`,
        maxWidth: `${gameDimensions.width}px`,
        maxHeight: `${gameDimensions.height}px`
      }}
    >
      <SmartWheel
        segments={segmentsWithWeights}
        theme="modern"
        size={wheelSize}
        brandColors={brandColors}
        onResult={handleResult}
        onSpin={handleSpin}
        disabled={disabled}
        disablePointerAnimation={true}
        borderStyle={borderStyle}
        showBulbs={showBulbs}
        spinMode={effectiveSpinMode}
        speed={resolvedSpeed}
        winProbability={resolvedWinProbability}
        customButton={{
          text: config?.buttonLabel || 'Faire tourner',
          color: brandColors.primary,
          textColor: '#ffffff'
        }}
      />
    </div>
  );
};

export default Wheel;
