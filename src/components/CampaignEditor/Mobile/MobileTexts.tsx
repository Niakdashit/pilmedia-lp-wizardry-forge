import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Eye, EyeOff } from 'lucide-react';
import type { OptimizedCampaign } from '../../ModernEditor/types/CampaignTypes';

interface MobileTextsProps {
  campaign: OptimizedCampaign;
  setCampaign: React.Dispatch<React.SetStateAction<OptimizedCampaign>>;
}

const MobileTexts: React.FC<MobileTextsProps> = ({ campaign, setCampaign }) => {
  const mobileConfig = campaign.mobileConfig || {};

  const updateMobileConfig = (key: string, value: unknown) => {
    setCampaign((prev) => ({
      ...prev,
      mobileConfig: { ...prev.mobileConfig, [key]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Type className="w-5 h-5 text-[#841b60]" />
        <h3 className="text-lg font-medium text-gray-900">Texts & Titles</h3>
      </div>

      {/* Show/Hide Controls */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Affichage des éléments</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm">
              <Eye className="w-4 h-4" />
              <span>Afficher le titre</span>
            </label>
            <button
              onClick={() => updateMobileConfig('showTitle', !(mobileConfig.showTitle !== false))}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs transition-colors ${
                mobileConfig.showTitle !== false
                  ? 'bg-[#841b60] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {mobileConfig.showTitle !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>{mobileConfig.showTitle !== false ? 'Visible' : 'Masqué'}</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm">
              <Eye className="w-4 h-4" />
              <span>Afficher la description</span>
            </label>
            <button
              onClick={() => updateMobileConfig('showDescription', !(mobileConfig.showDescription !== false))}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs transition-colors ${
                mobileConfig.showDescription !== false
                  ? 'bg-[#841b60] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {mobileConfig.showDescription !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>{mobileConfig.showDescription !== false ? 'Visible' : 'Masqué'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Title */}
      {mobileConfig.showTitle !== false && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre mobile
          </label>
          <input
            type="text"
            value={mobileConfig.title || campaign.name || ''}
            onChange={(e) => updateMobileConfig('title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            placeholder="Titre spécifique au mobile"
          />
          <p className="text-xs text-gray-500 mt-1">
            Laissez vide pour utiliser le titre de la campagne
          </p>
        </div>
      )}

      {/* Mobile Description */}
      {mobileConfig.showDescription !== false && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description mobile
          </label>
          <textarea
            value={mobileConfig.description || campaign.description || ''}
            onChange={(e) => updateMobileConfig('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            placeholder="Description spécifique au mobile"
          />
          <p className="text-xs text-gray-500 mt-1">
            Laissez vide pour utiliser la description de la campagne
          </p>
        </div>
      )}

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Police de caractères
        </label>
        <select
          value={mobileConfig.fontFamily || 'Inter'}
          onChange={(e) => updateMobileConfig('fontFamily', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
        >
          <option value="Inter">Inter</option>
          <option value="Poppins">Poppins</option>
          <option value="Roboto">Roboto</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
        </select>
      </div>

      {/* Title Styling */}
      {mobileConfig.showTitle !== false && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Style du titre
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Couleur</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={mobileConfig.titleColor || '#000000'}
                  onChange={(e) => updateMobileConfig('titleColor', e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={mobileConfig.titleColor || '#000000'}
                  onChange={(e) => updateMobileConfig('titleColor', e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#841b60]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Taille</label>
              <select
                value={mobileConfig.titleSize || 'text-lg'}
                onChange={(e) => updateMobileConfig('titleSize', e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#841b60]"
              >
                <option value="text-sm">Petite (14px)</option>
                <option value="text-base">Normale (16px)</option>
                <option value="text-lg">Grande (18px)</option>
                <option value="text-xl">Très grande (20px)</option>
                <option value="text-2xl">Extra grande (24px)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Poids</label>
              <select
                value={mobileConfig.titleWeight || 'font-bold'}
                onChange={(e) => updateMobileConfig('titleWeight', e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#841b60]"
              >
                <option value="font-normal">Normal</option>
                <option value="font-medium">Medium</option>
                <option value="font-semibold">Semi-bold</option>
                <option value="font-bold">Bold</option>
                <option value="font-extrabold">Extra-bold</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Alignement</label>
              <div className="flex space-x-1">
                {[
                  { value: 'text-left', icon: AlignLeft },
                  { value: 'text-center', icon: AlignCenter },
                  { value: 'text-right', icon: AlignRight }
                ].map((align) => (
                  <button
                    key={align.value}
                    onClick={() => updateMobileConfig('titleAlignment', align.value)}
                    className={`p-2 border rounded transition-colors ${
                      mobileConfig.titleAlignment === align.value
                        ? 'border-[#841b60] bg-[#f9f0f5] text-[#841b60]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <align.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Styling */}
      {mobileConfig.showDescription !== false && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Style de la description
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Couleur</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={mobileConfig.descriptionColor || '#666666'}
                  onChange={(e) => updateMobileConfig('descriptionColor', e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={mobileConfig.descriptionColor || '#666666'}
                  onChange={(e) => updateMobileConfig('descriptionColor', e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#841b60]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Taille</label>
              <select
                value={mobileConfig.descriptionSize || 'text-sm'}
                onChange={(e) => updateMobileConfig('descriptionSize', e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#841b60]"
              >
                <option value="text-xs">Très petite (12px)</option>
                <option value="text-sm">Petite (14px)</option>
                <option value="text-base">Normale (16px)</option>
                <option value="text-lg">Grande (18px)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-3">
            <label className="block text-xs text-gray-600 mb-1">Alignement</label>
            <div className="flex space-x-1">
              {[
                { value: 'text-left', icon: AlignLeft },
                { value: 'text-center', icon: AlignCenter },
                { value: 'text-right', icon: AlignRight }
              ].map((align) => (
                <button
                  key={align.value}
                  onClick={() => updateMobileConfig('descriptionAlignment', align.value)}
                  className={`p-2 border rounded transition-colors ${
                    mobileConfig.descriptionAlignment === align.value
                      ? 'border-[#841b60] bg-[#f9f0f5] text-[#841b60]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <align.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileTexts;
