import { TimedPrize } from '@/pages/CampaignSettings/DotationStep';

/**
 * Service pour gérer la logique de double mécanique (perdante/gagnante)
 * 
 * Principe:
 * - Par défaut, tous les participants tombent sur une mécanique 100% perdante
 * - Si un lot est programmé à une date/heure précise, seul le premier participant
 *   qui joue exactement à ce moment gagne
 * - Après l'attribution du lot, la mécanique perdante reprend
 */

export interface DoubleMechanicResult {
  isWinningMechanic: boolean;
  prizeId?: string;
  prizeName?: string;
  prizeDescription?: string;
  reason: 'default_losing' | 'timed_prize_match' | 'timed_prize_already_claimed' | 'no_active_prizes';
}

/**
 * Vérifie si le participant actuel doit tomber sur la mécanique gagnante
 * @param timedPrizes Liste des lots programmés
 * @param claimedPrizeIds Liste des IDs de lots déjà réclamés
 * @returns Résultat indiquant quelle mécanique utiliser
 */
export function checkDoubleMechanic(
  timedPrizes: TimedPrize[] = [],
  claimedPrizeIds: string[] = []
): DoubleMechanicResult {
  // Si aucun lot programmé, toujours perdant
  if (!timedPrizes || timedPrizes.length === 0) {
    return {
      isWinningMechanic: false,
      reason: 'no_active_prizes'
    };
  }

  // Filtrer les lots actifs uniquement
  const activePrizes = timedPrizes.filter(p => p.enabled && p.date && p.time);

  if (activePrizes.length === 0) {
    return {
      isWinningMechanic: false,
      reason: 'no_active_prizes'
    };
  }

  // Date et heure actuelles
  const now = new Date();
  const currentDate = formatDate(now);
  const currentTime = formatTime(now);

  console.log('🎯 [DoubleMechanic] Checking at:', { currentDate, currentTime });

  // Chercher un lot qui correspond à la date/heure actuelle
  for (const prize of activePrizes) {
    // Vérifier si le lot a déjà été réclamé
    if (claimedPrizeIds.includes(prize.id)) {
      console.log('⏭️ [DoubleMechanic] Prize already claimed:', prize.id);
      continue;
    }

    // Vérifier si la date et l'heure correspondent exactement
    if (prize.date === currentDate && prize.time === currentTime) {
      console.log('🎉 [DoubleMechanic] WINNING MECHANIC! Prize match:', {
        prizeId: prize.id,
        prizeName: prize.name,
        scheduledFor: `${prize.date} ${prize.time}`
      });

      return {
        isWinningMechanic: true,
        prizeId: prize.id,
        prizeName: prize.name,
        prizeDescription: prize.description,
        reason: 'timed_prize_match'
      };
    }
  }

  // Aucun lot ne correspond à l'heure actuelle
  console.log('❌ [DoubleMechanic] No prize match, using losing mechanic');
  return {
    isWinningMechanic: false,
    reason: 'default_losing'
  };
}

/**
 * Formate une date au format YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formate une heure au format HH:mm
 */
function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Marque un lot comme réclamé dans le localStorage
 * @param campaignId ID de la campagne
 * @param prizeId ID du lot réclamé
 */
export function markPrizeAsClaimed(campaignId: string, prizeId: string): void {
  try {
    const key = `campaign_${campaignId}_claimed_prizes`;
    const existing = localStorage.getItem(key);
    const claimed: string[] = existing ? JSON.parse(existing) : [];
    
    if (!claimed.includes(prizeId)) {
      claimed.push(prizeId);
      localStorage.setItem(key, JSON.stringify(claimed));
      console.log('✅ [DoubleMechanic] Prize marked as claimed:', prizeId);
    }
  } catch (error) {
    console.error('❌ [DoubleMechanic] Error marking prize as claimed:', error);
  }
}

/**
 * Récupère la liste des lots déjà réclamés pour une campagne
 * @param campaignId ID de la campagne
 * @returns Liste des IDs de lots réclamés
 */
export function getClaimedPrizes(campaignId: string): string[] {
  try {
    const key = `campaign_${campaignId}_claimed_prizes`;
    const existing = localStorage.getItem(key);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('❌ [DoubleMechanic] Error getting claimed prizes:', error);
    return [];
  }
}

/**
 * Réinitialise les lots réclamés (pour tests uniquement)
 * @param campaignId ID de la campagne
 */
export function resetClaimedPrizes(campaignId: string): void {
  try {
    const key = `campaign_${campaignId}_claimed_prizes`;
    localStorage.removeItem(key);
    console.log('🔄 [DoubleMechanic] Claimed prizes reset for campaign:', campaignId);
  } catch (error) {
    console.error('❌ [DoubleMechanic] Error resetting claimed prizes:', error);
  }
}
