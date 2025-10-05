import { Prize } from '../state/types';

/**
 * Détermine si un joueur doit gagner un lot basé sur les critères d'attribution
 * @param prizes - Liste des lots configurés
 * @param currentDateTime - Date et heure actuelles (optionnel, utilise Date.now() par défaut)
 * @returns true si le joueur doit gagner, false sinon
 */
export function shouldPlayerWin(prizes: Prize[], currentDateTime?: Date): boolean {
  if (!prizes || prizes.length === 0) {
    return false; // Aucun lot configuré = toujours perdant
  }

  const now = currentDateTime || new Date();

  for (const prize of prizes) {
    // Vérification de la méthode probabilité
    if (prize.attributionMethod === 'probability' && prize.probability) {
      const randomValue = Math.random() * 100; // 0-100
      if (randomValue <= prize.probability) {
        console.log(`🎯 Prize "${prize.name}" won by probability: ${randomValue.toFixed(2)}% <= ${prize.probability}%`);
        return true;
      }
    }

    // Vérification de la méthode calendrier
    if (prize.attributionMethod === 'calendar' && prize.calendarDate && prize.calendarTime) {
      const targetDateTime = new Date(`${prize.calendarDate}T${prize.calendarTime}`);
      
      // Vérifier si c'est exactement la date et l'heure (avec une tolérance de 1 minute)
      const timeDifference = Math.abs(now.getTime() - targetDateTime.getTime());
      const oneMinuteInMs = 60 * 1000;
      
      if (timeDifference <= oneMinuteInMs) {
        console.log(`🎯 Prize "${prize.name}" won by calendar: ${now.toISOString()} matches ${targetDateTime.toISOString()}`);
        return true;
      }
    }
  }

  console.log('🎯 No prize conditions met - player loses');
  return false;
}

/**
 * Obtient le lot gagné (le premier qui correspond aux critères)
 * @param prizes - Liste des lots configurés
 * @param currentDateTime - Date et heure actuelles (optionnel)
 * @returns Le lot gagné ou null
 */
export function getWonPrize(prizes: Prize[], currentDateTime?: Date): Prize | null {
  if (!prizes || prizes.length === 0) {
    return null;
  }

  const now = currentDateTime || new Date();

  for (const prize of prizes) {
    // Vérification de la méthode probabilité
    if (prize.attributionMethod === 'probability' && prize.probability) {
      const randomValue = Math.random() * 100;
      if (randomValue <= prize.probability) {
        return prize;
      }
    }

    // Vérification de la méthode calendrier
    if (prize.attributionMethod === 'calendar' && prize.calendarDate && prize.calendarTime) {
      const targetDateTime = new Date(`${prize.calendarDate}T${prize.calendarTime}`);
      const timeDifference = Math.abs(now.getTime() - targetDateTime.getTime());
      const oneMinuteInMs = 60 * 1000;
      
      if (timeDifference <= oneMinuteInMs) {
        return prize;
      }
    }
  }

  return null;
}
