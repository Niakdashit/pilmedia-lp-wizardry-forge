/**
 * TemporalDistribution - Système de distribution temporelle intelligente des lots
 * 
 * Implémente le lissage temporel selon les standards Drimify/Qualifio:
 * - Distribution uniforme sur la période de campagne
 * - Quotas journaliers adaptatifs
 * - Recalcul dynamique des probabilités
 * - Système de carry-over pour lots non gagnés
 * 
 * Évite que tous les lots soient gagnés le premier jour d'une campagne longue.
 */

import { Prize } from '../types/PrizeSystem';

export interface TemporalConfig {
  campaignStartDate: Date;
  campaignEndDate: Date;
  totalParticipantsEstimated?: number; // Estimation du nombre de participants
  distributionStrategy: 'uniform' | 'weighted' | 'peak_hours'; // Stratégie de distribution
}

export interface DailyQuota {
  date: string; // YYYY-MM-DD
  totalQuota: number;
  awarded: number;
  remaining: number;
  prizeQuotas: Map<string, { quota: number; awarded: number }>;
}

export interface TemporalAdjustment {
  originalProbability: number;
  adjustedProbability: number;
  reason: string;
  dailyQuotaRemaining: number;
  totalQuotaRemaining: number;
}

export class TemporalDistribution {
  private config: TemporalConfig;
  private dailyQuotas: Map<string, DailyQuota>;

  constructor(config: TemporalConfig) {
    this.config = config;
    this.dailyQuotas = new Map();
  }

