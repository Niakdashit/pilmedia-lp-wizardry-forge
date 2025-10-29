
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

// Lightweight cache with TTL (in-memory + localStorage fallback)
const CAMPAIGN_CACHE_TTL_MS = 60_000; // 1 minute
type CacheEntry = { data: any; expiresAt: number };
const campaignCache = new Map<string, CacheEntry>();
const slugCacheIndex = new Map<string, string>(); // slug -> id

function getNow() {
  return Date.now();
}

function makeCacheKeyById(id: string) {
  return `campaign:id:${id}`;
}

function makeCacheKeyBySlug(slug: string) {
  return `campaign:slug:${slug}`;
}

function readLocalCache(key: string): any | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || typeof parsed.expiresAt !== 'number') return null;
    if (parsed.expiresAt < getNow()) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeLocalCache(key: string, data: any) {
  try {
    const entry: CacheEntry = { data, expiresAt: getNow() + CAMPAIGN_CACHE_TTL_MS };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // best-effort
  }
}

function removeLocalCache(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // best-effort
  }
}

function clearCampaignCacheEntries(id?: string | null, slug?: string | null) {
  if (id) {
    const idKey = makeCacheKeyById(id);
    campaignCache.delete(idKey);
    if (typeof window !== 'undefined') {
      removeLocalCache(idKey);
    }
  }

  if (slug) {
    const slugKey = makeCacheKeyBySlug(slug);
    slugCacheIndex.delete(slug);
    if (typeof window !== 'undefined') {
      removeLocalCache(slugKey);
    }
  }
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

      // Prepare data for database (insert case)
      const baseData: any = {
        name: campaign.name || 'Nouvelle campagne',
        description: campaign.description,
        slug,
        status: campaign.status || 'draft',
        config: campaign.config,
        game_config: campaign.game_config,
        design: campaign.design,
        form_fields: campaign.form_fields,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        thumbnail_url: campaign.thumbnail_url,
        banner_url: campaign.banner_url,
        updated_at: new Date().toISOString()
      };

      let result;
      if (campaign.id) {
        // Update existing campaign with only provided fields (no destructive defaults)
        const updateData: any = { updated_at: new Date().toISOString() };
        const maybeSet = (key: string, val: any) => { if (val !== undefined) updateData[key] = val; };
        maybeSet('name', campaign.name);
        maybeSet('description', campaign.description);
        if (slug !== undefined) updateData.slug = slug; // slug may be generated above
        maybeSet('type', campaign.type);
        maybeSet('status', campaign.status);
        maybeSet('config', campaign.config);
        maybeSet('game_config', campaign.game_config);
        maybeSet('design', campaign.design);
        maybeSet('form_fields', campaign.form_fields);
        maybeSet('start_date', campaign.start_date);
        maybeSet('end_date', campaign.end_date);
        maybeSet('thumbnail_url', campaign.thumbnail_url);
        maybeSet('banner_url', campaign.banner_url);

        console.log('📤 [useCampaigns] UPDATE campaigns:', {
          id: campaign.id,
          fieldsUpdated: Object.keys(updateData),
          configKeys: updateData.config ? Object.keys(updateData.config) : [],
          designKeys: updateData.design ? Object.keys(updateData.design) : []
        });

        const { data, error } = await supabase
          .from('campaigns')
          .update(updateData)
          .eq('id', campaign.id)
          .select()
          .single();
        
        if (error) {
          console.error('❌ [useCampaigns] UPDATE FAILED:', error);
          throw error;
        }
        
        console.log('✅ [useCampaigns] UPDATE SUCCESS:', {
          id: data.id,
          name: data.name,
          configKeys: data.config ? Object.keys(data.config) : [],
          designKeys: data.design ? Object.keys(data.design) : []
        });
        
        result = data;
      } else {
        // Create new campaign (require or default type)
        const insertData = {
          ...baseData,
          type: campaign.type ?? 'wheel',
          created_by: user.id
        };
        const { data, error } = await supabase
          .from('campaigns')
          .insert(insertData)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      if (result?.id) {
        clearCampaignCacheEntries(result.id, result.slug);
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
      // Cache hit (memory)
      const mem = campaignCache.get(makeCacheKeyById(id));
      if (mem && mem.expiresAt > getNow()) {
        return mem.data as Campaign;
      }

      // Cache hit (localStorage)
      const local = readLocalCache(makeCacheKeyById(id));
      if (local) {
        // Warm memory cache and return fast while refreshing in background
        campaignCache.set(makeCacheKeyById(id), { data: local, expiresAt: getNow() + CAMPAIGN_CACHE_TTL_MS });
        // Fire-and-forget refresh (no throw)
        (async () => {
          try {
            await supabase
              .from('campaigns')
              .select(
                'id,name,description,slug,type,status,created_by,created_at,updated_at,published_at,thumbnail_url,banner_url,start_date,end_date,config,game_config,design,form_fields'
              )
              .eq('id', id)
              .single();
          } catch {}
        })();
        return local as Campaign;
      }

      // Network fetch with explicit projection to reduce payload
      const { data, error } = await supabase
        .from('campaigns')
        .select(
          'id,name,description,slug,type,status,created_by,created_at,updated_at,published_at,thumbnail_url,banner_url,start_date,end_date,config,game_config,design,form_fields'
        )
        .eq('id', id)
        .single();
      
      if (error) throw error;
      // Update caches
      const key = makeCacheKeyById(id);
      const entry: CacheEntry = { data, expiresAt: getNow() + CAMPAIGN_CACHE_TTL_MS };
      campaignCache.set(key, entry);
      writeLocalCache(key, data);
      if (data?.slug) slugCacheIndex.set(data.slug, id);
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
      const cachedId = slugCacheIndex.get(slug);
      if (cachedId) {
        const mem = campaignCache.get(makeCacheKeyById(cachedId));
        if (mem && mem.expiresAt > getNow()) return mem.data as Campaign;
      }

      const local = readLocalCache(makeCacheKeyBySlug(slug));
      if (local) {
        // Rehydrate id mapping if present
        if (local?.id) slugCacheIndex.set(slug, local.id);
        campaignCache.set(makeCacheKeyById(local?.id || slug), { data: local, expiresAt: getNow() + CAMPAIGN_CACHE_TTL_MS });
        // Background refresh
        (async () => {
          try {
            await supabase
              .from('campaigns')
              .select(
                'id,name,description,slug,type,status,created_by,created_at,updated_at,published_at,thumbnail_url,banner_url,start_date,end_date,config,game_config,design,form_fields'
              )
              .eq('slug', slug)
              .single();
          } catch {}
        })();
        return local as Campaign;
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select(
          'id,name,description,slug,type,status,created_by,created_at,updated_at,published_at,thumbnail_url,banner_url,start_date,end_date,config,game_config,design,form_fields'
        )
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      // Cache by slug and id
      const idKey = makeCacheKeyById(data.id);
      const slugKey = makeCacheKeyBySlug(slug);
      const entry: CacheEntry = { data, expiresAt: getNow() + CAMPAIGN_CACHE_TTL_MS };
      campaignCache.set(idKey, entry);
      writeLocalCache(idKey, data);
      writeLocalCache(slugKey, data);
      slugCacheIndex.set(slug, data.id);
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
        .select('id,name,description,slug,type,status,created_by,created_at,updated_at,published_at,thumbnail_url,banner_url,start_date,end_date')
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
