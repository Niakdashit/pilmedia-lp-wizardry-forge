
import React from 'react';
import { Dice6, Target, Settings } from 'lucide-react';
import { useQuickCampaignStore } from '../../../../stores/quickCampaignStore';

const DiceConfiguration: React.FC = () => {
  const { customColors } = useQuickCampaignStore();

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Dice6 className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">Configuration Dés</h3>
      </div>

      <div className="space-y-6">
        {/* Nombre de dés */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Configuration des dés
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de dés: 2
            </label>
            <input
              type="range"
              min="1"
              max="6"
              defaultValue="2"
              className="w-full h-2 bg-gradient-to-r from-red-200 to-orange-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1 dé</span>
              <span>6 dés</span>
            </div>
          </div>
        </div>

        {/* Conditions de victoire */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Conditions de victoire
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="double"
                defaultChecked
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="double" className="text-sm font-medium text-gray-700">
                Double (même valeur sur tous les dés)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="sum7"
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="sum7" className="text-sm font-medium text-gray-700">
                Somme égale à 7
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="sum11"
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="sum11" className="text-sm font-medium text-gray-700">
                Somme égale à 11
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allSix"
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="allSix" className="text-sm font-medium text-gray-700">
                Tous les dés montrent 6
              </label>
            </div>
          </div>
        </div>

        {/* Apparence des dés */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Apparence</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur des dés
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur des points
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value="#ffffff"
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">#ffffff</span>
              </div>
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
                defaultValue="Excellent ! Vous avez gagné !"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message de défaite
              </label>
              <input
                type="text"
                defaultValue="Dommage ! Tentez votre chance à nouveau !"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiceConfiguration;
