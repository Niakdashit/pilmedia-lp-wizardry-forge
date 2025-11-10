/**
 * Système d'Attribution des Lots
 * Basé sur les standards de l'industrie du gaming et des loteries en ligne
 */

/**
 * Méthodes d'attribution disponibles
 */
export type AttributionMethod = 
  | 'calendar'      // Attribution à une date/heure précise
  | 'probability'   // Attribution probabiliste (% de chance)
  | 'quota'         // Attribution par quota (X gagnants sur Y participants)
  | 'rank'          // Attribution par rang (Nième participant)
  | 'instant_win';  // Gain instantané garanti

/**
 * Configuration d'attribution par calendrier
 * Le lot est attribué à une date et heure précises
 */
export interface CalendarAttribution {
  method: 'calendar';
  /** Date et heure d'attribution (ISO 8601) */
  scheduledDate: string;
  /** Heure précise d'attribution (HH:mm) */
  scheduledTime: string;
  /** Fenêtre de temps en minutes (optionnel, défaut: 0 = instant précis) */
  timeWindow?: number;
  /** Fuseau horaire (défaut: UTC) */
  timezone?: string;
}

/**
 * Configuration d'attribution probabiliste
 * Le lot est attribué selon un pourcentage de chance
 */
export interface ProbabilityAttribution {
  method: 'probability';
  /** Pourcentage de chance de gagner (0-100) */
  winProbability: number;
  /** Nombre maximum de gagnants (optionnel) */
  maxWinners?: number;
  /** Distribution uniforme ou pondérée */
  distribution?: 'uniform' | 'weighted';
}

/**
 * Configuration d'attribution par quota
 * X gagnants sur Y participants
 */
export interface QuotaAttribution {
  method: 'quota';
  /** Nombre de gagnants */
  winnersCount: number;
  /** Nombre total de participants attendus */
  totalParticipants: number;
  /** Stratégie de sélection */
  selectionStrategy: 'random' | 'first' | 'last' | 'distributed';
}

/**
 * Configuration d'attribution par rang
 * Le Nième participant gagne
 */
export interface RankAttribution {
  method: 'rank';
  /** Rangs gagnants (ex: [10, 100, 1000]) */
  winningRanks: number[];
  /** Tolérance (±N participants) */
  tolerance?: number;
}

/**
 * Configuration de gain instantané
 * Gain garanti à chaque participation
 */
export interface InstantWinAttribution {
  method: 'instant_win';
  /** Tous les participants gagnent */
  guaranteed: true;
}

/**
 * Union de toutes les méthodes d'attribution
 */
export type AttributionConfig = 
  | CalendarAttribution 
  | ProbabilityAttribution 
  | QuotaAttribution 
  | RankAttribution 
  | InstantWinAttribution;

/**
 * Statut d'un lot
 */
export type PrizeStatus = 
  | 'active'      // Lot actif et disponible
  | 'exhausted'   // Lot épuisé (tous attribués)
  | 'scheduled'   // Lot programmé (pas encore actif)
  | 'expired'     // Lot expiré (date de fin dépassée)
  | 'paused';     // Lot mis en pause

/**
 * Configuration d'un lot
 */
export interface Prize {
  /** ID unique du lot */
  id: string;
  /** Nom du lot */
  name: string;
  /** Description du lot */
  description?: string;
  /** Valeur du lot (pour affichage) */
  value?: string;
  /** Image du lot */
  imageUrl?: string;
  /** Quantité totale disponible */
  totalQuantity: number;
  /** Quantité déjà attribuée */
  awardedQuantity: number;
  /** Quantité restante (calculée) */
  remainingQuantity?: number;
  /** Configuration d'attribution */
  attribution: AttributionConfig;
  /** Statut du lot */
  status: PrizeStatus;
  /** Date de début de disponibilité */
  startDate?: string;
  /** Date de fin de disponibilité */
  endDate?: string;
  /** Priorité (pour l'ordre d'affichage) */
  priority?: number;
  /** IDs des segments de roue assignés à ce lot (pour Wheel of Fortune) */
  assignedSegments?: string[];
  /** Métadonnées additionnelles */
  metadata?: Record<string, any>;
}

/**
 * Configuration de dotation pour une campagne
 */
