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
  return campaign?.gameConfig?.wheel?.segments || campaign?.config?.roulette?.segments || [];
};

const updateCampaignSegments = (campaign: CampaignConfig, segments: any[]) => {
  return {
    ...campaign,
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
  
  // État dérivé avec cache optimisé
  const segments = useMemo(() => {
    if (!campaign) return [];
    return SegmentManager.generateFinalSegments(campaign);
  }, [
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
      totalProbability: segments.reduce((sum, s) => sum + s.probability, 0)
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
      const cleanedSegments = rawSegments.map(segment => {
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
    return segments.find(s => s.id === id);
  }, [segments]);

  const getTotalProbability = useCallback((): number => {
    return segments.reduce((sum, s) => sum + s.probability, 0);
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