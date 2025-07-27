import React, { useCallback } from 'react';
import { Gamepad2, Zap, Clock, Target } from 'lucide-react';

interface WheelMechanicsConfigProps {
  campaign?: any;
  onCampaignUpdate?: (updates: any) => void;
}

const WheelMechanicsConfig: React.FC<WheelMechanicsConfigProps> = ({
  campaign,
  onCampaignUpdate
}) => {
  const gameConfig = campaign?.gameConfig?.wheel || {};
  const winProbability = gameConfig.winProbability || 0.3;
  const maxWinners = gameConfig.maxWinners || 100;
  const spinDuration = gameConfig.spinDuration || 3000;
  const autoSpin = gameConfig.autoSpin || false;

  const handleWinProbabilityChange = useCallback((value: number) => {
    onCampaignUpdate?.({
      gameConfig: {
        ...campaign?.gameConfig,
        wheel: {
          ...gameConfig,
          winProbability: value
        }
      }
    });
  }, [campaign?.gameConfig, gameConfig, onCampaignUpdate]);

  const handleMaxWinnersChange = useCallback((value: number) => {
    onCampaignUpdate?.({
      gameConfig: {
        ...campaign?.gameConfig,
        wheel: {
          ...gameConfig,
          maxWinners: value
        }
      }
    });
  }, [campaign?.gameConfig, gameConfig, onCampaignUpdate]);

  const handleSpinDurationChange = useCallback((value: number) => {
    onCampaignUpdate?.({
      gameConfig: {
        ...campaign?.gameConfig,
        wheel: {
          ...gameConfig,
          spinDuration: value
        }
      }
    });
  }, [campaign?.gameConfig, gameConfig, onCampaignUpdate]);

  const handleAutoSpinToggle = useCallback(() => {
    onCampaignUpdate?.({
      gameConfig: {
        ...campaign?.gameConfig,
        wheel: {
          ...gameConfig,
          autoSpin: !autoSpin
        }
      }
    });
  }, [campaign?.gameConfig, gameConfig, autoSpin, onCampaignUpdate]);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Mécanique de jeu</h3>
        <p className="text-sm text-gray-600">Configurez le comportement de votre roue</p>
      </div>

      {/* Win Probability */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <label className="text-sm font-medium text-gray-700">
            Probabilité de gain: {Math.round(winProbability * 100)}%
          </label>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={winProbability}
          onChange={(e) => handleWinProbabilityChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <p className="text-xs text-gray-600">
          Contrôle la fréquence des gains. Plus élevé = plus de gagnants.
        </p>
      </div>

      {/* Max Winners */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-green-600" />
          <label className="text-sm font-medium text-gray-700">
            Nombre maximum de gagnants
          </label>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="10000"
            value={maxWinners}
            onChange={(e) => handleMaxWinnersChange(parseInt(e.target.value) || 1)}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-600">participants</span>
        </div>
        <p className="text-xs text-gray-600">
          Limite le nombre total de gagnants pour cette campagne.
        </p>
      </div>

      {/* Spin Duration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          <label className="text-sm font-medium text-gray-700">
            Durée de rotation: {spinDuration / 1000}s
          </label>
        </div>
        <input
          type="range"
          min="1000"
          max="8000"
          step="500"
          value={spinDuration}
          onChange={(e) => handleSpinDurationChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1s</span>
          <span>4s</span>
          <span>8s</span>
        </div>
        <p className="text-xs text-gray-600">
          Contrôle la durée de l'animation de rotation de la roue.
        </p>
      </div>

      {/* Auto Spin */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <label className="text-sm font-medium text-gray-700">
              Rotation automatique
            </label>
          </div>
          <button
            onClick={handleAutoSpinToggle}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${autoSpin ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${autoSpin ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
        <p className="text-xs text-gray-600">
          {autoSpin 
            ? "La roue démarre automatiquement après validation du formulaire."
            : "L'utilisateur doit cliquer sur le bouton pour faire tourner la roue."
          }
        </p>
      </div>

      {/* Current Settings Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-3">Résumé de la configuration</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Probabilité de gain:</span>
            <span className="font-medium text-blue-900">{Math.round(winProbability * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Max gagnants:</span>
            <span className="font-medium text-blue-900">{maxWinners}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Durée rotation:</span>
            <span className="font-medium text-blue-900">{spinDuration / 1000}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Auto-spin:</span>
            <span className="font-medium text-blue-900">{autoSpin ? 'Activé' : 'Désactivé'}</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h5 className="text-sm font-medium text-green-900 mb-1">🎯 Conseils de mécanique</h5>
        <ul className="text-xs text-green-800 space-y-1">
          <li>• Une probabilité de 20-40% maintient l'engagement sans frustrer</li>
          <li>• Limitez les gagnants pour créer de la rareté</li>
          <li>• 3-4 secondes de rotation créent du suspense optimal</li>
        </ul>
      </div>
    </div>
  );
};

export default WheelMechanicsConfig;