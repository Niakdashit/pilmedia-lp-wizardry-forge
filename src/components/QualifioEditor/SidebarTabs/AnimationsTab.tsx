
import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Wand2, Eye, EyeOff } from 'lucide-react';
import { useAnimations } from '../animations/AnimationProvider';
import { textAnimationPresets, imageAnimationPresets } from '../animations/presets';
import type { EditorConfig } from '../QualifioEditorLayout';
import type { AnimationType, AnimationTrigger, TextAnimationConfig } from '../animations/types';

interface AnimationsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const AnimationsTab: React.FC<AnimationsTabProps> = ({ config }) => {
  const { 
    state, 
    updateTextAnimation, 
    updateImageAnimation,
    toggleGlobalAnimations,
    playAnimations,
    stopAnimations,
    resetAnimations
  } = useAnimations();

  
  const [activeSection, setActiveSection] = useState<'texts' | 'images' | 'games'>('texts');

  const animationTypes: { value: AnimationType; label: string }[] = [
    { value: 'fadeIn', label: 'Apparition' },
    { value: 'slideInLeft', label: 'Glisser gauche' },
    { value: 'slideInRight', label: 'Glisser droite' },
    { value: 'slideInUp', label: 'Glisser haut' },
    { value: 'slideInDown', label: 'Glisser bas' },
    { value: 'bounce', label: 'Rebond' },
    { value: 'typewriter', label: 'Machine à écrire' },
    { value: 'pulse', label: 'Pulsation' },
    { value: 'zoomIn', label: 'Zoom avant' },
    { value: 'bounceIn', label: 'Rebond entrée' }
  ];

  const triggers: { value: AnimationTrigger; label: string }[] = [
    { value: 'onLoad', label: 'Au chargement' },
    { value: 'onScroll', label: 'Au défilement' },
    { value: 'onClick', label: 'Au clic' },
    { value: 'onHover', label: 'Au survol' },
    { value: 'delayed', label: 'Retardé' },
    { value: 'manual', label: 'Manuel' }
  ];

  const applyPreset = (elementId: string, elementType: 'text' | 'image', presetName: string) => {
    if (elementType === 'text') {
      const preset = textAnimationPresets[presetName];
      if (preset) {
        updateTextAnimation(elementId, preset);
      }
    } else {
      const preset = imageAnimationPresets[presetName];
      if (preset) {
        updateImageAnimation(elementId, preset);
      }
    }
  };

  const updateTextAnimationConfig = (elementId: string, updates: Partial<TextAnimationConfig>) => {
    updateTextAnimation(elementId, updates);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Animations</h2>
        <button
          onClick={toggleGlobalAnimations}
          className={`p-2 rounded-lg transition-colors ${
            state.globalAnimationsEnabled 
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-100 text-gray-400'
          }`}
          title={state.globalAnimationsEnabled ? 'Désactiver animations' : 'Activer animations'}
        >
          {state.globalAnimationsEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Contrôles globaux */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Contrôles globaux</h3>
        <div className="flex gap-2">
          <button
            onClick={state.isPlaying ? stopAnimations : playAnimations}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {state.isPlaying ? 'Pause' : 'Jouer'}
          </button>
          <button
            onClick={resetAnimations}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Sélecteur de section */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {(['texts', 'images', 'games'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === section
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {section === 'texts' ? 'Textes' : section === 'images' ? 'Images' : 'Jeux'}
          </button>
        ))}
      </div>

      {/* Section Textes */}
      {activeSection === 'texts' && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Animations des textes</h3>
          
          {config.customTexts?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun texte personnalisé à animer</p>
              <p className="text-sm">Ajoutez des textes dans l'onglet Layout</p>
            </div>
          )}

          {config.customTexts?.map((text) => {
            const animation = state.textAnimations[text.id];
            return (
              <div key={text.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">
                    {text.content.slice(0, 30)}...
                  </h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={animation?.enabled || false}
                      onChange={(e) => updateTextAnimationConfig(text.id, { enabled: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Actif</span>
                  </label>
                </div>

                {/* Presets rapides */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Presets rapides
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(textAnimationPresets).map((presetName) => (
                      <button
                        key={presetName}
                        onClick={() => applyPreset(text.id, 'text', presetName)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Wand2 className="w-3 h-3" />
                        {presetName}
                      </button>
                    ))}
                  </div>
                </div>

                {animation?.enabled && (
                  <div className="space-y-3">
                    {/* Type d'animation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type d'animation
                      </label>
                      <select
                        value={animation.type || 'fadeIn'}
                        onChange={(e) => updateTextAnimationConfig(text.id, { type: e.target.value as AnimationType })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        {animationTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Déclencheur */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Déclencheur
                      </label>
                      <select
                        value={animation.trigger || 'onLoad'}
                        onChange={(e) => updateTextAnimationConfig(text.id, { trigger: e.target.value as AnimationTrigger })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        {triggers.map((trigger) => (
                          <option key={trigger.value} value={trigger.value}>
                            {trigger.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Durée et délai */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durée (s)
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={animation.duration || 0.6}
                          onChange={(e) => updateTextAnimationConfig(text.id, { duration: parseFloat(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Délai (s)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={animation.delay || 0}
                          onChange={(e) => updateTextAnimationConfig(text.id, { delay: parseFloat(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Options spéciales pour typewriter */}
                    {animation.type === 'typewriter' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vitesse (ms par caractère)
                        </label>
                        <input
                          type="number"
                          min="20"
                          max="200"
                          step="10"
                          value={animation.typewriterSpeed || 80}
                          onChange={(e) => updateTextAnimationConfig(text.id, { typewriterSpeed: parseInt(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Section Images */}
      {activeSection === 'images' && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Animations des images</h3>
          
          {config.design?.customImages?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune image personnalisée à animer</p>
              <p className="text-sm">Ajoutez des images dans l'onglet Design</p>
            </div>
          )}

          {config.design?.customImages?.map((image) => {
            const animation = state.imageAnimations[image.id];
            return (
              <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">
                    Image #{image.id}
                  </h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={animation?.enabled || false}
                      onChange={(e) => updateImageAnimation(image.id, { enabled: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Actif</span>
                  </label>
                </div>

                {/* Presets rapides pour images */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Presets rapides
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(imageAnimationPresets).map((presetName) => (
                      <button
                        key={presetName}
                        onClick={() => applyPreset(image.id, 'image', presetName)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Wand2 className="w-3 h-3" />
                        {presetName}
                      </button>
                    ))}
                  </div>
                </div>

                {animation?.enabled && (
                  <div className="space-y-3">
                    {/* Configuration similaire aux textes mais adaptée aux images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type d'animation
                      </label>
                      <select
                        value={animation.type || 'fadeIn'}
                        onChange={(e) => updateImageAnimation(image.id, { type: e.target.value as AnimationType })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        {animationTypes.filter(type => 
                          ['fadeIn', 'zoomIn', 'slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight', 'bounceIn', 'flipX', 'flipY'].includes(type.value)
                        ).map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durée (s)
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={animation.duration || 0.8}
                          onChange={(e) => updateImageAnimation(image.id, { duration: parseFloat(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Délai (s)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={animation.delay || 0}
                          onChange={(e) => updateImageAnimation(image.id, { delay: parseFloat(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={animation.hoverEffect || false}
                          onChange={(e) => updateImageAnimation(image.id, { hoverEffect: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Effet au survol</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Section Jeux */}
      {activeSection === 'games' && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Animations des jeux</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              🚀 Animations des zones de jeu et transitions automatiques
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Les animations de jeu sont appliquées automatiquement selon le type de jeu sélectionné.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationsTab;
