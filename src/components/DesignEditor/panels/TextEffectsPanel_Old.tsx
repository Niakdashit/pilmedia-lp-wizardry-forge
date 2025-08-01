import React, { useState } from 'react';

interface TextEffectsPanelProps {
  onBack: () => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

const textEffects = [
  {
    id: 'none',
    name: 'None',
    css: {}
  },
  {
    id: 'shadow',
    name: 'Shadow',
    css: {
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
    }
  },
  {
    id: 'lift',
    name: 'Lift',
    css: {
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      transform: 'translateY(-1px)'
    }
  },
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
      textShadow: '2px 0 #ff00ff, -2px 0 #ffff00'
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

const TextEffectsPanel: React.FC<TextEffectsPanelProps> = ({ 
  onBack, 
  selectedElement, 
  onElementUpdate 
}) => {
  const [selectedEffect, setSelectedEffect] = useState('none');
  
  // Shadow controls
  const [shadowOffset, setShadowOffset] = useState(50);
  const [shadowDirection, setShadowDirection] = useState(-45);
  const [shadowBlur, setShadowBlur] = useState(0);
  const [shadowTransparency, setShadowTransparency] = useState(40);
  const [shadowColor, setShadowColor] = useState('#000000');
  
  // Outline controls
  const [outlineThickness, setOutlineThickness] = useState(50);
  const [outlineColor, setOutlineColor] = useState('#ffffff');
  
  // Background controls
  const [backgroundRoundness, setBackgroundRoundness] = useState(50);
  const [backgroundSpread, setBackgroundSpread] = useState(50);
  const [backgroundTransparency, setBackgroundTransparency] = useState(100);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  
  // General controls
  const [effectColor, setEffectColor] = useState('#ff00ff');

  const addTextWithEffect = (effect: any) => {
    // Calculer les styles combinés
    const selectedStyleObj = styleTypes.find(s => s.id === selectedStyle);
    const selectedShapeObj = shapeTypes.find(s => s.id === selectedShape);
    
    let combinedCSS = {
      ...effect.css,
      ...selectedStyleObj?.css,
      ...selectedShapeObj?.css
    };

    // Appliquer les ajustements spécifiques selon l'effet
    const intensityFactor = intensity / 100;
    
    switch (effect.id) {
      case 'hollow':
        combinedCSS = {
          ...combinedCSS,
          WebkitTextStroke: `${2 * intensityFactor}px ${effectColor}`,
          textStroke: `${2 * intensityFactor}px ${effectColor}`
        };
        break;
        
      case 'splice':
        const shadowOffset = 3 * intensityFactor;
        combinedCSS = {
          ...combinedCSS,
          textShadow: `${shadowOffset}px ${shadowOffset}px 0px rgba(${hexToRgb(effectColor)}, ${0.3 * intensityFactor})`,
          color: effectColor
        };
        break;
        
      case 'outline':
        const outlineSize = 1 * intensityFactor;
        combinedCSS = {
          ...combinedCSS,
          color: effectColor,
          textShadow: `${-outlineSize}px ${-outlineSize}px 0 #fff, ${outlineSize}px ${-outlineSize}px 0 #fff, ${-outlineSize}px ${outlineSize}px 0 #fff, ${outlineSize}px ${outlineSize}px 0 #fff`
        };
        break;
        
      case 'echo':
        const echoIntensity = intensityFactor;
        combinedCSS = {
          ...combinedCSS,
          textShadow: `2px 2px 0px rgba(${hexToRgb(effectColor)}, ${0.3 * echoIntensity}), 4px 4px 0px rgba(${hexToRgb(effectColor)}, ${0.2 * echoIntensity}), 6px 6px 0px rgba(${hexToRgb(effectColor)}, ${0.1 * echoIntensity})`,
          color: effectColor
        };
        break;
        
      case 'neon':
        const glowSize = 20 * intensityFactor;
        combinedCSS = {
          ...combinedCSS,
          color: effectColor,
          textShadow: `0 0 ${glowSize * 0.25}px ${effectColor}, 0 0 ${glowSize * 0.5}px ${effectColor}, 0 0 ${glowSize * 0.75}px ${effectColor}, 0 0 ${glowSize}px ${effectColor}`
        };
        break;
        
      case 'background':
        combinedCSS = {
          ...combinedCSS,
          backgroundColor: `rgba(${hexToRgb(backgroundColor)}, ${0.8 * intensityFactor})`,
          color: effectColor,
          padding: `${8 * intensityFactor}px ${16 * intensityFactor}px`,
          borderRadius: `${4 * intensityFactor}px`
        };
        break;
        
      case 'gradient':
        combinedCSS = {
          ...combinedCSS,
          background: `linear-gradient(45deg, ${gradientStart}, ${gradientEnd})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          opacity: intensityFactor
        };
        break;
        
      default:
        // Appliquer l'intensité générique pour les textShadow
        if (combinedCSS.textShadow && intensity !== 100) {
          combinedCSS.textShadow = combinedCSS.textShadow.replace(/rgba\(([^)]+)\)/g, (_: string, values: string) => {
            const [r, g, b] = values.split(',').map((v: string) => v.trim());
            return `rgba(${r}, ${g}, ${b}, ${intensityFactor})`;
          });
        }
    }

    const updates = {
      customCSS: combinedCSS,
      advancedStyle: {
        id: effect.id,
        name: effect.name,
        category: 'effect',
        css: combinedCSS,
        settings: {
          style: selectedStyle,
          shape: selectedShape,
          intensity,
          effectColor,
          backgroundColor,
          gradientStart,
          gradientEnd
        }
      }
    };

    // Appliquer l'effet au texte sélectionné
    if (selectedElement && onElementUpdate) {
      onElementUpdate(updates);
      return;
    }

    // Message d'erreur si aucun texte sélectionné
    alert('Veuillez sélectionner un texte avant d\'appliquer un effet.');
  };

  // Fonction utilitaire pour convertir hex en rgb
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  };



  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Header compact comme Canva */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <button 
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          ← Retour
        </button>
        <h3 className="text-sm font-semibold text-gray-800">Effets de texte</h3>
        <div className="w-12"></div>
      </div>
      
      <div className="p-4 space-y-4">

        {/* Effets principaux - Grid plus compact */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Effets</h4>
          <div className="grid grid-cols-4 gap-2">
            {textEffects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => addTextWithEffect(effect)}
                className="group p-2 border border-gray-200 rounded-lg hover:border-[#841b60] hover:shadow-sm transition-all duration-200"
              >
                <div className="bg-gray-50 rounded p-2 mb-1 h-8 flex items-center justify-center">
                  <span 
                    className="text-sm font-bold text-gray-800"
                    style={effect.css}
                  >
                    Aa
                  </span>
                </div>
                <span className="text-xs text-gray-600 group-hover:text-[#841b60]">{effect.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Style Section - Plus compact */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Style</h4>
          <div className="grid grid-cols-3 gap-2">
            {styleTypes.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-2 border rounded-lg transition-colors ${
                  selectedStyle === style.id 
                    ? 'border-[#841b60] bg-[#841b60] text-white' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="bg-white rounded p-1 mb-1 h-6 flex items-center justify-center">
                  <span 
                    className="text-sm font-bold text-gray-800"
                    style={style.css}
                  >
                    Aa
                  </span>
                </div>
                <span className="text-xs text-gray-600">{style.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Section - Plus compact */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Intensité</h4>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #841b60 0%, #841b60 ${intensity}%, #e5e7eb ${intensity}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              <button 
                onClick={() => setIntensity(Math.max(0, intensity - 10))}
                className="hover:bg-gray-200 px-1 rounded"
              >
                −
              </button>
              <span className="w-8 text-center font-mono">{intensity}</span>
              <button 
                onClick={() => setIntensity(Math.min(100, intensity + 10))}
                className="hover:bg-gray-200 px-1 rounded"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Color Controls Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Couleurs</h4>
          
          {/* Effect Color */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-600">Couleur d'effet</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={effectColor}
                onChange={(e) => setEffectColor(e.target.value)}
                className="w-8 h-6 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-500 font-mono">{effectColor}</span>
            </div>
          </div>
          
          {/* Background Color */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-600">Arrière-plan</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-8 h-6 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-500 font-mono">{backgroundColor}</span>
            </div>
          </div>
          
          {/* Gradient Colors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600">Dégradé début</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  className="w-8 h-6 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-xs text-gray-500 font-mono">{gradientStart}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600">Dégradé fin</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  className="w-8 h-6 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-xs text-gray-500 font-mono">{gradientEnd}</span>
              </div>
            </div>
          </div>
        </div>



        {/* Shape Section - Plus compact */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Forme</h4>
          <div className="grid grid-cols-2 gap-2">
            {shapeTypes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setSelectedShape(shape.id)}
                className={`p-2 border rounded-lg transition-colors ${
                  selectedShape === shape.id 
                    ? 'border-[#841b60] bg-[#841b60] text-white' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="bg-gray-100 rounded p-1 mb-1 h-6 flex items-center justify-center">
                  <span 
                    className="text-xs font-bold text-gray-800"
                    style={shape.css}
                  >
                    ABC
                  </span>
                </div>
                <span className="text-xs text-gray-600">{shape.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default TextEffectsPanel;