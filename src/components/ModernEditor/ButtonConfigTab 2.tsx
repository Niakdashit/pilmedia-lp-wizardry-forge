
import React from 'react';
import { MousePointer, Palette, Square, Eye, EyeOff, Type } from 'lucide-react';

interface ButtonConfig {
  color: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  size: 'small' | 'medium' | 'large';
  link: string;
  visible: boolean;
  text: string;
}

interface ButtonConfigTabProps {
  buttonConfig: ButtonConfig;
  onButtonConfigChange: (config: ButtonConfig) => void;
}

const ButtonConfigTab: React.FC<ButtonConfigTabProps> = ({
  buttonConfig,
  onButtonConfigChange
}) => {
  const handleChange = (field: keyof ButtonConfig, value: any) => {
    onButtonConfigChange({
      ...buttonConfig,
      [field]: value
    });
  };

  const sizeOptions = [
    { value: 'small', label: 'Petit' },
    { value: 'medium', label: 'Moyen' },
    { value: 'large', label: 'Grand' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MousePointer className="w-5 h-5 mr-2" />
          Configuration des boutons
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Personnalisez le bouton de lancement du jeu
        </p>
      </div>

      {/* Texte du bouton */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Type className="w-4 h-4 mr-2" />
          Texte du bouton
        </label>
        <input
          type="text"
          value={buttonConfig.text}
          onChange={(e) => handleChange('text', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
          placeholder="Jouer"
        />
      </div>

      {/* Couleur du bouton */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Palette className="w-4 h-4 mr-2" />
          Couleur du bouton
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            value={buttonConfig.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={buttonConfig.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
            placeholder="#44444d"
          />
        </div>
      </div>

      {/* Couleur de bordure */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Square className="w-4 h-4 mr-2" />
          Couleur de bordure
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            value={buttonConfig.borderColor}
            onChange={(e) => handleChange('borderColor', e.target.value)}
            className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={buttonConfig.borderColor}
            onChange={(e) => handleChange('borderColor', e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Largeur de bordure */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Largeur de bordure (px)
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={buttonConfig.borderWidth}
          onChange={(e) => handleChange('borderWidth', Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-center">
          {buttonConfig.borderWidth}px
        </div>
      </div>

      {/* Rayon de bordure */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Rayon de bordure (px)
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={buttonConfig.borderRadius}
          onChange={(e) => handleChange('borderRadius', Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-center">
          {buttonConfig.borderRadius}px
        </div>
      </div>

      {/* Taille */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Taille du bouton
        </label>
        <div className="grid grid-cols-3 gap-2">
          {sizeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('size', option.value)}
              className={`p-1.5 text-xs rounded border transition-colors ${
                buttonConfig.size === option.value
                  ? 'bg-gradient-to-br from-[#44444d] to-[#44444d] text-white border-[#44444d]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#44444d]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lien */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Lien du bouton (optionnel)
        </label>
        <input
          type="url"
          value={buttonConfig.link}
          onChange={(e) => handleChange('link', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
          placeholder="https://example.com"
        />
      </div>

      {/* Afficher/Masquer */}
      <div className="space-y-2">
        <label className="flex items-center justify-between">
          <span className="flex items-center text-sm font-medium text-gray-700">
            {buttonConfig.visible ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            Afficher le bouton
          </span>
          <button
            onClick={() => handleChange('visible', !buttonConfig.visible)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              buttonConfig.visible ? 'bg-gradient-to-br from-[#44444d] to-[#44444d]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                buttonConfig.visible ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Aperçu du bouton */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Aperçu</label>
        <div className="p-4 bg-gray-50 rounded-lg flex justify-center">
          {buttonConfig.visible && (
            <button
              style={{
                backgroundColor: buttonConfig.color,
                borderColor: buttonConfig.borderColor,
                borderWidth: `${buttonConfig.borderWidth}px`,
                borderRadius: `${buttonConfig.borderRadius}px`,
                borderStyle: 'solid'
              }}
              className={`text-white font-medium transition-opacity hover:opacity-80 ${
                buttonConfig.size === 'small' ? 'px-2 py-1 text-xs' :
                buttonConfig.size === 'large' ? 'px-6 py-3 text-base' :
                'px-4 py-2 text-sm'
              }`}
            >
              {buttonConfig.text || 'Bouton d\'exemple'}
            </button>
          )}
          {!buttonConfig.visible && (
            <div className="text-gray-400 text-sm">Bouton masqué</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ButtonConfigTab;
