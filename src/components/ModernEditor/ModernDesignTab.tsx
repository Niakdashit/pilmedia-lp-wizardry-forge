
import React from 'react';
import { Palette, Image, Paintbrush } from 'lucide-react';
import ImageUpload from '../common/ImageUpload';
import WheelStyleSelector from '../configurators/WheelStyleSelector';

interface ModernDesignTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const ModernDesignTab: React.FC<ModernDesignTabProps> = ({
  campaign,
  setCampaign
}) => {
  const design = campaign.design || {};

  const updateDesign = (updates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      design: {
        ...prev.design,
        ...updates
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Palette className="w-6 h-6 mr-2 text-[#841b60]" />
          Design et apparence
        </h2>
        <p className="text-gray-600">Personnalisez l'apparence visuelle de votre campagne</p>
      </div>

      {/* Style de la roue */}
      {campaign.type === 'wheel' && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Paintbrush className="w-5 h-5 mr-2" />
            Style de la roue
          </h3>
          <WheelStyleSelector
            selectedStyle={campaign.wheelStyle || 'roulette_casino.svg'}
            setSelectedStyle={(style) => setCampaign((prev: any) => ({ ...prev, wheelStyle: style }))}
          />
        </div>
      )}

      {/* Couleurs principales */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Couleurs principales</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Couleur principale</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={design.primaryColor || '#841b60'}
                onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={design.primaryColor || '#841b60'}
                onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Couleur secondaire</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={design.secondaryColor || '#6d164f'}
                onChange={(e) => updateDesign({ secondaryColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={design.secondaryColor || '#6d164f'}
                onChange={(e) => updateDesign({ secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Couleur de fond</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={design.backgroundColor || '#ebf4f7'}
              onChange={(e) => updateDesign({ backgroundColor: e.target.value })}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={design.backgroundColor || '#ebf4f7'}
              onChange={(e) => updateDesign({ backgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Image de fond (Desktop/Tablette uniquement) */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Image className="w-5 h-5 mr-2" />
          Image de fond (Desktop/Tablette)
        </h3>
        
        <ImageUpload
          label="Image de fond principale"
          value={design.backgroundImage || ''}
          onChange={(value) => updateDesign({ backgroundImage: value })}
        />
        
        <p className="text-xs text-gray-500">
          Cette image sera utilisée sur desktop et tablette. Format paysage recommandé (1920x1080px).
        </p>

        {design.backgroundImage && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mode d'affichage</label>
              <select
                value={design.backgroundMode || 'cover'}
                onChange={(e) => updateDesign({ backgroundMode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              >
                <option value="cover">Couvrir (image rognée si nécessaire)</option>
                <option value="contain">Contenir (image entière visible)</option>
                <option value="stretch">Étirer (déformation possible)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Position de l'image</label>
              <select
                value={design.backgroundPosition || 'center'}
                onChange={(e) => updateDesign({ backgroundPosition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              >
                <option value="center">Centre</option>
                <option value="top">Haut</option>
                <option value="bottom">Bas</option>
                <option value="left">Gauche</option>
                <option value="right">Droite</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Effets visuels */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Effets visuels</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={design.enableShadows || false}
              onChange={(e) => updateDesign({ enableShadows: e.target.checked })}
              className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
            />
            <span className="text-sm text-gray-700">Activer les ombres</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={design.enableAnimations || true}
              onChange={(e) => updateDesign({ enableAnimations: e.target.checked })}
              className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
            />
            <span className="text-sm text-gray-700">Activer les animations</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={design.enableGradients || false}
              onChange={(e) => updateDesign({ enableGradients: e.target.checked })}
              className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
            />
            <span className="text-sm text-gray-700">Utiliser des dégradés</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ModernDesignTab;
