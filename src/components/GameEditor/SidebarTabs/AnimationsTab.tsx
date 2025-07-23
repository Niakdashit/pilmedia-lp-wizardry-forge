
import React from 'react';
import { Wand2, Play, RotateCcw, Sparkles } from 'lucide-react';
import type { EditorConfig, CustomText } from '../GameEditorLayout';

interface AnimationsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const AnimationsTab: React.FC<AnimationsTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const updateTextAnimation = (textId: string, animationConfig: Partial<CustomText['animationConfig']>) => {
    const updatedTexts = config.customTexts?.map(text => {
      if (text.id === textId) {
        const currentConfig = text.animationConfig || {
          type: 'fadeIn' as const,
          duration: 1000,
          delay: 0,
          trigger: 'onLoad' as const,
          enabled: false
        };
        return {
          ...text,
          animationConfig: {
            ...currentConfig,
            ...animationConfig,
            type: animationConfig?.type ?? currentConfig.type
          }
        };
      }
      return text;
    });
    onConfigUpdate({ customTexts: updatedTexts });
  };

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
    { value: 'delayed', label: 'Avec délai' }
  ];

  return (
    <div className="space-y-6 py-0 my-[30px]">
      <h3 className="section-title text-center">Animations</h3>
      
      {/* Configuration globale des animations */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Configuration globale
        </h4>
        
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-800">
              ✨ <strong>Animations disponibles :</strong> Configurez des animations pour vos textes personnalisés.
              Les animations ajoutent de l'interactivité et améliorent l'expérience utilisateur.
            </p>
          </div>
        </div>
      </div>

      {/* Animations par texte */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Animations des textes
        </h4>
        
        {!config.customTexts || config.customTexts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wand2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Aucun texte personnalisé</p>
            <p className="text-xs text-gray-400 mt-1">
              Ajoutez des textes dans l'onglet "Textes" pour configurer leurs animations
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {config.customTexts.map((text) => {
              const animationConfig = text.animationConfig || {
                type: 'fadeIn',
                duration: 1000,
                delay: 0,
                trigger: 'onLoad',
                enabled: false
              };

              return (
                <div key={text.id} className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-sidebar-text-muted" />
                      <span className="text-sm font-medium text-sidebar-text-primary">
                        {(text.content || 'Texte sans contenu').substring(0, 30)}{(text.content || '').length > 30 ? '...' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={animationConfig.enabled}
                          onChange={e => updateTextAnimation(text.id, { enabled: e.target.checked })}
                          className="rounded"
                        />
                        Activée
                      </label>
                    </div>
                  </div>

                  {animationConfig.enabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-group-premium">
                          <label>Type d'animation</label>
                          <select
                            value={animationConfig.type}
                            onChange={e => updateTextAnimation(text.id, { type: e.target.value as any })}
                          >
                            {animationTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group-premium">
                          <label>Déclencheur</label>
                          <select
                            value={animationConfig.trigger}
                            onChange={e => updateTextAnimation(text.id, { trigger: e.target.value as any })}
                          >
                            {triggerTypes.map(trigger => (
                              <option key={trigger.value} value={trigger.value}>
                                {trigger.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-group-premium">
                          <label>Durée (ms)</label>
                          <input
                            type="number"
                            min="100"
                            max="5000"
                            step="100"
                            value={animationConfig.duration}
                            onChange={e => updateTextAnimation(text.id, { duration: parseInt(e.target.value) || 1000 })}
                          />
                        </div>

                        <div className="form-group-premium">
                          <label>Délai (ms)</label>
                          <input
                            type="number"
                            min="0"
                            max="10000"
                            step="100"
                            value={animationConfig.delay}
                            onChange={e => updateTextAnimation(text.id, { delay: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      {animationConfig.type === 'typewriter' && (
                        <div className="form-group-premium">
                          <label>Vitesse de frappe (caractères/seconde)</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={animationConfig.typewriterSpeed || 10}
                            onChange={e => updateTextAnimation(text.id, { typewriterSpeed: parseInt(e.target.value) || 10 })}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-group-premium">
                          <label>Répétitions</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={animationConfig.repeat || 1}
                            onChange={e => updateTextAnimation(text.id, { repeat: parseInt(e.target.value) || 1 })}
                          />
                        </div>

                        <div className="form-group-premium">
                          <label>Type de répétition</label>
                          <select
                            value={animationConfig.repeatType || 'loop'}
                            onChange={e => updateTextAnimation(text.id, { repeatType: e.target.value as any })}
                          >
                            <option value="loop">Boucle</option>
                            <option value="reverse">Inverse</option>
                            <option value="mirror">Miroir</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group-premium">
                        <label>Courbe d'animation</label>
                        <select
                          value={animationConfig.ease || 'ease-out'}
                          onChange={e => updateTextAnimation(text.id, { ease: e.target.value })}
                        >
                          <option value="linear">Linéaire</option>
                          <option value="ease">Ease</option>
                          <option value="ease-in">Ease In</option>
                          <option value="ease-out">Ease Out</option>
                          <option value="ease-in-out">Ease In Out</option>
                          <option value="bounce">Rebond</option>
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button className="flex items-center gap-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                          <Play className="w-3 h-3" />
                          Aperçu
                        </button>
                        <button
                          onClick={() => updateTextAnimation(text.id, {
                            type: 'fadeIn',
                            duration: 1000,
                            delay: 0,
                            trigger: 'onLoad',
                            repeat: 1,
                            repeatType: 'loop',
                            ease: 'ease-out'
                          })}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Réinitialiser
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationsTab;
