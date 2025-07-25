import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface AnimationEntrancePanelProps {
  animationConfig?: any;
  onAnimationChange?: (config: any) => void;
}

const AnimationEntrancePanel: React.FC<AnimationEntrancePanelProps> = ({
  animationConfig,
  onAnimationChange = () => {}
}) => {
  const [config, setConfig] = React.useState(animationConfig || {
    type: 'fadeIn',
    direction: 'none',
    duration: 800,
    delay: 0,
    trigger: 'onLoad',
    easing: 'easeOut'
  });

  // Sync with external config changes
  React.useEffect(() => {
    if (animationConfig) {
      setConfig(animationConfig);
    }
  }, [animationConfig]);

  const handleConfigChange = (updates: any) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onAnimationChange(newConfig);
  };

  const animationTypes = [
    { id: 'fadeIn', label: 'Apparition en fondu', preview: '⚪' },
    { id: 'slideIn', label: 'Glissement', preview: '➡️' },
    { id: 'scaleIn', label: 'Zoom', preview: '🔍' },
    { id: 'bounceIn', label: 'Rebond', preview: '🏀' },
    { id: 'rotateIn', label: 'Rotation', preview: '🔄' },
    { id: 'flipIn', label: 'Retournement', preview: '🔀' }
  ];

  const directions = [
    { id: 'none', label: 'Aucune direction' },
    { id: 'top', label: 'Depuis le haut' },
    { id: 'bottom', label: 'Depuis le bas' },
    { id: 'left', label: 'Depuis la gauche' },
    { id: 'right', label: 'Depuis la droite' },
    { id: 'topLeft', label: 'Depuis le haut-gauche' },
    { id: 'topRight', label: 'Depuis le haut-droite' },
    { id: 'bottomLeft', label: 'Depuis le bas-gauche' },
    { id: 'bottomRight', label: 'Depuis le bas-droite' }
  ];

  const triggers = [
    { id: 'onLoad', label: 'Au chargement de la page' },
    { id: 'onScroll', label: 'Au scroll vers le bas' },
    { id: 'onHover', label: 'Au survol' },
    { id: 'onClick', label: 'Au clic' },
    { id: 'onDelay', label: 'Après un délai' },
    { id: 'onVisible', label: 'Quand visible à l\'écran' }
  ];

  const easingTypes = [
    { id: 'linear', label: 'Linéaire' },
    { id: 'easeIn', label: 'Accélération' },
    { id: 'easeOut', label: 'Décélération' },
    { id: 'easeInOut', label: 'Accél. puis décél.' },
    { id: 'bounce', label: 'Rebond' },
    { id: 'elastic', label: 'Élastique' }
  ];

  const handlePreview = () => {
    // Trigger animation preview
    console.log('Preview animation:', config);
  };

  const handleReset = () => {
    const defaultConfig = {
      type: 'fadeIn',
      direction: 'none',
      duration: 800,
      delay: 0,
      trigger: 'onLoad',
      easing: 'easeOut'
    };
    setConfig(defaultConfig);
    onAnimationChange(defaultConfig);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Type d'animation */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Type d'animation
        </label>
        <div className="grid grid-cols-2 gap-2">
          {animationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleConfigChange({ type: type.id })}
              className={`p-3 text-xs rounded-lg border-2 transition-all ${
                config.type === type.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="text-lg mb-1">{type.preview}</div>
              <div>{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Direction (pour slideIn principalement) */}
      {(config.type === 'slideIn' || config.type === 'bounceIn') && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Direction
          </label>
          <select
            value={config.direction}
            onChange={(e) => handleConfigChange({ direction: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {directions.map((dir) => (
              <option key={dir.id} value={dir.id}>
                {dir.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Déclencheur */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Déclencheur
        </label>
        <select
          value={config.trigger}
          onChange={(e) => handleConfigChange({ trigger: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {triggers.map((trigger) => (
            <option key={trigger.id} value={trigger.id}>
              {trigger.label}
            </option>
          ))}
        </select>
      </div>

      {/* Durée */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Durée ({config.duration}ms)
        </label>
        <input
          type="range"
          min="200"
          max="2000"
          step="100"
          value={config.duration}
          onChange={(e) => handleConfigChange({ duration: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>200ms</span>
          <span>2000ms</span>
        </div>
      </div>

      {/* Délai */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Délai ({config.delay}ms)
        </label>
        <input
          type="range"
          min="0"
          max="3000"
          step="100"
          value={config.delay}
          onChange={(e) => handleConfigChange({ delay: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0ms</span>
          <span>3000ms</span>
        </div>
      </div>

      {/* Type de transition */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Type de transition
        </label>
        <select
          value={config.easing}
          onChange={(e) => handleConfigChange({ easing: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {easingTypes.map((easing) => (
            <option key={easing.id} value={easing.id}>
              {easing.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={handlePreview}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Play className="w-4 h-4" />
          Aperçu
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Informations sur l'animation actuelle */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration actuelle :</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Type: {animationTypes.find(t => t.id === config.type)?.label}</div>
          <div>Déclencheur: {triggers.find(t => t.id === config.trigger)?.label}</div>
          <div>Durée: {config.duration}ms</div>
          {config.delay > 0 && <div>Délai: {config.delay}ms</div>}
        </div>
      </div>
    </div>
  );
};

export default AnimationEntrancePanel;