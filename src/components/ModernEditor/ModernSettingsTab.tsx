
import React from 'react';
import { Settings, Calendar, Globe, Tag } from 'lucide-react';

interface ModernSettingsTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const ModernSettingsTab: React.FC<ModernSettingsTabProps> = ({
  campaign,
  setCampaign
}) => {
  const updateCampaign = (updates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Paramètres
        </h2>
        <p className="text-sm text-gray-600">
          Configuration générale et planning de votre campagne
        </p>
      </div>

      {/* Informations générales */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Informations générales
        </h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nom de la campagne</label>
            <input
              type="text"
              value={campaign.name || ''}
              onChange={(e) => updateCampaign({ name: e.target.value })}
              placeholder="Nom de votre campagne"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={campaign.description || ''}
              onChange={(e) => updateCampaign({ description: e.target.value })}
              placeholder="Description de la campagne"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Statut</label>
            <select
              value={campaign.status || 'draft'}
              onChange={(e) => updateCampaign({ status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            >
              <option value="draft">Brouillon</option>
              <option value="active">Active</option>
              <option value="paused">En pause</option>
              <option value="ended">Terminée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configuration web */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Globe className="w-4 h-4 mr-2" />
          Configuration web
        </h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">URL personnalisée</label>
            <input
              type="text"
              value={campaign.slug || ''}
              onChange={(e) => updateCampaign({ slug: e.target.value })}
              placeholder="mon-jeu-concours"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              URL finale: {window.location.origin}/c/{campaign.slug || 'mon-jeu-concours'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mots-clés SEO</label>
            <input
              type="text"
              value={campaign.keywords || ''}
              onChange={(e) => updateCampaign({ keywords: e.target.value })}
              placeholder="jeu, concours, roue, prix"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Planning */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Planning
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date de début</label>
            <input
              type="datetime-local"
              value={campaign.start_date || ''}
              onChange={(e) => updateCampaign({ start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date de fin</label>
            <input
              type="datetime-local"
              value={campaign.end_date || ''}
              onChange={(e) => updateCampaign({ end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={campaign.unlimited_duration || false}
              onChange={(e) => updateCampaign({ unlimited_duration: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Durée illimitée</span>
          </label>
        </div>
      </div>

      {/* Limitations */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900">Limitations</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nombre max de participations</label>
            <input
              type="number"
              value={campaign.max_participations || ''}
              onChange={(e) => updateCampaign({ max_participations: parseInt(e.target.value) || null })}
              placeholder="Illimité"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Participations par utilisateur</label>
            <input
              type="number"
              value={campaign.max_participations_per_user || ''}
              onChange={(e) => updateCampaign({ max_participations_per_user: parseInt(e.target.value) || null })}
              placeholder="Illimité"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSettingsTab;
