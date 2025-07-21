
import React from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface AnimationsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const AnimationsTab: React.FC<AnimationsTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const animationTypes = [
    { value: 'fadeIn', label: 'Apparition en fondu' },
    { value: 'slideInLeft', label: 'Glissement depuis la gauche' },
    { value: 'slideInRight', label: 'Glissement depuis la droite' },
    { value: 'slideInUp', label: 'Glissement depuis le bas' },
    { value: 'slideInDown', label: 'Glissement depuis le haut' },
    { value: 'bounce', label: 'Rebond' },
    { value: 'typewriter', label: 'Machine à écrire' },
    { value: 'pulse', label: 'Pulsation' },
    { value: 'rotate', label: 'Rotation' },
    { value: 'zoomIn', label: 'Zoom avant' },
    { value: 'flipX', label: 'Retournement horizontal' },
    { value: 'flipY', label: 'Retournement vertical' }
  ];

  const triggerTypes = [
    { value: 'onLoad', label: 'Au chargement' },
    { value: 'onScroll', label: 'Au défilement' },
    { value: 'onClick', label: 'Au clic' },
    { value: 'onHover', label: 'Au survol' },
    { value: 'delayed', label: 'Retardé' }
  ];

  const updateTextAnimation = (textId: string, animationConfig: any) => {
    if (!config.customTexts) return;
    
    const updatedTexts = config.customTexts.map(text => 
      text.id === textId 
        ? { ...text, animationConfig, isAnimated: animationConfig.enabled }
        : text
    );
    
    onConfigUpdate({ customTexts: updatedTexts });
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Animations</h3>
      
      {config.customTexts && config.customTexts.length > 0 ? (
        <div className="space-y-4">
          {config.customTexts.map((text) => (
            <div key={text.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 truncate">
                Animation: {text.content}
              </h4>
              
              <div className="space-y-3">
                {/* Enable Animation */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Activer l'animation</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={text.animationConfig?.enabled || false}
                      onChange={(e) => updateTextAnimation(text.id, {
                        ...text.animationConfig,
                        enabled: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                {text.animationConfig?.enabled && (
                  <>
                    {/* Animation Type */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Type d'animation</label>
                      <select 
                        value={text.animationConfig?.type || 'fadeIn'} 
                        onChange={(e) => updateTextAnimation(text.id, {
                          ...text.animationConfig,
                          type: e.target.value
                        })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                      >
                        {animationTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Trigger */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Déclenchement</label>
                      <select 
                        value={text.animationConfig?.trigger || 'onLoad'} 
                        onChange={(e) => updateTextAnimation(text.id, {
                          ...text.animationConfig,
                          trigger: e.target.value
                        })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                      >
                        {triggerTypes.map(trigger => (
                          <option key={trigger.value} value={trigger.value}>
                            {trigger.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration and Delay */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Durée (ms)</label>
                        <input
                          type="number"
                          value={text.animationConfig?.duration || 1000}
                          onChange={(e) => updateTextAnimation(text.id, {
                            ...text.animationConfig,
                            duration: parseInt(e.target.value) || 1000
                          })}
                          min="100"
                          max="5000"
                          step="100"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Délai (ms)</label>
                        <input
                          type="number"
                          value={text.animationConfig?.delay || 0}
                          onChange={(e) => updateTextAnimation(text.id, {
                            ...text.animationConfig,
                            delay: parseInt(e.target.value) || 0
                          })}
                          min="0"
                          max="5000"
                          step="100"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    {/* Typewriter Speed (if typewriter animation) */}
                    {text.animationConfig?.type === 'typewriter' && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Vitesse machine à écrire (ms/caractère)</label>
                        <input
                          type="number"
                          value={text.animationConfig?.typewriterSpeed || 50}
                          onChange={(e) => updateTextAnimation(text.id, {
                            ...text.animationConfig,
                            typewriterSpeed: parseInt(e.target.value) || 50
                          })}
                          min="10"
                          max="500"
                          step="10"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Aucun texte disponible pour l'animation</p>
          <p className="text-sm text-gray-400 mt-1">Ajoutez du texte dans l'onglet Design pour configurer les animations</p>
        </div>
      )}
    </div>
  );
};

export default AnimationsTab;
