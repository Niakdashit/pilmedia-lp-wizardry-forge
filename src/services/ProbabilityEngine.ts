/**
 * Moteur de calcul de probabilité centralisé
 * Responsable de tous les calculs de probabilité avec une logique claire et testable
 */

import type { Prize, WheelSegment, CampaignSegment, ProbabilityCalculationResult, SegmentPrizeMapping } from '../types/PrizeSystem';

export class ProbabilityEngine {
  
  /**
   * Calcule les probabilités pour tous les segments
   * LOGIQUE PRINCIPALE : 
   * 1. Si un lot a 100% -> ce segment a 100%, les autres 0%
   * 2. Sinon, distribuer selon les % des lots + résiduel aux segments perdants
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

    // 1. Filtrer et valider les lots disponibles
    const availablePrizes = this.getAvailablePrizes(prizes);
    
    // 2. Créer le mapping segment -> lot
    const mappings = this.createSegmentPrizeMappings(segments, availablePrizes);
    
    // 3. Détecter les lots à 100% (mode garantie)
    const guaranteed100Prizes = availablePrizes.filter(p => 
      this.getProbabilityPercent(p) >= 100 && 
      this.isProbabilityMethod(p.method)
    );
    
    if (guaranteed100Prizes.length > 0) {
      return this.calculateGuaranteedWinProbabilities(segments, mappings, guaranteed100Prizes);
    }
    
    // 4. Calcul normal avec distribution
    return this.calculateNormalProbabilities(segments, mappings);
  }

  /**
   * Filtre les lots disponibles (non épuisés, méthodes valides)
   */
  private static getAvailablePrizes(prizes: Prize[]): Prize[] {
    return (prizes || []).filter(prize => {
      // Vérifier disponibilité
      if (typeof prize.totalUnits === 'number' && typeof prize.awardedUnits === 'number') {
        if (prize.totalUnits - prize.awardedUnits <= 0) return false;
      }
      
      // Vérifier méthode valide
      return prize.method && ['probability', 'immediate', 'calendar'].includes(prize.method);
    });
  }

  /**
   * Crée le mapping segment -> lot avec validation
   */
  private static createSegmentPrizeMappings(
    segments: CampaignSegment[],
    prizes: Prize[]
  ): SegmentPrizeMapping[] {
    return segments.map((segment, index) => {
      const segmentId = segment.id || `segment-${index}`;
      const prizeId = this.normalizePrizeId(segment.prizeId);
      
      if (!prizeId) {
        return {
          segmentId,
          computedProbability: 0,
          isAvailable: false,
          reason: 'Aucun lot assigné'
        };
      }
      
      const prize = prizes.find(p => p.id === prizeId);
      if (!prize) {
        return {
          segmentId,
          prizeId,
          computedProbability: 0,
          isAvailable: false,
          reason: 'Lot introuvable'
        };
      }
      
      return {
        segmentId,
        prizeId,
        computedProbability: this.getProbabilityPercent(prize),
        isAvailable: true
      };
    });
  }

  /**
   * Calcul pour les lots à 100% (mode garantie)
   */
  private static calculateGuaranteedWinProbabilities(
    segments: CampaignSegment[],
    mappings: SegmentPrizeMapping[],
    guaranteed100Prizes: Prize[]
  ): ProbabilityCalculationResult {
    const guaranteed100PrizeIds = new Set(guaranteed100Prizes.map(p => p.id));
    
    const resultSegments: WheelSegment[] = mappings.map((mapping, index) => {
      const segment = segments[index];
      const hasGuaranteedPrize = mapping.prizeId && guaranteed100PrizeIds.has(mapping.prizeId);
      
      return {
        id: mapping.segmentId,
        label: segment.label || `Segment ${index + 1}`,
        color: segment.color || '#ff6b6b',
        textColor: segment.textColor || '#ffffff',
        prizeId: mapping.prizeId,
        imageUrl: segment.imageUrl || segment.image,
        probability: hasGuaranteedPrize ? 100 : 0,
        isWinning: !!hasGuaranteedPrize
      };
    });

    return {
      segments: resultSegments,
      totalProbability: 100,
      hasGuaranteedWin: true,
      residualProbability: 0,
      errors: []
    };
  }

  /**
   * Calcul normal avec distribution proportionnelle
   */
  private static calculateNormalProbabilities(
    segments: CampaignSegment[],
    mappings: SegmentPrizeMapping[]
  ): ProbabilityCalculationResult {
    // Calculer le total des probabilités assignées
    let totalAssigned = 0;
    mappings.forEach(mapping => {
      if (mapping.isAvailable && mapping.computedProbability > 0) {
        totalAssigned += mapping.computedProbability;
      }
    });

    // Gérer les débordements (>100%)
    if (totalAssigned > 100) {
      const factor = 100 / totalAssigned;
      mappings.forEach(mapping => {
        if (mapping.isAvailable) {
          mapping.computedProbability *= factor;
        }
      });
      totalAssigned = 100;
    }

    // Distribuer le résiduel aux segments perdants
    const residual = Math.max(0, 100 - totalAssigned);
    const losingSegments = mappings.filter(m => !m.isAvailable || m.computedProbability === 0);
    const residualPerLosing = losingSegments.length > 0 ? residual / losingSegments.length : 0;

    losingSegments.forEach(mapping => {
      mapping.computedProbability = residualPerLosing;
    });

    // Construire les segments finaux
    const resultSegments: WheelSegment[] = mappings.map((mapping, index) => {
      const segment = segments[index];
      
      return {
        id: mapping.segmentId,
        label: segment.label || `Segment ${index + 1}`,
        color: segment.color || '#ff6b6b',
        textColor: segment.textColor || '#ffffff',
        prizeId: mapping.prizeId,
        imageUrl: segment.imageUrl || segment.image,
        probability: mapping.computedProbability,
        isWinning: mapping.isAvailable && mapping.computedProbability > 0
      };
    });

    return {
      segments: resultSegments,
      totalProbability: 100,
      hasGuaranteedWin: false,
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
    if (typeof prizeId === 'object' && prizeId.value !== 'undefined') {
      return prizeId.value;
    }
    return undefined;
  }

  /**
   * Extrait le pourcentage de probabilité d'un lot
   */
  private static getProbabilityPercent(prize: Prize): number {
    const candidates = [
      prize.probabilityPercent,
    ];
    
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
}