/**
 * Service d'attribution des lots pour les cartes à gratter
 * Implémente la logique spécifiée : par défaut perdant, gagnant seulement si conditions remplies
 */

import type { Prize } from '../types/PrizeSystem';
import { PrizeValidation } from '../utils/PrizeValidation';

export interface ScratchAttributionResult {
  isWinner: boolean;
  prize?: Prize;
  reason: 'probability' | 'calendar' | 'no_win';
  details?: string;
}

export class ScratchPrizeAttribution {
  
  /**
   * Détermine si le joueur remporte un lot selon les règles strictes :
   * 1. Par défaut, toutes les cartes sont perdantes
   * 2. Gagnant SEULEMENT si :
   *    - La probabilité de gain tombe sur le participant
   *    - OU il joue exactement à la date/heure fixée pour l'attribution du lot
   * 3. Si une condition est remplie, n'importe quelle carte grattée sera gagnante
   */
  static determineWin(prizes: Prize[], currentDate: Date = new Date()): ScratchAttributionResult {
    if (!prizes || prizes.length === 0) {
      return {
        isWinner: false,
        reason: 'no_win',
        details: 'Aucun lot configuré'
      };
    }

    // Filtrer les lots disponibles (non épuisés)
    const availablePrizes = prizes.filter(prize => PrizeValidation.isPrizeAvailable(prize));
    
    if (availablePrizes.length === 0) {
      return {
        isWinner: false,
        reason: 'no_win',
        details: 'Tous les lots sont épuisés'
      };
    }

    console.log('🎯 ScratchPrizeAttribution - Checking win conditions', {
      totalPrizes: prizes.length,
      availablePrizes: availablePrizes.length,
      currentDate: currentDate.toISOString()
    });

    // RÈGLE 1 : Vérifier les lots calendrier actifs (priorité absolue)
    const calendarResult = this.checkCalendarPrizes(availablePrizes, currentDate);
    if (calendarResult.isWinner) {
      console.log('✅ Calendar win detected:', calendarResult);
      return calendarResult;
    }

    // RÈGLE 2 : Vérifier les lots probabilistes
    const probabilityResult = this.checkProbabilityPrizes(availablePrizes);
    if (probabilityResult.isWinner) {
      console.log('✅ Probability win detected:', probabilityResult);
      return probabilityResult;
    }

    // RÈGLE 3 : Par défaut, perdant
    console.log('❌ No winning conditions met - player loses');
    return {
      isWinner: false,
      reason: 'no_win',
      details: 'Aucune condition de gain remplie'
    };
  }

  /**
   * Vérifie les lots calendrier - gagnant si joue exactement au bon moment
   */
  private static checkCalendarPrizes(availablePrizes: Prize[], currentDate: Date): ScratchAttributionResult {
    const calendarPrizes = availablePrizes.filter(prize => 
      (prize.method === 'calendar' || (prize as any).attributionMethod === 'calendar')
    );

    if (calendarPrizes.length === 0) {
      return { isWinner: false, reason: 'no_win' };
    }

    console.log('📅 Checking calendar prizes:', calendarPrizes.map(p => ({
      name: p.name,
      startDate: p.startDate,
      startTime: p.startTime,
      endDate: p.endDate,
      endTime: p.endTime,
      isActive: PrizeValidation.isPrizeActive(p, currentDate)
    })));

    // Trouver le premier lot calendrier actif
    for (const prize of calendarPrizes) {
      if (PrizeValidation.isPrizeActive(prize, currentDate)) {
        return {
          isWinner: true,
          prize,
          reason: 'calendar',
          details: `Lot calendrier "${prize.name}" actif maintenant`
        };
      }
    }

    return { isWinner: false, reason: 'no_win' };
  }

  /**
   * Vérifie les lots probabilistes - application de la probabilité configurée
   */
  private static checkProbabilityPrizes(availablePrizes: Prize[]): ScratchAttributionResult {
    const probabilityPrizes = availablePrizes.filter(prize => {
      const method = prize.method || (prize as any).attributionMethod;
      return method === 'probability' || method === 'immediate';
    });

    if (probabilityPrizes.length === 0) {
      return { isWinner: false, reason: 'no_win' };
    }

    console.log('🎲 Checking probability prizes:', probabilityPrizes.map(p => ({
      name: p.name,
      method: p.method || (p as any).attributionMethod,
      probability: p.probabilityPercent || (p as any).probability,
      totalUnits: p.totalUnits,
      awardedUnits: p.awardedUnits
    })));

    // Calculer la probabilité totale
    let totalProbability = 0;
    const eligiblePrizes: { prize: Prize; probability: number }[] = [];

    for (const prize of probabilityPrizes) {
      const probability = this.getPrizeProbability(prize);
      if (probability > 0) {
        totalProbability += probability;
        eligiblePrizes.push({ prize, probability });
      }
    }

    if (totalProbability === 0 || eligiblePrizes.length === 0) {
      return { isWinner: false, reason: 'no_win' };
    }

    // Générer un nombre aléatoire et vérifier si le joueur gagne
    const randomValue = Math.random() * 100; // 0 à 100
    console.log(`🎲 Probability check: ${randomValue.toFixed(2)}% vs ${totalProbability.toFixed(2)}% total`);

    if (randomValue <= totalProbability) {
      // Déterminer quel lot est gagné (distribution proportionnelle)
      let currentThreshold = 0;
      for (const { prize, probability } of eligiblePrizes) {
        currentThreshold += probability;
        if (randomValue <= currentThreshold) {
          return {
            isWinner: true,
            prize,
            reason: 'probability',
            details: `Tirage probabiliste réussi (${randomValue.toFixed(2)}% ≤ ${currentThreshold.toFixed(2)}%)`
          };
        }
      }
    }

    return { isWinner: false, reason: 'no_win' };
  }

  /**
   * Extrait la probabilité d'un lot (support des différents formats)
   */
  private static getPrizeProbability(prize: Prize): number {
    const candidates = [
      prize.probabilityPercent,
      (prize as any).probability
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return Math.max(0, Math.min(100, candidate));
      }
    }

    return 0;
  }

  /**
   * Utilitaire pour les tests - permet de simuler une date spécifique
   */
  static testWinConditions(prizes: Prize[], testDate?: Date): ScratchAttributionResult {
    return this.determineWin(prizes, testDate || new Date());
  }
}