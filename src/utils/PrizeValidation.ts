/**
 * Utilitaires de validation et normalisation pour le système de lots
 * Fonctions pures et réutilisables pour la validation des données
 */

import type { Prize, PrizeMethod } from '../types/PrizeSystem';

export class PrizeValidation {
  
  /**
   * Valide un lot individual
   */
  static validatePrize(prize: Prize): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation des champs requis
    if (!prize.id || typeof prize.id !== 'string') {
      errors.push('ID requis et doit être une chaîne');
    }

    if (!prize.name || typeof prize.name !== 'string' || prize.name.trim().length === 0) {
      errors.push('Nom requis et non vide');
    }

    if (typeof prize.totalUnits !== 'number' || prize.totalUnits < 0) {
      errors.push('Le nombre total d\'unités doit être un nombre positif');
    }

    if (typeof prize.awardedUnits !== 'number' || prize.awardedUnits < 0) {
      errors.push('Le nombre d\'unités attribuées doit être un nombre positif');
    }

    if (prize.awardedUnits > prize.totalUnits) {
      errors.push('Le nombre d\'unités attribuées ne peut pas dépasser le total');
    }

    // Validation de la méthode
    if (!this.isValidMethod(prize.method)) {
      errors.push('Méthode invalide (doit être probability, calendar ou immediate)');
    }

    // Validation spécifique selon la méthode
    if (prize.method === 'probability' || prize.method === 'immediate') {
      if (typeof prize.probabilityPercent !== 'number' || 
          prize.probabilityPercent < 0 || 
          prize.probabilityPercent > 100) {
        errors.push('Le pourcentage de probabilité doit être entre 0 et 100');
      }
    }

    if (prize.method === 'calendar') {
      const dateValidation = this.validateCalendarDates(prize);
      errors.push(...dateValidation.errors);
    }

