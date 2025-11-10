/**
 * Service d'intégration entre le système de dotation et la roue de la fortune
 * Gère l'attribution des lots selon la configuration de dotation
 */

import { supabase } from '@/integrations/supabase/client';
import { Prize, AttributionResult, DotationConfig } from '@/types/dotation';
import { PrizeAttributionEngine } from './PrizeAttributionEngine';

export interface WheelSpinParams {
  campaignId: string;
  participantEmail: string;
  participantId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

export interface WheelSpinResult {
  shouldWin: boolean;
  prize?: Prize;
  segmentId?: string;
  reason: string;
  attributionResult?: AttributionResult;
}

class WheelDotationIntegration {
  /**
   * Détermine si le participant doit gagner et quel lot
   */
  async determineWheelSpin(params: WheelSpinParams): Promise<WheelSpinResult> {
    try {
      console.log('🎡 [WheelDotation] Determining spin result for:', params);

      // 1. Charger la configuration de dotation
      const dotationConfig = await this.loadDotationConfig(params.campaignId);
      
      if (!dotationConfig || !dotationConfig.prizes || dotationConfig.prizes.length === 0) {
        console.log('⚠️ [WheelDotation] No dotation config found, using random mode');
        return {
          shouldWin: false,
          reason: 'NO_DOTATION_CONFIG',
        };
      }

      console.log('📦 [WheelDotation] Dotation config loaded:', {
        prizesCount: dotationConfig.prizes.length,
        prizes: dotationConfig.prizes.map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          totalQuantity: p.totalQuantity,
          awardedQuantity: p.awardedQuantity,
          startDate: p.startDate,
          endDate: p.endDate,
          attribution: p.attribution,
          assignedSegments: p.assignedSegments
        }))
      });
      console.log('📦 [WheelDotation] Full dotation config:', JSON.stringify(dotationConfig, null, 2));

      // 2. Créer l'engine avec la config chargée
      const attributionEngine = new PrizeAttributionEngine(dotationConfig);

      // 3. Tenter l'attribution d'un lot
      const attributionResult = await attributionEngine.attributePrize({
        campaignId: params.campaignId,
        participantEmail: params.participantEmail,
        participantId: params.participantId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        deviceFingerprint: params.deviceFingerprint,
        timestamp: new Date().toISOString(),
      });

      console.log('🎯 [WheelDotation] Attribution result:', attributionResult);

      // 3. Si le participant a gagné
      if (attributionResult.isWinner && attributionResult.prize) {
        const prize = attributionResult.prize;
        
        console.log('🎯 [WheelDotation] Winner detected! Prize details:', {
          prizeId: prize.id,
          prizeName: prize.name,
          method: prize.method,
          probabilityPercent: prize.probabilityPercent,
          assignedSegments: prize.assignedSegments,
          totalUnits: prize.totalUnits,
          awardedUnits: prize.awardedUnits
        });
        
        // Trouver un segment assigné à ce lot
        const assignedSegments = prize.assignedSegments || [];
        
        if (assignedSegments.length === 0) {
          console.warn('⚠️ [WheelDotation] Prize has no assigned segments!', {
            prizeId: prize.id,
            prizeName: prize.name,
            prizeObject: prize
          });
          return {
            shouldWin: false,
            reason: 'PRIZE_NO_SEGMENTS',
            attributionResult,
          };
        }

        // Choisir un segment aléatoire parmi ceux assignés
        const randomIndex = Math.floor(Math.random() * assignedSegments.length);
        const randomSegmentId = assignedSegments[randomIndex];

        console.log('✅ [WheelDotation] Winner! Selecting segment:', {
          prizeName: prize.name,
          assignedSegments: assignedSegments,
          selectedIndex: randomIndex,
          selectedSegmentId: randomSegmentId,
          allSegmentIds: assignedSegments
        });

        return {
          shouldWin: true,
          prize,
          segmentId: randomSegmentId,
          reason: attributionResult.reason,
          attributionResult,
        };
      }

      // 4. Le participant n'a pas gagné
      console.log('❌ [WheelDotation] No win:', attributionResult.reason);
      
      return {
        shouldWin: false,
        reason: attributionResult.reason,
        attributionResult,
      };

    } catch (error) {
      console.error('❌ [WheelDotation] Error determining spin:', error);
      return {
        shouldWin: false,
        reason: 'ERROR_SYSTEM',
      };
    }
  }

  /**
   * Charge la configuration de dotation depuis Supabase
   */
  private async loadDotationConfig(campaignId: string): Promise<DotationConfig | null> {
    try {
      // @ts-ignore - Table créée par migration
      const { data, error } = await supabase
        .from('dotation_configs')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Pas de config trouvée
          return null;
        }
        throw error;
      }

      if (!data) return null;

      return {
        campaignId: data.campaign_id,
        prizes: data.prizes || [],
        globalStrategy: data.global_strategy,
        antiFraud: data.anti_fraud,
        notifications: data.notifications,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('❌ [WheelDotation] Error loading dotation config:', error);
      return null;
    }
  }

  /**
   * Récupère tous les segments gagnants (avec lots assignés)
   */
  async getWinningSegments(campaignId: string): Promise<string[]> {
    const config = await this.loadDotationConfig(campaignId);
    if (!config) return [];

    const winningSegments = new Set<string>();
    
    config.prizes.forEach(prize => {
      if (prize.assignedSegments) {
        prize.assignedSegments.forEach(segmentId => winningSegments.add(segmentId));
      }
    });

    return Array.from(winningSegments);
  }

  /**
   * Récupère le lot associé à un segment
   */
  async getPrizeForSegment(campaignId: string, segmentId: string): Promise<Prize | null> {
    const config = await this.loadDotationConfig(campaignId);
    if (!config) return null;

    return config.prizes.find(prize => 
      prize.assignedSegments?.includes(segmentId)
    ) || null;
  }
}

// Export singleton instance
export const wheelDotationIntegration = new WheelDotationIntegration();
