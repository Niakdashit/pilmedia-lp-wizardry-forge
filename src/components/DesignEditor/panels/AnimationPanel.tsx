import React from 'react';
import { Zap, Play, RotateCw, Sparkles } from 'lucide-react';

const AnimationPanel: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      {/* Animations d'apparition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Play className="w-4 h-4 inline mr-2" />
          Animation d'apparition
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'fade', label: 'Fondu' },
            { id: 'slide', label: 'Glissement' },
            { id: 'zoom', label: 'Zoom' },
            { id: 'bounce', label: 'Rebond' }
          ].map((animation) => (
            <button
              key={animation.id}
              className="p-3 text-sm border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              {animation.label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">Durée (ms)</label>
          <input
            type="range"
            min="100"
            max="2000"
            defaultValue="500"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>100ms</span>
            <span>2000ms</span>
          </div>
        </div>
      </div>

      {/* Effets de jeu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Sparkles className="w-4 h-4 inline mr-2" />
          Effets de jeu
        </label>
        <div className="space-y-2">
          {[
            { id: 'confetti', label: 'Confettis victoire', desc: 'Explosion de confettis' },
            { id: 'shake', label: 'Vibration défaite', desc: 'Tremblement écran' },
            { id: 'glow', label: 'Lueur magique', desc: 'Effet de brillance' },
            { id: 'particles', label: 'Particules', desc: 'Particules flottantes' }
          ].map((effect) => (
            <div key={effect.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
              <input
                type="checkbox"
                id={effect.id}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor={effect.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                  {effect.label}
                </label>
                <p className="text-xs text-gray-500">{effect.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animations de la roue */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <RotateCw className="w-4 h-4 inline mr-2" />
          Animation d'entrée de la roue
        </label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Position initiale</label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
              <option value="bottom">Depuis le bas (50%)</option>
              <option value="top">Depuis le haut</option>
              <option value="left">Depuis la gauche</option>
              <option value="right">Depuis la droite</option>
              <option value="center">Directement au centre</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Animation de levée</label>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="wheel-lift-enabled"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="wheel-lift-enabled" className="text-sm text-gray-700">
                Activer l'animation de levée sur clic
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Durée de l'animation (ms)</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="300"
                max="1000"
                defaultValue="500"
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-16">500ms</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type d'animation</label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
              <option value="ease-out">Douce (ease-out)</option>
              <option value="ease-in-out">Équilibrée (ease-in-out)</option>
              <option value="spring">Rebond (spring)</option>
              <option value="bounce">Rebond prononcé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transitions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <RotateCw className="w-4 h-4 inline mr-2" />
          Transitions entre écrans
        </label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type de transition</label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
              <option value="slide">Glissement</option>
              <option value="fade">Fondu enchaîné</option>
              <option value="flip">Retournement</option>
              <option value="scale">Mise à l'échelle</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Vitesse</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="200"
                max="1000"
                defaultValue="400"
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-16">400ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animations de loading */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Zap className="w-4 h-4 inline mr-2" />
          Indicateurs de chargement
        </label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'spinner', label: 'Spinner classique' },
            { id: 'dots', label: 'Points qui sautent' },
            { id: 'bar', label: 'Barre de progression' },
            { id: 'pulse', label: 'Pulsation' }
          ].map((loader) => (
            <button
              key={loader.id}
              className="p-3 text-sm border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              {loader.label}
            </button>
          ))}
        </div>
      </div>

      {/* Performances */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Optimisations
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="reduced-motion"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="reduced-motion" className="text-sm text-gray-700">
              Respecter les préférences de mouvement réduit
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="gpu-acceleration"
              defaultChecked
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="gpu-acceleration" className="text-sm text-gray-700">
              Accélération GPU
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationPanel;