
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

import { Database } from '@/integrations/supabase/types';

type DatabaseCampaign = Database['public']['Tables']['campaigns']['Row'];

export interface Campaign extends Omit<DatabaseCampaign, 'config' | 'game_config' | 'design' | 'form_fields'> {
  config: Record<string, any>;
  game_config: Record<string, any>;
  design: Record<string, any>;
  form_fields: any[];
}

export const useCampaigns = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCampaign = async (campaign: Partial<Campaign>): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Generate slug if creating new campaign
      let slug = campaign.slug;
      if (!campaign.id && campaign.name && !slug) {
        const { data: slugData, error: slugError } = await supabase
          .rpc('generate_campaign_slug', { campaign_name: campaign.name });
        
        if (slugError) throw slugError;
        slug = slugData;
      }

      // Prepare data for database
      const campaignData: any = {
        name: campaign.name || 'Nouvelle campagne',
        description: campaign.description,
        slug,
        type: campaign.type || 'wheel',
        status: campaign.status || 'draft',
        config: campaign.config || {},
        game_config: campaign.game_config || {},
        design: campaign.design || {},
        form_fields: campaign.form_fields || [],
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        thumbnail_url: campaign.thumbnail_url,
        banner_url: campaign.banner_url,
        created_by: user.id,
        updated_at: new Date().toISOString()
      };

      let result;
      if (campaign.id) {
        // Update existing campaign
        const { data, error } = await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', campaign.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new campaign
        const { data, error } = await supabase
          .from('campaigns')
          .insert(campaignData)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      return result as Campaign;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCampaign = async (id: string): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Campaign;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCampaignBySlug = async (slug: string): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as Campaign;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserCampaigns = async (): Promise<Campaign[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Campaign[];
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const publishCampaign = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'active',
          published_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la publication');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const duplicateCampaign = async (id: string): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const originalCampaign = await getCampaign(id);
      if (!originalCampaign) throw new Error('Campagne non trouvée');

      const duplicatedCampaign = {
        ...originalCampaign,
        id: undefined,
        name: `${originalCampaign.name} (Copie)`,
        slug: undefined,
        status: 'draft' as const,
        published_at: undefined,
        total_participants: 0,
        total_views: 0
      };

      return await saveCampaign(duplicatedCampaign);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la duplication');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveCampaign,
    getCampaign,
    getCampaignBySlug,
    getUserCampaigns,
    publishCampaign,
    deleteCampaign,
    duplicateCampaign,
    loading,
    error
  };
};
