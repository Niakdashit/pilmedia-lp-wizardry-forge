import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface AnimationSettingsPopupProps {
  animation: {
    id: string;
    name: string;
    css: any;
  };
  position: { x: number; y: number };
  onApply: (settings: any) => void;
  onClose: () => void;
  visible: boolean;
}

const AnimationSettingsPopup: React.FC<AnimationSettingsPopupProps> = ({
  animation,
  position,
  onApply,
  onClose,
  visible
}) => {
  const [animateMode, setAnimateMode] = useState('on-enter');
  const [speed, setSpeed] = useState(50); // 0-100 scale
  const [direction, setDirection] = useState('right');
  const [writingStyle, setWritingStyle] = useState('element');
  const [animationColor, setAnimationColor] = useState('#8b5cf6');
  const [intensity, setIntensity] = useState(100);

  // Determine available settings based on animation type
  const getAvailableSettings = () => {
    const settings = {
      showDirection: false,
      showWritingStyle: false,
      directions: ['left', 'right'],
      writingStyles: ['character', 'word', 'line', 'element']
    };

    // Animations that support direction
    const directionalAnimations = [
      'ascend', 'shift', 'merge', 'block', 'burst', 'roll', 'skate',
      'rise', 'pan', 'wipe', 'drift', 'tectonic', 'tumble'
    ];

    // Text-specific animations that support writing style
    const textAnimations = [
      'typewriter', 'ascend', 'shift', 'merge', 'block', 'burst', 'roll', 'skate'
    ];

    if (directionalAnimations.includes(animation.id)) {
      settings.showDirection = true;
      
      // Set available directions based on animation
      if (['ascend', 'rise', 'baseline'].includes(animation.id)) {
        settings.directions = ['up', 'down'];
        setDirection('up');
      } else if (['pan', 'wipe', 'drift'].includes(animation.id)) {
        settings.directions = ['left', 'right', 'up', 'down'];
      }
    }

    if (textAnimations.includes(animation.id)) {
      settings.showWritingStyle = true;
    }

    return settings;
  };

  const settings = getAvailableSettings();

  const handleApply = () => {
    // Créer une copie des CSS sans la propriété animation shorthand pour éviter les conflits
    const { animation: animationShorthand, ...baseCss } = animation.css;
    
    // Calculer la durée basée sur la vitesse (plus intuitif)
    const duration = speed <= 25 ? 3 : speed <= 50 ? 2 : speed <= 75 ? 1 : 0.5;
    const intensityFactor = intensity / 100;
    
    let animationSettings = {
      ...baseCss,
      // Utiliser les propriétés spécifiques au lieu du shorthand
      animationName: animation.id,
      animationDuration: `${duration}s`,
      animationTimingFunction: getTimingFunction(),
      animationFillMode: 'both',
      animationIterationCount: animationShorthand?.includes('infinite') ? 'infinite' : '1',
      animationDirection: getAnimationDirection(),
      animationDelay: animateMode === 'on-exit' ? '0.2s' : '0s'
    };

    // Appliquer des ajustements spécifiques selon l'animation
    animationSettings = applyAnimationSpecificSettings(animationSettings, intensityFactor);

    onApply({
      customCSS: animationSettings,
      advancedStyle: {
        id: animation.id,
        name: animation.name,
        category: 'animation',
        css: animationSettings,
        settings: {
          mode: animateMode,
          speed,
          direction,
          writingStyle,
          animationColor,
          intensity
        }
      }
    });
  };

  const getTimingFunction = () => {
    if (speed <= 25) return 'ease-in';
    if (speed <= 75) return 'ease-out';
    return 'ease-in-out';
  };

  const getAnimationDirection = () => {
    if (animateMode === 'on-exit') {
      return direction === 'left' ? 'reverse' : direction === 'right' ? 'normal' : direction;
    }
    return 'normal';
  };

  const applyAnimationSpecificSettings = (settings: any, intensityFactor: number) => {
    // Ajustements spécifiques selon le type d'animation
    switch (animation.id) {
      case 'typewriter':
        return {
          ...settings,
          borderRightColor: animationColor,
          animationDuration: `${parseFloat(settings.animationDuration) * (2 - intensityFactor)}s`
        };
      case 'neon':
      case 'glow':
        return {
          ...settings,
          color: animationColor,
          textShadow: `0 0 ${10 * intensityFactor}px ${animationColor}`
        };
      case 'bounce':
      case 'pulse':
        return {
          ...settings,
          transform: `scale(${1 + (0.2 * intensityFactor)})`
        };
      default:
        return settings;
    }
  };

  const getDirectionIcon = (dir: string) => {
    switch (dir) {
      case 'left': return <ChevronLeft className="w-4 h-4" />;
      case 'right': return <ChevronRight className="w-4 h-4" />;
      case 'up': return <ChevronUp className="w-4 h-4" />;
      case 'down': return <ChevronDown className="w-4 h-4" />;
      default: return <ChevronRight className="w-4 h-4" />;
    }
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 p-4 min-w-[300px]"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Animate</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* Animation Mode */}
      <div className="mb-4">
        <div className="flex gap-1 mb-2">
          {['both', 'on-enter', 'on-exit'].map((mode) => (
            <button
              key={mode}
              onClick={() => setAnimateMode(mode)}
              className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                animateMode === mode
                  ? 'bg-purple-600 text-white border-2 border-purple-500'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {mode === 'both' ? 'Both' : mode === 'on-enter' ? 'On enter' : 'On exit'}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-300">Speed</label>
          <div className="w-4 h-4 text-purple-400">👑</div>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${speed}%, #374151 ${speed}%, #374151 100%)`
            }}
          />
          <div 
            className="absolute w-4 h-4 bg-white rounded-full border-2 border-gray-300 -mt-1"
            style={{ left: `calc(${speed}% - 8px)`, top: '0px' }}
          />
        </div>
      </div>

      {/* Direction Control */}
      {settings.showDirection && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300">Direction</label>
            <div className="w-4 h-4 text-purple-400">👑</div>
          </div>
          <div className="flex gap-1">
            {settings.directions.map((dir) => (
              <button
                key={dir}
                onClick={() => setDirection(dir)}
                className={`p-2 rounded border transition-colors ${
                  direction === dir
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {getDirectionIcon(dir)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Writing Style Control */}
      {settings.showWritingStyle && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300">Writing Style</label>
            <div className="w-4 h-4 text-purple-400">👑</div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {settings.writingStyles.map((style) => (
              <button
                key={style}
                onClick={() => setWritingStyle(style)}
                className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                  writingStyle === style
                    ? 'bg-purple-600 border-2 border-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Animation Color Control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-300">Couleur</label>
          <div className="w-4 h-4 text-purple-400">🎨</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={animationColor}
            onChange={(e) => setAnimationColor(e.target.value)}
            className="w-8 h-8 rounded border border-gray-600 cursor-pointer bg-gray-700"
          />
          <span className="text-xs text-gray-400 font-mono">{animationColor}</span>
        </div>
      </div>

      {/* Intensity Control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-300">Intensité</label>
          <div className="w-4 h-4 text-purple-400">⚡</div>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${intensity}%, #374151 ${intensity}%, #374151 100%)`
            }}
          />
          <div 
            className="absolute w-4 h-4 bg-white rounded-full border-2 border-gray-300 -mt-1"
            style={{ left: `calc(${intensity}% - 8px)`, top: '0px' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Faible</span>
          <span>{intensity}%</span>
          <span>Fort</span>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium transition-colors"
      >
        Apply Animation
      </button>
    </div>
  );
};

export default AnimationSettingsPopup;
