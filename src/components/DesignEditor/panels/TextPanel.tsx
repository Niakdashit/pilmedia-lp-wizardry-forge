import React, { useState } from 'react';
import { Type } from 'lucide-react';
import TextEffectsPanel from './TextEffectsPanel';

interface TextPanelProps {
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

// Polices organisées par catégories - Enrichies avec de nouvelles Google Fonts
const fontCategories = [{
  name: "Business",
  fonts: [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Nunito Sans', 'Inter', 'Poppins', 'Work Sans', 'IBM Plex Sans',
    // Nouvelles polices business modernes
    'DM Sans', 'Plus Jakarta Sans', 'Manrope', 'Space Grotesk', 'Outfit', 'Lexend', 'Sora', 'Red Hat Display', 'Figtree', 'Onest',
    'Geist Sans', 'Albert Sans', 'Be Vietnam Pro', 'Epilogue', 'Satoshi', 'Urbanist', 'Cabinet Grotesk', 'General Sans'
  ]
}, {
  name: "Calm",
  fonts: [
    'Libre Baskerville', 'Crimson Text', 'EB Garamond', 'Lora', 'Merriweather', 'Playfair Display', 'Cormorant Garamond', 'Spectral', 'Source Serif Pro', 'Vollkorn',
    // Nouvelles polices calmes et sereines
    'Fraunces', 'Newsreader', 'Literata', 'Crimson Pro', 'Libre Caslon Text', 'Zilla Slab', 'Bitter', 'Alegreya', 'Neuton', 'Gentium Plus',
    'Cardo', 'Domine', 'Arvo', 'Rokkitt', 'Slabo 27px', 'PT Serif', 'Droid Serif', 'Noto Serif'
  ]
}, {
  name: "Cute",
  fonts: [
    'Caveat', 'Indie Flower', 'Architects Daughter', 'Shadows Into Light', 'Covered By Your Grace', 'Handlee', 'Kalam', 'Coming Soon', 'Sue Ellen Francisco', 'Schoolbell',
    // Nouvelles polices mignonnes et amicales
    'Quicksand', 'Comfortaa', 'Nunito', 'Rubik', 'Varela Round', 'Fredoka', 'Baloo 2', 'Dosis', 'Livvic', 'Hind',
    'Karla', 'Assistant', 'Mukti', 'Catamaran', 'Muli', 'Oxygen', 'Ubuntu', 'Cabin', 'Lato', 'Raleway'
  ]
}, {
  name: "Fancy",
  fonts: [
    'Cinzel', 'Cormorant', 'Abril Fatface', 'Yeseva One', 'Fredericka the Great', 'Almendra', 'UnifrakturMaguntia', 'Cardo', 'Old Standard TT', 'Libre Caslon Text',
    // Nouvelles polices élégantes et sophistiquées
    'Bodoni Moda', 'Italiana', 'Tenor Sans', 'Marcellus', 'Forum', 'Philosopher', 'Sorts Mill Goudy', 'Bentham', 'Caudex', 'Fanwood Text',
    'Gilda Display', 'Judson', 'Linden Hill', 'Radley', 'Rufina', 'Vidaloka', 'Amiri', 'Cormorant Upright', 'Enriqueta', 'Trajan Pro'
  ]
}, {
  name: "Playful",
  fonts: [
    'Lobster', 'Pacifico', 'Fredoka One', 'Righteous', 'Bungee', 'Chewy', 'Leckerli One', 'Creepster', 'Sigmar One', 'Shrikhand',
    // Nouvelles polices ludiques et amusantes
    'Bowlby One', 'Titan One', 'Bungee Shade', 'Modak', 'Orbitron', 'Press Start 2P', 'Bangers', 'Kalam', 'Griffy', 'Luckiest Guy',
    'Lilita One', 'Bree Serif', 'Bungee Inline', 'Faster One', 'Fascinate', 'Fontdiner Swanky', 'Jolly Lodger', 'Nosifer', 'Rye', 'Special Elite'
  ]
}, {
  name: "Artistic",
  fonts: [
    'Dancing Script', 'Great Vibes', 'Allura', 'Satisfy', 'Kaushan Script', 'Tangerine', 'Sacramento', 'Yellowtail', 'Pinyon Script', 'Marck Script', 'Amatic SC', 'Permanent Marker', 'Homemade Apple', 'Rock Salt',
    // Nouvelles polices artistiques et créatives
    'Parisienne', 'Alex Brush', 'Courgette', 'Grand Hotel', 'Kalam', 'Lobster Two', 'Marmelad', 'Neucha', 'Pangolin', 'Patrick Hand',
    'Reenie Beanie', 'Shadows Into Light Two', 'Short Stack', 'Walter Turncoat', 'Zeyada', 'Bad Script', 'Caveat Brush', 'Dawning of a New Day', 'Delius', 'Gloria Hallelujah'
  ]
}];
const TextPanel: React.FC<TextPanelProps> = ({
  onAddElement,
  selectedElement,
  onElementUpdate
}) => {
  const [selectedCategory, setSelectedCategory] = useState(fontCategories[0]);
  const [showEffects, setShowEffects] = useState(false);

  // Ajouter un texte avec préréglages optionnels ou modifier le texte sélectionné
  const addText = (preset?: any, stylePreset?: any) => {
    // Si un texte est sélectionné, modifier ses propriétés au lieu de créer un nouveau texte
    if (selectedElement && selectedElement.type === 'text' && onElementUpdate) {
      const updates: any = {};
      
      // Appliquer la police si spécifiée
      if (preset?.fontFamily) {
        updates.fontFamily = preset.fontFamily;
      }
      
      // Appliquer d'autres propriétés du preset (mais PAS la taille pour préserver celle existante)
      // if (preset?.fontSize) updates.fontSize = preset.fontSize; // Commenté pour garder la taille existante
      if (preset?.color) updates.color = preset.color;
      if (preset?.fontWeight) updates.fontWeight = preset.fontWeight;
      
      // Appliquer les styles avancés si présents
      if (stylePreset) {
        updates.customCSS = stylePreset.style;
        updates.advancedStyle = {
          id: stylePreset.id,
          name: stylePreset.name,
          category: 'preset',
          css: stylePreset.style
        };
      }
      
      onElementUpdate(updates);
      return;
    }
    
    // Sinon, créer un nouveau texte comme avant
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
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
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


        </div>
      </div>;
};
export default TextPanel;