import React from 'react';
import { Sparkles, Circle } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const AdvancedWheelCustomization: React.FC = () => {
  const { wheelCustomization, setWheelCustomization } = useQuickCampaignStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Circle className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Personnalisation de la roue</h3>
      </div>

      {/* Border Radius */}
      <div className="bg-gray-50 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Arrondi des bordures: <span className="text-blue-600 font-semibold">{wheelCustomization.borderRadius}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={wheelCustomization.borderRadius}
          onChange={(e) => setWheelCustomization({ borderRadius: parseInt(e.target.value) })}
          className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Carré</span>
          <span>Très arrondi</span>
        </div>
      </div>

      {/* Shadow */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Intensité de l'ombre: <span className="text-blue-600 font-semibold">{wheelCustomization.shadowIntensity}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={wheelCustomization.shadowIntensity}
            onChange={(e) => setWheelCustomization({ shadowIntensity: parseInt(e.target.value) })}
            className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur de l'ombre
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={wheelCustomization.shadowColor}
              onChange={(e) => setWheelCustomization({ shadowColor: e.target.value })}
              className="w-12 h-8 rounded-lg border border-gray-300 cursor-pointer"
            />
            <span className="text-sm text-gray-600">{wheelCustomization.shadowColor}</span>
          </div>
        </div>
      </div>

      {/* Effects */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h4 className="font-medium text-gray-900">Effets spéciaux</h4>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wheelCustomization.bevelEffect}
              onChange={(e) => setWheelCustomization({ bevelEffect: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Effet de biseau 3D</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wheelCustomization.glowEffect}
              onChange={(e) => setWheelCustomization({ glowEffect: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Effet de lueur</span>
          </label>
          
          {wheelCustomization.glowEffect && (
            <div className="ml-7 flex items-center space-x-3">
              <input
                type="color"
                value={wheelCustomization.glowColor}
                onChange={(e) => setWheelCustomization({ glowColor: e.target.value })}
                className="w-8 h-6 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-600">Couleur de la lueur</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedWheelCustomization;
