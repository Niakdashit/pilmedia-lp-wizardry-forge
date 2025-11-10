/**
 * RateLimiter - Protection anti-fraude pour les participations
 * 
 * Implémente des limites strictes pour prévenir:
 * - Spam de participations
 * - Attaques automatisées
 * - Multi-comptes
 * - Abus du système
 */

import { supabase } from '@/integrations/supabase/client';

export interface RateLimitConfig {
  maxParticipationsPerDay: number;
  maxParticipationsPerHour: number;
  maxParticipationsPerIP: number;
  maxParticipationsPerDevice: number;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // Secondes avant de pouvoir réessayer
  currentCount?: number;
  maxCount?: number;
}

export class RateLimiter {
  private static defaultConfig: RateLimitConfig = {
    maxParticipationsPerDay: 3,      // 3 participations max par email par 24h
    maxParticipationsPerHour: 1,     // 1 participation max par heure
    maxParticipationsPerIP: 5,       // 5 participations max par IP par 24h
    maxParticipationsPerDevice: 3    // 3 participations max par device par 24h
  };

  /**
   * Vérifie toutes les limites pour une participation
   */
  static async checkLimit(
    campaignId: string,
    email: string,
    ipAddress: string,
    deviceFingerprint?: string,
    config: Partial<RateLimitConfig> = {}
  ): Promise<RateLimitResult> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    console.log('🔐 [RateLimiter] Checking limits:', {
      campaignId,
      email,
      ipAddress,
      deviceFingerprint: deviceFingerprint?.substring(0, 8) + '...',
      config: finalConfig
    });

    try {
      // 1. Vérifier limite par email (24h)
      const emailCheck = await this.checkEmailLimit(
        campaignId,
        email,
        finalConfig.maxParticipationsPerDay
      );
      if (!emailCheck.allowed) {
        console.log('❌ [RateLimiter] Email limit exceeded');
        return emailCheck;
      }
      
      // 2. Vérifier limite par email (1h)
      const hourlyCheck = await this.checkHourlyLimit(
        campaignId,
        email,
        finalConfig.maxParticipationsPerHour
      );
      if (!hourlyCheck.allowed) {
        console.log('❌ [RateLimiter] Hourly limit exceeded');
        return hourlyCheck;
      }
      
      // 3. Vérifier limite par IP
      const ipCheck = await this.checkIPLimit(
        campaignId,
        ipAddress,
        finalConfig.maxParticipationsPerIP
      );
      if (!ipCheck.allowed) {
        console.log('❌ [RateLimiter] IP limit exceeded');
        return ipCheck;
      }
      
      // 4. Vérifier limite par device (si fourni)
      if (deviceFingerprint) {
        const deviceCheck = await this.checkDeviceLimit(
          campaignId,
          deviceFingerprint,
          finalConfig.maxParticipationsPerDevice
        );
        if (!deviceCheck.allowed) {
          console.log('❌ [RateLimiter] Device limit exceeded');
          return deviceCheck;
        }
      }
      
      console.log('✅ [RateLimiter] All checks passed');
      return { allowed: true };
      
    } catch (error) {
      console.error('❌ [RateLimiter] Error checking limits:', error);
      // En cas d'erreur, on autorise pour ne pas bloquer les utilisateurs légitimes
      return { allowed: true };
    }
  }

  /**
   * Vérifie la limite par email sur 24h
   */
  private static async checkEmailLimit(
    campaignId: string,
    email: string,
    maxCount: number
  ): Promise<RateLimitResult> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('participations')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('user_email', email)
      .gte('created_at', oneDayAgo.toISOString());
    
    if (error) {
      console.error('Error checking email limit:', error);
      return { allowed: true }; // Fail open
    }
    
    const currentCount = count || 0;
    
    if (currentCount >= maxCount) {
      return {
        allowed: false,
        reason: `Limite atteinte: ${maxCount} participations maximum par 24h`,
        retryAfter: this.getRetryAfter(oneDayAgo),
        currentCount,
        maxCount
      };
    }
    
    return { allowed: true, currentCount, maxCount };
  }

  /**
   * Vérifie la limite par email sur 1h
   */
  private static async checkHourlyLimit(
    campaignId: string,
    email: string,
    maxCount: number
  ): Promise<RateLimitResult> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('participations')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('user_email', email)
      .gte('created_at', oneHourAgo.toISOString());
    
    if (error) {
      console.error('Error checking hourly limit:', error);
      return { allowed: true };
    }
    
    const currentCount = count || 0;
    
    if (currentCount >= maxCount) {
      return {
        allowed: false,
        reason: `Trop rapide: ${maxCount} participation maximum par heure`,
        retryAfter: this.getRetryAfter(oneHourAgo),
        currentCount,
        maxCount
      };
    }
    
    return { allowed: true, currentCount, maxCount };
  }

  /**
   * Vérifie la limite par IP sur 24h
   */
  private static async checkIPLimit(
    campaignId: string,
    ipAddress: string,
    maxCount: number
  ): Promise<RateLimitResult> {
    // Ignorer si IP inconnue
    if (!ipAddress || ipAddress === 'unknown' || ipAddress === '127.0.0.1') {
      return { allowed: true };
    }
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('participations')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('ip_address', ipAddress)
      .gte('created_at', oneDayAgo.toISOString());
    
    if (error) {
      console.error('Error checking IP limit:', error);
      return { allowed: true };
    }
    
    const currentCount = count || 0;
    
    if (currentCount >= maxCount) {
      return {
        allowed: false,
        reason: `Limite IP atteinte: ${maxCount} participations maximum par IP par 24h`,
        retryAfter: this.getRetryAfter(oneDayAgo),
        currentCount,
        maxCount
      };
    }
    
    return { allowed: true, currentCount, maxCount };
  }

  /**
   * Vérifie la limite par device sur 24h
   */
  private static async checkDeviceLimit(
    campaignId: string,
    deviceFingerprint: string,
    maxCount: number
  ): Promise<RateLimitResult> {
    // Ignorer si fingerprint inconnu
    if (!deviceFingerprint || deviceFingerprint === 'unknown') {
      return { allowed: true };
    }
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('participations')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('device_fingerprint', deviceFingerprint)
      .gte('created_at', oneDayAgo.toISOString());
    
    if (error) {
      console.error('Error checking device limit:', error);
      return { allowed: true };
    }
    
    const currentCount = count || 0;
    
    if (currentCount >= maxCount) {
      return {
        allowed: false,
        reason: `Limite device atteinte: ${maxCount} participations maximum par appareil par 24h`,
        retryAfter: this.getRetryAfter(oneDayAgo),
        currentCount,
        maxCount
      };
    }
    
    return { allowed: true, currentCount, maxCount };
  }

  /**
   * Calcule le temps avant de pouvoir réessayer (en secondes)
   */
  private static getRetryAfter(since: Date): number {
    const elapsed = Date.now() - since.getTime();
    const windowMs = 24 * 60 * 60 * 1000; // 24h
    const remaining = windowMs - elapsed;
    return Math.ceil(remaining / 1000); // Convertir en secondes
  }

  /**
   * Enregistre une tentative bloquée dans les logs de sécurité
   */
  static async logBlockedAttempt(
    campaignId: string,
    email: string,
    ipAddress: string,
    deviceFingerprint: string | undefined,
    reason: string
  ): Promise<void> {
    try {
      // TODO: Uncomment after migration is applied
      // await supabase.from('security_logs').insert({
      //   event_type: 'rate_limit_exceeded',
      //   campaign_id: campaignId,
      //   email,
      //   ip_address: ipAddress,
      //   device_fingerprint: deviceFingerprint,
      //   reason,
      //   metadata: {
      //     timestamp: new Date().toISOString(),
      //     user_agent: navigator.userAgent
      //   }
      // });
      
      console.log('📝 [RateLimiter] Blocked attempt (logging disabled until migration):', {
        campaignId,
        email,
        reason
      });
    } catch (error) {
      console.error('Error logging blocked attempt:', error);
    }
  }

  /**
   * Obtient les statistiques de rate limiting pour une campagne
   */
  static async getStats(campaignId: string): Promise<{
    totalParticipations: number;
    blockedAttempts: number;
    uniqueIPs: number;
    uniqueDevices: number;
  }> {
    try {
      // Total participations
      const { count: totalParticipations } = await supabase
        .from('participations')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId);
      
      // Tentatives bloquées (TODO: uncomment after migration)
      // const { count: blockedAttempts } = await supabase
      //   .from('security_logs')
      //   .select('*', { count: 'exact', head: true })
      //   .eq('campaign_id', campaignId)
      //   .eq('event_type', 'rate_limit_exceeded');
      const blockedAttempts = 0; // Temporary until migration
      
      // IPs uniques
      const { data: ips } = await supabase
        .from('participations')
        .select('ip_address')
        .eq('campaign_id', campaignId)
        .not('ip_address', 'is', null);
      
      const uniqueIPs = new Set(ips?.map(p => p.ip_address)).size;
      
      // Devices uniques (TODO: uncomment after migration)
      // const { data: devices } = await supabase
      //   .from('participations')
      //   .select('device_fingerprint')
      //   .eq('campaign_id', campaignId)
      //   .not('device_fingerprint', 'is', null);
      // const uniqueDevices = new Set(devices?.map(p => p.device_fingerprint)).size;
      const uniqueDevices = 0; // Temporary until migration
      
      return {
        totalParticipations: totalParticipations || 0,
        blockedAttempts: blockedAttempts || 0,
        uniqueIPs,
        uniqueDevices
      };
    } catch (error) {
      console.error('Error getting rate limit stats:', error);
      return {
        totalParticipations: 0,
        blockedAttempts: 0,
        uniqueIPs: 0,
        uniqueDevices: 0
      };
    }
  }
}
