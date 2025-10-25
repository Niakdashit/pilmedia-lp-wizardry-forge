// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Template {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  type: 'wheel' | 'quiz' | 'scratch' | 'dice' | 'jackpot';
  category: string | null;
  config: Record<string, any>;
  game_config: Record<string, any>;
  design: Record<string, any>;
  is_premium: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async (category?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('campaign_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTemplates(data as Template[]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates
  };
};
