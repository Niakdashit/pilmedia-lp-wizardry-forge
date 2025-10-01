import React, { useMemo, useState } from 'react';
import { fontCategories } from './TextPanel';

interface FontPanelProps {
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

const FontPanel: React.FC<FontPanelProps> = ({
  selectedElement,
  onElementUpdate
}) => {
  const availableFontCategories = useMemo(() => fontCategories, []);
  const [selectedFontCategory, setSelectedFontCategory] = useState(() => availableFontCategories[0]);

  // Vérifier si un élément texte est sélectionné
  const isTextSelected = selectedElement && (
    selectedElement.type === 'text' ||
    selectedElement.type === 'BlocTexte' ||
    selectedElement.elementType === 'text'
  );

  console.log('🎨 FontPanel render:', {
    isTextSelected,
    selectedElementType: selectedElement?.type,
    hasOnElementUpdate: !!onElementUpdate,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="p-4 space-y-6">
      {/* DEBUG: Test visibility */}
      <div className="bg-green-100 border border-green-400 p-2 text-xs text-green-800">
        🎨 DEBUG: FontPanel is rendering. Text selected: {isTextSelected ? 'YES' : 'NO'}
      </div>

      {/* Indicateur de ce qui sera modifié */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800 font-medium">
          {isTextSelected ? (
            <>
              🎨 Modification des polices du texte sélectionné
              <span className="block text-xs text-blue-600 mt-1">
                Les polices seront appliquées au texte "{selectedElement.text || selectedElement.content || 'Texte'}"
              </span>
            </>
          ) : (
            <>
              🎨 Sélection de polices
              <span className="block text-xs text-blue-600 mt-1">
                Sélectionnez un texte pour appliquer une police
              </span>
            </>
          )}
        </p>
      </div>

      {/* Section Catégories de polices */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-700">CATÉGORIES DE POLICES</h3>
          <span className="text-[11px] text-gray-400">
            {isTextSelected && onElementUpdate
              ? 'Appliquer à la sélection'
              : 'Sélectionnez un texte pour appliquer'}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {availableFontCategories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => setSelectedFontCategory(category)}
              className={`p-2 text-xs rounded transition-all duration-200 ${
                selectedFontCategory.name === category.name
                  ? 'bg-[radial-gradient(circle_at_0%_0%,_#d4dbe8,_#b41b60)] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">{selectedFontCategory?.name || 'Aucune'}</h4>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
            {(selectedFontCategory?.fonts || []).map((font) => {
              const isActiveFont = selectedElement?.fontFamily === font;
              const disabled = !isTextSelected || !onElementUpdate;
              return (
                <button
                  key={font}
                  type="button"
                  onClick={() => {
                    if (!disabled) {
                      console.log('🎨 Applying font:', font, 'to element:', selectedElement?.id);
                      onElementUpdate?.({ fontFamily: font });
                    }
                  }}
                  disabled={disabled}
                  className={`p-3 border rounded text-left transition-colors group ${
                    isActiveFont
                      ? 'border-[hsl(var(--primary))] bg-[radial-gradient(circle_at_0%_0%,_#d4dbe8,_#b41b60)] text-white'
                      : 'border-gray-200 hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#d4dbe8,_#b41b60)] hover:text-white'
                  } ${disabled ? 'opacity-60 cursor-not-allowed hover:border-gray-200 hover:bg-transparent hover:text-gray-500' : ''}`}
                >
                  <span style={{ fontFamily: font }} className={`text-lg font-medium ${disabled ? 'text-gray-600' : 'group-hover:text-white'}`}>
                    {font}
                  </span>
                  <span className={`block text-[11px] mt-1 ${disabled ? 'text-gray-400' : 'text-gray-500 group-hover:text-white/80'}`}>
                    {selectedFontCategory.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontPanel;
