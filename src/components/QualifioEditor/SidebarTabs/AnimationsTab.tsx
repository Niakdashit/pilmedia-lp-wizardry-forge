
import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface AnimationsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const AnimationsTab: React.FC<AnimationsTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const handleAnimationToggle = (animationType: string, enabled: boolean) => {
    onConfigUpdate({
      animations: {
        ...config.animations,
        [animationType]: enabled
      }
    });
  };

  const handleAnimationDurationChange = (animationType: string, duration: number) => {
    onConfigUpdate({
      animations: {
        ...config.animations,
        [`${animationType}Duration`]: duration
      }
    });
  };

  const animations = config.animations || {};

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Animations</h2>
        <p className="text-sm text-gray-600 mb-6">
          Configurez les animations pour améliorer l'expérience utilisateur.
        </p>
      </div>

      {/* Animation d'entrée */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800">Animation d'entrée</h3>
        
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Activer l'animation d'entrée</label>
          <input
            type="checkbox"
            checked={animations.fadeIn || false}
            onChange={(e) => handleAnimationToggle('fadeIn', e.target.checked)}
            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
        </div>

        {animations.fadeIn && (
          <div className="space-y-2">
            <label className="text-sm text-gray-700">Durée (ms)</label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={animations.fadeInDuration || 500}
              onChange={(e) => handleAnimationDurationChange('fadeIn', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500">{animations.fadeInDuration || 500}ms</div>
          </div>
        )}
      </div>

      {/* Animation de la roue */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800">Animation de la roue</h3>
        
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Animation de rotation fluide</label>
          <input
            type="checkbox"
            checked={animations.smoothRotation !== false}
            onChange={(e) => handleAnimationToggle('smoothRotation', e.target.checked)}
            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Effet de rebond</label>
          <input
            type="checkbox"
            checked={animations.bounceEffect || false}
            onChange={(e) => handleAnimationToggle('bounceEffect', e.target.checked)}
            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Animations des éléments */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800">Éléments interactifs</h3>
        
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Animation des boutons au survol</label>
          <input
            type="checkbox"
            checked={animations.buttonHover !== false}
            onChange={(e) => handleAnimationToggle('buttonHover', e.target.checked)}
            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Transition des textes</label>
          <input
            type="checkbox"
            checked={animations.textTransition || false}
            onChange={(e) => handleAnimationToggle('textTransition', e.target.checked)}
            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Prévisualisation */}
      <div className="border-t pt-4">
        <h3 className="text-md font-medium text-gray-800 mb-2">Prévisualisation</h3>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div 
            className={`inline-block w-16 h-16 bg-brand-primary rounded-full transition-all duration-300 ${
              animations.fadeIn ? 'animate-fade-in' : ''
            } ${
              animations.buttonHover ? 'hover:scale-110' : ''
            }`}
          />
          <p className="text-sm text-gray-600 mt-2">Élément de test pour les animations</p>
        </div>
      </div>
    </div>
  );
};

export default AnimationsTab;