    // Validation de l'URL d'image
    if (prize.imageUrl && !this.isValidUrl(prize.imageUrl)) {
      errors.push('URL d\'image invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide un ensemble de lots
   */
  static validatePrizeCollection(prizes: Prize[]): { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[] 
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifier les IDs uniques
    const ids = prizes.map(p => p.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push('Les IDs des lots doivent être uniques');
    }

    // Vérifier la cohérence des probabilités
    const probabilityPrizes = prizes.filter(p => 
      p.method === 'probability' || p.method === 'immediate'
    );
    
    let totalProbability = 0;
    probabilityPrizes.forEach(prize => {
      const percent = prize.probabilityPercent || 0;
      totalProbability += percent;
    });

    if (totalProbability > 100) {
      warnings.push(`La somme des probabilités (${totalProbability}%) dépasse 100%`);
    }

    // Validation individuelle
    prizes.forEach((prize, index) => {
      const validation = this.validatePrize(prize);
      if (!validation.isValid) {
        errors.push(`Lot ${index + 1} (${prize.name}): ${validation.errors.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valide les dates d'un lot calendrier
   */
  private static validateCalendarDates(prize: Prize): { errors: string[] } {
    const errors: string[] = [];

    if (!prize.startDate) {
      errors.push('Date de début requise pour les lots calendrier');
    }

    if (!prize.startTime) {
      errors.push('Heure de début requise pour les lots calendrier');
    }

    if (prize.startDate && !this.isValidDate(prize.startDate)) {
      errors.push('Date de début invalide (format YYYY-MM-DD requis)');
    }

    if (prize.startTime && !this.isValidTime(prize.startTime)) {
      errors.push('Heure de début invalide (format HH:MM requis)');
    }

    if (prize.endDate && !this.isValidDate(prize.endDate)) {
      errors.push('Date de fin invalide (format YYYY-MM-DD requis)');
    }

    if (prize.endTime && !this.isValidTime(prize.endTime)) {
      errors.push('Heure de fin invalide (format HH:MM requis)');
    }

    // Vérifier la cohérence des dates/heures
    if (prize.startDate && prize.endDate && prize.startTime && prize.endTime) {
      const start = new Date(`${prize.startDate}T${prize.startTime}`);
      const end = new Date(`${prize.endDate}T${prize.endTime}`);
      
      if (end <= start) {
        errors.push('La date/heure de fin doit être postérieure au début');
      }
    }

    return { errors };
  }

  /**
   * Normalise un lot (nettoie et standardise les données)
   */
  static normalizePrize(prize: Partial<Prize>): Prize {
    return {
      id: prize.id || `prize_${Date.now()}`,
      name: (prize.name || '').trim() || 'Lot sans nom',
      totalUnits: Math.max(0, Math.floor(prize.totalUnits || 1)),
      awardedUnits: Math.max(0, Math.floor(prize.awardedUnits || 0)),
      method: this.normalizeMethod(prize.method),
      probabilityPercent: this.normalizeProbabilityPercent(prize.probabilityPercent, prize.method),
      startDate: prize.startDate,
      endDate: prize.endDate,
      startTime: prize.startTime,
      endTime: prize.endTime,
      imageUrl: prize.imageUrl
    };
  }

  /**
   * Normalise une méthode de lot
   */
  private static normalizeMethod(method: any): PrizeMethod {
    if (typeof method !== 'string') return 'probability';
    
    const normalized = method.toLowerCase().trim();
    if (['probability', 'probabilite', 'probabilité'].includes(normalized)) return 'probability';
    if (['calendar', 'calendrier'].includes(normalized)) return 'calendar';
    if (['immediate', 'immédiat', 'immediat'].includes(normalized)) return 'immediate';
    
    return 'probability';
  }

  /**
   * Normalise un pourcentage de probabilité
   */
  private static normalizeProbabilityPercent(percent: any, method: any): number | undefined {
    const normalizedMethod = this.normalizeMethod(method);
    
    if (normalizedMethod !== 'probability' && normalizedMethod !== 'immediate') {
      return undefined;
    }

    if (typeof percent !== 'number') {
      return 100; // Valeur par défaut
    }

    return Math.max(0, Math.min(100, percent));
  }

  /**
   * Vérifie si une méthode est valide
   */
  private static isValidMethod(method: any): boolean {
    return ['probability', 'calendar', 'immediate'].includes(method);
  }

  /**
   * Vérifie si une date est valide (format YYYY-MM-DD)
   */
  private static isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Vérifie si une heure est valide (format HH:MM)
   */
  private static isValidTime(timeString: string): boolean {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(timeString);
  }

  /**
   * Vérifie si une URL est valide
   */
  private static isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Sanitise une chaîne de caractères
   */
  static sanitizeString(input: any): string {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Vérifie si un lot est actuellement actif (pour les lots calendrier)
   */
  static isPrizeActive(prize: Prize, currentDate: Date = new Date()): boolean {
    if (prize.method !== 'calendar') return true;
    if (!prize.startDate || !prize.startTime) return false;

    try {
      const start = new Date(`${prize.startDate}T${prize.startTime}`);
      const end = prize.endDate && prize.endTime 
        ? new Date(`${prize.endDate}T${prize.endTime}`)
        : new Date(start.getTime() + 60000); // 1 minute par défaut

      const isActive = currentDate >= start && currentDate <= end;
      
      console.log(`📅 Calendar prize activity check: ${prize.name}`, {
        startDate: prize.startDate,
        startTime: prize.startTime,
        endDate: prize.endDate,
        endTime: prize.endTime,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        currentDateTime: currentDate.toISOString(),
        isActive,
        timeUntilStart: start.getTime() - currentDate.getTime(),
        timeUntilEnd: end.getTime() - currentDate.getTime()
      });

      return isActive;
    } catch (error) {
      console.error(`❌ Error checking calendar prize ${prize.name}:`, error);
      return false;
    }
  }

  /**
   * Vérifie si un lot est disponible (non épuisé)
   */
  static isPrizeAvailable(prize: Prize): boolean {
    return prize.totalUnits - prize.awardedUnits > 0;
  }

  /**
   * Vérifie si on est EXACTEMENT à la date/heure programmée pour un lot calendrier
   * (avec une tolérance de 1 minute avant et après)
   */
  static isExactCalendarMoment(prize: Prize, currentDate: Date = new Date()): boolean {
    if (prize.method !== 'calendar') return false;
    if (!prize.startDate || !prize.startTime) return false;

    try {
      const targetMoment = new Date(`${prize.startDate}T${prize.startTime}`);
      const timeDiff = Math.abs(currentDate.getTime() - targetMoment.getTime());
      const toleranceMs = 60000; // 1 minute de tolérance
      
      const isExactMoment = timeDiff <= toleranceMs;
      
      console.log(`🎯 Exact calendar moment check: ${prize.name}`, {
        targetDate: prize.startDate,
        targetTime: prize.startTime,
        targetMoment: targetMoment.toISOString(),
        currentMoment: currentDate.toISOString(),
        timeDiffMs: timeDiff,
        timeDiffSeconds: Math.round(timeDiff / 1000),
        toleranceSeconds: toleranceMs / 1000,
        isExactMoment
      });

      return isExactMoment;
    } catch (error) {
      console.error(`❌ Error checking exact calendar moment for ${prize.name}:`, error);
      return false;
    }
  }
}