export interface DotationConfig {
  /** ID de la campagne */
  campaignId: string;
  /** Liste des lots */
  prizes: Prize[];
  /** Stratégie globale de distribution */
  globalStrategy?: {
    /** Ordre de priorité des lots */
    priorityOrder: 'sequential' | 'random' | 'weighted';
    /** Permettre plusieurs gains par participant */
    allowMultipleWins?: boolean;
    /** Délai minimum entre deux gains (en secondes) */
    minDelayBetweenWins?: number;
  };
  /** Paramètres anti-fraude */
  antiFraud?: {
    /** Limiter les gains par IP */
    maxWinsPerIP?: number;
    /** Limiter les gains par email */
    maxWinsPerEmail?: number;
    /** Limiter les gains par appareil */
    maxWinsPerDevice?: number;
    /** Période de vérification (en heures) */
    verificationPeriod?: number;
  };
  /** Notifications */
  notifications?: {
    /** Notifier l'admin quand un lot est gagné */
    notifyAdminOnWin?: boolean;
    /** Notifier l'admin quand un lot est épuisé */
    notifyAdminOnExhaustion?: boolean;
    /** Email de notification */
    adminEmail?: string;
  };
  /** Date de création */
  createdAt?: string;
  /** Date de dernière modification */
  updatedAt?: string;
}

/**
 * Résultat d'une tentative d'attribution
 */
export interface AttributionResult {
  /** Le participant a-t-il gagné ? */
  isWinner: boolean;
  /** Lot gagné (si isWinner = true) */
  prize?: Prize;
  /** Raison du résultat */
  reason: string;
  /** Code de raison (pour logging) */
  reasonCode: 
    | 'WIN_CALENDAR'          // Gagné via calendrier
    | 'WIN_PROBABILITY'       // Gagné via probabilité
    | 'WIN_QUOTA'             // Gagné via quota
    | 'WIN_RANK'              // Gagné via rang
    | 'WIN_INSTANT'           // Gain instantané
    | 'LOSE_NO_MATCH'         // Perdu: aucune condition remplie
    | 'LOSE_EXHAUSTED'        // Perdu: lot épuisé
    | 'LOSE_EXPIRED'          // Perdu: lot expiré
    | 'LOSE_NOT_SCHEDULED'    // Perdu: lot pas encore actif
    | 'LOSE_PROBABILITY'      // Perdu: probabilité non atteinte
    | 'LOSE_QUOTA_FULL'       // Perdu: quota atteint
    | 'LOSE_WRONG_RANK'       // Perdu: mauvais rang
    | 'ERROR_FRAUD_DETECTED'  // Erreur: fraude détectée
    | 'ERROR_SYSTEM';         // Erreur système
  /** Timestamp de l'attribution */
  timestamp: string;
  /** Métadonnées additionnelles */
  metadata?: Record<string, any>;
}

/**
 * Historique d'attribution
 */
export interface AttributionHistory {
  /** ID unique */
  id: string;
  /** ID de la campagne */
  campaignId: string;
  /** ID du lot */
  prizeId: string;
  /** ID du participant */
  participantId: string;
  /** Email du participant */
  participantEmail?: string;
  /** Résultat de l'attribution */
  result: AttributionResult;
  /** IP du participant */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Device fingerprint */
  deviceFingerprint?: string;
  /** Date de création */
  createdAt: string;
}

/**
 * Statistiques de dotation
 */
export interface DotationStats {
  /** ID de la campagne */
  campaignId: string;
  /** Nombre total de lots */
  totalPrizes: number;
  /** Nombre total de lots disponibles */
  totalQuantity: number;
  /** Nombre total de lots attribués */
  totalAwarded: number;
  /** Nombre total de lots restants */
  totalRemaining: number;
  /** Taux d'attribution global (%) */
  attributionRate: number;
  /** Nombre total de participants */
  totalParticipants: number;
  /** Nombre total de gagnants */
  totalWinners: number;
  /** Taux de gain (%) */
  winRate: number;
  /** Statistiques par lot */
  prizeStats: Array<{
    prizeId: string;
    prizeName: string;
    awarded: number;
    remaining: number;
    attributionRate: number;
  }>;
  /** Dernière mise à jour */
  lastUpdated: string;
}
