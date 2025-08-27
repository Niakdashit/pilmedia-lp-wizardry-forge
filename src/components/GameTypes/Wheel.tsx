
import React, { useEffect } from 'react';
// SmartWheel is used in the JSX
import { SmartWheel } from '../SmartWheel';
import { useGameSize } from '../../hooks/useGameSize';
import { usePrizeLogic } from '../../hooks/usePrizeLogic';
import type { CampaignConfig } from '../../types/PrizeSystem';

interface WheelSegment {
  id: string;
  label: string;
  value: string;
  color: string;
  textColor?: string;
  probability?: number;
  isWinning?: boolean;
  prizeId?: string;
  imageUrl?: string;
  [key: string]: any; // Pour les propriétés dynamiques supplémentaires
}

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
  const defaultSegments: WheelSegment[] = [
    { 
      id: '1', 
      label: 'Prix 1',
      value: 'prix-1',
      color: '#ff6b6b',
      probability: 1, // 100% de probabilité pour les tests
      isWinning: true
    },
    { 
      id: '2', 
      label: 'Prix 2',
      value: 'prix-2',
      color: '#4ecdc4',
      probability: 0,
      isWinning: true
    },
    { 
      id: '3', 
      label: 'Prix 3',
      value: 'prix-3',
      color: '#45b7d1',
      probability: 0,
      isWinning: true
    },
    { 
      id: '4', 
      label: 'Prix 4',
      value: 'prix-4',
      color: '#96ceb4',
      probability: 0,
      isWinning: true
    },
    { 
      id: '5', 
      label: 'Dommage',
      value: 'dommage',
      color: '#feca57',
      probability: 0,
      isWinning: false
    },
    { 
      id: '6', 
      label: 'Rejouer',
      value: 'rejouer',
      color: '#ff9ff3',
      probability: 0,
      isWinning: false
    }
  ];

  // Utiliser le nouveau système centralisé
  const { segments: computedSegments } = usePrizeLogic({
    campaign: campaign as CampaignConfig,
    setCampaign: () => {} // Read-only
  });

  let segments = computedSegments.length > 0 ? [...computedSegments] : [...defaultSegments];
  
  // Test mode: Set first segment to 100% probability and others to 0%
  const TEST_MODE = true; // Set to false to disable test mode
  if (TEST_MODE && segments.length > 0) {
    console.group('🎡 Wheel - TEST MODE ACTIVATED');
    console.log('Setting first segment to 100% probability');
    
    segments = segments.map((segment, index) => ({
      ...segment,
      probability: index === 0 ? 1 : 0,
      isWinning: index === 0
    }));
    
    console.log('Test Segments:', segments.map(s => ({
      label: s.label,
      probability: s.probability,
      isWinning: s.isWinning
    })));
    console.groupEnd();
  }
  
  // Log initial des segments chargés
  useEffect(() => {
    const segmentsWithProbabilities = segments.filter(s => (s?.probability ?? 0) > 0);
    const totalProbability = segments.reduce((sum, s) => sum + (s.probability || 0), 0);
    
    console.group('🎡 Wheel - Configuration initiale');
    console.log('Segments chargés:', segments.length);
    console.log('Segments avec probabilités personnalisées:', segmentsWithProbabilities.length);
    console.log(`Probabilité totale: ${totalProbability.toFixed(2)}%`);
    
    if (segmentsWithProbabilities.length > 0) {
      console.log('Détail des segments avec probabilités:', segmentsWithProbabilities.map(s => ({
        id: s.id,
        label: s.label,
        probability: s.probability,
        isWinning: s.isWinning,
        prizeId: s.prizeId
      })));
    }
    
    console.groupEnd();
  }, [segments]);
  
  // Déterminer le mode de spin effectif
  const hasCustomProbabilities = weightsMeta.nonZero > 0;
  const resolvedSpinMode = config?.spinMode || 'random';
  const effectiveSpinMode = hasCustomProbabilities ? 'probability' : resolvedSpinMode;
  
  console.group('🎡 Wheel - Détermination du mode de spin');
  console.log('Segments avec probabilités > 0:', weightsMeta.nonZero);
  console.log('hasCustomProbabilities:', hasCustomProbabilities);
  console.log('resolvedSpinMode:', resolvedSpinMode);
  console.log('effectiveSpinMode:', effectiveSpinMode);
  console.log('Config spinMode:', config?.spinMode);
  console.groupEnd();

  // Utiliser directement les probabilités pré-calculées par le moteur central (ProbabilityEngine via SegmentManager)
  // Si tous les poids sont nuls (ex: aucune configuration), fallback à des poids égaux gérés côté animation (mode random)
  const segmentsWithWeights = React.useMemo(() => {
    console.group('🎡 Wheel - Préparation des segments avec poids');
    
    // Process segments to ensure they match the WheelSegment type
    const processedSegments = segments.map(segment => {
      const baseSegment = {
        id: segment.id || Math.random().toString(36).substr(2, 9),
        label: segment.label || 'Segment',
        value: segment.value || segment.id || segment.label || 'default-value',
        color: segment.color || '#000000',
        textColor: segment.textColor || '#ffffff',
        probability: segment.probability || 0,
        isWinning: segment.isWinning || false,
        prizeId: segment.prizeId,
        imageUrl: segment.imageUrl
      };
      
      return baseSegment;
    });
    
    // Afficher les segments d'entrée
    console.log('Segments en entrée:', processedSegments.map(s => ({
      id: s.id,
      label: s.label,
      value: s.value,
      probability: s.probability,
      isWinning: s.isWinning
    })));
    
    // Si pas de probabilités personnalisées, retourner les segments avec value
    if (!hasCustomProbabilities) {
      console.log('Aucune probabilité personnalisée détectée, utilisation du mode aléatoire');
      console.groupEnd();
      return processedSegments;
    }
    
    // Vérifier que la somme des probabilités est > 0
    if (weightsMeta.total <= 0) {
      console.warn('La somme des probabilités est <= 0, utilisation du mode aléatoire');
      console.groupEnd();
      return processedSegments;
    }
    
    console.log(`Normalisation des probabilités (total avant normalisation: ${weightsMeta.total})`);
    
    // Normaliser les probabilités pour s'assurer qu'elles somment à 1
    const normalizedSegments = processedSegments.map(s => {
      const normalizedProb = s.probability ? s.probability / weightsMeta.total : 0;
      console.log(`- ${s.id} (${s.label}): ${s.probability} -> ${normalizedProb.toFixed(4)}`);
      return {
        ...s,
        probability: normalizedProb
      };
    });
    
    // Vérifier que la somme des probabilités normalisées est bien 1 (à un epsilon près)
    const checkTotal = normalizedSegments.reduce((sum, s) => sum + (s.probability || 0), 0);
    console.log(`Vérification de la normalisation: somme = ${checkTotal.toFixed(4)}`);
    
    if (Math.abs(checkTotal - 1) > 0.01) {
      console.warn(`La somme des probabilités normalisées (${checkTotal.toFixed(4)}) n'est pas égale à 1`);
    }
    
    console.log('Segments normalisés:', normalizedSegments.map(s => ({
      id: s.id,
      label: s.label,
      probability: s.probability,
      isWinning: s.isWinning
    })));
    
    console.groupEnd();
    return normalizedSegments;
  }, [segments, hasCustomProbabilities, weightsMeta.total]);


  // Configuration de la vitesse de rotation (non utilisée pour l'instant)
  // La vitesse est gérée directement par le composant SmartWheel
  
  // Calculer la probabilité de gain
  const resolvedWinProbability = 
    (typeof campaign?.gameConfig?.wheel?.winProbability === 'number') ? campaign.gameConfig.wheel.winProbability :
    (typeof config?.wheel?.winProbability === 'number') ? config.wheel.winProbability :
    (typeof config?.winProbability === 'number') ? config.winProbability : 0.5;

  // Calculer les métadonnées des poids
  const weightsMeta = React.useMemo(() => {
    console.group('🎡 Wheel - Calcul des métadonnées des poids');
    
    const total = Array.isArray(segments)
      ? segments.reduce((sum: number, s: WheelSegment) => {
          const prob = s?.probability || 0;
          console.log(`Segment ${s.id} (${s.label}): probabilité = ${prob}`);
          return sum + prob;
        }, 0)
      : 0;
    
    const nonZeroSegments = Array.isArray(segments)
      ? segments.filter(s => (s?.probability ?? 0) > 0)
      : [];
    
    console.log(`Total des probabilités: ${total}`);
    console.log(`Segments avec probabilité > 0: ${nonZeroSegments.length}`);
    console.groupEnd();
    
    return { 
      total: parseFloat(total.toFixed(4)),
      nonZero: nonZeroSegments.length,
      segments: nonZeroSegments
    };
  }, [segments]);

  // Log de la configuration finale - Utilisation d'un effet séparé pour les logs
  useEffect(() => {
    // Créer une copie des segments avec probabilités pour éviter les références directes
    const segmentsInfo = weightsMeta.segments.map(s => ({
      label: s.label,
      probability: s.probability,
      percentage: s.probability ? (s.probability * 100).toFixed(2) + '%' : '0%'
    }));

    console.group('🎡 Wheel - Configuration du spin');
    console.log('Mode de spin résolu:', resolvedSpinMode);
    console.log('Mode de spin effectif:', effectiveSpinMode);
    console.log('Probabilités personnalisées activées:', hasCustomProbabilities);
    console.log(`Segments avec probabilités: ${weightsMeta.nonZero} sur ${segments.length}`);
    console.log('Somme des probabilités:', weightsMeta.total);
    
    if (weightsMeta.nonZero > 0) {
      console.group('Détail des probabilités');
      segmentsInfo.forEach(s => {
        console.log(`- ${s.label}: ${s.probability?.toFixed(4)} (${s.percentage})`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }, [
    effectiveSpinMode, 
    hasCustomProbabilities, 
    segments.length, 
    config?.spinMode,
    weightsMeta.nonZero, 
    weightsMeta.total, 
    // Utilisation d'une chaîne JSON comme dépendance pour éviter les rendus inutiles
    JSON.stringify(weightsMeta.segments.map(s => ({
      label: s.label,
      probability: s.probability
    })))
  ]);

  // Remove forced remounts to avoid interrupting ongoing spins.
  // SmartWheel's internal renderer listens to prop changes and will redraw as needed.
  if (!isPreview) {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Configuration de la roue disponible en mode aperçu</p>
      </div>
    );
  }

  // Log avant le rendu de SmartWheel
  if (process.env.NODE_ENV !== 'production') {
    console.group('🎡 Wheel - Rendu de SmartWheel');
    console.log('Mode de spin effectif:', effectiveSpinMode);
    console.log('Segments avec probabilités personnalisées:', hasCustomProbabilities);
    console.log(`Nombre de segments: ${segmentsWithWeights.length}`);
    
    // Log des segments détaillés
    console.group('Détail des segments');
    segmentsWithWeights.forEach((s, i) => {
      console.log(`- Segment ${i} (${s.id}):`, {
        label: s.label,
        probability: s.probability,
        percentage: s.probability ? (s.probability * 100).toFixed(2) + '%' : '0%',
        isWinning: s.isWinning,
        color: s.color
      });
    });
    console.groupEnd();
    
    // Calculer la somme des probabilités pour vérification
    const totalProb = segmentsWithWeights.reduce((sum: number, s) => sum + (s.probability || 0), 0);
    console.log(`Somme des probabilités: ${totalProb.toFixed(4)}`);
    
    // Vérifier la configuration du mode de spin
    console.group('Configuration du spin');
    console.log('Mode de spin:', effectiveSpinMode);
    if (effectiveSpinMode === 'probability') {
      console.log('Mode de probabilité activé');
    } else if (effectiveSpinMode === 'instant_winner') {
      console.log('Mode instant winner avec probabilité:', resolvedWinProbability);
    } else {
      console.log('Mode aléatoire standard');
    }
    console.groupEnd();
    console.groupEnd();
  }
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {segmentsWithWeights.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">Aucun segment configuré</p>
        </div>
      )}
      
      <SmartWheel
        segments={segmentsWithWeights}
        onResult={(segment) => {
          if (onComplete) onComplete(segment.label);
          if (onFinish) onFinish(segment.isWinning ? 'win' : 'lose');
        }}
        onSpin={onStart}
        disabled={disabled}
        spinMode={effectiveSpinMode as 'random' | 'instant_winner' | 'probability'}
        winProbability={resolvedWinProbability}
        size={Math.min(gameDimensions.width, gameDimensions.height)}
        brandColors={{
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4'
        }}
      />
      
      {config?.showDebug && (
        <div className="absolute bottom-4 right-4 p-4 bg-gray-100 rounded-lg text-xs bg-opacity-80">
          <p>Mode: {effectiveSpinMode}</p>
          <p>Probabilité de gain: {resolvedWinProbability * 100}%</p>
          <p>Segments: {segmentsWithWeights.length}</p>
        </div>
      )}
    </div>
  );
};

export default Wheel;
