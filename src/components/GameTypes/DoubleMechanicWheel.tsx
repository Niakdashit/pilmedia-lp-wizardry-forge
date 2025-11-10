import React, { useEffect, useState } from 'react';
import { SmartWheel } from '../SmartWheel';
import { useGameSize } from '../../hooks/useGameSize';
import { checkDoubleMechanic, getClaimedPrizes, markPrizeAsClaimed } from '@/services/DoubleMechanicService';
import type { WheelSegment } from '../../types/PrizeSystem';

interface DoubleMechanicWheelProps {
  config: any;
  campaign?: any;
  isPreview?: boolean;
  onComplete?: (prize: string) => void;
  onFinish?: (result: 'win' | 'lose') => void;
  onStart?: () => void;
  disabled?: boolean;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
}

/**
 * Composant Roue avec système de double mécanique
 * - Mécanique perdante par défaut (100% perdant)
 * - Mécanique gagnante activée uniquement à des dates/heures précises
 */
const DoubleMechanicWheel: React.FC<DoubleMechanicWheelProps> = ({ 
  config, 
  campaign,
  isPreview = false, 
  onComplete, 
  onFinish,
  onStart,
  disabled = false,
  gameSize = 'small'
}) => {
  const { getGameDimensions } = useGameSize(gameSize);
  const gameDimensions = getGameDimensions();
  const [mechanicType, setMechanicType] = useState<'losing' | 'winning'>('losing');
  const [selectedPrize, setSelectedPrize] = useState<any>(null);

  // Récupérer les lots programmés depuis les paramètres de campagne
  const timedPrizes = campaign?.settings?.dotation?.timed_prizes || [];
  const campaignId = campaign?.id || '';

  // Segments perdants par défaut (100% perdant)
  const losingSegments: WheelSegment[] = [
    { 
      id: 'lose-1', 
      label: 'Perdu',
      value: 'perdu',
      color: '#ff6b6b',
      textColor: '#ffffff',
      probability: 1,
      isWinning: false
    },
    { 
      id: 'lose-2', 
      label: 'Dommage',
      value: 'dommage',
      color: '#feca57',
      textColor: '#000000',
      probability: 0,
      isWinning: false
    },
    { 
      id: 'lose-3', 
      label: 'Raté',
      value: 'rate',
      color: '#a29bfe',
      textColor: '#ffffff',
      probability: 0,
      isWinning: false
    },
    { 
      id: 'lose-4', 
      label: 'Perdu',
      value: 'perdu-2',
      color: '#fd79a8',
      textColor: '#ffffff',
      probability: 0,
      isWinning: false
    },
    { 
      id: 'lose-5', 
      label: 'Dommage',
      value: 'dommage-2',
      color: '#fdcb6e',
      textColor: '#000000',
      probability: 0,
      isWinning: false
    },
    { 
      id: 'lose-6', 
      label: 'Raté',
      value: 'rate-2',
      color: '#6c5ce7',
      textColor: '#ffffff',
      probability: 0,
      isWinning: false
    }
  ];

  // Segments gagnants (configurés dynamiquement selon le lot)
  const createWinningSegments = (prize: any): WheelSegment[] => [
    { 
      id: 'win-1', 
      label: prize.name || 'Gagné !',
      value: 'gagne',
      color: '#00b894',
      textColor: '#ffffff',
      probability: 1, // 100% de gagner
      isWinning: true
    },
    { 
      id: 'win-2', 
      label: prize.name || 'Gagné !',
      value: 'gagne-2',
      color: '#00cec9',
      textColor: '#ffffff',
      probability: 0,
      isWinning: true
    },
    { 
      id: 'win-3', 
      label: prize.name || 'Gagné !',
      value: 'gagne-3',
      color: '#0984e3',
      textColor: '#ffffff',
      probability: 0,
      isWinning: true
    },
    { 
      id: 'win-4', 
      label: prize.name || 'Gagné !',
      value: 'gagne-4',
      color: '#74b9ff',
      textColor: '#000000',
      probability: 0,
      isWinning: true
    },
    { 
      id: 'win-5', 
      label: prize.name || 'Gagné !',
      value: 'gagne-5',
      color: '#55efc4',
      textColor: '#000000',
      probability: 0,
      isWinning: true
    },
    { 
      id: 'win-6', 
      label: prize.name || 'Gagné !',
      value: 'gagne-6',
      color: '#81ecec',
      textColor: '#000000',
      probability: 0,
      isWinning: true
    }
  ];

  // Vérifier quelle mécanique utiliser au chargement
  useEffect(() => {
    if (isPreview) {
      // En mode preview, toujours perdant
      setMechanicType('losing');
      console.log('🎮 [DoubleMechanicWheel] Preview mode - using losing mechanic');
      return;
    }

    // Récupérer les lots déjà réclamés
    const claimedPrizeIds = getClaimedPrizes(campaignId);

    // Récupérer la probabilité de base
    const baseProbability = campaign?.settings?.dotation?.base_probability || 10;

    // Vérifier si on doit gagner (soit probabilité de base, soit lot programmé)
    const result = checkDoubleMechanic(timedPrizes, claimedPrizeIds, baseProbability);

    console.log('🎯 [DoubleMechanicWheel] Mechanic check result:', result);

    if (result.shouldWin && result.isTimedPrize && result.prizeId) {
      setMechanicType('winning');
      setSelectedPrize({
        id: result.prizeId,
        name: result.prizeName,
        description: result.prizeDescription
      });
      console.log('🎉 [DoubleMechanicWheel] TIMED PRIZE MECHANIC ACTIVATED!', result);
    } else if (result.shouldWin && !result.isTimedPrize) {
      setMechanicType('winning');
      setSelectedPrize(null);
      console.log('✅ [DoubleMechanicWheel] Base probability WIN!', result);
    } else {
      setMechanicType('losing');
      setSelectedPrize(null);
      console.log('❌ [DoubleMechanicWheel] Using losing mechanic:', result.reason);
    }
  }, [campaignId, timedPrizes, isPreview]);

  // Déterminer les segments à afficher
  const segments = mechanicType === 'winning' && selectedPrize
    ? createWinningSegments(selectedPrize)
    : losingSegments;

  // Gérer le résultat du spin
  const handleResult = (segment: any) => {
    console.log('🎲 [DoubleMechanicWheel] Spin result:', { segment, mechanicType, selectedPrize });

    if (mechanicType === 'winning' && selectedPrize) {
      // Marquer le lot comme réclamé
      markPrizeAsClaimed(campaignId, selectedPrize.id);
      
      // Notifier le gain
      if (onComplete) {
        onComplete(selectedPrize.name);
      }
      if (onFinish) {
        onFinish('win');
      }

      console.log('✅ [DoubleMechanicWheel] Prize claimed:', selectedPrize);
    } else {
      // Notifier la perte
      if (onComplete) {
        onComplete(segment.label);
      }
      if (onFinish) {
        onFinish('lose');
      }

      console.log('❌ [DoubleMechanicWheel] Player lost');
    }
  };

  return (
    <div className="relative">
      {/* Indicateur de debug (seulement en dev) */}
      {process.env.NODE_ENV === 'development' && !isPreview && (
        <div className="absolute top-2 right-2 z-50 bg-black/80 text-white px-3 py-1 rounded-lg text-xs font-mono">
          {mechanicType === 'winning' ? '🎉 GAGNANT' : '❌ PERDANT'}
        </div>
      )}

      <SmartWheel
        segments={segments}
        size={gameDimensions.width}
        onResult={handleResult}
        disabled={disabled}
        brandColors={{
          primary: campaign?.design?.customColors?.primary || '#44444d',
          secondary: campaign?.design?.customColors?.secondary || '#4ecdc4',
          accent: campaign?.design?.customColors?.accent || '#45b7d1'
        }}
      />
    </div>
  );
};

export default DoubleMechanicWheel;
