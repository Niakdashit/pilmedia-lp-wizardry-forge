import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, OrganizationMember } from '@/types/organization';
import { useAuthContext } from '@/contexts/AuthContext';

export const useOrganization = () => {
  const { user } = useAuthContext();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchOrganizationData();
  }, [user?.id]);

  const fetchOrganizationData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's profile to get organization_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.organization_id) {
        setOrganization(null);
        setMembers([]);
        setUserRole(null);
        setLoading(false);
        return;
      }

      // Get organization details
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      if (orgError) throw orgError;
      setOrganization(org);

      // Get user's role in the organization
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', profile.organization_id)
        .single();

      if (memberError) throw memberError;
      setUserRole(memberData?.role || null);

      // Get all members of the organization
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', profile.organization_id);

      if (membersError) throw membersError;

      // Get profiles for all members
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          const enrichedMembers = membersData.map(member => ({
            ...member,
            profiles: profilesData.find(p => p.id === member.user_id)
          }));
          setMembers(enrichedMembers as OrganizationMember[]);
        } else {
          setMembers(membersData as OrganizationMember[]);
        }
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error('Error fetching organization:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    organization,
    members,
    userRole,
    loading,
    error,
    refetch: fetchOrganizationData,
  };
};
