// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserWithProfile } from '@/types/profile';

export const useUsers = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithProfiles = data.map(transformProfile);
      setUsers(usersWithProfiles);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'user' | 'admin' | 'moderator') => {
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

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, role, is_admin: role === 'admin', is_moderator: role === 'moderator' || role === 'admin' }
            : user
        )
      );

      return { data, error: null };
    } catch (err) {
      console.error('Error updating user role:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    updateUserRole,
    refetch: fetchUsers,
  };
};

// Helper function to transform profile data
const transformProfile = (profile: Profile): UserWithProfile => {
  return {
    ...profile,
    full_name: [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(' ') || profile.email || 'Utilisateur',
    is_admin: profile.role === 'admin',
    is_moderator: profile.role === 'moderator' || profile.role === 'admin',
  };
};
