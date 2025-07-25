import React from 'react';
import { Clock, Users, Target, FileText } from 'lucide-react';

interface CampaignConfigPanelProps {
  config?: any;
  onConfigChange: (config: any) => void;
}

const CampaignConfigPanel: React.FC<CampaignConfigPanelProps> = ({
  config = {},
  onConfigChange
}) => {
  const handleChange = (key: string, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Type de campagne */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Target className="w-4 h-4 inline mr-2" />
          Type de campagne
        </label>
        <select
          value={config.type || 'instant-win'}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="instant-win">Instant Gagnant</option>
          <option value="quiz">Quiz</option>
          <option value="memory">Jeu de Mémoire</option>
          <option value="scratch">Jeu à Gratter</option>
          <option value="wheel">Roue de Fortune</option>
        </select>
      </div>

      {/* Informations générales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Titre de la campagne
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Ex: Grande Tombola de Noël"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={config.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Description de votre campagne..."
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Durée et dates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-2" />
          Durée de la campagne
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date de début</label>
            <input
              type="datetime-local"
              value={config.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date de fin</label>
            <input
              type="datetime-local"
              value={config.endDate || ''}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Nombre de participants */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="w-4 h-4 inline mr-2" />
          Limite de participants
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="unlimited"
            checked={config.unlimitedParticipants || false}
            onChange={(e) => handleChange('unlimitedParticipants', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="unlimited" className="text-sm text-gray-700">
            Illimité
          </label>
        </div>
        {!config.unlimitedParticipants && (
          <input
            type="number"
            value={config.maxParticipants || ''}
            onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value))}
            placeholder="Ex: 1000"
            className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Template */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template de base
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['Moderne', 'Classique', 'Festif', 'Corporatif'].map((template) => (
            <button
              key={template}
              onClick={() => handleChange('template', template.toLowerCase())}
              className={`p-3 text-sm border rounded-md transition-colors ${
                config.template === template.toLowerCase()
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {template}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignConfigPanel;