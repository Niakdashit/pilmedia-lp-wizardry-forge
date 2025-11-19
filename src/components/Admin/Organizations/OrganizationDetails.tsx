import React, { useState, useEffect } from 'react';
import { Users, Mail, User, Trash2, UserPlus } from 'lucide-react';
import { Organization, OrganizationMember, OrganizationRole } from '@/types/organization';
import { supabase } from '@/integrations/supabase/client';

interface OrganizationDetailsProps {
  organization: Organization;
  onInviteMember: () => void;
}

export const OrganizationDetails: React.FC<OrganizationDetailsProps> = ({
  organization,
  onInviteMember
}) => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [organization.id]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data: membersData, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organization.id);

      if (error) throw error;

      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);

        const enrichedMembers = membersData.map(member => ({
          ...member,
          profiles: profilesData?.find(p => p.id === member.user_id)
        }));
        setMembers(enrichedMembers as OrganizationMember[]);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: OrganizationRole) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      await fetchMembers();
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Erreur lors de la mise à jour du rôle');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await fetchMembers();
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Erreur lors de la suppression du membre');
    }
  };

  const getRoleColor = (role: OrganizationRole) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Organization Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          {organization.logo_url ? (
            <img 
              src={organization.logo_url} 
              alt={organization.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary" />
            </div>
          )}
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{organization.name}</h2>
            {organization.slug && (
              <p className="text-sm text-gray-500 font-mono mb-3">{organization.slug}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{members.length} membre{members.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Membres ({members.length})
          </h3>
          <button
            onClick={onInviteMember}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Inviter un membre
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Aucun membre</p>
            <p className="text-gray-400 text-sm mt-2">Invitez des membres pour collaborer</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {member.profiles?.avatar_url ? (
                      <img 
                        src={member.profiles.avatar_url}
                        alt={member.profiles.full_name || member.profiles.email}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {member.profiles?.full_name || 'Utilisateur'}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{member.profiles?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={member.role}
                      onChange={(e) => updateMemberRole(member.id, e.target.value as OrganizationRole)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium ${getRoleColor(member.role)}`}
                    >
                      <option value="viewer">Observateur</option>
                      <option value="member">Membre</option>
                      <option value="admin">Administrateur</option>
                      <option value="owner">Propriétaire</option>
                    </select>

                    <button
                      onClick={() => {
                        if (window.confirm(`Êtes-vous sûr de vouloir retirer ce membre ?`)) {
                          removeMember(member.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Retirer"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
