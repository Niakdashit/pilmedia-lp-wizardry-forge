import React, { useState, useEffect } from 'react';

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
  const [backgroundTransparency, setBackgroundTransparency] = useState(20);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  
  // General controls
  const [effectColor, setEffectColor] = useState('#ff00ff');

  // Fonction utilitaire pour convertir hex en rgb
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };



  // Mettre à jour l'effet en temps réel quand les contrôles changent
  useEffect(() => {
    if (selectedEffect !== 'none') {
      const effect = textEffects.find(e => e.id === selectedEffect);
      if (effect) {
        updateEffectWithCurrentSettings(effect);
      }
    }
  }, [selectedEffect, shadowOffset, shadowDirection, shadowBlur, shadowTransparency, shadowColor, 
      outlineThickness, outlineColor, backgroundRoundness, backgroundSpread, backgroundTransparency, 
      backgroundColor, effectColor]);

  const applyEffect = (effect: any) => {
    setSelectedEffect(effect.id);
    updateEffectWithCurrentSettings(effect);
  };

  const updateEffectWithCurrentSettings = (effect: any) => {
    let combinedCSS = { ...effect.css };
    
    // Appliquer les ajustements spécifiques selon l'effet
    switch (effect.id) {
      case 'shadow':
        const offsetX = Math.cos((shadowDirection * Math.PI) / 180) * (shadowOffset / 10);
        const offsetY = Math.sin((shadowDirection * Math.PI) / 180) * (shadowOffset / 10);
        combinedCSS = {
          ...combinedCSS,
          textShadow: `${offsetX}px ${offsetY}px ${shadowBlur}px rgba(${hexToRgb(shadowColor)}, ${shadowTransparency / 100})`
        };
        break;
        
      case 'outline':
        const thickness = outlineThickness / 50;
        combinedCSS = {
          ...combinedCSS,
          textShadow: `${-thickness}px ${-thickness}px 0 ${outlineColor}, ${thickness}px ${-thickness}px 0 ${outlineColor}, ${-thickness}px ${thickness}px 0 ${outlineColor}, ${thickness}px ${thickness}px 0 ${outlineColor}`
        };
        break;
        
      case 'background':
        const roundness = (backgroundRoundness / 100) * 20;
        const spread = 8 + (backgroundSpread / 100) * 16;
        combinedCSS = {
          ...combinedCSS,
          backgroundColor: `rgba(${hexToRgb(backgroundColor)}, ${backgroundTransparency / 100})`,
          color: selectedElement?.color || '#000000',
          padding: `8px ${spread}px`,
          borderRadius: `${roundness}px`
        };
        break;
        
      case 'hollow':
        combinedCSS = {
          ...combinedCSS,
          WebkitTextStroke: `2px ${effectColor}`,
          textStroke: `2px ${effectColor}`
        };
        break;
        
      case 'neon':
        combinedCSS = {
          ...combinedCSS,
          color: effectColor,
          textShadow: `0 0 5px ${effectColor}, 0 0 10px ${effectColor}, 0 0 15px ${effectColor}, 0 0 20px ${effectColor}`
        };
        break;
        
      default:
        break;
    }

    // Appliquer l'effet au texte sélectionné ou créer un nouveau texte
    if (selectedElement && onElementUpdate) {
      onElementUpdate({
        customCSS: combinedCSS,
        advancedStyle: {
          id: effect.id,
          name: effect.name,
          category: 'effect',
          css: combinedCSS
        }
      });
    } else {
      // Chercher un texte sélectionné dans le DOM
      const selectedTextElement = document.querySelector('[data-selected="true"][data-type="text"]');
      if (selectedTextElement) {
        const updateEvent = new CustomEvent('applyTextEffect', { 
          detail: {
            customCSS: combinedCSS,
            advancedStyle: {
              id: effect.id,
              name: effect.name,
              category: 'effect',
              css: combinedCSS
            }
          }
        });
        window.dispatchEvent(updateEvent);
      } else {
        // Créer un nouveau texte avec l'effet
        const newTextElement = {
          id: `text-${Date.now()}`,
          type: 'text',
          content: 'Nouveau texte',
          x: 100,
          y: 100,
          width: 200,
          height: 40,
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#000000',
          customCSS: combinedCSS,
          advancedStyle: {
            id: effect.id,
            name: effect.name,
            category: 'effect',
            css: combinedCSS
          }
        };
        
        const addElementEvent = new CustomEvent('addElement', { detail: newTextElement });
        window.dispatchEvent(addElementEvent);
      }
    }
  };

  // Rendu des contrôles spécifiques selon l'effet sélectionné
  const renderEffectControls = () => {
    switch (selectedEffect) {
      case 'shadow':
        return (
          <div className="space-y-4">
            {/* Offset */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Offset</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowOffset}
                  onChange={(e) => setShadowOffset(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${shadowOffset}%, #e5e7eb ${shadowOffset}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowOffset(Math.max(0, shadowOffset - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowOffset}</span>
                  <button onClick={() => setShadowOffset(Math.min(100, shadowOffset + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Direction</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={shadowDirection}
                  onChange={(e) => setShadowDirection(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowDirection(Math.max(-180, shadowDirection - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowDirection}°</span>
                  <button onClick={() => setShadowDirection(Math.min(180, shadowDirection + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Blur */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Blur</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={shadowBlur}
                  onChange={(e) => setShadowBlur(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${(shadowBlur / 20) * 100}%, #e5e7eb ${(shadowBlur / 20) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowBlur(Math.max(0, shadowBlur - 1))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowBlur}</span>
                  <button onClick={() => setShadowBlur(Math.min(20, shadowBlur + 1))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Transparency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Transparency</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowTransparency}
                  onChange={(e) => setShadowTransparency(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${shadowTransparency}%, #e5e7eb ${shadowTransparency}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowTransparency(Math.max(0, shadowTransparency - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowTransparency}</span>
                  <button onClick={() => setShadowTransparency(Math.min(100, shadowTransparency + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={shadowColor}
                  onChange={(e) => setShadowColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{shadowColor}</span>
              </div>
            </div>
          </div>
        );

      case 'outline':
        return (
          <div className="space-y-4">
            {/* Thickness */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Thickness</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={outlineThickness}
                  onChange={(e) => setOutlineThickness(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${outlineThickness}%, #e5e7eb ${outlineThickness}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setOutlineThickness(Math.max(0, outlineThickness - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{outlineThickness}</span>
                  <button onClick={() => setOutlineThickness(Math.min(100, outlineThickness + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{outlineColor}</span>
              </div>
            </div>
          </div>
        );

      case 'background':
        return (
          <div className="space-y-4">
            {/* Roundness */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Roundness</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={backgroundRoundness}
                  onChange={(e) => setBackgroundRoundness(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${backgroundRoundness}%, #e5e7eb ${backgroundRoundness}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setBackgroundRoundness(Math.max(0, backgroundRoundness - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{backgroundRoundness}</span>
                  <button onClick={() => setBackgroundRoundness(Math.min(100, backgroundRoundness + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Spread */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Spread</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={backgroundSpread}
                  onChange={(e) => setBackgroundSpread(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${backgroundSpread}%, #e5e7eb ${backgroundSpread}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setBackgroundSpread(Math.max(0, backgroundSpread - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{backgroundSpread}</span>
                  <button onClick={() => setBackgroundSpread(Math.min(100, backgroundSpread + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Transparency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Transparency</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={backgroundTransparency}
                  onChange={(e) => setBackgroundTransparency(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${backgroundTransparency}%, #e5e7eb ${backgroundTransparency}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setBackgroundTransparency(Math.max(0, backgroundTransparency - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{backgroundTransparency}</span>
                  <button onClick={() => setBackgroundTransparency(Math.min(100, backgroundTransparency + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Background Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{backgroundColor}</span>
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Text Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedElement?.color || '#000000'}
                  onChange={(e) => {
                    if (onElementUpdate) {
                      onElementUpdate({ color: e.target.value });
                    }
                  }}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{selectedElement?.color || '#000000'}</span>
              </div>
            </div>
          </div>
        );

      case 'neon':
        return (
          <div className="space-y-4">
            {/* Intensity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Intensity</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowOffset}
                  onChange={(e) => setShadowOffset(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${shadowOffset}%, #e5e7eb ${shadowOffset}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowOffset(Math.max(0, shadowOffset - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowOffset}</span>
                  <button onClick={() => setShadowOffset(Math.min(100, shadowOffset + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'glitch':
        return (
          <div className="space-y-4">
            {/* Offset */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Offset</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowOffset}
                  onChange={(e) => setShadowOffset(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${shadowOffset}%, #e5e7eb ${shadowOffset}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowOffset(Math.max(0, shadowOffset - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowOffset}</span>
                  <button onClick={() => setShadowOffset(Math.min(100, shadowOffset + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Direction</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={shadowDirection}
                  onChange={(e) => setShadowDirection(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowDirection(Math.max(-180, shadowDirection - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowDirection}</span>
                  <button onClick={() => setShadowDirection(Math.min(180, shadowDirection + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={effectColor}
                  onChange={(e) => setEffectColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{effectColor}</span>
              </div>
            </div>
          </div>
        );

      case 'echo':
        return (
          <div className="space-y-4">
            {/* Offset */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Offset</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowOffset}
                  onChange={(e) => setShadowOffset(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${shadowOffset}%, #e5e7eb ${shadowOffset}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowOffset(Math.max(0, shadowOffset - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowOffset}</span>
                  <button onClick={() => setShadowOffset(Math.min(100, shadowOffset + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Direction</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={shadowDirection}
                  onChange={(e) => setShadowDirection(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowDirection(Math.max(-180, shadowDirection - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowDirection}°</span>
                  <button onClick={() => setShadowDirection(Math.min(180, shadowDirection + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={shadowColor}
                  onChange={(e) => setShadowColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{shadowColor}</span>
              </div>
            </div>
          </div>
        );

      case 'splice':
        return (
          <div className="space-y-4">
            {/* Thickness */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Thickness</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={outlineThickness}
                  onChange={(e) => setOutlineThickness(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${outlineThickness}%, #e5e7eb ${outlineThickness}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setOutlineThickness(Math.max(0, outlineThickness - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{outlineThickness}</span>
                  <button onClick={() => setOutlineThickness(Math.min(100, outlineThickness + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Offset */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Offset</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowOffset}
                  onChange={(e) => setShadowOffset(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${shadowOffset}%, #e5e7eb ${shadowOffset}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowOffset(Math.max(0, shadowOffset - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowOffset}</span>
                  <button onClick={() => setShadowOffset(Math.min(100, shadowOffset + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Direction</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={shadowDirection}
                  onChange={(e) => setShadowDirection(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #841b60 0%, #841b60 ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowDirection(Math.max(-180, shadowDirection - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowDirection}°</span>
                  <button onClick={() => setShadowDirection(Math.min(180, shadowDirection + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={shadowColor}
                  onChange={(e) => setShadowColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{shadowColor}</span>
              </div>
            </div>
          </div>
        );

      case 'hollow':
        return (
          <div className="space-y-4">
            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={effectColor}
                  onChange={(e) => setEffectColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{effectColor}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Effects</h2>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Style Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Style</h4>
          <div className="grid grid-cols-3 gap-2">
            {textEffects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => applyEffect(effect)}
                className={`p-2 border rounded-lg transition-colors ${
                  selectedEffect === effect.id 
                    ? 'border-[#841b60] bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="bg-gray-100 rounded p-2 mb-2 h-12 flex items-center justify-center">
                  <span 
                    className="text-sm font-bold text-gray-800"
                    style={{
                      ...effect.css,
                      // Ensure all CSS properties are properly formatted for React
                      WebkitTextStroke: effect.css.WebkitTextStroke || undefined,
                      textShadow: effect.css.textShadow || undefined
                    }}
                  >
                    Ag
                  </span>
                </div>
                <span className="text-xs text-gray-600">{effect.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Effect-specific Controls */}
        {selectedEffect !== 'none' && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ajustements</h4>
            {renderEffectControls()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEffectsPanel;
