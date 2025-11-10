import { TimedPrize } from '@/pages/CampaignSettings/DotationStep';

/**
 * Service pour gérer la logique de double mécanique hybride
 * 
 * Principe:
 * - Probabilité de base configurable (ex: 10%) pour tous les participants
 * - Lots programmés avec fenêtres temporelles où la probabilité passe à 100%
 * - Durant la fenêtre, le premier participant gagne le lot programmé
 * - Après attribution ou fin de fenêtre, retour à la probabilité de base
 */

export interface DoubleMechanicResult {
  shouldWin: boolean;
  isTimedPrize: boolean; // true si c'est un lot programmé, false si c'est la probabilité de base
  prizeId?: string;
  prizeName?: string;
  prizeDescription?: string;
  reason: 'base_probability_win' | 'base_probability_lose' | 'timed_prize_match' | 'timed_prize_already_claimed' | 'no_timed_prizes' | 'outside_window';
}

/**
 * Vérifie si le participant actuel doit gagner avec le système hybride
 * @param timedPrizes Liste des lots programmés avec fenêtres temporelles
 * @param claimedPrizeIds Liste des IDs de lots déjà réclamés
 * @param baseProbability Probabilité de base (0-100)
 * @returns Résultat indiquant si le joueur gagne et pourquoi
 */
export function checkDoubleMechanic(
  timedPrizes: TimedPrize[] = [],
  claimedPrizeIds: string[] = [],
  baseProbability: number = 10
): DoubleMechanicResult {
  const now = new Date();
  const currentDate = formatDate(now);
  const currentTime = now.getTime();

  console.log('🎯 [DoubleMechanic] Checking at:', { currentDate, time: formatTime(now), baseProbability });

  // 1. Vérifier si on est dans une fenêtre temporelle d'un lot programmé
  if (timedPrizes && timedPrizes.length > 0) {
    const activePrizes = timedPrizes.filter(p => p.enabled && p.date && p.time && p.name);

    for (const prize of activePrizes) {
      // Vérifier si le lot a déjà été réclamé
      if (claimedPrizeIds.includes(prize.id)) {
        console.log('⏭️ [DoubleMechanic] Prize already claimed:', prize.id);
        continue;
      }

      // Vérifier si on est dans la fenêtre temporelle
      if (prize.date === currentDate) {
        const [prizeHour, prizeMinute] = prize.time.split(':').map(Number);
        const prizeStartTime = new Date(now);
        prizeStartTime.setHours(prizeHour, prizeMinute, 0, 0);
        
        const windowDuration = prize.windowDuration || 5; // 5 minutes par défaut
        const prizeEndTime = new Date(prizeStartTime.getTime() + windowDuration * 60 * 1000);

        // On est dans la fenêtre !
        if (currentTime >= prizeStartTime.getTime() && currentTime <= prizeEndTime.getTime()) {
          console.log('🎉 [DoubleMechanic] TIMED PRIZE WINDOW! Winner guaranteed:', {
            prizeId: prize.id,
            prizeName: prize.name,
            window: `${prize.time} -> ${formatTime(prizeEndTime)}`,
            currentTime: formatTime(now)
          });

          return {
            shouldWin: true,
            isTimedPrize: true,
            prizeId: prize.id,
            prizeName: prize.name,
            prizeDescription: prize.description,
            reason: 'timed_prize_match'
          };
        }
      }
    }
  }

  // 2. Aucune fenêtre active, utiliser la probabilité de base
  const randomValue = Math.random() * 100;
  const wins = randomValue <= baseProbability;

  if (wins) {
    console.log(`✅ [DoubleMechanic] Base probability WIN: ${randomValue.toFixed(2)}% <= ${baseProbability}%`);
    return {
      shouldWin: true,
      isTimedPrize: false,
      reason: 'base_probability_win'
    };
  } else {
    console.log(`❌ [DoubleMechanic] Base probability LOSE: ${randomValue.toFixed(2)}% > ${baseProbability}%`);
    return {
      shouldWin: false,
      isTimedPrize: false,
      reason: 'base_probability_lose'
    };
  }
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
