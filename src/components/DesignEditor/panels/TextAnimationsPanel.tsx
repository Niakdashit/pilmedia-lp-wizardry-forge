import React, { useState } from 'react';

interface TextAnimationsPanelProps {
  onBack: () => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

// Animations de texte (première section)
const textAnimations = [
  {
    id: 'typewriter',
    name: 'Typewriter',
    css: {
      animation: 'typewriter 2s steps(40, end)',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      borderRight: '2px solid'
    }
  },
  {
    id: 'ascend',
    name: 'Ascend',
    css: {
      animation: 'ascend 1s ease-out'
    }
  },
  {
    id: 'shift',
    name: 'Shift',
    css: {
      animation: 'shift 1s ease-in-out'
    }
  },
  {
    id: 'merge',
    name: 'Merge',
    css: {
      animation: 'merge 1.2s ease-out'
    }
  },
  {
    id: 'block',
    name: 'Block',
    css: {
      animation: 'block 0.8s ease-out'
    }
  },
  {
    id: 'burst',
    name: 'Burst',
    css: {
      animation: 'burst 0.6s ease-out'
    }
  },
  {
    id: 'bounce',
    name: 'Bounce',
    css: {
      animation: 'bounce 1s ease-in-out'
    }
  },
  {
    id: 'roll',
    name: 'Roll',
    css: {
      animation: 'roll 1s ease-in-out'
    }
  },
  {
    id: 'skate',
    name: 'Skate',
    css: {
      animation: 'skate 1.2s ease-out'
    }
  },
  {
    id: 'spread',
    name: 'Spread',
    css: {
      animation: 'spread 1s ease-out'
    }
  },
  {
    id: 'clarify',
    name: 'Clarify',
    css: {
      animation: 'clarify 1s ease-out'
    }
  }
];

// Animations générales (deuxième section)
const generalAnimations = [
  {
    id: 'rise',
    name: 'Rise',
    css: {
      animation: 'rise 1s ease-out'
    }
  },
  {
    id: 'pan',
    name: 'Pan',
    css: {
      animation: 'pan 1.2s ease-out'
    }
  },
  {
    id: 'fade',
    name: 'Fade',
    css: {
      animation: 'fade 1s ease-in-out'
    }
  },
  {
    id: 'pop',
    name: 'Pop',
    css: {
      animation: 'pop 0.6s ease-out'
    }
  },
  {
    id: 'wipe',
    name: 'Wipe',
    css: {
      animation: 'wipe 1s ease-out'
    }
  },
  {
    id: 'blur',
    name: 'Blur',
    css: {
      animation: 'blur 1s ease-in-out'
    }
  },
  {
    id: 'succession',
    name: 'Succession',
    css: {
      animation: 'succession 1.5s ease-out'
    }
  },
  {
    id: 'breathe',
    name: 'Breathe',
    css: {
      animation: 'breathe 2s ease-in-out infinite'
    }
  },
  {
    id: 'baseline',
    name: 'Baseline',
    css: {
      animation: 'baseline 1s ease-out'
    }
  },
  {
    id: 'drift',
    name: 'Drift',
    css: {
      animation: 'drift 2s ease-in-out infinite'
    }
  },
  {
    id: 'tectonic',
    name: 'Tectonic',
    css: {
      animation: 'tectonic 1.2s ease-out'
    }
  },
  {
    id: 'tumble',
    name: 'Tumble',
    css: {
      animation: 'tumble 1s ease-in-out'
    }
  },
  {
    id: 'neon',
    name: 'Neon',
    css: {
      animation: 'neon 1.5s ease-in-out'
    }
  },
  {
    id: 'scrapbook',
    name: 'Scrapbook',
    css: {
      animation: 'scrapbook 1s ease-out'
    }
  },
  {
    id: 'stomp',
    name: 'Stomp',
    css: {
      animation: 'stomp 0.8s ease-out'
    }
  }
];

// Effets additionnels (troisième section)
const addOnEffects = [
  {
    id: 'rotate',
    name: 'Rotate',
    css: {
      animation: 'rotate 2s linear infinite'
    }
  },
  {
    id: 'flicker',
    name: 'Flicker',
    css: {
      animation: 'flicker 0.5s ease-in-out infinite'
    }
  },
  {
    id: 'pulse',
    name: 'Pulse',
    css: {
      animation: 'pulse 1.5s ease-in-out infinite'
    }
  },
  {
    id: 'wiggle',
    name: 'Wiggle',
    css: {
      animation: 'wiggle 0.8s ease-in-out infinite'
    }
  }
];

const animationSpeeds = [
  { id: 'slow', name: 'Lent', duration: '2s' },
  { id: 'normal', name: 'Normal', duration: '1s' },
  { id: 'fast', name: 'Rapide', duration: '0.5s' }
];

const TextAnimationsPanel: React.FC<TextAnimationsPanelProps> = ({ 
  onBack, 
  selectedElement, 
  onElementUpdate 
}) => {
  const [selectedSpeed, setSelectedSpeed] = useState('normal');

  const showAnimationSettings = (animation: any) => {
    if (!selectedElement) {
      alert('Veuillez sélectionner un texte avant d\'appliquer une animation.');
      return;
    }
    
    // Déclencher un événement global pour afficher le popup sur le canvas
    const showPopupEvent = new CustomEvent('showAnimationPopup', {
      detail: {
        animation,
        selectedElementId: selectedElement.id
      }
    });
    window.dispatchEvent(showPopupEvent);
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
        <h3 className="text-sm font-semibold text-gray-800">Animations de texte</h3>
        <div className="w-12"></div>
      </div>
      
      <div className="p-4 space-y-4">

        {/* Animations principales - Grid compact */}
        {/* Animations de texte */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Animate</h4>
          <div className="grid grid-cols-3 gap-2">
            {textAnimations.map((animation) => (
              <button
                key={animation.id}
                onClick={() => showAnimationSettings(animation)}
                className="group p-2 border border-gray-200 rounded-lg hover:border-[#E0004D] hover:shadow-sm transition-all duration-200"
              >
                <div className="bg-gray-800 rounded p-2 mb-1 h-12 flex items-center justify-center">
                  <span 
                    className="text-sm font-bold text-[#8b5cf6]"
                  >
                    ABC
                  </span>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-[#E0004D]">{animation.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Animations générales */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">General</h4>
          <div className="grid grid-cols-3 gap-2">
            {generalAnimations.map((animation) => (
              <button
                key={animation.id}
                onClick={() => showAnimationSettings(animation)}
                className="group p-2 border border-gray-200 rounded-lg hover:border-[#E0004D] hover:shadow-sm transition-all duration-200"
              >
                <div className="bg-gray-800 rounded p-2 mb-1 h-12 flex items-center justify-center">
                  <div className="w-6 h-4 bg-[#8b5cf6] rounded opacity-80"></div>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-[#E0004D]">{animation.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Effets additionnels */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add-on effects</h4>
          <div className="grid grid-cols-3 gap-2">
            {addOnEffects.map((animation) => (
              <button
                key={animation.id}
                onClick={() => showAnimationSettings(animation)}
                className="group p-2 border border-gray-200 rounded-lg hover:border-[#E0004D] hover:shadow-sm transition-all duration-200"
              >
                <div className="bg-gray-800 rounded p-2 mb-1 h-12 flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#8b5cf6] rounded-full"></div>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-[#E0004D]">{animation.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vitesse d'animation */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vitesse</h4>
          <div className="grid grid-cols-3 gap-2">
            {animationSpeeds.map((speed) => (
              <button
                key={speed.id}
                onClick={() => setSelectedSpeed(speed.id)}
                className={`p-2 border rounded-lg transition-colors ${
                  selectedSpeed === speed.id 
                    ? 'border-[#E0004D] bg-[radial-gradient(circle_at_0%_0%,_#E0004D,_#6B2AA0)] text-white' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <span className="text-xs font-medium">{speed.name}</span>
                  <div className="text-xs text-gray-500 mt-1">{speed.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bouton pour supprimer l'animation */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => {
              if (selectedElement && onElementUpdate) {
                onElementUpdate({
                  customCSS: {},
                  advancedStyle: null
                });
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Supprimer l'animation
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextAnimationsPanel;