  /**
   * Calcule le nombre de jours restants dans la campagne
   */
  private getDaysRemaining(currentDate: Date = new Date()): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = this.config.campaignEndDate.getTime() - currentDate.getTime();
    return Math.max(1, Math.ceil(diffMs / msPerDay));
  }

  /**
   * Calcule le quota journalier pour un lot
   * Stratégie: Distribution uniforme sur les jours restants
   */
  calculateDailyQuota(
    prize: Prize,
    currentDate: Date = new Date()
  ): number {
    const remaining = prize.totalUnits - prize.awardedUnits;
    
    if (remaining <= 0) {
      return 0;
    }

    const daysRemaining = this.getDaysRemaining(currentDate);
    
    // Distribution uniforme de base
    let dailyQuota = Math.ceil(remaining / daysRemaining);

    // Ajustement selon la stratégie
    switch (this.config.distributionStrategy) {
      case 'uniform':
        // Déjà calculé
        break;
        
      case 'weighted':
        // Plus de lots en début de campagne pour encourager la participation
        const totalDays = Math.ceil(
          (this.config.campaignEndDate.getTime() - this.config.campaignStartDate.getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        const daysPassed = totalDays - daysRemaining;
        const weightFactor = 1 + (0.3 * (1 - daysPassed / totalDays)); // 30% de bonus en début
        dailyQuota = Math.ceil(dailyQuota * weightFactor);
        break;
        
      case 'peak_hours':
        // Distribution selon les heures de pointe (à implémenter avec analytics)
        // Pour l'instant, identique à uniform
        break;
    }

    console.log(`📊 Daily quota calculated for prize ${prize.name}:`, {
      remaining,
      daysRemaining,
      dailyQuota,
      strategy: this.config.distributionStrategy
    });

    return dailyQuota;
  }

  /**
   * Obtient ou crée le quota du jour
   */
  private getDailyQuota(date: Date = new Date()): DailyQuota {
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!this.dailyQuotas.has(dateKey)) {
      this.dailyQuotas.set(dateKey, {
        date: dateKey,
        totalQuota: 0,
        awarded: 0,
        remaining: 0,
        prizeQuotas: new Map()
      });
    }
    
    return this.dailyQuotas.get(dateKey)!;
  }

  /**
   * Enregistre l'attribution d'un lot
   */
  recordAttribution(prizeId: string, date: Date = new Date()): void {
    const quota = this.getDailyQuota(date);
    quota.awarded++;
    
    const prizeQuota = quota.prizeQuotas.get(prizeId);
    if (prizeQuota) {
      prizeQuota.awarded++;
    }

    console.log(`✅ Attribution recorded for prize ${prizeId}:`, {
      date: quota.date,
      totalAwarded: quota.awarded,
      prizeAwarded: prizeQuota?.awarded || 0
    });
  }

  /**
   * Vérifie si un lot peut être attribué aujourd'hui
   * Retourne true si le quota journalier n'est pas atteint
   */
  canAwardPrize(
    prize: Prize,
    currentDate: Date = new Date()
  ): { canAward: boolean; reason?: string; quotaRemaining: number } {
    const dailyQuota = this.calculateDailyQuota(prize, currentDate);
    const quota = this.getDailyQuota(currentDate);
    
    // Vérifier le quota du lot spécifique
    let prizeQuota = quota.prizeQuotas.get(prize.id);
    if (!prizeQuota) {
      prizeQuota = { quota: dailyQuota, awarded: 0 };
      quota.prizeQuotas.set(prize.id, prizeQuota);
    }

    const quotaRemaining = prizeQuota.quota - prizeQuota.awarded;

    if (quotaRemaining <= 0) {
      return {
        canAward: false,
        reason: `Quota journalier atteint (${prizeQuota.awarded}/${prizeQuota.quota})`,
        quotaRemaining: 0
      };
    }

    return {
      canAward: true,
      quotaRemaining
    };
  }

  /**
   * Ajuste la probabilité d'un lot selon le quota journalier
   * Implémente le lissage temporel intelligent
   */
  adjustProbability(
    prize: Prize,
    originalProbability: number,
    currentDate: Date = new Date()
  ): TemporalAdjustment {
    const { canAward, reason, quotaRemaining } = this.canAwardPrize(prize, currentDate);

    // Si le quota est atteint, probabilité = 0
    if (!canAward) {
      return {
        originalProbability,
        adjustedProbability: 0,
        reason: reason || 'Quota atteint',
        dailyQuotaRemaining: 0,
        totalQuotaRemaining: prize.totalUnits - prize.awardedUnits
      };
    }

    // Calculer le facteur d'ajustement
    const dailyQuota = this.calculateDailyQuota(prize, currentDate);
    const utilizationRate = (dailyQuota - quotaRemaining) / dailyQuota;

    // Réduire progressivement la probabilité au fur et à mesure que le quota se remplit
    // Formule: P_adjusted = P_original * (1 - 0.5 * utilizationRate)
    // Cela réduit la probabilité de 50% max quand le quota est presque atteint
    const adjustmentFactor = 1 - (0.5 * utilizationRate);
    const adjustedProbability = originalProbability * adjustmentFactor;

    console.log(`🎯 Probability adjusted for prize ${prize.name}:`, {
      original: originalProbability,
      adjusted: adjustedProbability,
      utilizationRate: `${(utilizationRate * 100).toFixed(1)}%`,
      quotaRemaining,
      dailyQuota
    });

    return {
      originalProbability,
      adjustedProbability,
      reason: `Ajustement temporel (${quotaRemaining}/${dailyQuota} restants aujourd'hui)`,
      dailyQuotaRemaining: quotaRemaining,
      totalQuotaRemaining: prize.totalUnits - prize.awardedUnits
    };
  }

  /**
   * Système de carry-over: redistribue les lots non gagnés
   * Si le quota du jour n'est pas atteint, augmente le quota du lendemain
   */
  applyCarryOver(date: Date = new Date()): void {
    const quota = this.getDailyQuota(date);
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Pour chaque lot
    quota.prizeQuotas.forEach((prizeQuota, prizeId) => {
      const unawarded = prizeQuota.quota - prizeQuota.awarded;
      
      if (unawarded > 0) {
        // Reporter sur le lendemain
        const tomorrowQuota = this.getDailyQuota(tomorrow);
        let tomorrowPrizeQuota = tomorrowQuota.prizeQuotas.get(prizeId);
        
        if (!tomorrowPrizeQuota) {
          tomorrowPrizeQuota = { quota: 0, awarded: 0 };
          tomorrowQuota.prizeQuotas.set(prizeId, tomorrowPrizeQuota);
        }
        
        tomorrowPrizeQuota.quota += unawarded;

        console.log(`📦 Carry-over applied for prize ${prizeId}:`, {
          unawarded,
          fromDate: quota.date,
          toDate: tomorrowQuota.date,
          newQuota: tomorrowPrizeQuota.quota
        });
      }
    });
  }

  /**
   * Statistiques de distribution temporelle
   */
  getDistributionStats(): {
    totalDays: number;
    daysRemaining: number;
    daysElapsed: number;
    averageAwardsPerDay: number;
    projectedTotalAwards: number;
  } {
    const now = new Date();
    const totalDays = Math.ceil(
      (this.config.campaignEndDate.getTime() - this.config.campaignStartDate.getTime()) 
      / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = this.getDaysRemaining(now);
    const daysElapsed = totalDays - daysRemaining;

    // Calculer la moyenne des attributions par jour
    let totalAwarded = 0;
    this.dailyQuotas.forEach(quota => {
      totalAwarded += quota.awarded;
    });
    const averageAwardsPerDay = daysElapsed > 0 ? totalAwarded / daysElapsed : 0;
    const projectedTotalAwards = Math.round(averageAwardsPerDay * totalDays);

    return {
      totalDays,
      daysRemaining,
      daysElapsed,
      averageAwardsPerDay,
      projectedTotalAwards
    };
  }

  /**
   * Réinitialise les quotas (pour tests ou nouvelle campagne)
   */
  reset(): void {
    this.dailyQuotas.clear();
    console.log('🔄 Temporal distribution reset');
  }
}
