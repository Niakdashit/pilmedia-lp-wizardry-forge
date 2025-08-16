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
    id: 'gradient',
    name: 'Gradient',
    css: {
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      backgroundImage: 'linear-gradient(90deg, #ff00ff, #00ffff)'
    }
  },
  {
    id: 'background',
    name: 'Background',
    css: {
      backgroundColor: 'rgba(251,255,0,1)',
      color: '#000000',
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
  const [backgroundColor, setBackgroundColor] = useState('#fbff00');
  
  // General controls
  const [effectColor, setEffectColor] = useState('#ff00ff');

  // Gradient controls
  const [gradientStart, setGradientStart] = useState('#ff00ff');
  const [gradientEnd, setGradientEnd] = useState('#00ffff');
  // 0..100 mapped to 0..360deg
  const [gradientAngle, setGradientAngle] = useState(25);

  // Glitch dual colors
  const [glitchColorA, setGlitchColorA] = useState('#00ffff');
  const [glitchColorB, setGlitchColorB] = useState('#ff00ff');

  // Lift controls (0..100 logical)
  const [liftStrength, setLiftStrength] = useState(30);
  const [liftBlur, setLiftBlur] = useState(20);
  const [liftTransparency, setLiftTransparency] = useState(30);
  const [liftColor, setLiftColor] = useState('#000000');

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
      backgroundColor, effectColor, gradientStart, gradientEnd, gradientAngle, glitchColorA, glitchColorB,
      liftStrength, liftBlur, liftTransparency, liftColor, selectedElement?.color, selectedElement?.fontSize]);

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
          textShadow: `${offsetX}px ${offsetY}px ${Math.round((shadowBlur / 100) * 40)}px rgba(${hexToRgb(shadowColor)}, ${shadowTransparency / 100})`
        };
        break;
        
      case 'outline':
        const thickness = outlineThickness / 50;
        combinedCSS = {
          ...combinedCSS,
          textShadow: `${-thickness}px ${-thickness}px 0 ${outlineColor}, ${thickness}px ${-thickness}px 0 ${outlineColor}, ${-thickness}px ${thickness}px 0 ${outlineColor}, ${thickness}px ${thickness}px 0 ${outlineColor}`,
          WebkitTextStroke: `${Math.max(1, thickness * 2)}px ${outlineColor}`
        };
        break;
        
      case 'background':
        const fontSize = selectedElement?.fontSize ?? 24;
        const vPad = Math.round(Math.max(6, fontSize * 0.35));
        const spreadDelta = (backgroundSpread / 100) * 40; // apply uniformly
        const hPad = 8 + spreadDelta; // keep existing 8px min horizontally
        const vPadAug = vPad + spreadDelta; // add spread vertically too
        {
          const progress = Math.min(100, Math.max(1, backgroundRoundness)) / 100; // 0.01..1
          const parseNumber = (v: any, fb = 0) => {
            if (v == null) return fb;
            if (typeof v === 'number') return v;
            const m = String(v).match(/([-+]?[0-9]*\.?[0-9]+)/);
            return m ? parseFloat(m[1]) : fb;
          };
          // Prefer actual element height if available, else estimate via fontSize & line-height
          const actualH = parseNumber((selectedElement as any)?.height, 0);
          const lh = parseNumber((selectedElement as any)?.lineHeight, 1.2);
          const approxHeight = Math.max(1, (actualH || (fontSize * lh)) + vPadAug * 2); // px includes spread vertically
          const fudge = 2; // px safety margin to ensure rounded ends
          const maxRadius = approxHeight / 2 + fudge; // theoretical pill radius + safety
          // Sqrt easing: more rounding earlier, very smooth from 98→100
          const eased = Math.sqrt(progress);
          const radiusPx = +(Math.min(maxRadius, Math.max(0, eased * maxRadius))).toFixed(2);
          combinedCSS = {
            ...combinedCSS,
            backgroundColor: `rgba(${hexToRgb(backgroundColor)}, ${backgroundTransparency / 100})`,
            color: selectedElement?.color ?? '#000000',
            padding: `${vPadAug}px ${hPad}px`,
            display: 'inline-block',
            boxSizing: 'border-box',
            textShadow: 'none',
            boxShadow: 'none',
            border: 'none',
            WebkitTextStroke: 'initial',
            borderRadius: `${radiusPx}px`
          };
        }
        ;
        break;

      case 'lift': {
        const dy = -Math.round((liftStrength / 100) * 6); // up to -6px lift
        const blurPx = Math.round((liftBlur / 100) * 20); // up to 20px blur
        const alpha = Math.min(1, liftTransparency / 100);
        combinedCSS = {
          ...combinedCSS,
          transform: `translateY(${dy}px)`,
          textShadow: `0 ${Math.abs(dy)}px ${blurPx}px rgba(${hexToRgb(liftColor)}, ${alpha})`
        };
        break;
      }
        
      case 'echo': {
        // Multi-shadow extrude along direction
        const steps = 5;
        const distance = shadowOffset / 10; // 0..10
        const angleRad = (shadowDirection * Math.PI) / 180;
        const dx = Math.cos(angleRad) * distance;
        const dy = Math.sin(angleRad) * distance;
        const col = `rgba(${hexToRgb(shadowColor)}, ${Math.min(1, shadowTransparency / 100)})`;
        const layers: string[] = [];
        for (let i = 1; i <= steps; i++) {
          layers.push(`${(dx * i).toFixed(2)}px ${(dy * i).toFixed(2)}px 0 ${col}`);
        }
        combinedCSS = {
          ...combinedCSS,
          textShadow: layers.join(', '),
          color: selectedElement?.color || '#000000'
        };
        break;
      }

      case 'glitch': {
        // RGB split using two colored shadows
        const distance = shadowOffset / 8; // 0..12.5 approx
        const angleRad = (shadowDirection * Math.PI) / 180;
        const dx = Math.cos(angleRad) * distance;
        const dy = Math.sin(angleRad) * distance;
        const c1 = glitchColorA || '#00ffff';
        const c2 = glitchColorB || '#ff00ff';
        combinedCSS = {
          ...combinedCSS,
          textShadow: `${dx.toFixed(2)}px ${dy.toFixed(2)}px 0 ${c1}, ${(-dx).toFixed(2)}px ${(-dy).toFixed(2)}px 0 ${c2}`
        };
        break;
      }

      case 'splice': {
        // 3D slice/extrude using multiple shadows with chosen color
        const steps = Math.max(3, Math.round(outlineThickness / 10));
        const distance = shadowOffset / 12; // 0..8.3
        const angleRad = (shadowDirection * Math.PI) / 180;
        const dx = Math.cos(angleRad) * distance;
        const dy = Math.sin(angleRad) * distance;
        const col = effectColor || 'rgba(0,0,0,0.3)';
        const layers: string[] = [];
        for (let i = 1; i <= steps; i++) {
          layers.push(`${(dx * i).toFixed(2)}px ${(dy * i).toFixed(2)}px 0 ${col}`);
        }
        combinedCSS = {
          ...combinedCSS,
          textShadow: layers.join(', ')
        };
        break;
      }

      case 'hollow':
        combinedCSS = {
          ...combinedCSS,
          WebkitTextStroke: `2px ${effectColor}`,
          textStroke: `2px ${effectColor}`
        };
        break;
        
      case 'neon':
        {
          const intensity = Math.max(1, Math.round((shadowOffset / 100) * 4));
          const layers: string[] = [];
          for (let i = 1; i <= 4 + intensity; i++) {
            const blur = i * 4;
            layers.push(`0 0 ${blur}px ${effectColor}`);
          }
          combinedCSS = {
            ...combinedCSS,
            color: effectColor,
            textShadow: layers.join(', ')
          };
        }
        break;

      case 'gradient':
        combinedCSS = {
          ...combinedCSS,
          color: 'transparent',
          WebkitTextFillColor: 'transparent' as any,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          backgroundImage: `linear-gradient(${Math.round((gradientAngle / 100) * 360)}deg, ${gradientStart}, ${gradientEnd})`
        } as any;
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${shadowOffset}%, #e5e7eb ${shadowOffset}%, #e5e7eb 100%)`
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
                  min="0"
                  max="100"
                  value={((shadowDirection + 180) / 360) * 100}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setShadowDirection(Math.round((p / 100) * 360 - 180));
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb 100%)`
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
                  max="100"
                  value={shadowBlur}
                  onChange={(e) => setShadowBlur(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${shadowBlur}%, #e5e7eb ${shadowBlur}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowBlur(Math.max(0, shadowBlur - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowBlur}</span>
                  <button onClick={() => setShadowBlur(Math.min(100, shadowBlur + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${shadowTransparency}%, #e5e7eb ${shadowTransparency}%, #e5e7eb 100%)`
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
                  value={effectColor}
                  onChange={(e) => setEffectColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{effectColor}</span>
              </div>
            </div>
          </div>
        );

      case 'gradient':
        return (
          <div className="space-y-4">
            {/* Angle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Angle</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${gradientAngle}%, #e5e7eb ${gradientAngle}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setGradientAngle(Math.max(0, gradientAngle - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{Math.round((gradientAngle / 100) * 360)}°</span>
                  <button onClick={() => setGradientAngle(Math.min(100, gradientAngle + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Start Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{gradientStart}</span>
              </div>
            </div>

            {/* End Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">End Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{gradientEnd}</span>
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${outlineThickness}%, #e5e7eb ${outlineThickness}%, #e5e7eb 100%)`
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
                  min="1"
                  max="100"
                  step="1"
                  value={backgroundRoundness}
                  onChange={(e) => setBackgroundRoundness(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${backgroundRoundness}%, #e5e7eb ${backgroundRoundness}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setBackgroundRoundness(Math.max(1, backgroundRoundness - 1))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{backgroundRoundness}</span>
                  <button onClick={() => setBackgroundRoundness(Math.min(100, backgroundRoundness + 1))} className="hover:bg-gray-700 px-1 rounded">+</button>
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${backgroundSpread}%, #e5e7eb ${backgroundSpread}%, #e5e7eb 100%)`
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${backgroundTransparency}%, #e5e7eb ${backgroundTransparency}%, #e5e7eb 100%)`
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${shadowOffset}%, #e5e7eb ${shadowOffset}%, #e5e7eb 100%)`
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${shadowOffset}%, #e5e7eb ${shadowOffset}%, #e5e7eb 100%)`
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
                  min="0"
                  max="100"
                  value={((shadowDirection + 180) / 360) * 100}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setShadowDirection(Math.round((p / 100) * 360 - 180));
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setShadowDirection(Math.max(-180, shadowDirection - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{shadowDirection}</span>
                  <button onClick={() => setShadowDirection(Math.min(180, shadowDirection + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Split Colors */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Split Colors</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={glitchColorA}
                    onChange={(e) => setGlitchColorA(e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 font-mono">{glitchColorA}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={glitchColorB}
                    onChange={(e) => setGlitchColorB(e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 font-mono">{glitchColorB}</span>
                </div>
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Text Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedElement?.color || '#000000'}
                  onChange={(e) => onElementUpdate && onElementUpdate({ color: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{selectedElement?.color || '#000000'}</span>
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${shadowOffset}%, #e5e7eb ${shadowOffset}%, #e5e7eb 100%)`
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb 100%)`
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

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Text Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedElement?.color || '#000000'}
                  onChange={(e) => onElementUpdate && onElementUpdate({ color: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{selectedElement?.color || '#000000'}</span>
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${outlineThickness}%, #e5e7eb ${outlineThickness}%, #e5e7eb 100%)`
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${shadowOffset}%, #e5e7eb ${shadowOffset}%, #e5e7eb 100%)`
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
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb ${((shadowDirection + 180) / 360) * 100}%, #e5e7eb 100%)`
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

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Text Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedElement?.color || '#000000'}
                  onChange={(e) => onElementUpdate && onElementUpdate({ color: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{selectedElement?.color || '#000000'}</span>
              </div>
            </div>
          </div>
        );

      case 'lift':
        return (
          <div className="space-y-4">
            {/* Strength */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Strength</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={liftStrength}
                  onChange={(e) => setLiftStrength(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${liftStrength}%, #e5e7eb ${liftStrength}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setLiftStrength(Math.max(0, liftStrength - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{liftStrength}</span>
                  <button onClick={() => setLiftStrength(Math.min(100, liftStrength + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
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
                  max="100"
                  value={liftBlur}
                  onChange={(e) => setLiftBlur(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${liftBlur}%, #e5e7eb ${liftBlur}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setLiftBlur(Math.max(0, liftBlur - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{liftBlur}</span>
                  <button onClick={() => setLiftBlur(Math.min(100, liftBlur + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
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
                  value={liftTransparency}
                  onChange={(e) => setLiftTransparency(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${liftTransparency}%, #e5e7eb ${liftTransparency}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex items-center space-x-1 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  <button onClick={() => setLiftTransparency(Math.max(0, liftTransparency - 5))} className="hover:bg-gray-700 px-1 rounded">−</button>
                  <span className="min-w-[2rem] text-center">{liftTransparency}</span>
                  <button onClick={() => setLiftTransparency(Math.min(100, liftTransparency + 5))} className="hover:bg-gray-700 px-1 rounded">+</button>
                </div>
              </div>
            </div>

            {/* Shadow Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Shadow Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={liftColor}
                  onChange={(e) => setLiftColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{liftColor}</span>
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Text Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedElement?.color || '#000000'}
                  onChange={(e) => onElementUpdate && onElementUpdate({ color: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{selectedElement?.color || '#000000'}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Clear any applied advancedStyle/customCSS on the selected text element
  const clearEffects = () => {
    setSelectedEffect('none');
    if (selectedElement && onElementUpdate) {
      onElementUpdate({ customCSS: undefined, advancedStyle: undefined });
    } else {
      const selectedTextElement = document.querySelector('[data-selected="true"][data-type="text"]');
      if (selectedTextElement) {
        const updateEvent = new CustomEvent('applyTextEffect', {
          detail: { customCSS: undefined, advancedStyle: undefined }
        });
        window.dispatchEvent(updateEvent);
      }
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
        {/* Clear Effects Quick Action */}
        <div className="flex items-center justify-end">
          <button
            onClick={clearEffects}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Effacer les effets
          </button>
        </div>
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
                    ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50 text-indigo-900' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`rounded p-2 mb-2 h-12 flex items-center justify-center ${selectedEffect === effect.id ? 'bg-white' : 'bg-gray-100'}`}>
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
