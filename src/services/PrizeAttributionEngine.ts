/**
 * Moteur d'Attribution des Lots
 * Basé sur les algorithmes de l'industrie du gaming et des loteries
 * 
 * Références:
 * - Provably Fair Gaming (Bitcoin Casinos)
 * - Google Lottery System
 * - Amazon Giveaway Algorithm
 */

import {
  Prize,
  DotationConfig,
  AttributionResult,
  AttributionHistory,
  CalendarAttribution,
  ProbabilityAttribution,
  QuotaAttribution,
  RankAttribution,
  InstantWinAttribution
} from '@/types/dotation';
import { supabase } from '@/integrations/supabase/client';

/**
 * Contexte d'attribution
 */
interface AttributionContext {
  campaignId: string;
  participantId?: string;
  participantEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  timestamp: string;
  participantRank?: number; // Rang du participant (1er, 2ème, etc.)
}

/**
 * Classe principale du moteur d'attribution
 */
export class PrizeAttributionEngine {
  private config: DotationConfig;

  constructor(config: DotationConfig) {
    this.config = config;
  }

  /**
   * Méthode principale: Détermine si le participant gagne un lot
   */
  async attributePrize(context: AttributionContext): Promise<AttributionResult> {
    console.log('🎯 [PrizeAttribution] Starting attribution process', context);

    try {
      // 1. Vérifications anti-fraude
      const fraudCheck = await this.checkAntiFraud(context);
      if (!fraudCheck.passed) {
        return this.createResult(false, null, fraudCheck.reason, 'ERROR_FRAUD_DETECTED', context);
      }

      // 2. Récupérer le rang du participant si nécessaire
      if (!context.participantRank) {
        context.participantRank = await this.getParticipantRank(context.campaignId);
      }

      // 3. Filtrer les lots actifs et disponibles
      const availablePrizes = this.getAvailablePrizes();
      if (availablePrizes.length === 0) {
        return this.createResult(false, null, 'Aucun lot disponible', 'LOSE_EXHAUSTED', context);
      }

      // 4. Trier les lots par priorité
      const sortedPrizes = this.sortPrizesByPriority(availablePrizes);

      // 5. Tenter l'attribution pour chaque lot
      for (const prize of sortedPrizes) {
        const result = await this.tryAttributePrize(prize, context);
        if (result.isWinner) {
          // Mettre à jour la quantité attribuée
          await this.incrementAwardedQuantity(prize.id);
          // Enregistrer dans l'historique
          await this.saveToHistory(context, result);
          // Envoyer les notifications
          await this.sendNotifications(result);
          return result;
        }
      }

      // 6. Aucun lot gagné
      return this.createResult(false, null, 'Aucune condition d\'attribution remplie', 'LOSE_NO_MATCH', context);

    } catch (error) {
      console.error('❌ [PrizeAttribution] Error:', error);
      return this.createResult(false, null, 'Erreur système', 'ERROR_SYSTEM', context);
    }
  }

  /**
   * Tente d'attribuer un lot spécifique
   */
  private async tryAttributePrize(prize: Prize, context: AttributionContext): Promise<AttributionResult> {
    const { attribution } = prize;

    console.log(`🎯 [tryAttributePrize] Trying prize ${prize.id} (${prize.name}) with method: ${attribution.method}`, attribution);

    switch (attribution.method) {
      case 'calendar':
        return this.attributeByCalendar(prize, attribution, context);
      
      case 'probability':
        return this.attributeByProbability(prize, attribution, context);
      
      case 'quota':
        return this.attributeByQuota(prize, attribution, context);
      
      case 'rank':
        return this.attributeByRank(prize, attribution, context);
      
      case 'instant_win':
        return this.attributeInstantWin(prize, attribution, context);
      
      default:
        console.warn(`⚠️ [tryAttributePrize] Unknown method: ${attribution.method}`);
        return this.createResult(false, null, 'Méthode d\'attribution inconnue', 'ERROR_SYSTEM', context);
    }
  }

  /**
   * Attribution par calendrier (date/heure précise)
   */
  private attributeByCalendar(
    prize: Prize,
    config: CalendarAttribution,
    context: AttributionContext
  ): AttributionResult {
    const now = new Date(context.timestamp);
    const scheduledDateTime = new Date(`${config.scheduledDate}T${config.scheduledTime}`);
    const timeWindow = config.timeWindow || 0; // minutes

    // Calculer la fenêtre de temps
    const windowStart = new Date(scheduledDateTime.getTime() - (timeWindow * 60000));
    const windowEnd = new Date(scheduledDateTime.getTime() + (timeWindow * 60000));

    // Vérifier si on est dans la fenêtre
    if (now >= windowStart && now <= windowEnd) {
      return this.createResult(
        true,
        prize,
        `Lot gagné via calendrier (${config.scheduledDate} ${config.scheduledTime})`,
        'WIN_CALENDAR',
        context
      );
    }

    // Pas dans la fenêtre
    if (now < windowStart) {
      return this.createResult(false, null, 'Lot pas encore disponible', 'LOSE_NOT_SCHEDULED', context);
    } else {
      return this.createResult(false, null, 'Fenêtre de temps dépassée', 'LOSE_EXPIRED', context);
    }
  }

  /**
   * Attribution probabiliste
   * Utilise un générateur de nombres aléatoires cryptographiquement sûr
   */
  private async attributeByProbability(
    prize: Prize,
    config: ProbabilityAttribution,
    context: AttributionContext
  ): Promise<AttributionResult> {
    // Vérifier si le quota de gagnants est atteint
    if (config.maxWinners && prize.awardedQuantity >= config.maxWinners) {
      return this.createResult(false, null, 'Quota de gagnants atteint', 'LOSE_QUOTA_FULL', context);
    }

    // Générer un nombre aléatoire sécurisé (0-100)
    const randomValue = this.generateSecureRandom() * 100;

    console.log(`🎲 [Probability] Random: ${randomValue.toFixed(2)}%, Threshold: ${config.winProbability}%`);

    if (randomValue <= config.winProbability) {
      return this.createResult(
        true,
        prize,
        `Lot gagné via probabilité (${config.winProbability}%)`,
        'WIN_PROBABILITY',
        context
      );
    }

    return this.createResult(false, null, 'Probabilité non atteinte', 'LOSE_PROBABILITY', context);
  }

  /**
   * Attribution par quota (X gagnants sur Y participants)
   */
  private async attributeByQuota(
    prize: Prize,
    config: QuotaAttribution,
    context: AttributionContext
  ): Promise<AttributionResult> {
    const { winnersCount, totalParticipants, selectionStrategy } = config;

    // Vérifier si le quota est atteint
    if (prize.awardedQuantity >= winnersCount) {
      return this.createResult(false, null, 'Quota de gagnants atteint', 'LOSE_QUOTA_FULL', context);
    }

    // Calculer la probabilité dynamique
    const remainingWinners = winnersCount - prize.awardedQuantity;
    const currentRank = context.participantRank || 1;
    const remainingParticipants = Math.max(1, totalParticipants - currentRank + 1);
    const dynamicProbability = (remainingWinners / remainingParticipants) * 100;

    console.log(`📊 [Quota] Remaining winners: ${remainingWinners}, Remaining participants: ${remainingParticipants}, Probability: ${dynamicProbability.toFixed(2)}%`);

    // Stratégies de sélection
    switch (selectionStrategy) {
      case 'first':
        // Les X premiers gagnent
        if (currentRank <= winnersCount) {
          return this.createResult(true, prize, 'Lot gagné via quota (premiers)', 'WIN_QUOTA', context);
        }
        break;

      case 'last':
        // Les X derniers gagnent
        if (currentRank > totalParticipants - winnersCount) {
          return this.createResult(true, prize, 'Lot gagné via quota (derniers)', 'WIN_QUOTA', context);
        }
        break;

      case 'distributed':
        // Distribution uniforme
        const interval = Math.floor(totalParticipants / winnersCount);
        if (currentRank % interval === 0) {
          return this.createResult(true, prize, 'Lot gagné via quota (distribué)', 'WIN_QUOTA', context);
        }
        break;

      case 'random':
      default:
        // Sélection aléatoire avec probabilité dynamique
        const randomValue = this.generateSecureRandom() * 100;
        if (randomValue <= dynamicProbability) {
          return this.createResult(true, prize, 'Lot gagné via quota (aléatoire)', 'WIN_QUOTA', context);
        }
        break;
    }

    return this.createResult(false, null, 'Quota non atteint', 'LOSE_QUOTA_FULL', context);
  }

  /**
   * Attribution par rang (Nième participant)
   */
  private attributeByRank(
    prize: Prize,
    config: RankAttribution,
    context: AttributionContext
  ): AttributionResult {
    const currentRank = context.participantRank || 1;
    const tolerance = config.tolerance || 0;

    // Vérifier si le rang actuel correspond à un rang gagnant
    for (const winningRank of config.winningRanks) {
      if (Math.abs(currentRank - winningRank) <= tolerance) {
        return this.createResult(
          true,
          prize,
          `Lot gagné via rang (${currentRank}/${winningRank})`,
          'WIN_RANK',
          context
        );
      }
    }

    return this.createResult(false, null, 'Rang non gagnant', 'LOSE_WRONG_RANK', context);
  }

  /**
   * Attribution de gain instantané (garanti)
   */
  private attributeInstantWin(
    prize: Prize,
    config: InstantWinAttribution,
    context: AttributionContext
  ): AttributionResult {
    // Vérifier s'il reste des lots
    if (prize.awardedQuantity >= prize.totalQuantity) {
      return this.createResult(false, null, 'Lot épuisé', 'LOSE_EXHAUSTED', context);
    }

    return this.createResult(
      true,
      prize,
      'Gain instantané garanti',
      'WIN_INSTANT',
      context
    );
  }

  /**
   * Vérifications anti-fraude
   */
  private async checkAntiFraud(context: AttributionContext): Promise<{ passed: boolean; reason: string }> {
    if (!this.config.antiFraud) {
      return { passed: true, reason: '' };
    }

    const { maxWinsPerIP, maxWinsPerEmail, maxWinsPerDevice, verificationPeriod } = this.config.antiFraud;
    const periodHours = verificationPeriod || 24;
    const cutoffDate = new Date(Date.now() - periodHours * 3600000).toISOString();

    try {
      // Vérifier les gains par IP
      if (maxWinsPerIP && context.ipAddress) {
        const { count } = await supabase
          .from('attribution_history')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', context.campaignId)
          .eq('ip_address', context.ipAddress)
          .eq('result->>isWinner', 'true')
          .gte('created_at', cutoffDate);

        if (count && count >= maxWinsPerIP) {
          return { passed: false, reason: `Limite de gains par IP atteinte (${maxWinsPerIP})` };
        }
      }

      // Vérifier les gains par email
      if (maxWinsPerEmail && context.participantEmail) {
        const { count } = await supabase
          .from('attribution_history')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', context.campaignId)
          .eq('participant_email', context.participantEmail)
          .eq('result->>isWinner', 'true')
          .gte('created_at', cutoffDate);

        if (count && count >= maxWinsPerEmail) {
          return { passed: false, reason: `Limite de gains par email atteinte (${maxWinsPerEmail})` };
        }
      }

      // Vérifier les gains par appareil
      if (maxWinsPerDevice && context.deviceFingerprint) {
        const { count } = await supabase
          .from('attribution_history')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', context.campaignId)
          .eq('device_fingerprint', context.deviceFingerprint)
          .eq('result->>isWinner', 'true')
          .gte('created_at', cutoffDate);

        if (count && count >= maxWinsPerDevice) {
          return { passed: false, reason: `Limite de gains par appareil atteinte (${maxWinsPerDevice})` };
        }
      }

      return { passed: true, reason: '' };
    } catch (error) {
      console.error('❌ [AntiFraud] Error:', error);
      return { passed: true, reason: '' }; // En cas d'erreur, on laisse passer
    }
  }

  /**
   * Récupère les lots disponibles
   */
  private getAvailablePrizes(): Prize[] {
    const now = new Date();
    const filtered = this.config.prizes.filter(prize => {
      // Vérifier le statut
      if (prize.status !== 'active') {
        console.log(`❌ [getAvailablePrizes] Prize ${prize.id} excluded: status=${prize.status}`);
        return false;
      }

      // Vérifier la quantité
      if (prize.awardedQuantity >= prize.totalQuantity) {
        console.log(`❌ [getAvailablePrizes] Prize ${prize.id} excluded: awarded=${prize.awardedQuantity}, total=${prize.totalQuantity}`);
        return false;
      }

      // Vérifier les dates
      if (prize.startDate && new Date(prize.startDate) > now) {
        console.log(`❌ [getAvailablePrizes] Prize ${prize.id} excluded: not started yet (${prize.startDate})`);
        return false;
      }
      if (prize.endDate && new Date(prize.endDate) < now) {
        console.log(`❌ [getAvailablePrizes] Prize ${prize.id} excluded: expired (${prize.endDate})`);
        return false;
      }

      console.log(`✅ [getAvailablePrizes] Prize ${prize.id} available:`, {
        name: prize.name,
        status: prize.status,
        awarded: prize.awardedQuantity,
        total: prize.totalQuantity,
        method: prize.attribution.method
      });
      return true;
    });
    
    console.log(`📦 [getAvailablePrizes] Total available prizes: ${filtered.length}/${this.config.prizes.length}`);
    return filtered;
  }

