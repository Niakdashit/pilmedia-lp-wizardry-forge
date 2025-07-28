import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';
interface TextPanelProps {
  onAddElement: (element: any) => void;
}

// Polices artistiques de TestPage
const fonts = [
  'Dancing Script',
  'Pacifico',
  'Satisfy',
  'Great Vibes',
  'Lobster',
  'Kaushan Script',
  'Tangerine',
  'Sacramento',
  'Yellowtail',
  'Pinyon Script',
  'Marck Script',
  'Allura',
  'Amatic SC',
  'Caveat',
  'Indie Flower',
  'Shadows Into Light',
  'Permanent Marker',
  'Architects Daughter',
  'Homemade Apple',
  'Covered By Your Grace',
  'Rock Salt'
];
const TextPanel: React.FC<TextPanelProps> = ({
  onAddElement
}) => {
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



          {/* Polices artistiques */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Polices artistiques</h4>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {fonts.map(font => <button key={font} onClick={() => addText({
            text: 'Texte artistique',
            fontFamily: font,
            fontSize: 24
          })} className="p-2 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                  <span style={{
              fontFamily: font
            }} className="text-xl">
                    {font}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Texte artistique</p>
                </button>)}
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