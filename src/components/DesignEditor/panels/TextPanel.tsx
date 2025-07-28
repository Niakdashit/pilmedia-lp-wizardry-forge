import React, { useState } from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';
interface TextPanelProps {
  onAddElement: (element: any) => void;
}

// Polices organisées par catégories (identique à TestPage)
const fontCategories = [
  {
    name: "Business",
    fonts: [
      'Roboto',
      'Open Sans',
      'Lato',
      'Montserrat',
      'Source Sans Pro',
      'Nunito Sans',
      'Inter',
      'Poppins',
      'Work Sans',
      'IBM Plex Sans'
    ]
  },
  {
    name: "Calm",
    fonts: [
      'Libre Baskerville',
      'Crimson Text',
      'EB Garamond',
      'Lora',
      'Merriweather',
      'Playfair Display',
      'Cormorant Garamond',
      'Spectral',
      'Source Serif Pro',
      'Vollkorn'
    ]
  },
  {
    name: "Cute",
    fonts: [
      'Caveat',
      'Indie Flower',
      'Architects Daughter',
      'Shadows Into Light',
      'Covered By Your Grace',
      'Handlee',
      'Kalam',
      'Coming Soon',
      'Sue Ellen Francisco',
      'Schoolbell'
    ]
  },
  {
    name: "Fancy",
    fonts: [
      'Cinzel',
      'Cormorant',
      'Abril Fatface',
      'Yeseva One',
      'Fredericka the Great',
      'Almendra',
      'UnifrakturMaguntia',
      'Cardo',
      'Old Standard TT',
      'Libre Caslon Text'
    ]
  },
  {
    name: "Playful",
    fonts: [
      'Lobster',
      'Pacifico',
      'Fredoka One',
      'Righteous',
      'Bungee',
      'Chewy',
      'Leckerli One',
      'Creepster',
      'Sigmar One',
      'Shrikhand'
    ]
  },
  {
    name: "Artistic",
    fonts: [
      'Dancing Script',
      'Great Vibes',
      'Allura',
      'Satisfy',
      'Kaushan Script',
      'Tangerine',
      'Sacramento',
      'Yellowtail',
      'Pinyon Script',
      'Marck Script',
      'Amatic SC',
      'Permanent Marker',
      'Homemade Apple',
      'Rock Salt'
    ]
  }
];
const TextPanel: React.FC<TextPanelProps> = ({
  onAddElement
}) => {
  const [selectedCategory, setSelectedCategory] = useState(fontCategories[0]);

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
  return <div className="p-4 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Texte</h3>
        <p className="text-sm text-muted-foreground">Ajoutez et personnalisez du texte</p>
      </div>

      <div className="space-y-6">
          {/* Bouton d'ajout simple */}
          <div>
            <button onClick={() => addText()} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center">
              <Type className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm text-gray-600">Ajouter du texte</span>
            </button>
          </div>

          {/* Sélecteur de catégories */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Catégories de polices</h4>
            <div className="grid grid-cols-3 gap-2">
              {fontCategories.map((category, index) => (
                <button
                  key={index}
                  className={`p-2 text-xs rounded cursor-pointer transition-all duration-200 ${
                    selectedCategory.name === category.name 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Polices de la catégorie sélectionnée */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">{selectedCategory.name}</h4>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {selectedCategory.fonts.map(font => (
                <button 
                  key={font} 
                  onClick={() => addText({
                    text: 'Texte stylé',
                    fontFamily: font,
                    fontSize: 24
                  })} 
                  className="p-2 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <span style={{ fontFamily: font }} className="text-xl">
                    {font}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{selectedCategory.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Texte personnalisé avec styles avancés */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Texte personnalisé</h4>
            <div className="flex space-x-2">
              <input type="text" placeholder="Votre texte..." className="flex-1 p-2 border border-gray-300 rounded-md text-sm" onKeyPress={e => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              addText({
                text: input.value || 'Nouveau texte',
                fontSize: 24
              });
              input.value = '';
            }
          }} />
              <button onClick={() => {
            const input = document.querySelector('input[placeholder="Votre texte..."]') as HTMLInputElement;
            addText({
              text: input?.value || 'Nouveau texte',
              fontSize: 24
            });
            if (input) input.value = '';
          }} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                +
              </button>
            </div>
            
            {/* Import de styles CSS personnalisés */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style CSS personnalisé
              </label>
              <textarea placeholder="color: #ff0000; font-size: 24px; text-shadow: 0 0 10px #ff0000;" className="w-full p-2 border border-gray-300 rounded-md text-xs" rows={3} onKeyPress={e => {
            if (e.key === 'Enter' && e.ctrlKey) {
              const textarea = e.target as HTMLTextAreaElement;
              if (textarea.value.trim()) {
                try {
                  const customStyle: any = {};
                  textarea.value.split(';').forEach(rule => {
                    const [property, value] = rule.split(':').map(s => s.trim());
                    if (property && value) {
                      customStyle[property] = value;
                    }
                  });
                  addText(null, {
                    id: `custom-${Date.now()}`,
                    name: 'Style personnalisé',
                    text: 'CUSTOM',
                    style: customStyle
                  });
                  textarea.value = '';
                } catch (error) {
                  console.error('Erreur dans le CSS personnalisé:', error);
                }
              }
            }
          }} />
              <p className="text-xs text-gray-500 mt-1">Appuyez sur Ctrl+Entrée pour appliquer</p>
            </div>
            
            {/* Import de HTML personnalisé */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML personnalisé
              </label>
              <textarea placeholder="<div style='font-family: Lobster, cursive; font-size: 36px; color: #ff6600;'>Mon titre stylé</div>" className="w-full p-2 border border-gray-300 rounded-md text-xs font-mono" rows={4} onKeyPress={e => {
            if (e.key === 'Enter' && e.ctrlKey) {
              const textarea = e.target as HTMLTextAreaElement;
              if (textarea.value.trim()) {
                try {
                  const newElement = {
                    id: `html-${Date.now()}`,
                    type: 'html',
                    content: textarea.value.trim(),
                    x: Math.random() * 400 + 100,
                    y: Math.random() * 300 + 100,
                    width: 300,
                    height: 150,
                    fontSize: 16,
                    color: '#000000',
                    fontFamily: 'Inter'
                  };
                  onAddElement(newElement);
                  textarea.value = '';
                } catch (error) {
                  console.error('Erreur dans le HTML personnalisé:', error);
                }
              }
            }
          }} />
              <p className="text-xs text-gray-500 mt-1">Appuyez sur Ctrl+Entrée pour appliquer</p>
            </div>
            </div>

          {/* Alignement et style */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Alignement</h4>
            <div className="flex space-x-2">
              <button onClick={() => addText({
            text: 'Texte aligné à gauche',
            textAlign: 'left'
          })} className="flex-1 p-2 border border-gray-200 rounded hover:bg-gray-100">
                <AlignLeft className="w-4 h-4 mx-auto" />
              </button>
              <button onClick={() => addText({
            text: 'Texte centré',
            textAlign: 'center'
          })} className="flex-1 p-2 border border-gray-200 rounded hover:bg-gray-100">
                <AlignCenter className="w-4 h-4 mx-auto" />
              </button>
              <button onClick={() => addText({
            text: 'Texte aligné à droite',
            textAlign: 'right'
          })} className="flex-1 p-2 border border-gray-200 rounded hover:bg-gray-100">
                <AlignRight className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Style de texte</h4>
            <div className="flex space-x-2">
              <button onClick={() => addText({
            text: 'Texte en gras',
            fontWeight: 'bold'
          })} className="p-2 border border-gray-200 rounded hover:bg-gray-100">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => addText({
            text: 'Texte en italique',
            fontStyle: 'italic'
          })} className="p-2 border border-gray-200 rounded hover:bg-gray-100">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => addText({
            text: 'Texte souligné',
            textDecoration: 'underline'
          })} className="p-2 border border-gray-200 rounded hover:bg-gray-100">
                <Underline className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>;
};
export default TextPanel;