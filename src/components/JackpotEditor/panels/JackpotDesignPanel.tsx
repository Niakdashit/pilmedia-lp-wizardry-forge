import React from 'react';
import { Palette, Upload, Eye, Layers } from 'lucide-react';

interface JackpotDesignPanelProps {
  config: any;
  onConfigUpdate: (updates: any) => void;
}

const JackpotDesignPanel: React.FC<JackpotDesignPanelProps> = ({
  config,
  onConfigUpdate
}) => {
  const jackpotConfig = config.gameConfig?.jackpot || {};
  const design = config.design || {};

  const updateJackpotConfig = (updates: any) => {
    onConfigUpdate({
      gameConfig: {
        ...config.gameConfig,
        jackpot: {
          ...jackpotConfig,
          ...updates
        }
      }
    });
  };

  const updateDesign = (updates: any) => {
    onConfigUpdate({
      design: {
        ...design,
        ...updates
      }
    });
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateDesign({
          background: {
            type: 'image',
            value: e.target?.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    updateDesign({
      background: {
        type: 'color',
        value: color
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Arrière-plan général */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Layers className="w-5 h-5 mr-2 text-purple-600" />
          Arrière-plan général
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'arrière-plan
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBackgroundColorChange(design.background?.value || '#f8fafc')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  design.background?.type === 'color' || !design.background?.type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Couleur
              </button>
              <button
                onClick={() => document.getElementById('backgroundImage')?.click()}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  design.background?.type === 'image'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Image
              </button>
            </div>
          </div>

          {design.background?.type === 'color' || !design.background?.type ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur d'arrière-plan
              </label>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                  style={{ backgroundColor: design.background?.value || '#f8fafc' }}
                  onClick={() => document.getElementById('bgColorPicker')?.click()}
                />
                <input
                  id="bgColorPicker"
                  type="color"
                  value={design.background?.value || '#f8fafc'}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="sr-only"
                />
                <input
                  type="text"
                  value={design.background?.value || '#f8fafc'}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#f8fafc"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image d'arrière-plan
              </label>
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Choisir une image</span>
                  <input
                    id="backgroundImage"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {design.background?.value && design.background?.type === 'image' && (
                <div className="mt-3">
                  <img 
                    src={design.background.value} 
                    alt="Aperçu arrière-plan" 
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Couleurs du jackpot */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-blue-600" />
          Couleurs du jackpot
        </h3>

        <div className="space-y-4">
          {/* Conteneur principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arrière-plan du conteneur
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: jackpotConfig.containerBackgroundColor || '#1f2937' }}
                onClick={() => document.getElementById('containerBg')?.click()}
              />
              <input
                id="containerBg"
                type="color"
                value={jackpotConfig.containerBackgroundColor || '#1f2937'}
                onChange={(e) => updateJackpotConfig({ containerBackgroundColor: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={jackpotConfig.containerBackgroundColor || '#1f2937'}
                onChange={(e) => updateJackpotConfig({ containerBackgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#1f2937"
              />
            </div>
          </div>

          {/* Zone de jeu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arrière-plan de la zone de jeu
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: (jackpotConfig.backgroundColor || '#c4b5fd30').replace('30', '') }}
                onClick={() => document.getElementById('gameBg')?.click()}
              />
              <input
                id="gameBg"
                type="color"
                value={(jackpotConfig.backgroundColor || '#c4b5fd30').replace('30', '')}
                onChange={(e) => updateJackpotConfig({ backgroundColor: e.target.value + '30' })}
                className="sr-only"
              />
              <input
                type="text"
                value={jackpotConfig.backgroundColor || '#c4b5fd30'}
                onChange={(e) => updateJackpotConfig({ backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#c4b5fd30"
              />
            </div>
          </div>

          {/* Bordure principale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de bordure principale
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: jackpotConfig.borderColor || '#8b5cf6' }}
                onClick={() => document.getElementById('borderColor')?.click()}
              />
              <input
                id="borderColor"
                type="color"
                value={jackpotConfig.borderColor || '#8b5cf6'}
                onChange={(e) => updateJackpotConfig({ borderColor: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={jackpotConfig.borderColor || '#8b5cf6'}
                onChange={(e) => updateJackpotConfig({ borderColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          {/* Épaisseur de bordure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Épaisseur de bordure ({jackpotConfig.borderWidth || 3}px)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={jackpotConfig.borderWidth || 3}
              onChange={(e) => updateJackpotConfig({ borderWidth: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1px</span>
              <span>5px</span>
              <span>10px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Couleurs des slots */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-green-600" />
          Slots du jackpot
        </h3>

        <div className="space-y-4">
          {/* Bordure des slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de bordure des slots
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: jackpotConfig.slotBorderColor || '#a78bfa' }}
                onClick={() => document.getElementById('slotBorderColor')?.click()}
              />
              <input
                id="slotBorderColor"
                type="color"
                value={jackpotConfig.slotBorderColor || '#a78bfa'}
                onChange={(e) => updateJackpotConfig({ slotBorderColor: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={jackpotConfig.slotBorderColor || '#a78bfa'}
                onChange={(e) => updateJackpotConfig({ slotBorderColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#a78bfa"
              />
            </div>
          </div>

          {/* Épaisseur bordure slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Épaisseur bordure slots ({jackpotConfig.slotBorderWidth || 2}px)
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={jackpotConfig.slotBorderWidth || 2}
              onChange={(e) => updateJackpotConfig({ slotBorderWidth: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1px</span>
              <span>4px</span>
              <span>8px</span>
            </div>
          </div>

          {/* Arrière-plan des slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arrière-plan des slots
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: jackpotConfig.slotBackgroundColor || '#ffffff' }}
                onClick={() => document.getElementById('slotBgColor')?.click()}
              />
              <input
                id="slotBgColor"
                type="color"
                value={jackpotConfig.slotBackgroundColor || '#ffffff'}
                onChange={(e) => updateJackpotConfig({ slotBackgroundColor: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={jackpotConfig.slotBackgroundColor || '#ffffff'}
                onChange={(e) => updateJackpotConfig({ slotBackgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu des couleurs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Aperçu des couleurs
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div 
              className="w-full h-12 rounded-lg border-2 mb-2"
              style={{ 
                backgroundColor: jackpotConfig.containerBackgroundColor || '#1f2937',
                borderColor: jackpotConfig.borderColor || '#8b5cf6'
              }}
            />
            <div className="text-xs text-gray-600">Conteneur</div>
          </div>
          
          <div className="text-center">
            <div 
              className="w-full h-12 rounded-lg border-2 mb-2"
              style={{ 
                backgroundColor: (jackpotConfig.backgroundColor || '#c4b5fd30').replace('30', ''),
                borderColor: jackpotConfig.borderColor || '#8b5cf6'
              }}
            />
            <div className="text-xs text-gray-600">Zone de jeu</div>
          </div>
          
          <div className="text-center">
            <div 
              className="w-full h-12 rounded-lg border-2 mb-2"
              style={{ 
                backgroundColor: jackpotConfig.slotBackgroundColor || '#ffffff',
                borderColor: jackpotConfig.slotBorderColor || '#a78bfa'
              }}
            />
            <div className="text-xs text-gray-600">Slots</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotDesignPanel;
