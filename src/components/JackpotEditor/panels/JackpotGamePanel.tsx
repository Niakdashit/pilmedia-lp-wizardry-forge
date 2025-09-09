import React, { useState } from 'react';
import { Trophy, Settings, Percent, Users, Target } from 'lucide-react';

interface JackpotGamePanelProps {
  config: any;
  onConfigUpdate: (updates: any) => void;
}

const JackpotGamePanel: React.FC<JackpotGamePanelProps> = ({
  config,
  onConfigUpdate
}) => {
  const jackpotConfig = config.gameConfig?.jackpot || {};
  const instantWin = jackpotConfig.instantWin || {};

  const updateJackpotConfig = (updates: any) => {
    onConfigUpdate({
      gameConfig: {
        ...config.gameConfig,
        jackpot: {
          ...jackpotConfig,
          ...updates
        }
      }
    });
  };

  const updateInstantWin = (updates: any) => {
    updateJackpotConfig({
      instantWin: {
        ...instantWin,
        ...updates
      }
    });
  };

  const updateButtonConfig = (updates: any) => {
    onConfigUpdate({
      buttonConfig: {
        ...config.buttonConfig,
        ...updates
      }
    });
    
    // Synchroniser avec la config du jeu
    updateJackpotConfig({
      buttonLabel: updates.text || config.buttonConfig?.text,
      buttonColor: updates.color || config.buttonConfig?.color
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration du bouton */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Bouton de jeu
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={config.buttonConfig?.text || jackpotConfig.buttonLabel || 'Lancer le Jackpot'}
              onChange={(e) => updateButtonConfig({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Lancer le Jackpot"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du bouton
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: config.buttonConfig?.color || jackpotConfig.buttonColor || '#ec4899' }}
                onClick={() => document.getElementById('buttonColorPicker')?.click()}
              />
              <input
                id="buttonColorPicker"
                type="color"
                value={config.buttonConfig?.color || jackpotConfig.buttonColor || '#ec4899'}
                onChange={(e) => updateButtonConfig({ color: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={config.buttonConfig?.color || jackpotConfig.buttonColor || '#ec4899'}
                onChange={(e) => updateButtonConfig({ color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#ec4899"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration des gains instantanés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
          Gains instantanés
        </h3>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Trophy className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Mode gain instantané</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Les joueurs peuvent gagner immédiatement selon la probabilité définie
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Percent className="w-4 h-4 inline mr-1" />
              Probabilité de gain ({instantWin.winProbability || 30}%)
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={instantWin.winProbability || 30}
              onChange={(e) => updateInstantWin({ winProbability: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              Nombre maximum de gagnants
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={instantWin.maxWinners || 100}
              onChange={(e) => updateInstantWin({ maxWinners: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Limite le nombre total de gagnants pour cette campagne
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gagnants actuels
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600">
                {instantWin.winnersCount || 0} / {instantWin.maxWinners || 100}
              </div>
              <button
                onClick={() => updateInstantWin({ winnersCount: 0 })}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(((instantWin.winnersCount || 0) / (instantWin.maxWinners || 100)) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques en temps réel */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-600" />
          Statistiques
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              {instantWin.winnersCount || 0}
            </div>
            <div className="text-sm text-blue-700">Gagnants</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {instantWin.winProbability || 30}%
            </div>
            <div className="text-sm text-green-700">Taux de gain</div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-2">Estimation des gains</div>
          <div className="text-xs text-gray-500">
            Sur 1000 participants, environ {Math.round((instantWin.winProbability || 30) * 10)} personnes gagneront
          </div>
        </div>
      </div>

      {/* Paramètres avancés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-600" />
          Paramètres avancés
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Animation des slots</div>
              <div className="text-xs text-gray-500">Active l'animation de rotation des slots</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={jackpotConfig.enableAnimation !== false}
                onChange={(e) => updateJackpotConfig({ enableAnimation: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Son des effets</div>
              <div className="text-xs text-gray-500">Joue des sons lors des interactions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={jackpotConfig.enableSound !== false}
                onChange={(e) => updateJackpotConfig({ enableSound: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotGamePanel;
