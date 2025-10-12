
import React from 'react';
import { Palette, Settings } from 'lucide-react';
import { useQuickCampaignStore } from '../../../../stores/quickCampaignStore';

const JackpotConfiguration: React.FC = () => {
  const { jackpotColors, setJackpotColors } = useQuickCampaignStore();

  const updateJackpotColor = (field: string, value: string | number) => {
    setJackpotColors({
      ...jackpotColors,
      [field]: value
    });
  };

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Configuration Jackpot</h3>
      </div>

      <div className="space-y-6">
        {/* Couleurs du conteneur */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Couleurs du conteneur
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrière-plan du conteneur
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={jackpotColors.containerBackgroundColor}
                  onChange={(e) => updateJackpotColor('containerBackgroundColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{jackpotColors.containerBackgroundColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrière-plan principal
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={jackpotColors.backgroundColor}
                  onChange={(e) => updateJackpotColor('backgroundColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{jackpotColors.backgroundColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bordures */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Bordures</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur de bordure
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={jackpotColors.borderColor}
                  onChange={(e) => updateJackpotColor('borderColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{jackpotColors.borderColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Épaisseur de bordure: {jackpotColors.borderWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={jackpotColors.borderWidth}
                onChange={(e) => updateJackpotColor('borderWidth', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Slots */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Configuration des slots</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur bordure slot
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={jackpotColors.slotBorderColor}
                  onChange={(e) => updateJackpotColor('slotBorderColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{jackpotColors.slotBorderColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Épaisseur bordure slot: {jackpotColors.slotBorderWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={jackpotColors.slotBorderWidth}
                onChange={(e) => updateJackpotColor('slotBorderWidth', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrière-plan des slots
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={jackpotColors.slotBackgroundColor}
                  onChange={(e) => updateJackpotColor('slotBackgroundColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{jackpotColors.slotBackgroundColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JackpotConfiguration;
