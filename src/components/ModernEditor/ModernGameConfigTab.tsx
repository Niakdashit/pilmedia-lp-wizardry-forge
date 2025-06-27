
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
  buttonConfig,
  onButtonConfigChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration du layout</h2>
        <p className="text-gray-600 text-sm">Configurez l'apparence et le comportement des boutons</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              placeholder="Jouer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur du bouton
            </label>
            <input
              type="color"
              value={buttonConfig?.color || '#841b60'}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
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
