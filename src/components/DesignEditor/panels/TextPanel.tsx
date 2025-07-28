import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';

interface TextPanelProps {
  onAddElement: (element: any) => void;
}

const TextPanel: React.FC<TextPanelProps> = ({ onAddElement }) => {
  const textPresets = [
    { id: 'heading', text: 'Titre principal', fontSize: 48, fontWeight: 'bold' },
    { id: 'subheading', text: 'Sous-titre', fontSize: 32, fontWeight: '600' },
    { id: 'body', text: 'Texte du corps', fontSize: 16, fontWeight: 'normal' },
    { id: 'caption', text: 'Légende', fontSize: 12, fontWeight: 'normal' },
  ];

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS'
  ];

const stylePresets = [
    {
      id: 'fitness',
      name: 'Style Fitness',
      preview: 'FITNESS',
      style: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        backgroundColor: '#00FF88',
        borderRadius: 8,
        padding: { top: 8, right: 16, bottom: 8, left: 16 },
        textShadow: { color: '#000000', blur: 2, offsetX: 1, offsetY: 1 }
      }
    },
    {
      id: 'price',
      name: 'Style Prix',
      preview: '49€',
      style: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
        backgroundColor: '#FFD700',
        borderRadius: 20,
        padding: { top: 12, right: 20, bottom: 12, left: 20 }
      }
    },
    {
      id: 'button',
      name: 'Style Bouton',
      preview: 'CLIQUEZ ICI',
      style: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        backgroundColor: '#007BFF',
        borderRadius: 25,
        padding: { top: 12, right: 24, bottom: 12, left: 24 }
      }
    },
    {
      id: 'cursive',
      name: 'Style Cursif',
      preview: 'Élégant',
      style: {
        fontSize: 24,
        fontStyle: 'italic',
        color: '#2C3E50',
        fontFamily: 'Georgia',
        textShadow: { color: '#BDC3C7', blur: 1, offsetX: 1, offsetY: 1 }
      }
    }
  ];

  const addText = (preset?: any, stylePreset?: any) => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      content: preset?.text || stylePreset?.preview || 'Votre texte ici',
      fontSize: preset?.fontSize || stylePreset?.style?.fontSize || 16,
      fontWeight: preset?.fontWeight || stylePreset?.style?.fontWeight || 'normal',
      fontFamily: stylePreset?.style?.fontFamily || 'Arial',
      color: stylePreset?.style?.color || '#000000',
      textAlign: 'left',
      zIndex: 10,
      ...(stylePreset?.style || {})
    };
    onAddElement(newText);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <button
          onClick={() => addText()}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center"
        >
          <Type className="w-5 h-5 mr-2 text-gray-600" />
          <span className="text-sm text-gray-600">Ajouter du texte</span>
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">STYLES DE TEXTE</h3>
        <div className="space-y-2">
          {textPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => addText(preset)}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div 
                style={{ 
                  fontSize: Math.min(preset.fontSize / 2, 20),
                  fontWeight: preset.fontWeight 
                }}
              >
                {preset.text}
              </div>
            </button>
          ))}
          
          {stylePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => addText(undefined, preset)}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              title={preset.name}
            >
              <div 
                style={{ 
                  fontSize: 14,
                  fontWeight: preset.style.fontWeight || 'normal',
                  color: preset.style.color,
                  backgroundColor: preset.style.backgroundColor,
                  borderRadius: preset.style.borderRadius ? `${preset.style.borderRadius}px` : '0',
                  padding: preset.style.padding ? 
                    `${preset.style.padding.top}px ${preset.style.padding.right}px ${preset.style.padding.bottom}px ${preset.style.padding.left}px` : 
                    '2px 4px',
                  textShadow: preset.style.textShadow ? 
                    `${preset.style.textShadow.offsetX}px ${preset.style.textShadow.offsetY}px ${preset.style.textShadow.blur}px ${preset.style.textShadow.color}` : 
                    'none',
                  fontStyle: preset.style.fontStyle || 'normal',
                  fontFamily: preset.style.fontFamily || 'Arial',
                  display: 'inline-block'
                }}
              >
                {preset.preview}
              </div>
              <div className="text-xs text-gray-500 mt-1">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">POLICES POPULAIRES</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {fonts.map((font) => (
            <button
              key={font}
              className="w-full p-2 text-left text-sm rounded hover:bg-gray-100 transition-colors"
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">ALIGNEMENT</h3>
        <div className="flex space-x-1">
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">STYLE</h3>
        <div className="flex space-x-1">
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <Bold className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <Italic className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <Underline className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextPanel;