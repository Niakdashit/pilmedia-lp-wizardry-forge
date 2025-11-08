import React from 'react';

interface ModernGameConfigTabProps {
  gameSize: string;
  gamePosition: string;
  onGameSizeChange: (size: string) => void;
  onGamePositionChange: (position: string) => void;
  buttonConfig: any;
  onButtonConfigChange: (config: any) => void;
}

const ModernGameConfigTab: React.FC<ModernGameConfigTabProps> = ({
  gameSize,
  gamePosition,
  onGameSizeChange,
  onGamePositionChange,
  buttonConfig,
  onButtonConfigChange
}) => {
  const positions = [
    { value: 'top-left', label: 'Haut gauche' },
    { value: 'top-center', label: 'Haut centre' },
    { value: 'top-right', label: 'Haut droite' },
    { value: 'center-left', label: 'Centre gauche' },
    { value: 'center', label: 'Centre' },
    { value: 'center-right', label: 'Centre droite' },
    { value: 'bottom-left', label: 'Bas gauche' },
    { value: 'bottom-center', label: 'Bas centre' },
    { value: 'bottom-right', label: 'Bas droite' }
  ];

  const sizes = [
    { value: 'small', label: 'Petit' },
    { value: 'medium', label: 'Moyen' },
    { value: 'large', label: 'Grand' },
    { value: 'xlarge', label: 'Très grand' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration du layout</h2>
        <p className="text-gray-600 text-sm">Configurez la position, la taille et l'apparence du jeu</p>
      </div>

      {/* Position du jeu */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Position du jeu</h3>
        <div className="grid grid-cols-3 gap-2">
          {positions.map((position) => (
            <button
              key={position.value}
              onClick={() => onGamePositionChange(position.value)}
              className={`p-3 text-sm rounded-lg border transition-all ${
                gamePosition === position.value
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-primary'
              }`}
            >
              {position.label}
            </button>
          ))}
        </div>
      </div>

      {/* Taille du jeu */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Taille du jeu</h3>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((size) => (
            <button
              key={size.value}
              onClick={() => onGameSizeChange(size.value)}
              className={`p-3 text-sm rounded-lg border transition-all ${
                gameSize === size.value
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-primary'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration des boutons */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Configuration des boutons</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte du bouton principal
            </label>
            <input
              type="text"
              value={buttonConfig?.text || 'Jouer'}
              onChange={(e) => onButtonConfigChange({ ...buttonConfig, text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="Jouer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur du bouton
            </label>
            <input
              type="color"
              value={buttonConfig?.color || '#E0004D'}
              onChange={(e) => onButtonConfigChange({ ...buttonConfig, color: e.target.value })}
              className="w-full h-10 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur du texte
            </label>
            <input
              type="color"
              value={buttonConfig?.textColor || '#ffffff'}
              onChange={(e) => onButtonConfigChange({ ...buttonConfig, textColor: e.target.value })}
              className="w-full h-10 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille du bouton
            </label>
            <select
              value={buttonConfig?.size || 'medium'}
              onChange={(e) => onButtonConfigChange({ ...buttonConfig, size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="small">Petit</option>
              <option value="medium">Moyen</option>
              <option value="large">Grand</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style du bouton
            </label>
            <select
              value={buttonConfig?.style || 'solid'}
              onChange={(e) => onButtonConfigChange({ ...buttonConfig, style: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="solid">Plein</option>
              <option value="outline">Contour</option>
              <option value="ghost">Transparent</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernGameConfigTab;