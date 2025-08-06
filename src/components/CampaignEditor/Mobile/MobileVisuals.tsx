import React from 'react';
import { Smartphone } from 'lucide-react';
import ImageUpload from '../../common/ImageUpload';
import type { OptimizedCampaign } from '../../ModernEditor/types/CampaignTypes';

interface MobileVisualsProps {
  campaign: OptimizedCampaign;
  setCampaign: React.Dispatch<React.SetStateAction<OptimizedCampaign>>;
}

const MobileVisuals: React.FC<MobileVisualsProps> = ({ campaign, setCampaign }) => {
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
        <Smartphone className="w-5 h-5 text-[#841b60]" />
        <h3 className="text-lg font-medium text-gray-900">Mobile Visuals</h3>
      </div>

      {/* Mobile Background Image */}
      <div>
        <ImageUpload
          label="Image de fond mobile (1080x1920px recommandé)"
          value={mobileConfig.backgroundImage || ''}
          onChange={(value) => updateMobileConfig('backgroundImage', value)}
        />
        <p className="text-xs text-gray-500 mt-2">
          Cette image sera utilisée uniquement sur mobile. Format portrait recommandé.
        </p>
      </div>

      {/* Display Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Mode d'affichage
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'cover', label: 'Couvrir (rognée)', desc: 'Remplit l\'écran, peut être coupée' },
            { value: 'contain', label: 'Contenir (ajustée)', desc: 'Image entière visible' }
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => updateMobileConfig('backgroundMode', mode.value)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                mobileConfig.backgroundMode === mode.value
                  ? 'border-[#841b60] bg-[#f9f0f5]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{mode.label}</div>
              <div className="text-xs text-gray-500 mt-1">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Logo Overlay */}
      <div>
        <ImageUpload
          label="Logo mobile (optionnel)"
          value={typeof mobileConfig.logoOverlay === 'string' ? mobileConfig.logoOverlay : mobileConfig.logoOverlay?.src || ''}
          onChange={(value) => updateMobileConfig('logoOverlay', value)}
        />
      </div>

      {/* Logo Position */}
      {mobileConfig.logoOverlay && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Position du logo
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'top-left', label: 'Haut gauche' },
              { value: 'top-center', label: 'Haut centre' },
              { value: 'top-right', label: 'Haut droite' },
              { value: 'center', label: 'Centre' },
              { value: 'bottom-left', label: 'Bas gauche' },
              { value: 'bottom-right', label: 'Bas droite' }
            ].map((position) => (
              <button
                key={position.value}
                onClick={() => updateMobileConfig('logoPosition', position.value)}
                className={`p-3 border-2 rounded-lg text-center text-xs transition-colors ${
                  mobileConfig.logoPosition === position.value
                    ? 'border-[#841b60] bg-[#f9f0f5] text-[#841b60]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {position.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Decorative Overlay */}
      <div>
        <ImageUpload
          label="Calque décoratif (optionnel)"
          value={typeof mobileConfig.decorativeOverlay === 'string' ? mobileConfig.decorativeOverlay : mobileConfig.decorativeOverlay?.type || ''}
          onChange={(value) => updateMobileConfig('decorativeOverlay', value)}
        />
        <p className="text-xs text-gray-500 mt-2">
          Ajoutez des éléments visuels décoratifs par-dessus le fond.
        </p>
      </div>

      {/* Background Color Fallback */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur de fond de secours
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={mobileConfig.backgroundColor || '#ebf4f7'}
            onChange={(e) => updateMobileConfig('backgroundColor', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={mobileConfig.backgroundColor || '#ebf4f7'}
            onChange={(e) => updateMobileConfig('backgroundColor', e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Utilisée si aucune image de fond n'est définie.
        </p>
      </div>
    </div>
  );
};

export default MobileVisuals;
