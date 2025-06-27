
import React from 'react';
import { Palette, Image, Paintbrush } from 'lucide-react';

interface ModernAppearanceTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const ModernAppearanceTab: React.FC<ModernAppearanceTabProps> = ({
  campaign,
  setCampaign
}) => {
  const updateDesign = (updates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      design: {
        ...prev.design,
        ...updates
      }
    }));
  };

  const updateCustomColors = (colorUpdates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      design: {
        ...prev.design,
        customColors: {
          ...prev.design?.customColors,
          ...colorUpdates
        }
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Palette className="w-6 h-6 mr-2" />
          Apparence
        </h2>
        <p className="text-sm text-gray-600">
          Personnalisez les couleurs et le style visuel de votre campagne
        </p>
      </div>

      {/* Couleurs principales */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Paintbrush className="w-4 h-4 mr-2" />
          Couleurs principales
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Couleur principale</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={campaign.design?.customColors?.primary || '#841b60'}
                onChange={(e) => updateCustomColors({ primary: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={campaign.design?.customColors?.primary || '#841b60'}
                onChange={(e) => updateCustomColors({ primary: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Couleur secondaire</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={campaign.design?.customColors?.secondary || '#4ecdc4'}
                onChange={(e) => updateCustomColors({ secondary: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={campaign.design?.customColors?.secondary || '#4ecdc4'}
                onChange={(e) => updateCustomColors({ secondary: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Couleur d'accent</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={campaign.design?.customColors?.accent || '#45b7d1'}
                onChange={(e) => updateCustomColors({ accent: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={campaign.design?.customColors?.accent || '#45b7d1'}
                onChange={(e) => updateCustomColors({ accent: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Images de fond */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Image className="w-4 h-4 mr-2" />
          Images de fond
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Fond desktop</label>
            <input
              type="url"
              value={campaign.design?.backgroundImage || ''}
              onChange={(e) => updateDesign({ backgroundImage: e.target.value })}
              placeholder="URL de l'image de fond"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Fond mobile</label>
            <input
              type="url"
              value={campaign.design?.mobileBackgroundImage || ''}
              onChange={(e) => updateDesign({ mobileBackgroundImage: e.target.value })}
              placeholder="URL de l'image de fond mobile"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Style général */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900">Style général</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={campaign.design?.enableGradients || false}
                onChange={(e) => updateDesign({ enableGradients: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Dégradés activés</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={campaign.design?.enableShadows || false}
                onChange={(e) => updateDesign({ enableShadows: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Ombres activées</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAppearanceTab;
