import React from 'react';
import { Palette, Settings, Image, Zap } from 'lucide-react';

interface JackpotConfigPanelProps {
  config: {
    containerColor?: string;
    slotBackgroundColor?: string;
    slotBorderColor?: string;
    buttonColor?: string;
    borderStyle?: 'classic' | 'neon' | 'metallic' | 'luxury';
    borderWidth?: number;
    symbols?: string[];
    winProbability?: number;
    backgroundImage?: string;
  };
  onConfigChange: (updates: any) => void;
}

const JackpotConfigPanel: React.FC<JackpotConfigPanelProps> = ({
  config,
  onConfigChange
}) => {
  const borderStyles = [
    { value: 'classic', label: 'Classique', icon: '⚪' },
    { value: 'neon', label: 'Néon', icon: '💫' },
    { value: 'metallic', label: 'Métallique', icon: '🔘' },
    { value: 'luxury', label: 'Luxe', icon: '✨' }
  ];

  const symbolSets = [
    { label: 'Fruits', symbols: ['🍒', '🍋', '🍊', '🍇', '🍓', '🥝', '🍑', '🍌'] },
    { label: 'Casino', symbols: ['🎰', '🔔', '💎', '⭐', '🍀', '🎯', '🎲', '♠️'] },
    { label: 'Émojis', symbols: ['😀', '😎', '🤩', '😍', '🥳', '😊', '🔥', '💯'] },
    { label: 'Animaux', symbols: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'] }
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Couleurs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Palette className="w-4 h-4" />
          Couleurs
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Conteneur</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.containerColor || '#1f2937'}
                onChange={(e) => onConfigChange({ containerColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={config.containerColor || '#1f2937'}
                onChange={(e) => onConfigChange({ containerColor: e.target.value })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Slots</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.slotBackgroundColor || '#ffffff'}
                onChange={(e) => onConfigChange({ slotBackgroundColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={config.slotBackgroundColor || '#ffffff'}
                onChange={(e) => onConfigChange({ slotBackgroundColor: e.target.value })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Bordure slots</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.slotBorderColor || '#e5e7eb'}
                onChange={(e) => onConfigChange({ slotBorderColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={config.slotBorderColor || '#e5e7eb'}
                onChange={(e) => onConfigChange({ slotBorderColor: e.target.value })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Bouton</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.buttonColor || '#ec4899'}
                onChange={(e) => onConfigChange({ buttonColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={config.buttonColor || '#ec4899'}
                onChange={(e) => onConfigChange({ buttonColor: e.target.value })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Style de bordure */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Zap className="w-4 h-4" />
          Style de bordure
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {borderStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => onConfigChange({ borderStyle: style.value })}
              className={`p-3 rounded-lg border-2 transition-all ${
                config.borderStyle === style.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-lg mb-1">{style.icon}</div>
              <div className="text-xs font-medium">{style.label}</div>
            </button>
          ))}
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Épaisseur bordure: {config.borderWidth || 3}px
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={config.borderWidth || 3}
            onChange={(e) => onConfigChange({ borderWidth: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Symboles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Settings className="w-4 h-4" />
          Symboles
        </div>
        
        <div className="space-y-2">
          {symbolSets.map((set) => (
            <button
              key={set.label}
              onClick={() => onConfigChange({ symbols: set.symbols })}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                JSON.stringify(config.symbols) === JSON.stringify(set.symbols)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm mb-1">{set.label}</div>
              <div className="text-lg">{set.symbols.slice(0, 6).join(' ')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Probabilité de gain */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Settings className="w-4 h-4" />
          Probabilité de gain
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Chance de gagner: {Math.round((config.winProbability || 0.3) * 100)}%
          </label>
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.05"
            value={config.winProbability || 0.3}
            onChange={(e) => onConfigChange({ winProbability: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Image de fond */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Image className="w-4 h-4" />
          Image de fond
        </div>
        
        <div className="space-y-2">
          <input
            type="url"
            placeholder="URL de l'image de fond"
            value={config.backgroundImage || ''}
            onChange={(e) => onConfigChange({ backgroundImage: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
          />
          
          {config.backgroundImage && (
            <button
              onClick={() => onConfigChange({ backgroundImage: '' })}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Supprimer l'image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JackpotConfigPanel;
