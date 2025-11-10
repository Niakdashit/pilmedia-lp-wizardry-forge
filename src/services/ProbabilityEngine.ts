/**
 * Moteur de calcul de probabilité centralisé
 * Responsable de tous les calculs de probabilité avec une logique claire et testable
 * 
 * AMÉLIORATIONS v2.0:
 * - Intégration de la distribution temporelle intelligente
 * - Support du lissage temporel des probabilités
 * - Ajustement dynamique selon les quotas journaliers
 */

import type { Prize, WheelSegment, CampaignSegment, ProbabilityCalculationResult, SegmentPrizeMapping } from '../types/PrizeSystem';
import { PrizeValidation } from '../utils/PrizeValidation';
import { TemporalDistribution, TemporalConfig } from './TemporalDistribution';

export class ProbabilityEngine {
  
  /**
   * Calcule les probabilités pour tous les segments
   * LOGIQUE PRINCIPALE : 
   * 1. Calendrier actif -> 100% aux segments calendrier (si lots disponibles)
   * 2. Sinon, si lot à 100% -> 100% à ce segment (si lots disponibles)
   * 3. Sinon, distribuer selon les % des lots + résiduel aux segments perdants
   * 4. CRITIQUE: Lots épuisés (totalUnits - awardedUnits = 0) -> probabilité = 0%
   */
  static calculateSegmentProbabilities(
    segments: CampaignSegment[],
    prizes: Prize[]
  ): ProbabilityCalculationResult {
    if (!segments || segments.length === 0) {
      return {
        segments: [],
        totalProbability: 0,
        hasGuaranteedWin: false,
        residualProbability: 0,
        errors: ['Aucun segment fourni']
      };
    }

    // 1. Filtrer et valider les lots disponibles (non épuisés, méthode connue)
    const availablePrizes = this.getAvailablePrizes(prizes);

    // 2. Compter le nombre de segments par lot
    const segsByPrize = new Map<string, number>();
    segments.forEach((segment) => {
      const pid = this.normalizePrizeId((segment as any)?.prizeId);
      if (pid) segsByPrize.set(pid, (segsByPrize.get(pid) || 0) + 1);
    });

    // 3. Gating calendrier: si des lots calendrier sont à leur moment exact,
    //    répartir 100% uniquement entre ces lots (puis par segments de chaque lot)
    const activeCalendarPrizes = availablePrizes.filter(
      (p) => {
        const method = p.method || (p as any).attributionMethod;
        const isCalendar = method === 'calendar';
        // 🎯 CRITICAL: Utiliser isExactCalendarMoment pour vérifier la date/heure EXACTE programmée
        const isExactMoment = PrizeValidation.isExactCalendarMoment(p);
        const isAvailable = PrizeValidation.isPrizeAvailable(p);
        
        console.log(`📅 Calendar prize check: ${p.name}`, {
          method,
          isCalendar,
          isExactMoment,
          isAvailable,
          startDate: p.startDate,
          startTime: p.startTime,
          endDate: p.endDate,
          endTime: p.endTime,
          currentTime: new Date().toISOString()
        });
        
        return isCalendar && isExactMoment && isAvailable;
      }
    );

    const activeCalendarWithSegments = activeCalendarPrizes.filter((p) => (segsByPrize.get(p.id) || 0) > 0);
    if (activeCalendarWithSegments.length > 0) {
      console.log(`🎯 CALENDAR MODE: ${activeCalendarWithSegments.length} active prizes`, 
        activeCalendarWithSegments.map(p => ({ 
          name: p.name, 
          id: p.id, 
          segments: segsByPrize.get(p.id),
          totalUnits: p.totalUnits,
          awardedUnits: p.awardedUnits,
          remaining: p.totalUnits - p.awardedUnits
        })));
      
      const perPrizeWeight = 100 / activeCalendarWithSegments.length;
      const resultSegments: WheelSegment[] = segments.map((segment, index) => {
        const segmentId = segment.id || `segment-${index}`;
        const prizeId = this.normalizePrizeId((segment as any)?.prizeId);
        const activePrize = prizeId ? activeCalendarWithSegments.find((p) => p.id === prizeId) : undefined;
        let probability = 0;
        
        if (activePrize) {
          const remaining = activePrize.totalUnits - activePrize.awardedUnits;
          
          if (remaining > 0) {
            const count = Math.max(1, segsByPrize.get(activePrize.id) || 0);
            probability = perPrizeWeight / count;
            console.log(`✅ Calendar segment ${segmentId} (prize: ${activePrize.name}): ${probability}% (${remaining} prizes left)`);
          } else {
            console.log(`❌ Calendar segment ${segmentId} (prize: ${activePrize.name}): 0% (EXHAUSTED - no prizes left)`);
          }
        }
        
        return {
          id: segmentId,
          label: segment.label || `Segment ${index + 1}`,
          value: segment.label || `Segment ${index + 1}`,
          color: segment.color || '#ff6b6b',
          textColor: segment.textColor || '#ffffff',
          prizeId: prizeId,
          imageUrl: (segment as any).imageUrl || (segment as any).image,
          probability,
          isWinning: probability > 0
        };
      });

      const totalProb = resultSegments.reduce((sum, s) => sum + s.probability, 0);
      console.log(`🏆 Calendar mode result: ${totalProb}% total probability distributed`, 
        resultSegments.map(s => ({ id: s.id, probability: s.probability, isWinning: s.isWinning })));

      return {
        segments: resultSegments,
        totalProbability: totalProb,
        hasGuaranteedWin: totalProb > 0,
        residualProbability: Math.max(0, 100 - totalProb),
        errors: totalProb === 0 ? ['Tous les lots calendrier sont épuisés'] : []
      };
    }

    // 4. Cas garantie: si un lot probabilité/immediate est à 100%, il prend 100% et les autres 0
    const guaranteed100Prizes = availablePrizes.filter(
      (p) => {
        const method = p.method || (p as any).attributionMethod;
        const isProbMethod = this.isProbabilityMethod(method);
        const probability = this.getProbabilityPercent(p);
        const isGuaranteed = probability === 100;
        
        console.log(`🎲 Probability prize check: ${p.name}`, {
          method,
          isProbMethod,
          probability,
          isGuaranteed,
          totalUnits: p.totalUnits,
          awardedUnits: p.awardedUnits
        });
        
        return isProbMethod && isGuaranteed;
      }
    );
    const guaranteedWithSegments = guaranteed100Prizes.filter((p) => (segsByPrize.get(p.id) || 0) > 0);

    // Préparer le mapping une seule fois (réutilisé ensuite)
    const mappings = this.createSegmentPrizeMappings(segments, availablePrizes, segsByPrize);

    if (guaranteedWithSegments.length > 0) {
      console.log(`🎯 Guaranteed 100% prizes found: ${guaranteedWithSegments.length}`, 
        guaranteedWithSegments.map(p => ({ name: p.name, id: p.id, segments: segsByPrize.get(p.id) })));
      return this.calculateGuaranteedWinProbabilities(segments, mappings, guaranteedWithSegments, segsByPrize);
    }

    // 5. Cas normal: répartir selon les probabilités configurées
    console.log(`📊 Normal probability mode - distributing based on configured percentages`);
    return this.calculateNormalProbabilities(segments, mappings);
  }

  /**
   * Filtre les lots disponibles (non épuisés, méthodes valides)
   */
  private static getAvailablePrizes(prizes: Prize[]): Prize[] {
    return (prizes || []).filter(prize => {
      // Vérifier disponibilité - CRITIQUE: Un lot épuisé ne doit plus être disponible
      if (typeof prize.totalUnits === 'number' && typeof prize.awardedUnits === 'number') {
        const remaining = prize.totalUnits - prize.awardedUnits;
        console.log(`🎁 Prize availability check: ${prize.name}`, {
          totalUnits: prize.totalUnits,
          awardedUnits: prize.awardedUnits,
          remaining,
          isAvailable: remaining > 0
        });
        if (remaining <= 0) {
          console.log(`❌ Prize ${prize.name} is EXHAUSTED - no more units available`);
          return false;
        }
      }
      
      // Vérifier méthode valide - support both formats
      const method = prize.method || (prize as any).attributionMethod;
      return method && ['probability', 'immediate', 'calendar'].includes(method);
    });
  }

  /**
   * Crée le mapping segment -> lot avec validation
   */
  private static createSegmentPrizeMappings(
    segments: CampaignSegment[],
    prizes: Prize[],
    segsByPrize: Map<string, number>
  ): SegmentPrizeMapping[] {
    return segments.map((segment, index) => {
      const segmentId = segment.id || `segment-${index}`;
      const prizeId = this.normalizePrizeId((segment as any)?.prizeId);

      if (!prizeId) {
        return {
          segmentId,
          computedProbability: 0,
          isAvailable: false,
          reason: 'Aucun lot assigné'
        };
      }

      const prize = prizes.find((p) => p.id === prizeId);
      if (!prize) {
        return {
          segmentId,
          prizeId,
          computedProbability: 0,
          isAvailable: false,
          reason: 'Lot introuvable'
        };
      }

      const method = prize.method || (prize as any).attributionMethod;
      const isCalendar = method === 'calendar';
      const isActiveCalendar = isCalendar && PrizeValidation.isPrizeActive(prize);
      const isAvailable = !isCalendar && true; // Les lots calendrier ne participent pas en mode normal

      // Répartir la probabilité du lot par nombre de segments liés
      const prizePercent = this.isProbabilityMethod(method) ? this.getProbabilityPercent(prize) : 0;
      const count = Math.max(1, segsByPrize.get(prizeId) || 0);
      const perSegment = isCalendar ? 0 : prizePercent / count;

      return {
        segmentId,
        prizeId,
        computedProbability: perSegment,
        isAvailable,
        reason: isCalendar && !isActiveCalendar ? 'Lot calendrier inactif' : undefined
      };
    });
  }

  /**
   * Calcul pour les lots à 100% (mode garantie)
   * CRITIQUE: Les segments avec 100% de probabilité doivent TOUJOURS gagner
   * tant qu'il reste des lots disponibles
   */
  private static calculateGuaranteedWinProbabilities(
    segments: CampaignSegment[],
    mappings: SegmentPrizeMapping[],
    guaranteed100Prizes: Prize[],
    segsByPrize: Map<string, number>
  ): ProbabilityCalculationResult {
    const guaranteedIds = guaranteed100Prizes.map((p) => p.id);
    const perPrizeWeight = 100 / guaranteedIds.length;

    console.log(`🎯 GUARANTEED MODE: ${guaranteedIds.length} prizes at 100%`, {
      prizes: guaranteed100Prizes.map(p => ({
        name: p.name,
        id: p.id,
        totalUnits: p.totalUnits,
        awardedUnits: p.awardedUnits,
        remaining: p.totalUnits - p.awardedUnits,
        segments: segsByPrize.get(p.id)
      }))
    });

    const resultSegments: WheelSegment[] = mappings.map((mapping, index) => {
      const segment = segments[index];
      const prizeId = mapping.prizeId;
      let probability = 0;
      
      if (prizeId && guaranteedIds.includes(prizeId)) {
        const prize = guaranteed100Prizes.find(p => p.id === prizeId);
        const remaining = prize ? (prize.totalUnits - prize.awardedUnits) : 0;
        
        if (remaining > 0) {
          const count = Math.max(1, segsByPrize.get(prizeId) || 0);
          probability = perPrizeWeight / count;
          console.log(`✅ Guaranteed segment ${mapping.segmentId}: ${probability}% (${remaining} prizes left)`);
        } else {
          console.log(`❌ Guaranteed segment ${mapping.segmentId}: 0% (EXHAUSTED - no prizes left)`);
        }
      }
      
      return {
        id: mapping.segmentId,
        label: segment.label || `Segment ${index + 1}`,
        value: segment.label || `Segment ${index + 1}`,
        color: segment.color || '#ff6b6b',
        textColor: segment.textColor || '#ffffff',
        prizeId: prizeId,
        imageUrl: (segment as any).imageUrl || (segment as any).image,
        probability,
        isWinning: probability > 0
      };
    });

    const totalProb = resultSegments.reduce((sum, s) => sum + s.probability, 0);
    console.log(`🏆 Guaranteed mode result: ${totalProb}% total probability distributed`);

    return {
      segments: resultSegments,
      totalProbability: totalProb,
      hasGuaranteedWin: totalProb > 0,
      residualProbability: Math.max(0, 100 - totalProb),
      errors: totalProb === 0 ? ['Tous les lots garantis sont épuisés'] : []
    };
  }

