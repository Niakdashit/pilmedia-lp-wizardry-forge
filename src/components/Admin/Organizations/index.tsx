import React, { useState, useEffect } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Organization } from '@/types/organization';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationsList } from './OrganizationsList';
import { OrganizationDetails } from './OrganizationDetails';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { InviteMemberModal } from './InviteMemberModal';

export const AdminOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations((data || []) as Organization[]);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (orgId: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      setOrganizations(organizations.filter(org => org.id !== orgId));
      if (selectedOrg?.id === orgId) {
        setSelectedOrg(null);
      }
    } catch (err) {
      console.error('Error deleting organization:', err);
      alert('Erreur lors de la suppression de l\'organisation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Gestion des organisations
          </h2>
          <p className="text-muted-foreground mt-1">
            Créez et gérez les organisations de votre plateforme
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Nouvelle organisation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrganizationsList
          organizations={organizations}
          onSelectOrganization={setSelectedOrg}
          onDeleteOrganization={deleteOrganization}
          selectedOrgId={selectedOrg?.id}
        />

        {selectedOrg ? (
          <OrganizationDetails
            organization={selectedOrg}
            onInviteMember={() => setShowInviteModal(true)}
          />
        ) : (
          <div className="bg-card rounded-xl shadow-sm border border-border p-12 flex flex-col items-center justify-center text-center">
            <Building2 className="w-20 h-20 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Sélectionnez une organisation
            </h3>
            <p className="text-muted-foreground">
              Cliquez sur une organisation pour voir ses détails et gérer ses membres
            </p>
          </div>
        )}
      </div>

      <CreateOrganizationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchOrganizations}
      />

      {selectedOrg && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          organizationId={selectedOrg.id}
          onSuccess={() => {
            // Refresh the selected org to show new member
            fetchOrganizations();
          }}
        />
      )}
    </div>
  );
};
