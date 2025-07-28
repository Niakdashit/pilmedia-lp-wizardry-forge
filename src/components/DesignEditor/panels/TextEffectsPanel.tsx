import React, { useState } from 'react';

interface TextEffectsPanelProps {
  onAddElement: (element: any) => void;
  onBack: () => void;
}

const textEffects = [
  {
    id: 'hollow',
    name: 'Hollow',
    css: {
      color: 'transparent',
      WebkitTextStroke: '2px #000000',
      textStroke: '2px #000000'
    }
  },
  {
    id: 'splice',
    name: 'Splice',
    css: {
      textShadow: '3px 3px 0px rgba(0,0,0,0.3)',
      color: '#000000'
    }
  },
  {
    id: 'outline',
    name: 'Outline',
    css: {
      color: '#000000',
      textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff'
    }
  },
  {
    id: 'echo',
    name: 'Echo',
    css: {
      textShadow: '2px 2px 0px rgba(0,0,0,0.3), 4px 4px 0px rgba(0,0,0,0.2), 6px 6px 0px rgba(0,0,0,0.1)',
      color: '#000000'
    }
  },
  {
    id: 'glitch',
    name: 'Glitch',
    css: {
      color: '#00ffff',
      textShadow: '2px 0 #ff00ff, -2px 0 #ffff00',
      animation: 'glitch 0.3s infinite'
    }
  },
  {
    id: 'neon',
    name: 'Neon',
    css: {
      color: '#ff00ff',
      textShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff, 0 0 20px #ff00ff'
    }
  },
  {
    id: 'background',
    name: 'Background',
    css: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: '#ffffff',
      padding: '8px 16px',
      borderRadius: '4px'
    }
  }
];

const styleTypes = [
  { id: 'none', name: 'None', css: {} },
  { id: 'shadow', name: 'Shadow', css: { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' } },
  { id: 'lift', name: 'Lift', css: { textShadow: '0 2px 4px rgba(0,0,0,0.3)', transform: 'translateY(-1px)' } }
];

const shapeTypes = [
  { id: 'none', name: 'None', css: {} },
  { id: 'curve', name: 'Curve', css: { borderRadius: '20px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.1)' } }
];

const TextEffectsPanel: React.FC<TextEffectsPanelProps> = ({ onAddElement, onBack }) => {
  const [selectedStyle, setSelectedStyle] = useState('lift');
  const [selectedShape, setSelectedShape] = useState('none');
  const [intensity, setIntensity] = useState(100);

  const addTextWithEffect = (effect: any) => {
    const selectedStyleObj = styleTypes.find(s => s.id === selectedStyle);
    const selectedShapeObj = shapeTypes.find(s => s.id === selectedShape);
    
    const combinedCSS = {
      ...effect.css,
      ...selectedStyleObj?.css,
      ...selectedShapeObj?.css
    };

    // Apply intensity
    if (intensity !== 100 && combinedCSS.textShadow) {
      const opacity = intensity / 100;
      combinedCSS.textShadow = combinedCSS.textShadow.replace(/rgba\(([^)]+)\)/g, (_: string, values: string) => {
        const [r, g, b] = values.split(',').map((v: string) => v.trim());
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      });
    }

    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Texte avec effet',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      fontSize: 32,
      color: effect.css.color || '#000000',
      fontFamily: 'Inter',
      fontWeight: 'bold',
      textAlign: 'left' as const,
      customCSS: combinedCSS,
      advancedStyle: {
        id: effect.id,
        name: effect.name,
        category: 'effect',
        css: combinedCSS
      }
    };

    onAddElement(newElement);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Retour
        </button>
        <h3 className="text-lg font-semibold">Effets</h3>
        <div></div>
      </div>

      {/* Style Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Style</h4>
        <div className="grid grid-cols-3 gap-2">
          {styleTypes.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-3 border rounded-lg transition-colors ${
                selectedStyle === style.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="bg-white rounded p-2 mb-2">
                <span 
                  className="text-xl font-bold"
                  style={style.css}
                >
                  Ag
                </span>
              </div>
              <span className="text-xs text-gray-600">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Intensité</h4>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="flex-1 h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex items-center space-x-2 bg-gray-800 text-white px-3 py-1 rounded">
            <button onClick={() => setIntensity(Math.max(0, intensity - 10))}>−</button>
            <span className="w-8 text-center">{intensity}</span>
            <button onClick={() => setIntensity(Math.min(100, intensity + 10))}>+</button>
          </div>
        </div>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-3 gap-2">
        {textEffects.map((effect) => (
          <button
            key={effect.id}
            onClick={() => addTextWithEffect(effect)}
            className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="bg-white rounded p-2 mb-2">
              <span 
                className="text-xl font-bold"
                style={effect.css}
              >
                Ag
              </span>
            </div>
            <span className="text-xs text-gray-600">{effect.name}</span>
          </button>
        ))}
      </div>

      {/* Shape Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Shape</h4>
        <div className="grid grid-cols-2 gap-2">
          {shapeTypes.map((shape) => (
            <button
              key={shape.id}
              onClick={() => setSelectedShape(shape.id)}
              className={`p-3 border rounded-lg transition-colors ${
                selectedShape === shape.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="bg-gray-100 rounded p-2 mb-2">
                <span 
                  className="text-lg font-bold"
                  style={shape.css}
                >
                  ABCD
                </span>
              </div>
              <span className="text-xs text-gray-600">{shape.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextEffectsPanel;