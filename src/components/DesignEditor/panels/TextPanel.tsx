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

  const addText = (preset?: any) => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      content: preset?.text || 'Votre texte ici',
      fontSize: preset?.fontSize || 16,
      fontWeight: preset?.fontWeight || 'normal',
      fontFamily: 'Arial',
      color: '#000000',
      textAlign: 'left',
      zIndex: 10
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
        <h3 className="font-semibold text-sm text-gray-700 mb-3">PRESETS DE TEXTE</h3>
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