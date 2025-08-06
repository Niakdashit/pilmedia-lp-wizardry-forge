import React, { useState } from 'react';
import { Type, Wand2 } from 'lucide-react';
import TextEffectsPanel from './TextEffectsPanel';

interface TextPanelProps {
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

// Polices organisées par catégories (identique à TestPage)
const fontCategories = [{
  name: "Business",
  fonts: ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Nunito Sans', 'Inter', 'Poppins', 'Work Sans', 'IBM Plex Sans']
}, {
  name: "Calm",
  fonts: ['Libre Baskerville', 'Crimson Text', 'EB Garamond', 'Lora', 'Merriweather', 'Playfair Display', 'Cormorant Garamond', 'Spectral', 'Source Serif Pro', 'Vollkorn']
}, {
  name: "Cute",
  fonts: ['Caveat', 'Indie Flower', 'Architects Daughter', 'Shadows Into Light', 'Covered By Your Grace', 'Handlee', 'Kalam', 'Coming Soon', 'Sue Ellen Francisco', 'Schoolbell']
}, {
  name: "Fancy",
  fonts: ['Cinzel', 'Cormorant', 'Abril Fatface', 'Yeseva One', 'Fredericka the Great', 'Almendra', 'UnifrakturMaguntia', 'Cardo', 'Old Standard TT', 'Libre Caslon Text']
}, {
  name: "Playful",
  fonts: ['Lobster', 'Pacifico', 'Fredoka One', 'Righteous', 'Bungee', 'Chewy', 'Leckerli One', 'Creepster', 'Sigmar One', 'Shrikhand']
}, {
  name: "Artistic",
  fonts: ['Dancing Script', 'Great Vibes', 'Allura', 'Satisfy', 'Kaushan Script', 'Tangerine', 'Sacramento', 'Yellowtail', 'Pinyon Script', 'Marck Script', 'Amatic SC', 'Permanent Marker', 'Homemade Apple', 'Rock Salt']
}];
const TextPanel: React.FC<TextPanelProps> = ({
  onAddElement,
  selectedElement,
  onElementUpdate
}) => {
  const [selectedCategory, setSelectedCategory] = useState(fontCategories[0]);
  const [showEffects, setShowEffects] = useState(false);

  // Ajouter un texte avec préréglages optionnels
  const addText = (preset?: any, stylePreset?: any) => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: preset?.text || stylePreset?.text || 'Nouveau texte',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      fontSize: preset?.fontSize || 24,
      color: preset?.color || '#000000',
      fontFamily: preset?.fontFamily || 'Inter',
      fontWeight: preset?.fontWeight || 'normal',
      textAlign: 'left' as const,
      ...(stylePreset && {
        customCSS: stylePreset.style,
        advancedStyle: {
          id: stylePreset.id,
          name: stylePreset.name,
          category: 'preset',
          css: stylePreset.style
        }
      })
    };
    onAddElement(newElement);
  };

  if (showEffects) {
    return (
      <TextEffectsPanel 
        onBack={() => setShowEffects(false)}
        selectedElement={selectedElement}
        onElementUpdate={onElementUpdate}
      />
    );
  }

  return <div className="p-4 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Texte</h3>
        <p className="text-sm text-muted-foreground">Ajoutez et personnalisez du texte</p>
      </div>

      <div className="space-y-6">
          {/* Bouton d'ajout simple */}
          <div>
            <button onClick={() => addText()} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors flex items-center justify-center">
              <Type className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm text-gray-600">Ajouter du texte</span>
            </button>
          </div>

          {/* Sélecteur de catégories */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Catégories de polices</h4>
            <div className="grid grid-cols-3 gap-2">
              {fontCategories.map((category, index) => <button key={index} className={`p-2 text-xs rounded cursor-pointer transition-all duration-200 ${selectedCategory.name === category.name ? 'bg-[hsl(var(--primary))] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`} onClick={() => setSelectedCategory(category)}>
                  {category.name}
                </button>)}
            </div>
          </div>

          {/* Polices de la catégorie sélectionnée */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">{selectedCategory.name}</h4>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {selectedCategory.fonts.map(font => <button key={font} onClick={() => addText({
            text: 'Texte stylé',
            fontFamily: font,
            fontSize: 24
          })} className="p-2 border border-gray-200 rounded hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors text-left">
                  <span style={{
              fontFamily: font
            }} className="text-xl">
                    {font}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{selectedCategory.name}</p>
                </button>)}
            </div>
          </div>

          {/* Bouton Effets */}
          <div>
            <button 
              onClick={() => setShowEffects(true)} 
              className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center"
            >
              <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
              <span className="text-sm text-purple-600">Effets de texte</span>
            </button>
          </div>
        </div>
      </div>;
};
export default TextPanel;