  /**
   * Trie les lots par priorité
   */
  private sortPrizesByPriority(prizes: Prize[]): Prize[] {
    const strategy = this.config.globalStrategy?.priorityOrder || 'sequential';

    switch (strategy) {
      case 'random':
        return this.shuffleArray([...prizes]);
      
      case 'weighted':
        // Trier par priorité (plus haute en premier)
        return [...prizes].sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      case 'sequential':
      default:
        // Ordre défini dans la config
        return prizes;
    }
  }

  /**
   * Récupère le rang du participant
   */
  private async getParticipantRank(campaignId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('attribution_history')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId);

      return (count || 0) + 1; // Le prochain participant
    } catch (error) {
      console.error('❌ [GetRank] Error:', error);
      return 1;
    }
  }

  /**
   * Incrémente la quantité attribuée d'un lot
   */
  private async incrementAwardedQuantity(prizeId: string): Promise<void> {
    const prizeIndex = this.config.prizes.findIndex(p => p.id === prizeId);
    if (prizeIndex !== -1) {
      this.config.prizes[prizeIndex].awardedQuantity++;

      // Mettre à jour en base de données
      try {
        await supabase
          .from('dotation_configs')
          .update({ prizes: this.config.prizes })
          .eq('campaign_id', this.config.campaignId);
      } catch (error) {
        console.error('❌ [IncrementAwarded] Error:', error);
      }
    }
  }

  /**
   * Enregistre l'attribution dans l'historique
   */
  private async saveToHistory(context: AttributionContext, result: AttributionResult): Promise<void> {
    try {
      const historyEntry: Partial<AttributionHistory> = {
        campaign_id: context.campaignId,
        prize_id: result.prize?.id || '',
        participant_id: context.participantId,
        participant_email: context.participantEmail,
        result: result as any,
        ip_address: context.ipAddress,
        user_agent: context.userAgent,
        device_fingerprint: context.deviceFingerprint,
        created_at: context.timestamp
      };

      await supabase.from('attribution_history').insert(historyEntry);
    } catch (error) {
      console.error('❌ [SaveHistory] Error:', error);
    }
  }

  /**
   * Envoie les notifications
   */
  private async sendNotifications(result: AttributionResult): Promise<void> {
    if (!this.config.notifications) return;

    const { notifyAdminOnWin, notifyAdminOnExhaustion, adminEmail } = this.config.notifications;

    // Notification de gain
    if (notifyAdminOnWin && result.isWinner && adminEmail) {
      console.log(`📧 [Notification] Sending win notification to ${adminEmail}`);
      // TODO: Implémenter l'envoi d'email
    }

    // Notification d'épuisement
    if (notifyAdminOnExhaustion && result.prize) {
      const prize = result.prize;
      if (prize.awardedQuantity >= prize.totalQuantity && adminEmail) {
        console.log(`📧 [Notification] Sending exhaustion notification to ${adminEmail}`);
        // TODO: Implémenter l'envoi d'email
      }
    }
  }

  /**
   * Crée un résultat d'attribution
   */
  private createResult(
    isWinner: boolean,
    prize: Prize | null,
    reason: string,
    reasonCode: AttributionResult['reasonCode'],
    context: AttributionContext
  ): AttributionResult {
    return {
      isWinner,
      prize: prize || undefined,
      reason,
      reasonCode,
      timestamp: context.timestamp,
      metadata: {
        participantRank: context.participantRank
      }
    };
  }

  /**
   * Génère un nombre aléatoire cryptographiquement sûr (0-1)
   */
  private generateSecureRandom(): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }

  /**
   * Mélange un tableau (Fisher-Yates shuffle)
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.generateSecureRandom() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

/**
 * Fonction utilitaire pour créer une instance du moteur
 */
export async function createAttributionEngine(campaignId: string): Promise<PrizeAttributionEngine | null> {
  try {
    const { data, error } = await supabase
      .from('dotation_configs')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (error || !data) {
      console.error('❌ [CreateEngine] Config not found:', error);
      return null;
    }

    const config: DotationConfig = {
      campaignId: data.campaign_id,
      prizes: data.prizes,
      globalStrategy: data.global_strategy,
      antiFraud: data.anti_fraud,
      notifications: data.notifications
    };

    return new PrizeAttributionEngine(config);
  } catch (error) {
    console.error('❌ [CreateEngine] Error:', error);
    return null;
  }
}
