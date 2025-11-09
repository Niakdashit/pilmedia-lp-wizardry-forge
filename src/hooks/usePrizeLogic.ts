/**
 * Hook réutilisable pour la logique de lots et segments
 * Version simplifiée sans erreurs de build
 */

import { useMemo, useCallback } from 'react';
import type { Prize, WheelSegment, CampaignConfig, PrizeValidationResult } from '../types/PrizeSystem';
import { SegmentManager } from '../services/SegmentManager';
import { ProbabilityEngine } from '../services/ProbabilityEngine';

interface UsePrizeLogicProps {
  campaign: CampaignConfig | null;
  setCampaign: (updater: (prev: CampaignConfig | null) => CampaignConfig | null) => void;
}

interface UsePrizeLogicReturn {
  // État dérivé
  segments: WheelSegment[];
  prizes: Prize[];
  validation: PrizeValidationResult;
  
  // Actions sur les lots
  addPrize: (prize: Omit<Prize, 'id'>) => string;
  updatePrize: (id: string, updates: Partial<Prize>) => void;
  removePrize: (id: string) => void;
  duplicatePrize: (id: string) => string;
  
  // Actions sur les segments  
  updateSegmentPrize: (segmentIndex: number, prizeId?: string) => void;
  
  // Utilitaires
  getPrizeById: (id: string) => Prize | undefined;
  getSegmentById: (id: string) => WheelSegment | undefined;
  getTotalProbability: () => number;
}

// Fonctions utilitaires en dehors du hook
const getRawSegments = (campaign: CampaignConfig) => {
  return (campaign as any)?.wheelConfig?.segments || campaign?.gameConfig?.wheel?.segments || campaign?.config?.roulette?.segments || [];
};

const updateCampaignSegments = (campaign: CampaignConfig, segments: any[]) => {
  return {
    ...campaign,
    wheelConfig: {
      ...(campaign as any).wheelConfig,
      segments
    },
    gameConfig: {
      ...campaign.gameConfig,
      wheel: {
        ...campaign.gameConfig?.wheel,
        segments
      }
    },
    config: {
      ...campaign.config,
      roulette: {
        ...campaign.config?.roulette,
        segments
      }
    },
    _lastUpdate: Date.now()
  };
};

export function usePrizeLogic({ campaign, setCampaign }: UsePrizeLogicProps): UsePrizeLogicReturn {
  
  // État dérivé avec cache optimisé - utilise le ProbabilityEngine pour calculer les probabilités
  const segments = useMemo(() => {
    if (!campaign) {
      console.log('🔍 usePrizeLogic: No campaign provided');
      return [];
    }
    
    // Priorité aux segments du GameManagementPanel
    const wheelConfigSegments = (campaign as any)?.wheelConfig?.segments;
    console.log('🔍 usePrizeLogic: Processing segments', {
      campaignId: campaign.id,
      wheelConfigSegments,
      segmentCount: wheelConfigSegments?.length || 0,
      lastUpdate: campaign._lastUpdate
    });
    
    if (wheelConfigSegments && wheelConfigSegments.length > 0) {
      // Utiliser le ProbabilityEngine pour calculer les probabilités correctes
      const probabilityResult = ProbabilityEngine.calculateSegmentProbabilities(
        wheelConfigSegments,
        campaign.prizes || []
      );
      
      const finalSegments = probabilityResult.segments.map((segment: any, idx: number) => {
        // Match by id (string-safe) or fallback by index
        const wheelSegment = wheelConfigSegments.find((s: any) => String(s.id) === String(segment.id))
          ?? wheelConfigSegments[idx];
        const hasImage = !!wheelSegment?.imageUrl;
        const resolvedContentType = wheelSegment?.contentType || (hasImage ? 'image' : 'text');
        
        // Appliquer les couleurs extraites si disponibles
        const extractedColors = (campaign as any)?.design?.extractedColors || [];
        const primaryColor = extractedColors[0];
        let finalColor = wheelSegment?.color ?? segment.color;
        
        console.log(`🎨 usePrizeLogic: Segment ${segment.id} - originalColor: ${finalColor}, primaryColor: ${primaryColor}, extractedColors:`, extractedColors);
        
        // Remplacer la couleur par défaut violette par la couleur extraite
        if (finalColor === '#44444d' && primaryColor) {
          finalColor = primaryColor;
          console.log(`🎨 usePrizeLogic: ✅ Updated segment ${segment.id} color from #44444d to ${primaryColor}`);
        } else if (primaryColor) {
          console.log(`🎨 usePrizeLogic: ❌ NOT updating segment ${segment.id} - color is ${finalColor}, not #44444d`);
        }
        
        return {
          ...segment,
          // Prefer the label/color from wheelConfig so UI stays in sync
          label: wheelSegment?.label ?? segment.label,
          color: finalColor,
          textColor: wheelSegment?.textColor ?? segment.textColor,
          contentType: resolvedContentType,
          imageUrl: wheelSegment?.imageUrl,
          // Assurer que l'icon est mappé pour la compatibilité
          icon: resolvedContentType === 'image' && wheelSegment?.imageUrl ? wheelSegment.imageUrl : segment.icon
        };
      });
      
      console.log('🔍 usePrizeLogic: Final segments computed', finalSegments.map(s => ({
        id: s.id,
        label: s.label,
        color: s.color,
        contentType: s.contentType,
        imageUrl: s.imageUrl ? 'HAS_IMAGE' : 'NO_IMAGE',
        icon: s.icon ? 'HAS_ICON' : 'NO_ICON'
      })));
      return finalSegments;
    }
    
    const fallbackSegments = SegmentManager.generateFinalSegments(campaign);
    console.log('🔍 usePrizeLogic: Using fallback segments', fallbackSegments);
    return fallbackSegments;
  }, [
    (campaign as any)?.wheelConfig?.segments,
    campaign?.gameConfig?.wheel?.segments,
    campaign?.config?.roulette?.segments,
    campaign?.prizes,
    campaign?._lastUpdate
  ]);

  const prizes = useMemo(() => {
    return (campaign?.prizes as Prize[]) || [];
  }, [campaign?.prizes]);

  const validation = useMemo(() => {
    const prizeValidation = ProbabilityEngine.validatePrizes(prizes);
    const segmentValidation = SegmentManager.validateSegments(segments);
    
    return {
      isValid: prizeValidation.isValid && segmentValidation.isValid,
      errors: [...prizeValidation.errors, ...segmentValidation.errors],
      warnings: prizeValidation.warnings,
      totalProbability: segments.reduce((sum: number, s: any) => sum + (s.probability || 0), 0)
    };
  }, [segments, prizes]);

  // Actions sur les lots
  const addPrize = useCallback((prizeData: Omit<Prize, 'id'>): string => {
    const id = `prize_${Date.now()}`;
    const newPrize: Prize = {
      ...prizeData,
      id
    };

    setCampaign(prev => prev ? ({
      ...prev,
      prizes: [...(prev.prizes || []), newPrize],
      _lastUpdate: Date.now()
    }) : prev);

    return id;
  }, [setCampaign]);

  const updatePrize = useCallback((id: string, updates: Partial<Prize>) => {
    setCampaign(prev => {
      if (!prev) return prev;
      
      const updatedPrizes = (prev.prizes || []).map(prize =>
        prize.id === id ? { ...prize, ...updates } : prize
      );

      return {
        ...prev,
        prizes: updatedPrizes,
        _lastUpdate: Date.now()
      };
    });
  }, [setCampaign]);

  const removePrize = useCallback((id: string) => {
    setCampaign(prev => {
      if (!prev) return prev;
      
      const filteredPrizes = (prev.prizes || []).filter(prize => prize.id !== id);
      
      // Supprimer les références au lot dans les segments
      const rawSegments = getRawSegments(prev);
      const cleanedSegments = rawSegments.map((segment: any) => {
        if (segment.prizeId === id) {
          const { prizeId: _, ...segmentWithoutPrize } = segment;
          return segmentWithoutPrize;
        }
        return segment;
      });

      const updatedCampaign = updateCampaignSegments(prev, cleanedSegments);

      return {
        ...updatedCampaign,
        prizes: filteredPrizes,
        _lastUpdate: Date.now()
      };
    });
  }, [setCampaign]);

  const duplicatePrize = useCallback((id: string): string => {
    const sourcePrize = prizes.find(p => p.id === id);
    if (!sourcePrize) return '';

    const newId = `prize_${Date.now()}`;
    const duplicatedPrize: Prize = {
      ...sourcePrize,
      id: newId,
      name: `${sourcePrize.name} (copie)`,
      awardedUnits: 0
    };

    setCampaign(prev => prev ? ({
      ...prev,
      prizes: [...(prev.prizes || []), duplicatedPrize],
      _lastUpdate: Date.now()
    }) : prev);

    return newId;
  }, [prizes, setCampaign]);

  // Actions sur les segments
  const updateSegmentPrize = useCallback((segmentIndex: number, prizeId?: string) => {
    setCampaign(prev => {
      if (!prev) return prev;

      const rawSegments = getRawSegments(prev);
      if (!rawSegments || segmentIndex >= rawSegments.length) return prev;

      const updatedSegments = [...rawSegments];
      updatedSegments[segmentIndex] = {
        ...updatedSegments[segmentIndex],
        prizeId
      };

      return updateCampaignSegments(prev, updatedSegments);
    });
  }, [setCampaign]);

  // Utilitaires
  const getPrizeById = useCallback((id: string): Prize | undefined => {
    return prizes.find(p => p.id === id);
  }, [prizes]);

  const getSegmentById = useCallback((id: string): WheelSegment | undefined => {
    return segments.find((s: any) => s.id === id);
  }, [segments]);

  const getTotalProbability = useCallback((): number => {
    return segments.reduce((sum: number, s: any) => sum + (s.probability || 0), 0);
  }, [segments]);

  return {
    segments,
    prizes,
    validation,
    addPrize,
    updatePrize,
    removePrize,
    duplicatePrize,
    updateSegmentPrize,
    getPrizeById,
    getSegmentById,
    getTotalProbability
  };
}