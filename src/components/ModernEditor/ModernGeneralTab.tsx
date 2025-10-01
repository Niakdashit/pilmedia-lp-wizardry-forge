import React from 'react';
import { Calendar, Clock, Globe, Tag, Activity } from 'lucide-react';
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
  const statusOptions = [{
    value: 'draft',
    label: 'Brouillon'
  }, {
    value: 'active',
    label: 'Actif'
  }, {
    value: 'paused',
    label: 'En pause'
  }, {
    value: 'ended',
    label: 'Terminé'
  }];
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
        <input type="text" value={campaign.name || ''} onChange={e => handleInputChange('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent" placeholder="Ma nouvelle campagne" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea value={campaign.description || ''} onChange={e => handleInputChange('description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent" rows={3} placeholder="Description de la campagne..." />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Globe className="w-4 h-4 mr-2" />
          URL de la campagne
        </label>
        <input type="url" value={campaign.url || ''} onChange={e => handleInputChange('url', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent" placeholder="https://example.com/campagne" />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 mr-2" />
            Date de début
          </label>
          <input type="date" value={campaign.startDate || ''} onChange={e => handleInputChange('startDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent" />
        </div>
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 mr-2" />
            Date de fin
          </label>
          <input type="date" value={campaign.endDate || ''} onChange={e => handleInputChange('endDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent" />
        </div>
      </div>

      {/* Heures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-2" />
            Heure de début
          </label>
          <input type="time" value={campaign.startTime || '09:00'} onChange={e => handleInputChange('startTime', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent" />
        </div>
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-2" />
            Heure de fin
          </label>
          <input type="time" value={campaign.endTime || '18:00'} onChange={e => handleInputChange('endTime', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent" />
        </div>
      </div>

      {/* Statut */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Activity className="w-4 h-4 mr-2" />
          Statut
        </label>
        <select value={campaign.status || 'draft'} onChange={e => handleInputChange('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent">
          {statusOptions.map(option => <option key={option.value} value={option.value}>
              {option.label}
            </option>)}
        </select>
      </div>
    </div>;
};
export default ModernGeneralTab;