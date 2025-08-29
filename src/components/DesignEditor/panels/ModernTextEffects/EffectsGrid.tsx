import React, { memo, useMemo } from 'react';
import EffectPreview from './EffectPreview';
import type { TextEffect } from '../../../../stores/useTextEffectsStore';

interface EffectsGridProps {
  effects: TextEffect[];
  selectedEffect: string | null;
  favorites: string[];
  getEffectState: (effectId: string) => any;
  getCompiledCSS: (effect: TextEffect, state?: any) => Record<string, any>;
  onSelectEffect: (effectId: string) => void;
  onToggleFavorite: (effectId: string) => void;
  previewText: string;
}

const EffectsGrid: React.FC<EffectsGridProps> = memo(({
  effects,
  selectedEffect,
  favorites,
  getEffectState,
  getCompiledCSS,
  onSelectEffect,
  onToggleFavorite,
  previewText
}) => {
  const memoizedEffects = useMemo(() => {
    return effects.map(effect => {
      const effectState = getEffectState(effect.id);
      const compiledCSS = getCompiledCSS(effect, effectState);
      return {
        effect,
        effectState,
        compiledCSS,
      };
    });
  }, [effects, getEffectState, getCompiledCSS]);

  if (effects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-sm">Aucun effet trouvé</p>
        <p className="text-xs mt-1">Essayez d'autres mots-clés</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {memoizedEffects.map(({ effect, effectState, compiledCSS }) => (
        <EffectPreview
          key={effect.id}
          effect={effect}
          effectState={effectState}
          isSelected={selectedEffect === effect.id}
          isFavorite={favorites.includes(effect.id)}
          onSelect={() => onSelectEffect(effect.id)}
          onToggleFavorite={() => onToggleFavorite(effect.id)}
          compiledCSS={compiledCSS}
          previewText={previewText}
        />
      ))}
    </div>
  );
});

EffectsGrid.displayName = 'EffectsGrid';

export default EffectsGrid;