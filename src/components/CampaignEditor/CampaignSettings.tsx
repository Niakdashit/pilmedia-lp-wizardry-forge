
import React from 'react';

interface CampaignSettingsProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const CampaignSettings: React.FC<CampaignSettingsProps> = ({ campaign, setCampaign }) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#f9f0f5] border border-[#e9d0e5] rounded-lg p-4">
        <p className="text-[#841b60] text-sm">
          Configurez les paramètres avancés de votre campagne.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Paramètres de la campagne</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de distribution des lots
            </label>
            <select
              value={campaign.rewards?.mode || 'probability'}
              onChange={(e) => setCampaign((prev: any) => ({
                ...prev,
                rewards: { ...prev.rewards, mode: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="probability">Probabilité</option>
              <option value="quantity">Quantité limitée</option>
              <option value="timeSlots">Créneaux horaires</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Probabilité de gain (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={campaign.rewards?.probability || 10}
              onChange={(e) => setCampaign((prev: any) => ({
                ...prev,
                rewards: { ...prev.rewards, probability: Number(e.target.value) }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            />
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <input
              id="previewEnabled"
              type="checkbox"
              checked={campaign.previewEnabled || false}
              onChange={(e) =>
                setCampaign((prev: any) => ({
                  ...prev,
                  previewEnabled: e.target.checked
                }))
              }
              className="h-4 w-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
            />
            <label htmlFor="previewEnabled" className="text-sm text-gray-700">
              Aperçu en temps réel
            </label>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <input
              id="highContrast"
              type="checkbox"
              checked={campaign.accessibility?.highContrast || false}
              onChange={(e) =>
                setCampaign((prev: any) => ({
                  ...prev,
                  accessibility: {
                    ...prev.accessibility,
                    highContrast: e.target.checked
                  }
                }))
              }
              className="h-4 w-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
            />
            <label htmlFor="highContrast" className="text-sm text-gray-700">
              Mode contraste renforcé
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Google Analytics
            </label>
            <input
              type="text"
              value={campaign.analytics?.gaId || ''}
              onChange={(e) =>
                setCampaign((prev: any) => ({
                  ...prev,
                  analytics: { ...prev.analytics, gaId: e.target.value }
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignSettings;
