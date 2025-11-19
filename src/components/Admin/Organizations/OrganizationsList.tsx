import React from 'react';
import { Building2, Calendar, Edit, Trash2 } from 'lucide-react';
import { Organization } from '@/types/organization';

interface OrganizationsListProps {
  organizations: Organization[];
  onSelectOrganization: (org: Organization) => void;
  onDeleteOrganization: (orgId: string) => void;
  selectedOrgId?: string;
}

export const OrganizationsList: React.FC<OrganizationsListProps> = ({
  organizations,
  onSelectOrganization,
  onDeleteOrganization,
  selectedOrgId
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Organisations ({organizations.length})
          </h3>
        </div>
      </div>

      {organizations.length === 0 ? (
        <div className="p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Aucune organisation</p>
          <p className="text-gray-400 text-sm mt-2">Créez votre première organisation pour commencer</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {organizations.map((org) => (
            <div
              key={org.id}
              className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedOrgId === org.id ? 'bg-primary/5 border-l-4 border-primary' : ''
              }`}
              onClick={() => onSelectOrganization(org)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {org.logo_url ? (
                    <img 
                      src={org.logo_url} 
                      alt={org.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {org.name}
                    </h4>
                    {org.slug && (
                      <p className="text-sm text-gray-500 mb-3 font-mono">
                        {org.slug}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Créée le {formatDate(org.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrganization(org);
                    }}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'organisation "${org.name}" ?`)) {
                        onDeleteOrganization(org.id);
                      }
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
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
  );
};
