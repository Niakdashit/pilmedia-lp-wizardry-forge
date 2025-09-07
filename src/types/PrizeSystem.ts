/**
 * Types stricts pour le système de lots et segments
 * Centralise toutes les définitions de types pour éviter la duplication
 */

export type PrizeMethod = 'probability' | 'calendar' | 'immediate';

export interface Prize {
  id: string;
  name: string;
  totalUnits: number;
  awardedUnits: number;
  imageUrl?: string;
  method: PrizeMethod;
  
  // Propriétés spécifiques à la méthode probabilité
  probabilityPercent?: number; // 0-100
  
  // Propriétés spécifiques à la méthode calendaire  
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:MM
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  
  // Propriétés pour état et gestion
  isActive?: boolean;
  remainingQuantity?: number;
  probability?: number; // Alias pour probabilityPercent
  
  // Compatibility properties
  description?: string;
  attributionMethod?: 'calendar' | 'probability';
  calendarDate?: string;
  calendarTime?: string;
  segmentId?: string;
}

export interface WheelSegment {
  id: string;
  label: string;
  value: string;
  color: string;
  textColor: string;
  prizeId?: string;
  imageUrl?: string;
  probability: number; // Probabilité calculée (0-100) - required
  isWinning?: boolean;  // Déterminé par la présence d'un lot valide
}

export interface ProbabilityCalculationResult {
  segments: WheelSegment[];
  totalProbability: number;
  hasGuaranteedWin: boolean; // true si un lot a 100%
  residualProbability: number; // probabilité non assignée
  errors: string[];
}

export interface PrizeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalProbability: number;
}

export interface SegmentPrizeMapping {
  segmentId: string;
  prizeId?: string;
  computedProbability: number;
  isAvailable: boolean;
  reason?: string; // Raison si non disponible
}

// Types pour la configuration de campagne (compatibilité)
export interface CampaignSegment {
  id?: string;
  label?: string;
  color?: string;
  textColor?: string;
  prizeId?: string | { _type: string; value: string };
  manualProbabilityPercent?: number; // Manuel pour segments sans lot (0-100)
  imageUrl?: string;
  image?: string;
}

export interface CampaignConfig {
  id?: string;
  prizes?: Prize[];
  gameConfig?: {
    wheel?: {
      segments?: CampaignSegment[];
    };
  };
  config?: {
    roulette?: {
      segments?: CampaignSegment[];
    };
  };
  _lastUpdate?: number; // Pour invalider le cache
}