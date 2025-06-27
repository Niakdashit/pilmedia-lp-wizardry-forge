
import React from 'react';
import { Smartphone, Image } from 'lucide-react';
import ImageUpload from '../common/ImageUpload';

interface ModernMobileTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const ModernMobileTab: React.FC<ModernMobileTabProps> = ({
  campaign,
  setCampaign
}) => {
  const mobileConfig = campaign.mobileConfig || {};
  const design = campaign.design || {};

  const updateMobileConfig = (key: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      mobileConfig: { ...prev.mobileConfig, [key]: value }
    }));
  };

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
          <Smartphone className="w-6 h-6 mr-2 text-[#841b60]" />
          Configuration mobile
        </h2>
        <p className="text-gray-600">Optimisez l'affichage pour les appareils mobiles</p>
      </div>

      {/* Image de fond mobile */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Image className="w-5 h-5 mr-2" />
          Image de fond mobile (optionnel)
        </h3>
        
        <ImageUpload
          label="Image de fond spécifique mobile"
          value={design.mobileBackgroundImage || ''}
          onChange={(value) => updateDesign({ mobileBackgroundImage: value })}
        />
        
        <p className="text-xs text-gray-500">
          Si aucune image n'est définie, l'image de fond desktop sera utilisée. Format portrait recommandé (1080x1920px).
        </p>

        {design.mobileBackgroundImage && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mode d'affichage mobile</label>
              <select
                value={design.mobileBackgroundMode || 'cover'}
                onChange={(e) => updateDesign({ mobileBackgroundMode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              >
                <option value="cover">Couvrir (image rognée si nécessaire)</option>
                <option value="contain">Contenir (image entière visible)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Configuration de la mise en page mobile */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Mise en page mobile</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Orientation préférée</label>
            <select
              value={mobileConfig.orientation || 'portrait'}
              onChange={(e) => updateMobileConfig('orientation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Paysage</option>
              <option value="auto">Automatique</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Taille du jeu sur mobile</label>
            <select
              value={mobileConfig.gameSize || 'auto'}
              onChange={(e) => updateMobileConfig('gameSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            >
              <option value="auto">Automatique</option>
              <option value="small">Petit</option>
              <option value="medium">Moyen</option>
              <option value="large">Grand</option>
            </select>
          </div>
        </div>
      </div>

      {/* Optimisations mobiles */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Optimisations</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mobileConfig.enableSwipeGestures || false}
              onChange={(e) => updateMobileConfig('enableSwipeGestures', e.target.checked)}
              className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
            />
            <span className="text-sm text-gray-700">Activer les gestes tactiles</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mobileConfig.enableHapticFeedback || false}
              onChange={(e) => updateMobileConfig('enableHapticFeedback', e.target.checked)}
              className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
            />
            <span className="text-sm text-gray-700">Activer les vibrations</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mobileConfig.fullscreenMode || false}
              onChange={(e) => updateMobileConfig('fullscreenMode', e.target.checked)}
              className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
            />
            <span className="text-sm text-gray-700">Mode plein écran</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ModernMobileTab;
