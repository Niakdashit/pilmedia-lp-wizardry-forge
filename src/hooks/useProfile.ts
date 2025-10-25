import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserWithProfile } from '@/types/profile';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || 
                         [user.user_metadata?.first_name, user.user_metadata?.last_name]
                           .filter(Boolean)
                           .join(' ') || 
                         null,
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          const userWithProfile = transformProfile(newProfile);
          setProfile(userWithProfile);
        } else {
          throw error;
        }
      } else {
        const userWithProfile = transformProfile(data);
        setProfile(userWithProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'full_name' | 'company' | 'avatar_url'>>) => {
    if (!profile) return { error: 'No profile loaded' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      const userWithProfile = transformProfile(data);
      setProfile(userWithProfile);
      return { data: userWithProfile, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const setUserRole = async (userId: string, role: 'user' | 'admin' | 'moderator') => {
    // Only admins can change roles
    if (!profile?.is_admin) {
      return { error: 'Unauthorized: Only admins can change user roles' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // If updating current user, refresh profile
      if (userId === profile.id) {
        const userWithProfile = transformProfile(data);
        setProfile(userWithProfile);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error updating user role:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    setUserRole,
    refetch: fetchProfile,
  };
};

// Helper function to transform profile data
const transformProfile = (profile: Profile): UserWithProfile => {
  return {
    ...profile,
    full_name: profile.full_name || profile.email || 'Utilisateur',
    is_admin: profile.role === 'admin',
    is_moderator: profile.role === 'moderator' || profile.role === 'admin',
    is_media: profile.role === 'media',
  };
};
