import type { Prize } from '../types/PrizeSystem';

/**
 * Service d'attribution des lots pour la roue de la fortune
 * 
 * Règles de fonctionnement :
 * 1. État par défaut : Toutes les rotations sont perdantes tant qu'aucune condition d'attribution n'est satisfaite
 * 2. Conditions d'attribution d'un lot :
 *    - Le joueur est désigné gagnant par le tirage probabiliste paramétré
 *    - OU le joueur effectue son spin exactement à la date et à l'heure prédéfinies pour l'attribution du lot
 * 3. Conséquences logiques :
 *    - Si aucune des conditions ci-dessus n'est remplie → résultat = perdant, indépendamment du segment touché
 *    - Si au moins une condition est remplie → résultat = gagnant, et le segment gagnant sera forcé
 * 4. Principe clé :
 *    - L'état "gagnant" ou "perdant" est donc dépendant exclusivement des critères d'attribution 
 *      et non du contenu intrinsèque du segment touché
 */

interface AttributionResult {
  isWinner: boolean;
  reason: 'probability' | 'scheduled_time' | 'default_losing';
  prize?: Prize;
  forceWinningSegment?: boolean;
  details?: {
    probabilityCheck?: boolean;
    timeCheck?: boolean;
    currentTime?: Date;
    scheduledTimes?: Date[];
    winProbability?: number;
    randomValue?: number;
  };
}

export class WheelPrizeAttribution {
  /**
   * Détermine si le joueur doit gagner selon les règles d'attribution
   */
  static determineWin(prizes: Prize[] = []): AttributionResult {
    console.group('🎯 WheelPrizeAttribution - Détermination du gain');
    
    const currentTime = new Date();
    const details: AttributionResult['details'] = {
      currentTime,
      scheduledTimes: [],
      probabilityCheck: false,
      timeCheck: false
    };

    // 1. Vérification des horaires prédéfinis
    console.log('📅 Vérification des horaires prédéfinis...');
    
    for (const prize of prizes) {
      if (prize.scheduledDate && prize.scheduledTime) {
        const scheduledDateTime = new Date(`${prize.scheduledDate}T${prize.scheduledTime}`);
        details.scheduledTimes!.push(scheduledDateTime);
        
        // Vérifier si on est exactement à l'heure prévue (avec une marge de ±1 minute)
        const timeDiff = Math.abs(currentTime.getTime() - scheduledDateTime.getTime());
        const isExactTime = timeDiff <= 60000; // 1 minute de marge
        
        console.log(`⏰ Lot "${prize.name}":`, {
          scheduledTime: scheduledDateTime.toISOString(),
          currentTime: currentTime.toISOString(),
          timeDiff: timeDiff,
          isExactTime
        });
        
        if (isExactTime) {
          details.timeCheck = true;
          console.log('✅ Attribution par horaire prédéfini');
          console.groupEnd();
          
          return {
            isWinner: true,
            reason: 'scheduled_time',
            prize,
            forceWinningSegment: true,
            details
          };
        }
      }
    }
    
    details.timeCheck = false;
    console.log('❌ Aucun horaire prédéfini ne correspond');

    // 2. Vérification de la probabilité de gain
    console.log('🎲 Vérification de la probabilité...');
    
    const eligiblePrizes = prizes.filter(p => p.isActive && (p.remainingQuantity || 0) > 0);
    
    if (eligiblePrizes.length === 0) {
      console.log('❌ Aucun lot éligible disponible');
      console.groupEnd();
      
      return {
        isWinner: false,
        reason: 'default_losing',
        forceWinningSegment: false,
        details
      };
    }

    // Calculer la probabilité totale de tous les lots actifs
    const totalProbability = eligiblePrizes.reduce((sum, prize) => {
      const prob = typeof prize.probability === 'number' ? prize.probability : 0;
      return sum + prob;
    }, 0);

    details.winProbability = totalProbability;
    
    if (totalProbability <= 0) {
      console.log('❌ Probabilité totale = 0, aucune chance de gain');
      console.groupEnd();
      
      return {
        isWinner: false,
        reason: 'default_losing',
        forceWinningSegment: false,
        details
      };
    }

    // Générer un nombre aléatoire pour déterminer le gain
    const randomValue = Math.random();
    details.randomValue = randomValue;
    
    console.log(`🎲 Tirage probabiliste:`, {
      randomValue: randomValue.toFixed(4),
      totalProbability: totalProbability.toFixed(4),
      threshold: (totalProbability / 100).toFixed(4)
    });

    // Vérifier si le joueur gagne (probabilité exprimée en pourcentage)
    const isWinner = randomValue < (totalProbability / 100);
    details.probabilityCheck = isWinner;
    
    if (isWinner) {
      // Sélectionner quel lot est gagné selon les probabilités relatives
      let cumulativeProbability = 0;
      let selectedPrize = eligiblePrizes[0]; // Fallback
      
      const normalizedRandom = randomValue * 100; // Ramener à l'échelle 0-100
      
      for (const prize of eligiblePrizes) {
        cumulativeProbability += (prize.probability || 0);
        if (normalizedRandom <= cumulativeProbability) {
          selectedPrize = prize;
          break;
        }
      }
      
      console.log('✅ Attribution par probabilité', {
        selectedPrize: selectedPrize.name,
        prizeProbability: selectedPrize.probability
      });
      console.groupEnd();
      
      return {
        isWinner: true,
        reason: 'probability',
        prize: selectedPrize,
        forceWinningSegment: true,
        details
      };
    }

    console.log('❌ Probabilité non atteinte, résultat perdant');
    console.groupEnd();
    
    // 3. Aucune condition remplie = perdant par défaut
    return {
      isWinner: false,
      reason: 'default_losing',
      forceWinningSegment: false,
      details
    };
  }

  /**
   * Force le résultat de la roue selon l'attribution déterminée
   */
  static forceWheelResult(segments: any[], attributionResult: AttributionResult): any[] {
    if (!attributionResult.forceWinningSegment) {
      // Pas de forcing nécessaire, la roue peut tourner normalement
      return segments;
    }

    console.log('🎯 Forcing du résultat de la roue vers un segment gagnant');
    
    // Trouver les segments gagnants
    const winningSegments = segments.filter(s => s.isWinning);
    
    if (winningSegments.length === 0) {
      console.warn('⚠️ Aucun segment gagnant trouvé, impossible de forcer le résultat');
      return segments;
    }

    // Si un lot spécifique est attribué, essayer de le mapper à un segment
    if (attributionResult.prize) {
      const matchingSegment = segments.find(s => 
        s.prizeId === attributionResult.prize!.id || 
        s.label.toLowerCase().includes(attributionResult.prize!.name.toLowerCase())
      );
      
      if (matchingSegment && matchingSegment.isWinning) {
        console.log('🎯 Segment spécifique trouvé pour le lot:', matchingSegment.label);
        // Augmenter drastiquement la probabilité de ce segment
        return segments.map(s => ({
          ...s,
          probability: s.id === matchingSegment.id ? 0.99 : 0.01 / (segments.length - 1)
        }));
      }
    }

    // Sinon, forcer vers un segment gagnant aléatoire
    const selectedWinningSegment = winningSegments[Math.floor(Math.random() * winningSegments.length)];
    console.log('🎯 Forcing vers le segment gagnant:', selectedWinningSegment.label);
    
    return segments.map(s => ({
      ...s,
      probability: s.id === selectedWinningSegment.id ? 0.99 : 0.01 / (segments.length - 1)
    }));
  }
}