import React, { memo } from 'react';
import type { TextEffect, EffectState } from '../../../../stores/useTextEffectsStore';

interface EffectControlsProps {
  effect: TextEffect;
  effectState: EffectState;
  onUpdateState: (updates: Partial<EffectState>) => void;
}

const EffectControls: React.FC<EffectControlsProps> = memo(({
  effect,
  effectState,
  onUpdateState
}) => {
  if (!effect.controls) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Cet effet n'a pas de contrôles personnalisables
      </div>
    );
  }

  const renderControl = (controlName: string, config: any) => {
    const value = effectState[controlName as keyof EffectState];
    
    switch (controlName) {
      case 'color':
        return (
          <div key={controlName} className="space-y-2">
            <label className="text-sm font-medium text-gray-700 capitalize">
              {controlName}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={value as string}
                onChange={(e) => onUpdateState({ [controlName]: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={value as string}
                onChange={(e) => onUpdateState({ [controlName]: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                placeholder="#000000"
              />
            </div>
          </div>
        );

      case 'intensity':
      case 'blur':
      case 'opacity':
      case 'spread':
      case 'direction':
      case 'angle':
      case 'metalness':
      case 'roughness':
        const { min, max } = config;
        const numValue = value as number;
        return (
          <div key={controlName} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 capitalize">
                {controlName}
              </label>
              <span className="text-sm text-gray-500 font-mono">
                {numValue}
                {controlName === 'angle' || controlName === 'direction' ? '°' : ''}
                {controlName === 'opacity' ? '%' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min={min}
                max={max}
                value={numValue}
                onChange={(e) => onUpdateState({ [controlName]: Number(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((numValue - min) / (max - min)) * 100}%, #e5e7eb ${((numValue - min) / (max - min)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm min-w-[80px]">
                <button 
                  onClick={() => onUpdateState({ [controlName]: Math.max(min, numValue - 5) })}
                  className="hover:bg-gray-700 px-1 rounded text-xs"
                >
                  −
                </button>
                <span className="flex-1 text-center text-xs">{numValue}</span>
                <button 
                  onClick={() => onUpdateState({ [controlName]: Math.min(max, numValue + 5) })}
                  className="hover:bg-gray-700 px-1 rounded text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h3 className="text-sm font-semibold text-gray-900">{effect.name}</h3>
        <button
          onClick={() => {
            // Reset to default values
            const resetState: Partial<EffectState> = {};
            Object.entries(effect.controls || {}).forEach(([key, config]) => {
              if (typeof config === 'object' && config.default !== undefined) {
                (resetState as any)[key] = config.default;
              }
            });
            onUpdateState(resetState);
          }}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
        >
          Réinitialiser
        </button>
      </div>
      
      <div className="space-y-4">
        {Object.entries(effect.controls).map(([controlName, config]) =>
          renderControl(controlName, config)
        )}
      </div>

      {/* Blend mode selector if supported */}
      {effect.blendMode && (
        <div className="space-y-2 border-t border-gray-200 pt-4">
          <label className="text-sm font-medium text-gray-700">
            Mode de fusion
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            defaultValue="normal"
          >
            <option value="normal">Normal</option>
            <option value="multiply">Multiplier</option>
            <option value="screen">Écran</option>
            <option value="overlay">Superposition</option>
            <option value="soft-light">Lumière douce</option>
            <option value="hard-light">Lumière dure</option>
            <option value="color-dodge">Densité couleur -</option>
            <option value="color-burn">Densité couleur +</option>
            <option value="difference">Différence</option>
            <option value="exclusion">Exclusion</option>
          </select>
        </div>
      )}
    </div>
  );
});

EffectControls.displayName = 'EffectControls';

export default EffectControls;