  /**
   * Calcul normal avec distribution proportionnelle
   */
  private static calculateNormalProbabilities(
    segments: CampaignSegment[],
    mappings: SegmentPrizeMapping[]
  ): ProbabilityCalculationResult {
    let residual = 0;
    // 1) Calcul du total des probabilités gagnantes (segments liés à des lots probabilité/immediate)
    let totalWinners = 0;
    mappings.forEach((m) => {
      if (m.isAvailable && m.computedProbability > 0) totalWinners += m.computedProbability;
    });

    // 2) Récupérer les valeurs manuelles pour les segments perdants sans lot
    const manualByIndex = new Map<number, number>();
    mappings.forEach((m, index) => {
      const hasPrize = !!m.prizeId;
      const manual = (segments[index] as any)?.manualProbabilityPercent;
      if (!hasPrize && typeof manual === 'number' && Number.isFinite(manual)) {
        const clamped = Math.max(0, Math.min(100, manual));
        if (clamped > 0) manualByIndex.set(index, clamped);
      }
    });

    let manualSum = 0;
    manualByIndex.forEach((v) => (manualSum += v));

    // 3) Si winners + manual > 100, normaliser proportionnellement winners et manuel
    const combined = totalWinners + manualSum;
    if (combined > 100 && combined > 0) {
      const factor = 100 / combined;
      // scale winners
      mappings.forEach((m) => {
        if (m.isAvailable && m.computedProbability > 0) m.computedProbability *= factor;
      });
      // scale manual
      manualByIndex.forEach((v, index) => {
        mappings[index].computedProbability = v * factor;
      });
      // Tous les autres perdants sans manuel restent à 0
      residual = 0;
    } else {
      // 4) Assigner d'abord les valeurs manuelles telles quelles
      manualByIndex.forEach((v, index) => {
        mappings[index].computedProbability = v;
      });

      // 5) Distribuer le résiduel aux perdants sans manuel
      residual = Math.max(0, 100 - (totalWinners + manualSum));
      const losingNoManual: SegmentPrizeMapping[] = mappings.filter((m, idx) => {
        const hasPrize = !!m.prizeId;
        const hasManual = manualByIndex.has(idx);
        const isWinner = m.isAvailable && m.computedProbability > 0;
        return !isWinner && !hasPrize && !hasManual; // perdants sans lot et sans manuel
      });
      const per = losingNoManual.length > 0 ? residual / losingNoManual.length : 0;
      losingNoManual.forEach((m) => (m.computedProbability = per));
    }

    // Construire les segments finaux
    const resultSegments: WheelSegment[] = mappings.map((m, index) => {
      const segment = segments[index];
      return {
        id: m.segmentId,
        label: segment.label || `Segment ${index + 1}`,
        value: segment.label || `Segment ${index + 1}`,
        color: segment.color || '#ff6b6b',
        textColor: segment.textColor || '#ffffff',
        prizeId: m.prizeId,
        imageUrl: (segment as any).imageUrl || (segment as any).image,
        probability: m.computedProbability,
        isWinning: !!(m.prizeId && m.isAvailable && m.computedProbability > 0)
      };
    });

    const totalProb = resultSegments.reduce((sum, s) => sum + s.probability, 0);
    const hasWin = resultSegments.some(s => s.isWinning);
    
    console.log(`📊 Normal mode final result: ${totalProb}% distributed, ${hasWin ? 'has' : 'no'} winning segments`);

    return {
      segments: resultSegments,
      totalProbability: totalProb,
      hasGuaranteedWin: hasWin,
      residualProbability: residual,
      errors: []
    };
  }

  /**
   * Normalise un prizeId (gère les différents formats)
   */
  private static normalizePrizeId(prizeId: any): string | undefined {
    if (!prizeId) return undefined;
    if (typeof prizeId === 'string') return prizeId;
    if (typeof prizeId === 'object' && prizeId && typeof prizeId.value === 'string') {
      return prizeId.value;
    }
    return undefined;
  }

  /**
   * Extrait le pourcentage de probabilité d'un lot
   */
  private static getProbabilityPercent(prize: Prize): number {
    // Support both formats: probabilityPercent and probability
    const candidates = [prize.probabilityPercent, (prize as any).probability];
    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return Math.max(0, Math.min(100, candidate));
      }
    }
    return 0;
  }

  /**
   * Vérifie si la méthode du lot est basée sur la probabilité
   */
  private static isProbabilityMethod(method: string): boolean {
    return ['probability', 'immediate'].includes(method);
  }

  /**
   * Valide la cohérence d'un ensemble de lots
   */
  static validatePrizes(prizes: Prize[]): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    let totalProbability = 0;
    const probabilityPrizes = prizes.filter(p => this.isProbabilityMethod(p.method));
    
    probabilityPrizes.forEach(prize => {
      const percent = this.getProbabilityPercent(prize);
      totalProbability += percent;
      
      if (percent === 0) {
        warnings.push(`Le lot "${prize.name}" a une probabilité de 0%`);
      }
    });

    if (totalProbability > 100) {
      warnings.push(`La somme des probabilités (${totalProbability}%) dépasse 100% et sera normalisée`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calcule les probabilités avec ajustement temporel (v2.0)
   * Intègre le lissage temporel pour éviter l'épuisement prématuré des lots
   */
  static calculateSegmentProbabilitiesWithTemporal(
    segments: CampaignSegment[],
    prizes: Prize[],
    temporalConfig?: TemporalConfig
  ): ProbabilityCalculationResult {
    // Calcul de base
    const baseResult = this.calculateSegmentProbabilities(segments, prizes);

    // Si pas de config temporelle, retourner le résultat de base
    if (!temporalConfig) {
      return baseResult;
    }

    // Créer le système de distribution temporelle
    const temporal = new TemporalDistribution(temporalConfig);

    // Ajuster les probabilités de chaque segment selon le quota journalier
    const adjustedSegments = baseResult.segments.map(segment => {
      // Si le segment n'a pas de lot, pas d'ajustement
      if (!segment.prizeId) {
        return segment;
      }

      // Trouver le lot correspondant
      const prize = prizes.find(p => p.id === segment.prizeId);
      if (!prize) {
        return segment;
      }

      // Appliquer l'ajustement temporel
      const adjustment = temporal.adjustProbability(
        prize,
        segment.probability,
        new Date()
      );

      return {
        ...segment,
        probability: adjustment.adjustedProbability,
        // Ajouter les métadonnées d'ajustement
        temporalAdjustment: adjustment
      };
    });

    // Recalculer la probabilité totale
    const totalProbability = adjustedSegments.reduce(
      (sum, s) => sum + s.probability,
      0
    );

    console.log('📊 Temporal adjustment applied:', {
      originalTotal: baseResult.totalProbability,
      adjustedTotal: totalProbability,
      segmentsAdjusted: adjustedSegments.filter(s => (s as any).temporalAdjustment).length
    });

    return {
      ...baseResult,
      segments: adjustedSegments,
      totalProbability,
      residualProbability: Math.max(0, 100 - totalProbability)
    };
  }
}