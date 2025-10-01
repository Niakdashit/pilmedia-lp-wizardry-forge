/**
 * Gestionnaire centralisé des segments de roue
 * Responsable de la standardisation, couleurs, et cohérence visuelle
 */

import type { WheelSegment, CampaignConfig, CampaignSegment } from '../types/PrizeSystem';
import { ProbabilityEngine } from './ProbabilityEngine';

export class SegmentManager {
  
  /**
   * Point d'entrée principal : génère les segments finaux avec probabilités et styles
   */
  static generateFinalSegments(campaign: CampaignConfig): WheelSegment[] {
    // 1. Extraire les segments bruts
    const rawSegments = this.extractRawSegments(campaign);
    
    if (rawSegments.length === 0) {
      return [];
    }

    // 2. Calculer les probabilités
    const probabilityResult = ProbabilityEngine.calculateSegmentProbabilities(
      rawSegments, 
      campaign.prizes || []
    );

    // 3. Appliquer la standardisation visuelle
    return this.applyVisualStandardization(probabilityResult.segments, campaign);
  }

  /**
   * Extrait les segments depuis les différentes sources possibles
   */
  private static extractRawSegments(campaign: CampaignConfig): CampaignSegment[] {
    // Prioriser wheelConfig.segments (GameManagementPanel) puis gameConfig.wheel.segments puis config.roulette.segments
    const segments = 
      (campaign as any)?.wheelConfig?.segments || 
      campaign?.gameConfig?.wheel?.segments || 
      campaign?.config?.roulette?.segments || 
      [];

    return Array.isArray(segments) ? segments : [];
  }

  /**
   * Applique la standardisation visuelle (couleurs alternées, lisibilité)
   */
  private static applyVisualStandardization(
    segments: WheelSegment[], 
    campaign: CampaignConfig
  ): WheelSegment[] {
    if (segments.length === 0) return [];

    // Extraire les couleurs du design
    const colors = this.extractDesignColors(campaign);
    
    // Assurer un nombre pair pour l'alternance parfaite
    let workingSegments = [...segments];
    if (workingSegments.length % 2 === 1) {
      // Ajouter un segment neutre
      workingSegments.push({
        id: 'auto-spacer',
        label: '',
        value: '',
        color: colors.secondary,
        textColor: colors.primary,
        probability: 0,
        isWinning: false
      });
    }

    // Appliquer l'alternance de couleurs
    return workingSegments.map((segment, index) => ({
      ...segment,
      color: index % 2 === 0 ? colors.primary : colors.secondary,
      textColor: this.getReadableTextColor(index % 2 === 0 ? colors.primary : colors.secondary),
      id: segment.id || `segment-${index + 1}`
    }));
  }

  /**
   * Extrait les couleurs du design de campagne
   */
  private static extractDesignColors(_campaign: CampaignConfig): { primary: string; secondary: string } {
    // Logique simplifiée pour extraire les couleurs
    const primary = '#841b60'; // Couleur par défaut
    const secondary = '#ffffff';

    return { primary, secondary };
  }

  /**
   * Détermine la couleur de texte lisible selon la luminance du fond
   */
  private static getReadableTextColor(backgroundColor: string): string {
    // Calculer la luminance et retourner noir ou blanc
    const luminance = this.calculateLuminance(backgroundColor);
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  /**
   * Calcule la luminance d'une couleur hexadécimale
   */
  private static calculateLuminance(hex: string): number {
    // Nettoyer le hex
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

    // Calculer la luminance relative
    const sRGB = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  /**
   * Met à jour un segment spécifique (pour les modifications en live)
   */
  static updateSegment(
    segments: WheelSegment[], 
    segmentId: string, 
    updates: Partial<WheelSegment>
  ): WheelSegment[] {
    return segments.map(segment => 
      segment.id === segmentId 
        ? { ...segment, ...updates }
        : segment
    );
  }

  /**
   * Ajoute un nouveau segment
   */
  static addSegment(segments: WheelSegment[], newSegment: Partial<WheelSegment>): WheelSegment[] {
    const id = newSegment.id || `segment-${Date.now()}`;
    const segment: WheelSegment = {
      id,
      label: newSegment.label || `Segment ${segments.length + 1}`,
      value: newSegment.label || `Segment ${segments.length + 1}`,
      color: newSegment.color || '#ff6b6b',
      textColor: newSegment.textColor || '#ffffff',
      probability: newSegment.probability || 0,
      isWinning: newSegment.isWinning || false,
      prizeId: newSegment.prizeId,
      imageUrl: newSegment.imageUrl
    };

    return [...segments, segment];
  }

  /**
   * Supprime un segment
   */
  static removeSegment(segments: WheelSegment[], segmentId: string): WheelSegment[] {
    return segments.filter(segment => segment.id !== segmentId);
  }

  /**
   * Valide la cohérence des segments
   */
  static validateSegments(segments: WheelSegment[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (segments.length === 0) {
      errors.push('Aucun segment défini');
    }

    if (segments.length < 2) {
      errors.push('Au moins 2 segments sont nécessaires');
    }

    // Vérifier les IDs uniques
    const ids = segments.map(s => s.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push('Les IDs des segments doivent être uniques');
    }

    // Vérifier les probabilités
    const totalProbability = segments.reduce((sum, s) => sum + s.probability, 0);
    if (Math.abs(totalProbability - 100) > 0.01) {
      errors.push(`La somme des probabilités (${totalProbability.toFixed(2)}%) doit être égale à 100%`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}