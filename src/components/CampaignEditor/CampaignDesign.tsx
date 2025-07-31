
import React from 'react';
import { Palette, Type, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../common/ImageUpload';
import JackpotAppearance from './JackpotAppearance';
import type { OptimizedCampaign } from '../ModernEditor/types/CampaignTypes';

interface CampaignDesignProps {
  campaign: OptimizedCampaign;
  setCampaign: React.Dispatch<React.SetStateAction<OptimizedCampaign>>;
}

const CampaignDesign: React.FC<CampaignDesignProps> = ({ campaign, setCampaign }) => {
  const updateDesign = (key: string, value: string) => {
    setCampaign((prev) => ({
      ...prev,
      design: { ...prev.design, [key]: value }
    }));
  };

  return (
    <div className="space-y-8">
      {/* Apparence du jeu spécifique au Jackpot */}
      {campaign.type === 'jackpot' && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <ImageIcon className="w-5 h-5 text-[#841b60]" />
            <h3 className="text-lg font-medium text-gray-900">Apparence visuelle</h3>
          </div>
          <JackpotAppearance campaign={campaign} setCampaign={setCampaign} />
        </div>
      )}

      {/* Couleurs principales */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="w-5 h-5 text-[#841b60]" />
          <h3 className="text-lg font-medium text-gray-900">Couleurs</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur principale
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={campaign.design.primaryColor}
                onChange={(e) => updateDesign('primaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={campaign.design.primaryColor}
                onChange={(e) => updateDesign('primaryColor', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur secondaire
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={campaign.design.secondaryColor}
                onChange={(e) => updateDesign('secondaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={campaign.design.secondaryColor}
                onChange={(e) => updateDesign('secondaryColor', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arrière-plan
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={campaign.design.background}
                onChange={(e) => updateDesign('background', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={campaign.design.background}
                onChange={(e) => updateDesign('background', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typographie */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Type className="w-5 h-5 text-[#841b60]" />
          <h3 className="text-lg font-medium text-gray-900">Typographie</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Police principale
            </label>
            <select
              value={campaign.design.fontFamily}
              onChange={(e) => updateDesign('fontFamily', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="Inter">Inter</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille de police
            </label>
            <select
              value={campaign.design.fontSize}
              onChange={(e) => updateDesign('fontSize', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="small">Petite</option>
              <option value="normal">Normale</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Images générales</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUpload
            label="Logo"
            value={campaign.design.logoUrl || ''}
            onChange={(value) => updateDesign('logoUrl', value)}
          />

          <ImageUpload
            label="Image d'arrière-plan générale"
            value={campaign.design.backgroundImage || ''}
            onChange={(value) => updateDesign('backgroundImage', value)}
          />

          <ImageUpload
            label="Image d'arrière-plan mobile"
            value={campaign.design.mobileBackgroundImage || ''}
            onChange={(value) => updateDesign('mobileBackgroundImage', value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignDesign;
