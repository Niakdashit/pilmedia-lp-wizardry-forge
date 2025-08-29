import React, { useState, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';

type MixBlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

interface StyleUpdates {
  style: React.CSSProperties;
  advancedStyle: {
    id: string;
    name: string;
    css: React.CSSProperties;
  } | null;
  // Ajout d'un index signature plus précis
  [key: string]: React.CSSProperties | {
    id: string;
    name: string;
    css: React.CSSProperties;
  } | null | undefined;
}

interface EffectParams {
  [key: string]: any; // Permet l'accès dynamique aux propriétés
  color?: string;
  intensity?: number;
  distance?: number;
  angle?: number;
  blur?: number;
  transparency?: number;
  radius?: number;
  spread?: number;
  thickness?: number;
}

type CssFunction = (params: EffectParams) => React.CSSProperties;

interface TextEffect {
  id: string;
  name: string;
  css: CssFunction | React.CSSProperties;
  defaultParams?: EffectParams;
}

interface TextEffectsPanelProps {
  onBack: () => void;
  selectedElement?: {
    style?: React.CSSProperties & {
      color?: string;
    };
    advancedStyle?: {
      id: string;
      name: string;
      css: React.CSSProperties;
    } | null;
    type?: string;
    id?: string;
    // Autres propriétés connues de l'élément
    [key: string]: unknown;
  };
  onElementUpdate?: (updates: StyleUpdates) => void;
  onAddElement?: (element: any) => void;
}

const textEffects = [
  {
    id: 'none',
    name: 'Aucun',
    css: () => ({}),
    defaultParams: {}
  },
  {
    id: 'shadow',
    name: 'Ombre',
    css: ({ distance = 2, angle = 45, blur = 4, color = 'rgba(0,0,0,0.5)', transparency = 0.5 }) => ({
      textShadow: `${Math.cos(angle * Math.PI / 180) * distance}px ${Math.sin(angle * Math.PI / 180) * distance}px ${blur}px ${color.replace('0.5', transparency.toString())}`
    }),
    defaultParams: { distance: 2, angle: 45, blur: 4, color: '#000000', transparency: 0.5 }
  },
  {
    id: 'lift',
    name: 'Relief',
    css: () => ({
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      transform: 'translateY(-1px)'
    }),
    defaultParams: {}
  },
  {
    id: 'outline',
    name: 'Contour',
    css: ({ color = '#000000', thickness = 1, offset = 1, fillColor = '#ffffff' }) => {
      const offset1 = offset;
      const offset2 = -offset1;
      return {
        color: fillColor,
        textShadow: `${offset2}px ${offset2}px 0 ${color}, ${offset1}px ${offset2}px 0 ${color}, ${offset2}px ${offset1}px 0 ${color}, ${offset1}px ${offset1}px 0 ${color}`,
        padding: `${thickness * 2}px ${thickness * 4}px`,
        display: 'inline-block',
        lineHeight: '1.2',
        WebkitTextStroke: '0',
        textStroke: '0'
      };
    },
    defaultParams: { color: '#000000', thickness: 1, offset: 1, fillColor: '#ffffff' }
  },
  {
    id: 'outline2',
    name: 'Contour 2',
    css: ({ color = '#000000', thickness = 1 }) => ({
      color: 'transparent',
      WebkitTextStroke: `${thickness}px ${color}`,
      textShadow: 'none',
      padding: '2px 4px',
      display: 'inline-block',
      lineHeight: '1.2',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      backgroundColor: 'transparent'
    }),
    defaultParams: { color: '#000000', thickness: 1 }
  },
  {
    id: 'echo',
    name: 'Écho',
    css: ({ distance = 2, angle = 45, color = 'rgba(0,0,0,0.3)', transparency = 0.3 }) => {
      const x1 = Math.cos(angle * Math.PI / 180) * distance;
      const y1 = Math.sin(angle * Math.PI / 180) * distance;
      const x2 = x1 * 1.5;
      const y2 = y1 * 1.5;
      const x3 = x1 * 2;
      const y3 = y1 * 2;
      
      // Extraire la couleur de base (sans l'opacité si elle existe)
      const baseColor = color.includes('rgba') ? color.substring(0, color.lastIndexOf(',')) + ')' : color;
      
      // Créer les couleurs avec les niveaux de transparence
      const color1 = baseColor.replace(')', `, ${transparency})`);
      const color2 = baseColor.replace(')', `, ${transparency * 0.7})`);
      const color3 = baseColor.replace(')', `, ${transparency * 0.3})`);
      
      return {
        textShadow: `${x1}px ${y1}px 0 ${color1}, ${x2}px ${y2}px 0 ${color2}, ${x3}px ${y3}px 0 ${color3}`,
        color: '#000000',
        display: 'inline-block'
      };
    },
    defaultParams: { distance: 5, angle: 45, color: 'rgba(0,0,0,0.3)', transparency: 0.3 }
  },
  {
    id: 'glitch',
    name: 'Glitch',
    css: ({ distance = 2, angle = 0, color = '#ff00ff' }) => {
      const x = Math.cos(angle * Math.PI / 180) * distance;
      const y = Math.sin(angle * Math.PI / 180) * distance;
      return {
        color: '#00ffff',
        textShadow: `${x}px ${y}px 0 ${color}, ${-x}px ${-y}px 0 #ffff00`
      };
    },
    defaultParams: { distance: 2, angle: 0, color: '#ff00ff' }
  },
  {
    id: 'neon',
    name: 'Néon',
    css: ({ color = '#00ffff', intensity = 1 }) => {
      const intensityFactor = Math.min(Math.max(intensity, 0.1), 2);
      const blur1 = 5 * intensityFactor;
      const blur2 = 10 * intensityFactor;
      const blur3 = 20 * intensityFactor;
      return {
        color: '#ffffff',
        textShadow: `0 0 ${blur1}px ${color}, 0 0 ${blur2}px ${color}, 0 0 ${blur3}px ${color}`,
        fontWeight: 'bold',
        letterSpacing: '1px'
      };
    },
    defaultParams: { color: '#00ffff', intensity: 1 }
  },
  {
    id: 'gradient',
    name: 'Dégradé',
    css: ({ 
      angle = 90, 
      color1 = '#7F00FF', 
      color2 = '#E100FF',
      position1 = 0,
      position2 = 100,
      blendMode = 'normal' as MixBlendMode
    } = {}) => {
      // S'assurer que les positions sont des pourcentages valides
      const pos1 = Math.min(100, Math.max(0, position1));
      const pos2 = Math.min(100, Math.max(0, position2));
      
      return {
        color: 'transparent',
        background: `linear-gradient(${angle}deg, ${color1} ${pos1}%, ${color2} ${pos2}%)`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
        mixBlendMode: blendMode
      };
    },
    defaultParams: { 
      angle: 90, 
      color1: '#7F00FF', 
      color2: '#E100FF',
      position1: 0,
      position2: 100,
      blendMode: 'normal'
    }
  },
  {
    id: 'border',
    name: 'Bordure',
    css: ({ color = '#000000', thickness = 1, radius = 0 }) => ({
      border: `${thickness}px solid ${color}`,
      borderRadius: `${radius}px`,
      padding: '4px 8px',
      display: 'inline-block'
    }),
    defaultParams: { color: '#000000', thickness: 1, radius: 0 }
  },
  {
    id: 'background',
    name: 'Fond',
    css: ({ color = 'rgba(245, 245, 245, 0.9)', radius = 4, spread = 8 }) => ({
      backgroundColor: color,
      padding: `${spread}px`,
      borderRadius: `${radius}px`,
      display: 'inline-block'
    }),
    defaultParams: { color: 'rgba(245, 245, 245, 0.9)', radius: 4, spread: 8 }
  }
];

const TextEffectsPanel: React.FC<TextEffectsPanelProps> = ({ 
  onBack, 
  selectedElement, 
  onElementUpdate, 
  onAddElement 
}: TextEffectsPanelProps) => {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string>('none');
  const [effectParams, setEffectParams] = useState<EffectParams>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Type pour le style avancé
  type AdvancedStyle = {
    id: string;
    name: string;
    css: React.CSSProperties;
  };

  // Initialisation de l'effet sélectionné basé sur l'élément actuel
  useEffect(() => {
    if (!selectedElement) return;
    
    const advancedStyle = selectedElement.advancedStyle as AdvancedStyle | undefined;
    if (advancedStyle?.id && !isInitialized) {
      setSelectedEffect(advancedStyle.id);
      setIsInitialized(true);
      
      // Initialiser les paramètres si disponibles
      const effect = textEffects.find(e => e.id === advancedStyle.id);
      if (effect && effect.id !== 'none') {
        setEffectParams(effect.defaultParams || {});
      }
    } else if (!advancedStyle?.id && isInitialized) {
      setSelectedEffect('none');
      setEffectParams({});
    }
  }, [selectedElement, isInitialized]);

  // Fonction utilitaire pour appliquer un style d'effet de manière sécurisée
  const getEffectStyle = useCallback((eff: TextEffect, params: EffectParams = {}): React.CSSProperties => {
    if (typeof eff.css === 'function') {
      return eff.css(params);
    }
    return eff.css;
  }, []);

  const applyEffectStyle = useCallback((eff: TextEffect, params: EffectParams = {}): React.CSSProperties => {
    try {
      return getEffectStyle(eff, params);
    } catch (error) {
      console.error(`Error applying effect ${eff.id}:`, error);
      return {};
    }
  }, [getEffectStyle]);

  const applyEffect = useCallback((effect: TextEffect) => {
    const effectId = effect.id;
    setSelectedEffect(effectId);
    
    // Mettre à jour les paramètres avec les valeurs par défaut si nécessaire
    if (effectId !== 'none' && (!effectParams || Object.keys(effectParams).length === 0)) {
      const newParams = effect.defaultParams || {};
      setEffectParams(newParams);
    }
    
    // Créer une copie des paramètres pour l'application de l'effet
    const effectParamsToApply = { ...effectParams };
    
    // Pour l'effet d'écho, s'assurer que la transparence est appliquée correctement
    if (effectId === 'echo' && effectParamsToApply.transparency === undefined) {
      effectParamsToApply.transparency = 0.3; // Valeur par défaut pour la rétrocompatibilité
    }
    
    // Créer une copie des mises à jour à appliquer
    const style = effectId === 'none' ? {} : applyEffectStyle(effect, effectId !== 'none' ? effectParamsToApply : {});
    const updates = { 
      style,
      advancedStyle: effectId === 'none' ? null : {
        id: effect.id,
        name: effect.name,
        css: style,
        params: effectParamsToApply // Sauvegarder les paramètres pour une utilisation ultérieure
      }
    };

    // Si on a un élément sélectionné, on l'utilise directement
    if (selectedElement && onElementUpdate) {
      onElementUpdate(updates);
    } else {
      // Sinon, on utilise la méthode DOM
      const selectedTextElement = document.querySelector('[data-selected="true"][data-type="text"]');
      if (selectedTextElement) {
        const updateEvent = new CustomEvent('applyTextEffect', { detail: updates });
        window.dispatchEvent(updateEvent);
        return;
      }
      
      // Si aucun texte n'est sélectionné, on crée un nouveau texte
      if (onAddElement) {
        onAddElement({
          type: 'text',
          content: 'Double-cliquez pour modifier',
          style: { ...updates.style },
          advancedStyle: updates.advancedStyle
        });
      }
    }
  }, [effectParams, onAddElement, onElementUpdate, selectedElement, applyEffectStyle]);

  const clearEffects = useCallback(() => {
    setSelectedEffect('none');
    setEffectParams({});
    
    if (selectedElement && onElementUpdate) {
      onElementUpdate({
        style: {
          transform: 'none',
          color: selectedElement.style?.color || '#000000'
        },
        advancedStyle: null
      });
    }
  }, [onElementUpdate, selectedElement]);

  // Fonction pour afficher un sélecteur de couleur
  const renderColorPicker = useCallback((paramName: string, label: string, value: string) => {
    const effect = textEffects.find(e => e.id === selectedEffect);
    
    return (
      <div key={paramName} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center relative">
          <div 
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer mr-2"
            style={{ backgroundColor: value }}
            onClick={() => setShowColorPicker(paramName === showColorPicker ? null : paramName)}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newParams = { ...effectParams, [paramName]: e.target.value };
              setEffectParams(newParams);
              if (effect) {
                applyEffect({ ...effect, defaultParams: newParams });
              }
            }}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
          />
          {showColorPicker === paramName && (
            <div className="absolute z-10 mt-1 top-full left-0">
              <HexColorPicker
                color={value}
                onChange={(color) => {
                  const newParams = { ...effectParams, [paramName]: color };
                  setEffectParams(newParams);
                  if (effect) {
                    applyEffect({ ...effect, defaultParams: newParams });
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }, [selectedEffect, effectParams, showColorPicker, applyEffect]);

  // Fonction pour afficher un sélecteur de mode de fusion
  const renderBlendModeSelector = useCallback((paramName: string, label: string, value: string) => {
    const effect = textEffects.find(e => e.id === selectedEffect);
    
    return (
      <div key={paramName} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
          value={value}
          onChange={(e) => {
            const newParams = { ...effectParams, [paramName]: e.target.value };
            setEffectParams(newParams);
            if (effect) {
              applyEffect({ ...effect, defaultParams: newParams });
            }
          }}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="normal">Normal</option>
          <option value="multiply">Multiplier</option>
          <option value="screen">Superposition claire</option>
          <option value="overlay">Superposition</option>
          <option value="darken">Assombrir</option>
          <option value="lighten">Éclaircir</option>
          <option value="color-dodge">Densité couleur -</option>
          <option value="color-burn">Densité couleur +</option>
          <option value="hard-light">Lumière crue</option>
          <option value="soft-light">Lumière tamisée</option>
          <option value="difference">Différence</option>
          <option value="exclusion">Exclusion</option>
          <option value="hue">Teinte</option>
          <option value="saturation">Saturation</option>
          <option value="color">Couleur</option>
          <option value="luminosity">Luminosité</option>
        </select>
      </div>
    );
  }, [selectedEffect, effectParams, applyEffect]);

  // Fonction pour afficher un curseur de réglage
  const renderSlider = useCallback((paramName: string, label: string, min: number, max: number, step = 1) => {
    const effect = textEffects.find(e => e.id === selectedEffect);
    const value = effectParams[paramName] ?? min;
    
    return (
      <div key={paramName} className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {label}: {value}
          </label>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            const newParams = { ...effectParams, [paramName]: newValue };
            setEffectParams(newParams);
            if (effect) {
              applyEffect({ ...effect, defaultParams: newParams });
            }
          }}
          className="w-full"
        />
      </div>
    );
  }, [selectedEffect, effectParams, applyEffect]);

  // Rendu des contrôles d'effet
  const renderEffectControls = useCallback(() => {
    if (!selectedEffect) return null;
    
    const effect = textEffects.find(e => e.id === selectedEffect);
    if (!effect || effect.id === 'none') return null;
    
    const controls = [];

    // Contrôles spécifiques à chaque effet
    switch (effect.id) {
      case 'outline':
        controls.push(
          renderSlider('thickness', 'Épaisseur', 1, 20, 1),
          renderSlider('offset', 'Décalage', 1, 10, 0.5),
          renderColorPicker('color', 'Couleur du contour', effectParams.color || '#000000'),
          renderColorPicker('fillColor', 'Couleur de remplissage', effectParams.fillColor || '#ffffff')
        );
        break;
        
      case 'gradient':
        controls.push(
          renderSlider('angle', 'Angle', 0, 360, 1),
          renderColorPicker('color1', 'Couleur 1', effectParams.color1 || '#7F00FF'),
          renderColorPicker('color2', 'Couleur 2', effectParams.color2 || '#E100FF'),
          renderSlider('position1', 'Position couleur 1', 0, 100, 1),
          renderSlider('position2', 'Position couleur 2', 0, 100, 1),
          renderBlendModeSelector('blendMode', 'Mode de fusion', effectParams.blendMode || 'normal')
        );
        break;
        
      case 'shadow':
        controls.push(
          renderSlider('distance', 'Distance', 0, 40, 1),
          renderSlider('angle', 'Angle', 0, 360, 1),
          renderSlider('blur', 'Flou', 0, 40, 1),
          renderSlider('transparency', 'Opacité', 0, 1, 0.05),
          renderColorPicker('color', 'Couleur', effectParams.color || '#000000')
        );
        break;

      case 'neon':
        controls.push(
          renderSlider('intensity', 'Intensité', 0.1, 5, 0.1),
          renderColorPicker('color', 'Couleur', effectParams.color || '#00ffff')
        );
        break;
        
      case 'glitch':
        controls.push(
          renderSlider('distance', 'Décalage', 0, 20, 0.5),
          renderSlider('angle', 'Angle', 0, 360, 15),
          renderColorPicker('color', 'Couleur secondaire', effectParams.color || '#ff00ff')
        );
        break;
        
      case 'outline2':
        controls.push(
          renderSlider('thickness', 'Épaisseur', 0.5, 10, 0.5),
          renderColorPicker('color', 'Couleur', effectParams.color || '#000000')
        );
        break;
        
      case 'echo':
        controls.push(
          renderSlider('distance', 'Distance', 1, 30, 1),
          renderSlider('angle', 'Angle', 0, 360, 15),
          renderSlider('transparency', 'Dégradé', 0.1, 0.5, 0.05),
          renderColorPicker('color', 'Couleur', effectParams.color || 'rgba(0,0,0,0.3)')
        );
        break;
        
      case 'border':
        controls.push(
          renderSlider('thickness', 'Épaisseur', 0.5, 10, 0.5),
          renderSlider('radius', 'Coins arrondis', 0, 50, 1),
          renderColorPicker('color', 'Couleur', effectParams.color || '#000000')
        );
        break;
        
      case 'background':
        controls.push(
          renderSlider('radius', 'Coins arrondis', 0, 50, 1),
          renderSlider('spread', 'Marge', 0, 40, 1),
          renderSlider('transparency', 'Opacité', 0.1, 1, 0.05),
          renderColorPicker('color', 'Couleur', effectParams.color || 'rgba(245, 245, 245, 0.9)')
        );
        break;

      default:
        return null;
    }

    return <div className="space-y-4">{controls}</div>;
  }, [selectedEffect, effectParams, showColorPicker, applyEffect, applyEffectStyle]);

  return (
    <div className="h-full bg-white flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Effets de texte</h2>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {textEffects.map((effect) => (
          <button
            key={effect.id}
            onClick={() => applyEffect(effect)}
            className={`p-2 border rounded-lg transition-colors ${
              selectedEffect === effect.id 
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center mb-1">
                <span 
                  className="text-lg font-bold"
                  style={effect.id === 'none' ? {} : applyEffectStyle(effect, effect.defaultParams || {})}
                >
                  Aa
                </span>
              </div>
              <span className="text-xs">{effect.name}</span>
            </div>
          </button>
        ))}
      </div>
      
      {selectedEffect !== 'none' && (
        <div className="mt-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Ajustements</h3>
          {renderEffectControls()}
          <button
            onClick={clearEffects}
            className="w-full py-2 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Effacer les effets
          </button>
        </div>
      )}
    </div>
  );
};

export default TextEffectsPanel;
