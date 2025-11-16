// @ts-nocheck
import React, { useState } from 'react';
import { advancedTextStyles, getStylesByCategory, specializedFonts } from '../../../config/advancedTextStyles';
import { Palette, Zap, Sparkles, Crown, Gamepad2, Clock, Eye, Type } from 'lucide-react';

interface AdvancedTextPanelProps {
  onAddElement: (element: any) => void;
}


const AdvancedTextPanel: React.FC<AdvancedTextPanelProps> = ({ onAddElement }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('gradient');
  const [selectedFont, setSelectedFont] = useState<string>('Bebas Neue');

  const categories = [
    { id: 'gradient', name: 'Dégradés', icon: Palette },
    { id: '3d', name: '3D', icon: Zap },
    { id: 'neon', name: 'Néon', icon: Sparkles },
    { id: 'metallic', name: 'Métallique', icon: Crown },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
    { id: 'vintage', name: 'Vintage', icon: Clock },
    { id: 'modern', name: 'Moderne', icon: Eye },
    { id: 'luxury', name: 'Luxe', icon: Crown },
    { id: 'outline', name: 'Contour', icon: Type },
    { id: 'shadow', name: 'Ombre', icon: Eye }
  ];

  const addStyledText = (styleId: string) => {
    const style = advancedTextStyles.find(s => s.id === styleId);
    if (!style) return;

    const newElement = {
      id: `styled-text-${Date.now()}`,
      type: 'text',
      content: 'TEXTE STYLÉ',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      fontSize: 48,
      fontFamily: selectedFont,
      fontWeight: 'bold',
      color: '#000000',
      textAlign: 'center' as const,
      advancedStyle: style,
      customCSS: style.css
    };

    onAddElement(newElement);
  };

  const clearEffects = () => {
    // Dispatch the same event used by TextEffectsPanel when no direct callback is available
    const selectedTextElement = document.querySelector('[data-selected="true"][data-type="text"]');
    if (selectedTextElement) {
      const updateEvent = new CustomEvent('applyTextEffect', {
        detail: { customCSS: undefined, advancedStyle: undefined }
      });
      window.dispatchEvent(updateEvent);
    }
  };

  const stylesForCategory = getStylesByCategory(selectedCategory);
  const fontsForCategory = specializedFonts[selectedCategory as keyof typeof specializedFonts] || specializedFonts.modern;

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Styles Avancés</h3>
        <p className="text-sm text-muted-foreground">Effets de texte professionnels</p>
      </div>

      {/* Action to clear effects on selected text */}
      <div className="flex items-center justify-end">
        <button
          onClick={clearEffects}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Effacer les effets
        </button>
      </div>

      {/* Sélecteur de polices spécialisées */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Police recommandée</label>
        <select
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value)}
          className="w-full p-2 border rounded-md text-sm"
        >
          {fontsForCategory.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Catégories d'effets */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Catégorie d'effet</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 rounded-lg border text-sm flex items-center space-x-2 transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background hover:bg-muted border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Styles disponibles */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Effets {categories.find(c => c.id === selectedCategory)?.name}
        </label>
        
        <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
          {stylesForCategory.map(style => (
            <button
              key={style.id}
              onClick={() => addStyledText(style.id)}
              className="p-4 border rounded-lg text-left hover:bg-muted transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{style.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {style.category}
                </span>
              </div>
              
              {/* Aperçu du style */}
              <div 
                className="text-2xl font-bold transition-transform group-hover:scale-105"
                style={{
                  fontFamily: selectedFont,
                  ...style.css
                }}
              >
                APERÇU
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="border-t pt-4 space-y-3">
        <h4 className="text-sm font-medium">Actions Rapides</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addStyledText('gradient-fire')}
            className="p-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md text-sm font-medium"
          >
            Feu 🔥
          </button>
          <button
            onClick={() => addStyledText('neon-blue')}
            className="p-2 bg-cyan-500 text-white rounded-md text-sm font-medium"
          >
            Néon 💫
          </button>
          <button
            onClick={() => addStyledText('gold')}
            className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-md text-sm font-medium"
          >
            Or ✨
          </button>
          <button
            onClick={() => addStyledText('3d-classic')}
            className="p-2 bg-gray-600 text-white rounded-md text-sm font-medium"
          >
            3D 🎯
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTextPanel;