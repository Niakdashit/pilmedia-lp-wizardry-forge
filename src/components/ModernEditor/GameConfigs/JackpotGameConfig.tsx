
import React from 'react';
import { Palette, Upload } from 'lucide-react';

interface JackpotGameConfigProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const JackpotGameConfig: React.FC<JackpotGameConfigProps> = ({
  campaign,
  setCampaign
}) => {
  const jackpotConfig = campaign.gameConfig?.jackpot || {};

  const updateJackpotConfig = (updates: any) => {
    setCampaign((prev: any) => {
      const updated = {
        ...prev,
        gameConfig: {
          ...prev.gameConfig,
          jackpot: {
            ...prev.gameConfig?.jackpot,
            ...updates
          }
        }
      };
      return updated;
    });
  };

  const updateButtonConfig = (buttonUpdates: any) => {
    setCampaign((prev: any) => {
      const updated = {
        ...prev,
        buttonConfig: {
          ...prev.buttonConfig,
          ...buttonUpdates
        },
        gameConfig: {
          ...prev.gameConfig,
          jackpot: {
            ...prev.gameConfig?.jackpot,
            buttonLabel: buttonUpdates.text || prev.gameConfig?.jackpot?.buttonLabel,
            buttonColor: buttonUpdates.color || prev.gameConfig?.jackpot?.buttonColor
          }
        }
      };
      return updated;
    });
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateJackpotConfig({
          backgroundImage: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (colorKey: string, value: string) => {
    updateJackpotConfig({
      [colorKey]: value
    });
  };

  const handleSliderChange = (key: string, value: number) => {
    updateJackpotConfig({
      [key]: value
    });
  };

  const handleButtonLabelChange = (value: string) => {
    updateButtonConfig({ text: value });
  };

  const handleButtonColorChange = (value: string) => {
    updateButtonConfig({ color: value });
  };

  // Valeurs actuelles avec fallbacks cohérents
  const currentButtonText = campaign.buttonConfig?.text || jackpotConfig.buttonLabel || 'Lancer le Jackpot';
  const currentButtonColor = campaign.buttonConfig?.color || jackpotConfig.buttonColor || '#ec4899';

  return (
    <div className="space-y-6">
      {/* Configuration du bouton */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Configuration du bouton
        </h3>

        {/* Texte du bouton */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Texte du bouton
          </label>
          <input
            type="text"
            value={currentButtonText}
            onChange={(e) => handleButtonLabelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Lancer le Jackpot"
          />
        </div>

        {/* Couleur du bouton */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Couleur du bouton
          </label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              style={{ backgroundColor: currentButtonColor }}
              onClick={() => document.getElementById('buttonColor')?.click()}
            />
            <input
              id="buttonColor"
              type="color"
              value={currentButtonColor}
              onChange={(e) => handleButtonColorChange(e.target.value)}
              className="sr-only"
            />
            <input
              type="text"
              value={currentButtonColor}
              onChange={(e) => handleButtonColorChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#ec4899"
            />
          </div>
        </div>
      </div>

      {/* Image de fond */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Image de fond du jeu
        </label>
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            <span>Choisir un fichier</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageUpload}
              className="hidden"
            />
          </label>
          <span className="text-sm text-gray-500">
            {jackpotConfig.backgroundImage ? 'Image sélectionnée' : 'Aucun fichier choisi'}
          </span>
        </div>
        {jackpotConfig.backgroundImage && (
          <div className="mt-2">
            <img 
              src={jackpotConfig.backgroundImage} 
              alt="Background preview" 
              className="w-24 h-16 object-cover rounded border"
            />
          </div>
        )}
      </div>

      {/* Couleurs du Jackpot */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Couleurs du Jackpot
        </h3>

        {/* Arrière-plan du conteneur */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Arrière-plan du conteneur
          </label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              style={{ backgroundColor: jackpotConfig.containerBackgroundColor || '#1f2937' }}
              onClick={() => document.getElementById('containerBg')?.click()}
            />
            <input
              id="containerBg"
              type="color"
              value={jackpotConfig.containerBackgroundColor || '#1f2937'}
              onChange={(e) => handleColorChange('containerBackgroundColor', e.target.value)}
              className="sr-only"
            />
            <input
              type="text"
              value={jackpotConfig.containerBackgroundColor || '#1f2937'}
              onChange={(e) => handleColorChange('containerBackgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#1f2937"
            />
          </div>
        </div>

        {/* Arrière-plan interne */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Arrière-plan interne
          </label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              style={{ backgroundColor: (jackpotConfig.backgroundColor || '#c4b5fd30').replace('30', '') }}
              onClick={() => document.getElementById('internalBg')?.click()}
            />
            <input
              id="internalBg"
              type="color"
              value={(jackpotConfig.backgroundColor || '#c4b5fd30').replace('30', '')}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value + '30')}
              className="sr-only"
            />
            <input
              type="text"
              value={jackpotConfig.backgroundColor || '#c4b5fd30'}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#c4b5fd30"
            />
          </div>
        </div>

        {/* Bordure principale */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Bordure principale
          </label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              style={{ backgroundColor: jackpotConfig.borderColor || '#8b5cf6' }}
              onClick={() => document.getElementById('mainBorder')?.click()}
            />
            <input
              id="mainBorder"
              type="color"
              value={jackpotConfig.borderColor || '#8b5cf6'}
              onChange={(e) => handleColorChange('borderColor', e.target.value)}
              className="sr-only"
            />
            <input
              type="text"
              value={jackpotConfig.borderColor || '#8b5cf6'}
              onChange={(e) => handleColorChange('borderColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#8b5cf6"
            />
          </div>
        </div>

        {/* Épaisseur bordure principale */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Épaisseur bordure principale ({jackpotConfig.borderWidth || 3}px)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={jackpotConfig.borderWidth || 3}
            onChange={(e) => handleSliderChange('borderWidth', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Bordure des slots */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Bordure des slots
          </label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              style={{ backgroundColor: jackpotConfig.slotBorderColor || '#a78bfa' }}
              onClick={() => document.getElementById('slotBorder')?.click()}
            />
            <input
              id="slotBorder"
              type="color"
              value={jackpotConfig.slotBorderColor || '#a78bfa'}
              onChange={(e) => handleColorChange('slotBorderColor', e.target.value)}
              className="sr-only"
            />
            <input
              type="text"
              value={jackpotConfig.slotBorderColor || '#a78bfa'}
              onChange={(e) => handleColorChange('slotBorderColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#a78bfa"
            />
          </div>
        </div>

        {/* Épaisseur bordure slots */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Épaisseur bordure slots ({jackpotConfig.slotBorderWidth || 2}px)
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={jackpotConfig.slotBorderWidth || 2}
            onChange={(e) => handleSliderChange('slotBorderWidth', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Arrière-plan des slots */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Arrière-plan des slots
          </label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              style={{ backgroundColor: jackpotConfig.slotBackgroundColor || '#ffffff' }}
              onClick={() => document.getElementById('slotBg')?.click()}
            />
            <input
              id="slotBg"
              type="color"
              value={jackpotConfig.slotBackgroundColor || '#ffffff'}
              onChange={(e) => handleColorChange('slotBackgroundColor', e.target.value)}
              className="sr-only"
            />
            <input
              type="text"
              value={jackpotConfig.slotBackgroundColor || '#ffffff'}
              onChange={(e) => handleColorChange('slotBackgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotGameConfig;
