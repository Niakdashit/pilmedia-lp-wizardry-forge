
import React from 'react';
import { Palette, Percent, Gift } from 'lucide-react';
import { useQuickCampaignStore } from '../../../../stores/quickCampaignStore';

const ScratchConfiguration: React.FC = () => {
  const { customColors } = useQuickCampaignStore();

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Gift className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Configuration Scratch</h3>
      </div>

      <div className="space-y-6">
        {/* Couleur de grattage */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Apparence de la carte
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur de la surface à gratter
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value="#C0C0C0"
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">#C0C0C0</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur de fond révélée
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={customColors.primary}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{customColors.primary}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone de grattage */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center">
            <Percent className="w-4 h-4 mr-2" />
            Zone de grattage
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pourcentage à gratter pour révéler: 60%
            </label>
            <input
              type="range"
              min="30"
              max="90"
              defaultValue="60"
              className="w-full h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>30%</span>
              <span>90%</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Messages</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message de victoire
              </label>
              <input
                type="text"
                defaultValue="Félicitations ! Vous avez gagné !"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message de défaite
              </label>
              <input
                type="text"
                defaultValue="Pas de chance cette fois !"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Probabilité de gain */}
        <div className="bg-purple-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-800 mb-3">Paramètres de jeu</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Probabilité de gain: 10%
            </label>
            <input
              type="range"
              min="5"
              max="50"
              defaultValue="10"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScratchConfiguration;
