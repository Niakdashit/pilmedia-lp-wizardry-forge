/**
 * Tests unitaires pour TemporalDistribution
 * Vérifie le lissage temporel des lots
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TemporalDistribution, TemporalConfig } from '../src/services/TemporalDistribution';
import { Prize } from '../src/types/PrizeSystem';

describe('TemporalDistribution', () => {
  let distribution: TemporalDistribution;
  let config: TemporalConfig;
  let testPrize: Prize;

  beforeEach(() => {
    // Campagne de 10 jours
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-10');
    
    config = {
      campaignStartDate: startDate,
      campaignEndDate: endDate,
      totalParticipantsEstimated: 1000,
      distributionStrategy: 'uniform'
    };
    
    distribution = new TemporalDistribution(config);
    
    testPrize = {
      id: 'prize-1',
      name: 'Test Prize',
      totalUnits: 100,
      awardedUnits: 0,
      method: 'probability',
      probabilityPercent: 10
    };
  });

  describe('Daily quota calculation', () => {
    it('should calculate uniform daily quota', () => {
      // 100 lots sur 10 jours = 10 lots/jour
      const quota = distribution.calculateDailyQuota(testPrize, new Date('2025-01-01'));
      expect(quota).toBe(10);
    });

    it('should adjust quota based on days remaining', () => {
      // Jour 6: 100 lots restants, 5 jours restants = 20 lots/jour
      const quota = distribution.calculateDailyQuota(testPrize, new Date('2025-01-06'));
      expect(quota).toBe(20);
    });

    it('should return 0 for exhausted prizes', () => {
      const exhaustedPrize = { ...testPrize, awardedUnits: 100 };
      const quota = distribution.calculateDailyQuota(exhaustedPrize);
      expect(quota).toBe(0);
    });

    it('should handle last day correctly', () => {
      // Dernier jour: tous les lots restants
      const partialPrize = { ...testPrize, awardedUnits: 90 };
      const quota = distribution.calculateDailyQuota(partialPrize, new Date('2025-01-10'));
      expect(quota).toBe(10); // 10 lots restants, 1 jour restant
    });
  });

  describe('Distribution strategies', () => {
    it('should apply weighted strategy (more at start)', () => {
      const weightedConfig = { ...config, distributionStrategy: 'weighted' as const };
      const weightedDist = new TemporalDistribution(weightedConfig);
      
      const quotaDay1 = weightedDist.calculateDailyQuota(testPrize, new Date('2025-01-01'));
      const quotaDay10 = weightedDist.calculateDailyQuota(testPrize, new Date('2025-01-10'));
      
      // Premier jour devrait avoir plus de lots que le dernier
      expect(quotaDay1).toBeGreaterThan(quotaDay10);
    });

    it('should handle peak_hours strategy', () => {
      const peakConfig = { ...config, distributionStrategy: 'peak_hours' as const };
      const peakDist = new TemporalDistribution(peakConfig);
      
      const quota = peakDist.calculateDailyQuota(testPrize);
      expect(quota).toBeGreaterThan(0);
    });
  });

  describe('Prize attribution tracking', () => {
    it('should allow prize if quota not reached', () => {
      const result = distribution.canAwardPrize(testPrize);
      
      expect(result.canAward).toBe(true);
      expect(result.quotaRemaining).toBeGreaterThan(0);
    });

    it('should block prize if daily quota reached', () => {
      const quota = distribution.calculateDailyQuota(testPrize);
      
      // Attribuer tous les lots du quota
      for (let i = 0; i < quota; i++) {
        distribution.recordAttribution(testPrize.id);
      }
      
      const result = distribution.canAwardPrize(testPrize);
      expect(result.canAward).toBe(false);
      expect(result.quotaRemaining).toBe(0);
    });

    it('should track attributions per prize', () => {
      distribution.recordAttribution('prize-1');
      distribution.recordAttribution('prize-1');
      distribution.recordAttribution('prize-2');
      
      const result1 = distribution.canAwardPrize(testPrize);
      const quota = distribution.calculateDailyQuota(testPrize);
      
      expect(result1.quotaRemaining).toBe(quota - 2);
    });
  });

  describe('Probability adjustment', () => {
    it('should not adjust if quota not reached', () => {
      const adjustment = distribution.adjustProbability(testPrize, 50);
      
      expect(adjustment.adjustedProbability).toBeCloseTo(50, 1);
      expect(adjustment.adjustedProbability).toBeLessThanOrEqual(50);
    });

    it('should reduce probability as quota fills up', () => {
      const quota = distribution.calculateDailyQuota(testPrize);
      
      // Remplir 80% du quota
      const attributions = Math.floor(quota * 0.8);
      for (let i = 0; i < attributions; i++) {
        distribution.recordAttribution(testPrize.id);
      }
      
      const adjustment = distribution.adjustProbability(testPrize, 50);
      
      // Probabilité devrait être réduite
      expect(adjustment.adjustedProbability).toBeLessThan(50);
      expect(adjustment.adjustedProbability).toBeGreaterThan(0);
    });

    it('should set probability to 0 when quota reached', () => {
      const quota = distribution.calculateDailyQuota(testPrize);
      
      // Remplir tout le quota
      for (let i = 0; i < quota; i++) {
        distribution.recordAttribution(testPrize.id);
      }
      
      const adjustment = distribution.adjustProbability(testPrize, 50);
      
      expect(adjustment.adjustedProbability).toBe(0);
      expect(adjustment.reason).toContain('Quota atteint');
    });
  });

  describe('Carry-over system', () => {
    it('should carry over unawarded prizes to next day', () => {
      const today = new Date('2025-01-05');
      const quota = distribution.calculateDailyQuota(testPrize, today);
      
      // Attribuer seulement la moitié du quota
      const halfQuota = Math.floor(quota / 2);
      for (let i = 0; i < halfQuota; i++) {
        distribution.recordAttribution(testPrize.id, today);
      }
      
      // Appliquer le carry-over
      distribution.applyCarryOver(today);
      
      // Le lendemain devrait avoir plus de quota
      const tomorrow = new Date('2025-01-06');
      const result = distribution.canAwardPrize(testPrize, tomorrow);
      
      // Le quota du lendemain devrait inclure le carry-over
      expect(result.quotaRemaining).toBeGreaterThan(quota);
    });

    it('should not carry over if quota fully used', () => {
      const today = new Date('2025-01-05');
      const quota = distribution.calculateDailyQuota(testPrize, today);
      
      // Utiliser tout le quota
      for (let i = 0; i < quota; i++) {
        distribution.recordAttribution(testPrize.id, today);
      }
      
      distribution.applyCarryOver(today);
      
      // Le lendemain devrait avoir le quota normal
      const tomorrow = new Date('2025-01-06');
      const tomorrowQuota = distribution.calculateDailyQuota(testPrize, tomorrow);
      const result = distribution.canAwardPrize(testPrize, tomorrow);
      
      expect(result.quotaRemaining).toBe(tomorrowQuota);
    });
  });

  describe('Distribution statistics', () => {
    it('should calculate correct statistics', () => {
      const stats = distribution.getDistributionStats();
      
      expect(stats.totalDays).toBe(10);
      expect(stats.daysRemaining).toBeGreaterThan(0);
      expect(stats.daysElapsed).toBeGreaterThanOrEqual(0);
    });

    it('should track average awards per day', () => {
      // Simuler quelques jours d'attributions
      distribution.recordAttribution('prize-1', new Date('2025-01-01'));
      distribution.recordAttribution('prize-1', new Date('2025-01-01'));
      distribution.recordAttribution('prize-1', new Date('2025-01-02'));
      
      const stats = distribution.getDistributionStats();
      
      expect(stats.averageAwardsPerDay).toBeGreaterThan(0);
      expect(stats.projectedTotalAwards).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle campaign ending today', () => {
      const endingConfig = {
        ...config,
        campaignEndDate: new Date()
      };
      const endingDist = new TemporalDistribution(endingConfig);
      
      const quota = endingDist.calculateDailyQuota(testPrize);
      
      // Tous les lots restants devraient être attribués aujourd'hui
      expect(quota).toBe(100);
    });

    it('should handle very short campaigns', () => {
      const shortConfig = {
        campaignStartDate: new Date('2025-01-01'),
        campaignEndDate: new Date('2025-01-02'),
        distributionStrategy: 'uniform' as const
      };
      const shortDist = new TemporalDistribution(shortConfig);
      
      const quota = shortDist.calculateDailyQuota(testPrize, new Date('2025-01-01'));
      
      // Devrait distribuer la moitié des lots par jour
      expect(quota).toBe(50);
    });

    it('should handle reset correctly', () => {
      distribution.recordAttribution('prize-1');
      distribution.recordAttribution('prize-2');
      
      distribution.reset();
      
      const result = distribution.canAwardPrize(testPrize);
      const quota = distribution.calculateDailyQuota(testPrize);
      
      // Après reset, quota devrait être plein
      expect(result.quotaRemaining).toBe(quota);
    });

    it('should handle multiple prizes independently', () => {
      const prize2: Prize = {
        id: 'prize-2',
        name: 'Prize 2',
        totalUnits: 50,
        awardedUnits: 0,
        method: 'probability',
        probabilityPercent: 5
      };
      
      distribution.recordAttribution('prize-1');
      distribution.recordAttribution('prize-1');
      distribution.recordAttribution('prize-2');
      
      const result1 = distribution.canAwardPrize(testPrize);
      const result2 = distribution.canAwardPrize(prize2);
      
      const quota1 = distribution.calculateDailyQuota(testPrize);
      const quota2 = distribution.calculateDailyQuota(prize2);
      
      expect(result1.quotaRemaining).toBe(quota1 - 2);
      expect(result2.quotaRemaining).toBe(quota2 - 1);
    });
  });
});
