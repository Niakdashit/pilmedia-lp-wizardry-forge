import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { participationSchema, viewParamsSchema } from '@/lib/validation';
import { RateLimiter } from '@/services/RateLimiter';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { getClientIPWithTimeout } from '@/utils/getClientIP';

type DatabaseParticipation = Database['public']['Tables']['participations']['Row'];

export interface Participation extends Omit<DatabaseParticipation, 'form_data' | 'game_result'> {
  form_data: Record<string, any>;
  game_result?: Record<string, any>;
}

export const useParticipations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createParticipation = async (participation: {
    campaign_id: string;
    user_email: string;
    form_data: Record<string, any>;
    game_result?: Record<string, any>;
    is_winner?: boolean;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 [useParticipations] Starting secure participation creation...');
      
      // 1. Récupérer IP et device fingerprint en parallèle
      const [ipAddress, deviceFingerprint] = await Promise.all([
        getClientIPWithTimeout(3000), // Timeout 3s
        getDeviceFingerprint()
      ]);
      
      console.log('🔍 [useParticipations] Security info:', {
        ipAddress,
        deviceFingerprint: deviceFingerprint.substring(0, 16) + '...'
      });
      
      // 2. Vérifier rate limiting
      const rateLimitCheck = await RateLimiter.checkLimit(
        participation.campaign_id,
        participation.user_email,
        ipAddress,
        deviceFingerprint
      );
      
      if (!rateLimitCheck.allowed) {
        console.warn('❌ [useParticipations] Rate limit exceeded:', rateLimitCheck.reason);
        
        // Logger la tentative bloquée
        await RateLimiter.logBlockedAttempt(
          participation.campaign_id,
          participation.user_email,
          ipAddress,
          deviceFingerprint,
          rateLimitCheck.reason || 'Unknown'
        );
        
        throw new Error(rateLimitCheck.reason || 'Limite de participations atteinte');
      }
      
      console.log('✅ [useParticipations] Rate limit check passed');
      
      // 3. Valider les données
      const validation = participationSchema.safeParse({
        campaign_id: participation.campaign_id,
        user_email: participation.user_email,
        form_data: participation.form_data,
        game_result: participation.game_result,
        is_winner: participation.is_winner || false,
        utm_source: participation.utm_source,
        utm_medium: participation.utm_medium,
        utm_campaign: participation.utm_campaign,
      });
      
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.error.message}`);
      }

      // 4. Préparer les données avec sécurité et métriques enrichies
      const ua = navigator.userAgent;
      let device_type = 'desktop';
      let browser = 'unknown';
      let os = 'unknown';

      if (/mobile/i.test(ua)) device_type = 'mobile';
      else if (/tablet|ipad/i.test(ua)) device_type = 'tablet';

      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Edge')) browser = 'Edge';

      if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

      const participationData = {
        ...validation.data,
        ip_address: ipAddress, // ✅ Vraie IP (plus de hardcode)
        user_agent: navigator.userAgent,
        device_type, // ✅ Device type
        browser, // ✅ Browser
        os, // ✅ OS
        referrer: document.referrer || undefined, // ✅ Referrer
      };

      console.log('💾 [useParticipations] Inserting participation with security data...');

      // 5. Insérer en base
      const { error } = await supabase
        .from('participations')
        .insert(participationData);
      
      if (error) {
        // Gérer erreur de contrainte unique
        if (error.code === '23505') {
          throw new Error('Vous avez déjà participé à cette campagne');
        }
        throw error;
      }
      
      console.log('✅ [useParticipations] Participation created successfully');
      return true;
    } catch (err: any) {
      console.error('❌ [useParticipations] Error:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement de la participation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getParticipations = async (): Promise<Participation[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('participations')
        .select(`
          *,
          campaigns!inner(created_by)
        `)
        .eq('campaigns.created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Participation[];
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des participations');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getParticipationsByCampaign = async (campaignId: string): Promise<Participation[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('participations')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Participation[];
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des participations');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const trackCampaignView = async (campaignId: string, utmParams?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
  }): Promise<void> => {
    try {
      // Validate UTM parameters
      const validatedParams = viewParamsSchema.safeParse(utmParams || {});
      
      if (!validatedParams.success) {
        console.warn('Invalid UTM parameters:', validatedParams.error);
        return;
      }

      const userAgent = navigator.userAgent;
      const ip_address = '127.0.0.1';

      const viewData = {
        campaign_id: campaignId,
        ip_address,
        user_agent: userAgent,
        referrer: validatedParams.data.referrer || document.referrer || '',
        utm_source: validatedParams.data.utm_source,
        utm_medium: validatedParams.data.utm_medium,
        utm_campaign: validatedParams.data.utm_campaign
      };

      await supabase
        .from('campaign_views')
        .insert(viewData);
    } catch (err) {
      console.warn('Failed to track campaign view:', err);
    }
  };

  const exportParticipationsToCSV = (participations: Participation[], campaignName: string) => {
    try {
      const headers = ['Date', 'Email', 'Prénom', 'Nom', 'Source', 'Gagnant'];
      const csvContent = [
        headers.join(','),
        ...participations.map(p => [
          p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '',
          p.user_email || '',
          p.form_data?.prenom || '',
          p.form_data?.nom || '',
          p.utm_source || '',
          p.is_winner ? 'Oui' : 'Non'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `participations_${campaignName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erreur lors de l\'export CSV:', err);
    }
  };

  return {
    createParticipation,
    getParticipations,
    getParticipationsByCampaign,
    trackCampaignView,
    exportParticipationsToCSV,
    loading,
    error
  };
};
