/**
 * Utilitaires pour l'attribution des lots
 * Fonctions communes utilisées par tous les jeux
 */

import { createAttributionEngine } from '@/services/PrizeAttributionEngine';
import type { Prize, AttributionResult } from '@/types/dotation';

/**
 * Récupère l'email du participant depuis le localStorage
 */
export const getUserEmail = (): string => {
  return localStorage.getItem('participant_email') || '';
};

/**
 * Récupère l'IP du participant via API externe
 */
export const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return '';
  }
};

/**
 * Génère une empreinte unique de l'appareil
 */
export const getDeviceFingerprint = (): string => {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const platform = navigator.platform;
  
  const fingerprint = `${ua}-${screen}-${language}-${timezone}-${platform}`;
  return btoa(fingerprint);
};

/**
 * Sauvegarde l'email du participant
 */
export const saveUserEmail = (email: string): void => {
  localStorage.setItem('participant_email', email);
};

/**
 * Efface les données du participant
 */
export const clearUserData = (): void => {
  localStorage.removeItem('participant_email');
};

/**
 * Fonction principale d'attribution de lot
 * Utilisée par tous les jeux
 */
export const attributePrizeForGame = async (
  campaignId: string,
  gameType: 'wheel' | 'jackpot' | 'scratch'
): Promise<AttributionResult | null> => {
  console.log(`🎯 [${gameType}] Starting prize attribution`);

  try {
    // 1. Créer le moteur d'attribution
    const engine = await createAttributionEngine(campaignId);
    
    if (!engine) {
      console.warn(`⚠️ [${gameType}] No dotation config found`);
      return null;
    }

    // 2. Récupérer les infos du participant
    const participantEmail = getUserEmail();
    if (!participantEmail) {
      console.warn(`⚠️ [${gameType}] No participant email found`);
      return null;
    }

    const ipAddress = await getUserIP();
    const deviceFingerprint = getDeviceFingerprint();

    // 3. Appeler le moteur d'attribution
    const result = await engine.attributePrize({
      campaignId,
      participantEmail,
      ipAddress,
      userAgent: navigator.userAgent,
      deviceFingerprint,
      timestamp: new Date().toISOString()
    });

    // 4. Logger le résultat
    if (result.isWinner) {
      console.log(`🎉 [${gameType}] Winner!`, result.prize);
    } else {
      console.log(`❌ [${gameType}] No prize:`, result.reason);
    }

    return result;

  } catch (error) {
    console.error(`❌ [${gameType}] Attribution error:`, error);
    return null;
  }
};

/**
 * Vérifie si une config de dotation existe pour une campagne
 */
export const hasDotationConfig = async (campaignId: string): Promise<boolean> => {
  try {
    const engine = await createAttributionEngine(campaignId);
    return engine !== null;
  } catch {
    return false;
  }
};

/**
 * Récupère les statistiques de dotation d'une campagne
 * Note: Les types TypeScript seront disponibles après régénération des types Supabase
 */
export const getDotationStats = async (campaignId: string) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await (supabase as any)
      .from('dotation_stats')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching dotation stats:', error);
    return null;
  }
};

/**
 * Récupère l'historique des attributions pour un participant
 * Note: Les types TypeScript seront disponibles après régénération des types Supabase
 */
export const getParticipantHistory = async (
  campaignId: string,
  participantEmail: string
) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await (supabase as any)
      .from('attribution_history')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('participant_email', participantEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching participant history:', error);
    return [];
  }
};

/**
 * Vérifie si un participant a déjà gagné
 */
export const hasParticipantWon = async (
  campaignId: string,
  participantEmail: string
): Promise<boolean> => {
  const history = await getParticipantHistory(campaignId, participantEmail);
  return history.some((entry: any) => entry.result?.isWinner === true);
};

/**
 * Formate un prix pour l'affichage
 */
export const formatPrize = (prize: Prize): string => {
  let text = prize.name;
  if (prize.value) {
    text += ` (${prize.value})`;
  }
  return text;
};

/**
 * Génère un message de félicitations personnalisé
 */
export const getWinMessage = (prize: Prize): string => {
  const messages = [
    `🎉 Félicitations ! Vous avez gagné ${prize.name} !`,
    `🎊 Bravo ! ${prize.name} est à vous !`,
    `✨ Incroyable ! Vous remportez ${prize.name} !`,
    `🏆 Victoire ! ${prize.name} vous attend !`,
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Génère un message de perte encourageant
 */
export const getLoseMessage = (): string => {
  const messages = [
    "Dommage ! Tentez votre chance une prochaine fois.",
    "Ce n'est pas pour cette fois, mais ne perdez pas espoir !",
    "Presque ! Revenez bientôt pour retenter votre chance.",
    "Pas de chance aujourd'hui, mais la roue tourne toujours !",
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Déclenche des confettis (si bibliothèque disponible)
 */
export const triggerConfetti = () => {
  // Si vous utilisez une bibliothèque de confettis comme canvas-confetti
  if (typeof window !== 'undefined' && (window as any).confetti) {
    (window as any).confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
};

/**
 * Enregistre un événement d'attribution dans Google Analytics (si disponible)
 */
export const trackPrizeAttribution = (
  gameType: string,
  isWinner: boolean,
  prizeName?: string
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'prize_attribution', {
      game_type: gameType,
      is_winner: isWinner,
      prize_name: prizeName || 'none',
    });
  }
};
