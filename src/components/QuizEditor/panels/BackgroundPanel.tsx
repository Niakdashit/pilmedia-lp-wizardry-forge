import React, { useMemo, useRef, useState } from 'react';
import { Upload, Pipette } from 'lucide-react';
import ColorThief from 'colorthief';
import { fontCategories } from './TextPanel';

const QUICK_TEXT_EFFECTS: Array<{ id: string; name: string; style: React.CSSProperties }> = [
  {
    id: 'none',
    name: 'Aucun effet',
    style: {
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      color: '#ffffff',
      padding: '8px 12px'
    }
  },
  {
    id: 'background',
    name: 'Fond surligné',
    style: {
      backgroundColor: 'rgba(251,255,0,1)',
      color: '#000000',
      borderRadius: '6px',
      padding: '8px 16px',
      display: 'inline-block'
    }
  },
  {
    id: 'yellow-button',
    name: 'Bouton jaune',
    style: {
      backgroundColor: '#FFD700',
      color: '#000000',
      fontWeight: 'bold',
      padding: '10px 24px',
      borderRadius: '9999px',
      display: 'inline-block',
      boxShadow: '0 2px 4px rgba(0,0,0,0.12)'
    }
  }
];

interface BackgroundPanelProps {
  onBackgroundChange: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  currentBackground?: { type: 'color' | 'image'; value: string };
  extractedColors?: string[];
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  onModuleUpdate?: (id: string, patch: any) => void;
  // 'fill' applies text color or shape background; 'border' applies shape borderColor
  colorEditingContext?: 'fill' | 'border' | 'text';
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ 
  onBackgroundChange, 
  onExtractedColorsChange,
  currentBackground,
  extractedColors = [],
  selectedElement,
  onElementUpdate,
  onModuleUpdate,
  colorEditingContext = 'fill'
}) => {
  console.log('🎨 BackgroundPanel component received props:', {
    selectedElementId: selectedElement?.id,
    selectedElementType: selectedElement?.type,
    hasOnElementUpdate: !!onElementUpdate,
    colorEditingContext,
    timestamp: new Date().toISOString()
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [customColor, setCustomColor] = useState('#FF0000');
  const availableFontCategories = useMemo(() => fontCategories, []);
  const [selectedFontCategory, setSelectedFontCategory] = useState(() => availableFontCategories[0]);
  
  // États pour personnaliser les couleurs des effets rapides
  const [effectBackgroundColor, setEffectBackgroundColor] = useState<string>('#FFD700');
  const [effectTextColor, setEffectTextColor] = useState<string>('#000000');
  const [currentEffectId, setCurrentEffectId] = useState<string | null>(null);

  // Vérifier si un élément est sélectionné
  const isTextSelected = selectedElement && (
    selectedElement.type === 'text' ||
    selectedElement.type === 'BlocTexte' ||
    selectedElement.elementType === 'text'
  );
  const isShapeSelected = selectedElement && selectedElement.type === 'shape';
  
  // Déterminer la couleur actuelle en fonction de la sélection et du contexte
  const getCurrentColor = () => {
    if (isTextSelected) {
      if (colorEditingContext === 'border') {
        // Texte peut ne pas avoir de bordure; fallback à la couleur du texte si absent
        return selectedElement.borderColor || selectedElement.color || '#000000';
      }
      return selectedElement.color || '#000000';
    }
    if (isShapeSelected) {
      if (colorEditingContext === 'border') {
        return selectedElement.borderColor || '#000000';
      }
      if (colorEditingContext === 'text') {
        return selectedElement.textColor || '#000000';
      }
      // Replace old blue fallback by a neutral border token to keep brand consistency
      return selectedElement.backgroundColor || 'hsl(var(--border))';
    }
    return currentBackground?.type === 'color' ? currentBackground.value : undefined;
  };
  
  console.log('🎨 BackgroundPanel render:', {
    selectedElement: selectedElement?.id || selectedElement?.type,
    selectedElementType: selectedElement?.type,
    isTextSelected,
    isShapeSelected,
    colorEditingContext,
    currentColor: getCurrentColor(),
    hasOnElementUpdate: !!onElementUpdate,
    timestamp: new Date().toISOString()
  });

  // Fonction pour appliquer une couleur
  const applyColor = (color: string) => {
    console.log('🎨 applyColor called:', {
      color,
      isTextSelected,
      isShapeSelected,
      colorEditingContext,
      hasOnElementUpdate: !!onElementUpdate,
      selectedElement: selectedElement?.id || selectedElement?.type
    });
    
    if (isTextSelected && onElementUpdate) {
      // Texte: bordure optionnelle, sinon couleur du texte
      if (colorEditingContext === 'border') {
        console.log('🎨 Updating text border color:', color);
        onElementUpdate({ borderColor: color });
      } else {
        console.log('🎨 Updating text color:', color);
        onElementUpdate({ color });
      }
    } else if (isShapeSelected && onElementUpdate) {
      // Forme: selon le contexte
      if (colorEditingContext === 'border') {
        console.log('🎨 Updating shape border color:', color);
        onElementUpdate({ borderColor: color });
      } else if (colorEditingContext === 'text') {
        console.log('🎨 Updating shape text color:', color);
        onElementUpdate({ textColor: color });
      } else {
        console.log('🎨 Updating shape background color:', color);
        onElementUpdate({ backgroundColor: color });
      }
    } else {
      // Appliquer à l'arrière-plan (toujours fill)
      console.log('🎨 Updating background color:', color);
      onBackgroundChange({ type: 'color', value: color });
    }
  };

  // La fonction getCurrentColor() est utilisée directement dans le rendu

  const backgroundColors = [
    '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA',
    '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8C69', '#87CEEB', '#98FB98'
  ];

  const currentQuickEffectId = selectedElement?.advancedStyle?.id || 'none';

  const applyQuickEffect = (effectId: string, customBgColor?: string, customTextColor?: string) => {
    const effect = QUICK_TEXT_EFFECTS.find((fx) => fx.id === effectId);
    if (!effect) return;

    // Mémoriser l'effet actuel
    setCurrentEffectId(effectId);
    
    // Si on a des couleurs personnalisées, les utiliser
    let effectCss = { ...effect.style };
    if (customBgColor) {
      effectCss.backgroundColor = customBgColor;
      setEffectBackgroundColor(customBgColor);
    } else if (effect.style.backgroundColor) {
      setEffectBackgroundColor(effect.style.backgroundColor as string);
    }
    if (customTextColor) {
      effectCss.color = customTextColor;
      setEffectTextColor(customTextColor);
    } else if (effect.style.color) {
      setEffectTextColor(effect.style.color as string);
    }

    const baseUpdates = effectId === 'none'
      ? {
          customCSS: undefined,
          advancedStyle: undefined,
          advancedStyleParams: undefined,
          textEffect: undefined,
          content: selectedElement?.content ?? ''
        }
      : {
          customCSS: effectCss,
          advancedStyle: {
            id: effectId,
            name: effect.name,
            category: 'effect',
            css: effectCss
          },
          advancedStyleParams: undefined,
          textEffect: effectId,
          content: selectedElement?.content ?? ''
        };

    // Centralize routing through DesignCanvas listener so modules/elements are handled correctly
    console.log('🎨 Dispatching applyTextEffect from BackgroundPanel', {
      effectId,
      selectedElementSummary: {
        id: (selectedElement as any)?.id || selectedElement,
        type: (selectedElement as any)?.type,
      }
    });
    const updateEvent = new CustomEvent('applyTextEffect', { detail: baseUpdates });
    window.dispatchEvent(updateEvent);
  };

  const extractColorsFromImage = async (imageUrl: string) => {
    return new Promise<string[]>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          // Extraire une palette de 8 couleurs pour avoir un bon choix
          const palette = colorThief.getPalette(img, 8);
          const extractedColors = palette.map(color => 
            `rgb(${color[0]}, ${color[1]}, ${color[2]})`
          );
          resolve(extractedColors);
        } catch (error) {
          console.error('Error extracting colors:', error);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imageUrl;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        onBackgroundChange({ type: 'image', value: imageUrl });
        
        // Extract colors from the uploaded image
        const extractedColors = await extractColorsFromImage(imageUrl);
        if (onExtractedColorsChange && extractedColors.length > 0) {
          onExtractedColorsChange(extractedColors);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerColorPicker = () => {
    colorInputRef.current?.click();
  };

  const handleCustomColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setCustomColor(newColor);
    applyColor(newColor);
  };

  return (
    <div className="p-4 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="sr-only"
      />
      
      <input
        ref={colorInputRef}
        type="color"
        value={customColor}
        onChange={handleCustomColorChange}
        className="sr-only"
      />

      {/* Indicateur retiré par demande */}

      {/* Upload Background Image - Seulement si pas de texte sélectionné */}
      {!isTextSelected && (
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-3">IMAGE DE FOND</h3>
          <button
            onClick={triggerFileUpload}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors flex flex-col items-center group"
          >
            <Upload className="w-6 h-6 mb-2 text-gray-600 group-hover:text-white" />
            <span className="text-sm text-gray-600 group-hover:text-white">Télécharger une image</span>
            <span className="text-xs text-gray-500 group-hover:text-white">PNG, JPG jusqu'à 10MB</span>
          </button>
        </div>
      )}

      {/* Solid Colors */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">
          {isShapeSelected
            ? (colorEditingContext === 'border' ? 'COULEURS DE BORDURE' : 'COULEURS DE REMPLISSAGE')
            : (isTextSelected
                ? (colorEditingContext === 'border' ? 'COULEURS DE BORDURE (TEXTE)' : 'COULEURS DE TEXTE')
                : 'COULEURS UNIES')}
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {/* Sélecteur de couleur personnalisé en première position */}
          <button
            onClick={triggerColorPicker}
            className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors relative overflow-hidden"
            style={{
              background: `conic-gradient(from 0deg, #ff0000 0deg, #ffff00 60deg, #00ff00 120deg, #00ffff 180deg, #0000ff 240deg, #ff00ff 300deg, #ff0000 360deg)`
            }}
            title="Couleur personnalisée"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Pipette className="w-3 h-3 text-gray-700" />
              </div>
            </div>
          </button>
          
          {backgroundColors.map((color, index) => (
            <button
              key={index}
              onClick={() => applyColor(color)}
              className={`w-10 h-10 rounded-full border-2 transition-colors relative ${
                getCurrentColor() === color 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            >
              {color === '#FFFFFF' && (
                <div className="absolute inset-0 border border-gray-300 rounded-full"></div>
              )}
              {getCurrentColor() === color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* FONT CATEGORIES SECTION - MOVED FROM POLICES TAB */}
      {isTextSelected && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-700">CATÉGORIES DE POLICES</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {availableFontCategories.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => setSelectedFontCategory(category)}
                className={`p-2 text-xs rounded transition-all duration-200 ${
                  selectedFontCategory.name === category.name
                    ? 'bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">{selectedFontCategory?.name || 'Aucune'}</h4>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
              {(selectedFontCategory?.fonts || []).map((font) => {
                const isActiveFont = selectedElement?.fontFamily === font;
                return (
                  <button
                    key={font}
                    type="button"
                    onClick={() => onElementUpdate?.({ fontFamily: font })}
                    className={`p-3 border rounded text-left transition-colors group ${
                      isActiveFont
                        ? 'border-[hsl(var(--primary))] bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                        : 'border-gray-200 hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white'
                    }`}
                  >
                    <span style={{ fontFamily: font }} className="text-lg font-medium group-hover:text-white">
                      {font}
                    </span>
                    <span className="block text-[11px] mt-1 text-gray-500 group-hover:text-white/80">
                      {selectedFontCategory.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick text effects (formerly modal) */}
      {isTextSelected && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-700">EFFETS RAPIDES</h3>
          <div className="space-y-2">
            {QUICK_TEXT_EFFECTS.map((effect) => {
              const isActive = currentQuickEffectId === effect.id;
              return (
                <button
                  key={effect.id}
                  type="button"
                  onClick={() => applyQuickEffect(effect.id)}
                  className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'border-[hsl(var(--primary))] bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white shadow-lg'
                      : 'border-gray-200 bg-gray-900/40 hover:border-[hsl(var(--primary))] hover:bg-gray-800/80 text-gray-100'
                  }`}
                >
                  <span className="text-sm font-medium">{effect.name}</span>
                  <span
                    className="ml-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
                    style={effect.style}
                  >
                    Aperçu
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Personnalisation des couleurs de l'effet */}
          {currentEffectId && currentEffectId !== 'none' && (
            <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-white space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Personnaliser l'effet</h4>
              
              {/* Couleur de fond */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Couleur de fond</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={effectBackgroundColor}
                    onChange={(e) => {
                      const newBgColor = e.target.value;
                      setEffectBackgroundColor(newBgColor);
                      applyQuickEffect(currentEffectId, newBgColor, effectTextColor);
                    }}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={effectBackgroundColor}
                    onChange={(e) => {
                      const newBgColor = e.target.value;
                      setEffectBackgroundColor(newBgColor);
                      applyQuickEffect(currentEffectId, newBgColor, effectTextColor);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="#FFD700"
                  />
                </div>
              </div>
              
              {/* Couleur de texte */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Couleur de texte</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={effectTextColor}
                    onChange={(e) => {
                      const newTextColor = e.target.value;
                      setEffectTextColor(newTextColor);
                      applyQuickEffect(currentEffectId, effectBackgroundColor, newTextColor);
                    }}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={effectTextColor}
                    onChange={(e) => {
                      const newTextColor = e.target.value;
                      setEffectTextColor(newTextColor);
                      applyQuickEffect(currentEffectId, effectBackgroundColor, newTextColor);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extracted Colors */}
      {extractedColors.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-3">COULEURS EXTRAITES</h3>
          <div className="grid grid-cols-5 gap-2">
            {extractedColors.map((color, index) => (
              <button
                key={index}
                onClick={() => applyColor(color)}
                className={`w-10 h-10 rounded-full border-2 transition-colors relative group ${
                  getCurrentColor() === color 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-opacity"></div>
                {getCurrentColor() === color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundPanel;