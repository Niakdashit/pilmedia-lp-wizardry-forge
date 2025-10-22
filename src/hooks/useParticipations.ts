
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

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
      // Get IP address and user agent from browser
      const userAgent = navigator.userAgent;
      const ip_address = '127.0.0.1'; // In real app, this would come from server

      const participationData = {
        campaign_id: participation.campaign_id,
        user_email: participation.user_email,
        form_data: participation.form_data,
        game_result: participation.game_result,
        is_winner: participation.is_winner || false,
        ip_address,
        user_agent: userAgent,
        utm_source: participation.utm_source,
        utm_medium: participation.utm_medium,
        utm_campaign: participation.utm_campaign
      };

      const { error } = await supabase
        .from('participations')
        .insert(participationData);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
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
      const userAgent = navigator.userAgent;
      const ip_address = '127.0.0.1'; // In real app, this would come from server

      const viewData = {
        campaign_id: campaignId,
        ip_address,
        user_agent: userAgent,
        referrer: utmParams?.referrer || document.referrer,
        utm_source: utmParams?.utm_source,
        utm_medium: utmParams?.utm_medium,
        utm_campaign: utmParams?.utm_campaign
      };

      await supabase
        .from('campaign_views')
        .insert(viewData);
    } catch (err) {
      // Silently fail for analytics
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
