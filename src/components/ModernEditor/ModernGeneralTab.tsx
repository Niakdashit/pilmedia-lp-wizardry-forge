import React, { useMemo } from 'react';
import { Calendar, Clock, Globe, Tag, Activity, Power } from 'lucide-react';
interface ModernGeneralTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}
const ModernGeneralTab: React.FC<ModernGeneralTabProps> = ({
  campaign,
  setCampaign
}) => {
  const handleInputChange = (field: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Calcul automatique du statut basé sur les dates
  const computedStatus = useMemo(() => {
    if (!campaign.startDate || !campaign.endDate) {
      return { value: 'draft', label: 'Brouillon', color: 'text-gray-600 bg-gray-100' };
    }

    const now = new Date();
    const start = new Date(campaign.startDate + 'T' + (campaign.startTime || '00:00'));
    const end = new Date(campaign.endDate + 'T' + (campaign.endTime || '23:59'));

    if (now < start) {
      return { value: 'draft', label: 'Brouillon', color: 'text-gray-600 bg-gray-100' };
    } else if (now >= start && now <= end) {
      return { value: 'active', label: 'En ligne', color: 'text-green-600 bg-green-100' };
    } else {
      return { value: 'ended', label: 'Terminée', color: 'text-red-600 bg-red-100' };
    }
  }, [campaign.startDate, campaign.endDate, campaign.startTime, campaign.endTime]);
  return <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">Configuration générale</h2>
        <p className="text-sm text-gray-600">
          Paramètres de base de votre campagne
        </p>
      </div>

      {/* Nom de la campagne */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Tag className="w-4 h-4 mr-2" />
          Nom de la campagne
        </label>
        <input type="text" value={campaign.name || ''} onChange={e => handleInputChange('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent" placeholder="Ma nouvelle campagne" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea value={campaign.description || ''} onChange={e => handleInputChange('description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent" rows={3} placeholder="Description de la campagne..." />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Globe className="w-4 h-4 mr-2" />
          URL de la campagne
        </label>
        <input type="url" value={campaign.url || ''} onChange={e => handleInputChange('url', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent" placeholder="https://example.com/campagne" />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 mr-2" />
            Date de début
          </label>
          <input type="date" value={campaign.startDate || ''} onChange={e => handleInputChange('startDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent" />
        </div>
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 mr-2" />
            Date de fin
          </label>
          <input type="date" value={campaign.endDate || ''} onChange={e => handleInputChange('endDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent" />
        </div>
      </div>

      {/* Heures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-2" />
            Heure de début
          </label>
          <input type="time" value={campaign.startTime || '09:00'} onChange={e => handleInputChange('startTime', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent" />
        </div>
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-2" />
            Heure de fin
          </label>
          <input type="time" value={campaign.endTime || '18:00'} onChange={e => handleInputChange('endTime', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent" />
        </div>
      </div>

      {/* Statut calculé automatiquement */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Activity className="w-4 h-4 mr-2" />
          Statut de la campagne
        </label>
        <div className={`px-4 py-3 rounded-lg border ${computedStatus.color} border-current/20`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{computedStatus.label}</span>
            <span className="text-xs opacity-75">
              {computedStatus.value === 'draft' && 'Pas encore commencée'}
              {computedStatus.value === 'active' && 'En cours'}
              {computedStatus.value === 'ended' && 'Période terminée'}
            </span>
          </div>
        </div>
      </div>

      {/* Activation / Désactivation */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Power className="w-4 h-4 mr-2" />
          Activation
        </label>
        <button
          type="button"
          onClick={() => handleInputChange('isActive', !campaign.isActive)}
          className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:ring-offset-2 ${
            campaign.isActive ? 'bg-[#841b60]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${
              campaign.isActive ? 'translate-x-11' : 'translate-x-1'
            }`}
          />
        </button>
        <p className="text-xs text-gray-500 mt-2">
          {campaign.isActive ? 'Campagne activée' : 'Campagne désactivée'}
        </p>
      </div>
    </div>;
};
export default ModernGeneralTab;