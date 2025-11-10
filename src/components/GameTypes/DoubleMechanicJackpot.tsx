import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import SlotMachine from '../SlotJackpot/SlotMachine';
import { checkDoubleMechanic, getClaimedPrizes, markPrizeAsClaimed } from '@/services/DoubleMechanicService';

interface DoubleMechanicJackpotProps {
  campaign?: any;
  isPreview?: boolean;
  onFinish?: (result: 'win' | 'lose') => void;
  disabled?: boolean;
}

/**
 * Composant Jackpot avec système de double mécanique
 * - Mécanique perdante par défaut (100% perdant)
 * - Mécanique gagnante activée uniquement à des dates/heures précises
 * 
 * Note: Le SlotMachine détermine lui-même le résultat aléatoirement.
 * On intercepte les callbacks pour forcer le résultat selon la mécanique active.
 */
const DoubleMechanicJackpot: React.FC<DoubleMechanicJackpotProps> = ({
  campaign,
  isPreview = false,
  onFinish,
  disabled = false
}) => {
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
      console.log('🎮 [DoubleMechanicJackpot] Preview mode - using losing mechanic');
      return;
    }

    // Récupérer les lots déjà réclamés
    const claimedPrizeIds = getClaimedPrizes(campaignId);

    // Récupérer la probabilité de base
    const baseProbability = campaign?.settings?.dotation?.base_probability || 10;

    // Vérifier si on doit gagner (soit probabilité de base, soit lot programmé)
    const result = checkDoubleMechanic(timedPrizes, claimedPrizeIds, baseProbability);

    console.log('🎯 [DoubleMechanicJackpot] Mechanic check result:', result);

    if (result.shouldWin && result.isTimedPrize && result.prizeId) {
      setMechanicType('winning');
      setSelectedPrize({
        id: result.prizeId,
        name: result.prizeName,
        description: result.prizeDescription
      });
      console.log('🎉 [DoubleMechanicJackpot] TIMED PRIZE MECHANIC ACTIVATED!', result);
    } else if (result.shouldWin && !result.isTimedPrize) {
      setMechanicType('winning');
      setSelectedPrize(null);
      console.log('✅ [DoubleMechanicJackpot] Base probability WIN!', result);
    } else {
      setMechanicType('losing');
      setSelectedPrize(null);
      console.log('❌ [DoubleMechanicJackpot] Using losing mechanic:', result.reason);
    }
  }, [campaignId, timedPrizes, isPreview]);

  // Gérer le gain
  const handleWin = (results: string[]) => {
    console.log('🎆 [DoubleMechanicJackpot] Win triggered:', { mechanicType, selectedPrize, results });

    if (mechanicType === 'winning' && selectedPrize) {
      // Marquer le lot comme réclamé
      markPrizeAsClaimed(campaignId, selectedPrize.id);
      console.log('✅ [DoubleMechanicJackpot] Prize claimed:', selectedPrize);

      // Confetti
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.7 }
      });

      // Notifier le gain
      if (onFinish) {
        onFinish('win');
      }
    } else {
      // Ne devrait jamais arriver si la mécanique est perdante
      console.warn('⚠️ [DoubleMechanicJackpot] Win triggered but mechanic is losing!');
      if (onFinish) {
        onFinish('lose');
      }
    }
  };

  // Gérer la perte
  const handleLose = () => {
    console.log('❌ [DoubleMechanicJackpot] Lose triggered:', { mechanicType });

    if (onFinish) {
      onFinish('lose');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Indicateur de debug (seulement en dev) */}
      {process.env.NODE_ENV === 'development' && !isPreview && (
        <div className="absolute top-2 right-2 z-50 bg-black/80 text-white px-3 py-1 rounded-lg text-xs font-mono">
          {mechanicType === 'winning' ? '🎉 GAGNANT' : '❌ PERDANT'}
        </div>
      )}

      <SlotMachine
        disabled={disabled}
        onWin={handleWin}
        onLose={handleLose}
        symbols={campaign?.gameConfig?.jackpot?.symbols || campaign?.jackpotConfig?.symbols}
        templateOverride={campaign?.gameConfig?.jackpot?.template || campaign?.jackpotConfig?.template}
      />
    </div>
  );
};

export default DoubleMechanicJackpot;
