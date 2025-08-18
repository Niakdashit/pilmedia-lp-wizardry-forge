import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SavedForm = {
  id: string;
  name: string;
  fields: any[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export const useSavedForms = () => {
  const [forms, setForms] = useState<SavedForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setForms([]);
        return [] as SavedForm[];
      }

      const client = supabase as any;
      let query = client
        .from('saved_forms')
        .select('id, name, fields, user_id, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (search && search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = (data || []) as any[];
      const mapped: SavedForm[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        fields: Array.isArray(r.fields) ? r.fields : [],
        user_id: r.user_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));
      setForms(mapped);
      return mapped;
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement des formulaires');
      return [] as SavedForm[];
    } finally {
      setLoading(false);
    }
  }, []);

  const createForm = useCallback(async (name: string, fields: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      const payload = { name, fields, user_id: user.id };
      const client = supabase as any;
      const { data, error } = await client
        .from('saved_forms')
        .insert(payload)
        .select('id, name, fields, user_id, created_at, updated_at')
        .single();

      if (error) throw error;
      const saved: SavedForm = {
        id: data!.id,
        name: data!.name,
        fields: Array.isArray(data!.fields) ? data!.fields : [],
        user_id: data!.user_id,
        created_at: data!.created_at,
        updated_at: data!.updated_at,
      };
      setForms((prev) => [saved, ...prev]);
      return saved;
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création du formulaire');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateForm = useCallback(async (id: string, name: string, fields: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const client = supabase as any;
      const { data, error } = await client
        .from('saved_forms')
        .update({ name, fields })
        .eq('id', id)
        .select('id, name, fields, user_id, created_at, updated_at')
        .single();
      if (error) throw error;
      const updated: SavedForm = {
        id: data!.id,
        name: data!.name,
        fields: Array.isArray(data!.fields) ? data!.fields : [],
        user_id: data!.user_id,
        created_at: data!.created_at,
        updated_at: data!.updated_at,
      };
      setForms((prev) => prev.map((f) => (f.id === id ? updated : f)));
      return updated;
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la mise à jour du formulaire');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeForm = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const client = supabase as any;
      const { error } = await client
        .from('saved_forms')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setForms((prev) => prev.filter((f) => f.id !== id));
      return true;
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la suppression du formulaire');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    forms,
    loading,
    error,
    fetchForms,
    createForm,
    updateForm,
    removeForm,
  };
};
