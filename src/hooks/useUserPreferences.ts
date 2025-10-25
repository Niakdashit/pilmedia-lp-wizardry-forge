// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserPreferences {
  editorZoom?: Record<string, number>;
  previewButtonSide?: 'left' | 'right';
  clipboardElement?: any;
  [key: string]: any;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences(data.preferences as UserPreferences);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des préférences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updatedPrefs = { ...preferences, ...newPrefs };

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences: updatedPrefs
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      setPreferences(updatedPrefs);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour des préférences');
      throw err;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences
  };
};
