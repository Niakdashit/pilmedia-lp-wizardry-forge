import React from 'react';
import { Move, ArrowUp, ArrowDown, Layers } from 'lucide-react';

interface MobileLayoutProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ campaign, setCampaign }) => {
  const mobileConfig = campaign.mobileConfig || {};
  const contrastBg = mobileConfig.contrastBackground || {};

  const updateMobileConfig = (key: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      mobileConfig: { ...prev.mobileConfig, [key]: value }
    }));
  };

  const updateContrastBackground = (key: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      mobileConfig: { 
        ...prev.mobileConfig, 
        contrastBackground: { 
          ...prev.mobileConfig?.contrastBackground, 
          [key]: value 
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Move className="w-5 h-5 text-[#841b60]" />
        <h3 className="text-lg font-medium text-gray-900">Layout Configuration</h3>
      </div>

      {/* Game Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Position du jeu
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['top', 'center', 'bottom'].map((position) => (
            <button
              key={position}
              onClick={() => updateMobileConfig('gamePosition', position)}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                mobileConfig.gamePosition === position
                  ? 'border-[#841b60] bg-[#f9f0f5] text-[#841b60]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium capitalize">{position}</div>
              <div className="text-xs text-gray-500 mt-1">
                {position === 'top' && 'En haut'}
                {position === 'center' && 'Centré'}
                {position === 'bottom' && 'En bas'}
              </div>
            </button>
          ))}
        </div>
        
        {/* Décalage vertical - toujours affiché */}
        <div className="mt-4">
          <label className="block text-xs text-gray-600 mb-1">
            Décalage vertical (%)
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={mobileConfig.gameVerticalOffset || 0}
            onChange={(e) =>
              updateMobileConfig('gameVerticalOffset', Number(e.target.value))
            }
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            {mobileConfig.gameVerticalOffset || 0}%
          </div>
        </div>
        
        {/* Décalage horizontal - toujours affiché */}
        <div className="mt-4">
          <label className="block text-xs text-gray-600 mb-1">
            Décalage horizontal (%)
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={mobileConfig.gameHorizontalOffset || 0}
            onChange={(e) =>
              updateMobileConfig('gameHorizontalOffset', Number(e.target.value))
            }
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            {mobileConfig.gameHorizontalOffset || 0}%
          </div>
        </div>
      </div>

      {/* Launch Button Configuration */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Configuration du bouton de lancement
        </label>
        
        {/* Hide Launch Button Toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={mobileConfig.hideLaunchButton || false}
              onChange={(e) => updateMobileConfig('hideLaunchButton', e.target.checked)}
              className="w-4 h-4 text-[#841b60] rounded focus:ring-[#841b60]"
            />
            <span className="text-sm font-medium text-gray-700">
              Masquer le bouton de lancement externe
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Le bouton sera placé au centre de la roue pour gagner de l'espace
          </p>
        </div>

        {/* Button Position - only show if not hidden */}
        {!mobileConfig.hideLaunchButton && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Position du bouton principal
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'above', label: 'Au-dessus du jeu', icon: ArrowUp },
                { value: 'below', label: 'En-dessous du jeu', icon: ArrowDown }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateMobileConfig('buttonPosition', option.value)}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    mobileConfig.buttonPosition === option.value
                      ? 'border-[#841b60] bg-[#f9f0f5] text-[#841b60]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option.icon className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text Block Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Position du bloc de texte
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['top', 'center', 'bottom'].map((position) => (
            <button
              key={position}
              onClick={() => updateMobileConfig('textPosition', position)}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                mobileConfig.textPosition === position
                  ? 'border-[#841b60] bg-[#f9f0f5] text-[#841b60]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium capitalize">{position}</div>
              <div className="text-xs text-gray-500 mt-1">
                {position === 'top' && 'En haut'}
                {position === 'center' && 'Centré'}
                {position === 'bottom' && 'En bas'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Spacing Controls */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Espacement et padding
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Padding horizontal</label>
            <input
              type="range"
              min="0"
              max="40"
              value={mobileConfig.horizontalPadding || 16}
              onChange={(e) => updateMobileConfig('horizontalPadding', Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">{mobileConfig.horizontalPadding || 16}px</div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Espacement vertical</label>
            <input
              type="range"
              min="0"
              max="60"
              value={mobileConfig.verticalSpacing || 20}
              onChange={(e) => updateMobileConfig('verticalSpacing', Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">{mobileConfig.verticalSpacing || 20}px</div>
          </div>
        </div>
      </div>

      {/* Contrast Background Section */}
      <div className="border-t pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Layers className="w-5 h-5 text-[#841b60]" />
          <h4 className="text-lg font-medium text-gray-900">Fond de contraste</h4>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={contrastBg.enabled || false}
              onChange={(e) => updateContrastBackground('enabled', e.target.checked)}
              className="w-4 h-4 text-[#841b60] rounded focus:ring-[#841b60]"
            />
            <span className="text-sm font-medium text-gray-700">
              Afficher un fond de contraste
            </span>
          </label>
        </div>

        {contrastBg.enabled && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            {/* Background Color */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Couleur de fond</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={contrastBg.color?.replace(/rgba?\([^)]+\)/, '') || '#ffffff'}
                  onChange={(e) => updateContrastBackground('color', `${e.target.value}90`)}
                  className="w-12 h-8 rounded border"
                />
                <input
                  type="text"
                  value={contrastBg.color || 'rgba(255, 255, 255, 0.9)'}
                  onChange={(e) => updateContrastBackground('color', e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border rounded"
                  placeholder="rgba(255, 255, 255, 0.9)"
                />
              </div>
            </div>

            {/* Padding */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Padding interne</label>
              <input
                type="range"
                min="0"
                max="40"
                value={contrastBg.padding || 16}
                onChange={(e) => updateContrastBackground('padding', Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">{contrastBg.padding || 16}px</div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Arrondi des angles</label>
              <input
                type="range"
                min="0"
                max="20"
                value={contrastBg.borderRadius || 8}
                onChange={(e) => updateContrastBackground('borderRadius', Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">{contrastBg.borderRadius || 8}px</div>
            </div>

            {/* Apply to Game */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={contrastBg.applyToGame || false}
                  onChange={(e) => updateContrastBackground('applyToGame', e.target.checked)}
                  className="w-4 h-4 text-[#841b60] rounded focus:ring-[#841b60]"
                />
                <span className="text-sm text-gray-700">
                  Appliquer aussi au jeu
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileLayout;
