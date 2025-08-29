import React, { memo } from 'react';
import type { TextEffect, EffectState } from '../../../../stores/useTextEffectsStore';

interface EffectPreviewProps {
  effect: TextEffect;
  effectState: EffectState;
  isSelected?: boolean;
  isFavorite?: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  compiledCSS: Record<string, any>;
  previewText?: string;
}

const EffectPreview: React.FC<EffectPreviewProps> = memo(({
  effect,
  effectState,
  isSelected = false,
  isFavorite = false,
  onSelect,
  onToggleFavorite,
  compiledCSS,
  previewText = 'ABC'
}) => {
  return (
    <div
      className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.05]'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
          isFavorite
            ? 'bg-red-500 text-white'
            : 'bg-white/80 text-gray-400 hover:text-red-500'
        } opacity-0 group-hover:opacity-100`}
      >
        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>

      {/* Preview area */}
      <div className="p-4 h-24 flex items-center justify-center bg-gray-50 rounded-t-lg overflow-hidden">
        <span
          className="text-2xl font-bold select-none"
          style={compiledCSS}
        >
          {previewText}
        </span>
      </div>

      {/* Effect info */}
      <div className="p-3 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {effect.name}
        </h4>
        <p className="text-xs text-gray-500 capitalize">
          {effect.category}
        </p>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg border-2 border-[hsl(var(--primary))] pointer-events-none" />
      )}
    </div>
  );
});

EffectPreview.displayName = 'EffectPreview';

export default EffectPreview;