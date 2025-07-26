import React from 'react';
import { Settings, Zap, AlertTriangle } from 'lucide-react';

interface ResponsiveModeToggleProps {
  isExpertMode: boolean;
  isAutoMode: boolean;
  onToggleExpert: () => void;
  onToggleAuto: (enabled: boolean) => void;
  issuesCount?: number;
}

const ResponsiveModeToggle: React.FC<ResponsiveModeToggleProps> = ({
  isExpertMode,
  isAutoMode,
  onToggleExpert,
  onToggleAuto,
  issuesCount = 0
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Mode Responsive</h3>
        {issuesCount > 0 && (
          <div className="flex items-center text-amber-600 text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {issuesCount} problème{issuesCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Auto-Responsive Toggle */}
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-3">
          <Zap className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-medium text-green-900">Auto-Responsive</div>
            <div className="text-sm text-green-700">Adaptation automatique pour tous les appareils</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isAutoMode}
            onChange={(e) => onToggleAuto(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
      </div>

      {/* Expert Mode Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-gray-600" />
          <div>
            <div className="font-medium text-gray-900">Mode Expert</div>
            <div className="text-sm text-gray-600">Contrôle granulaire par appareil</div>
          </div>
        </div>
        <button
          onClick={onToggleExpert}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            isExpertMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isExpertMode ? 'Activé' : 'Activer'}
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        💡 <strong>Recommandé :</strong> Commencez avec l'Auto-Responsive pour un gain de temps optimal. 
        Activez le Mode Expert seulement si vous avez besoin de personnaliser chaque appareil.
      </div>
    </div>
  );
};

export default ResponsiveModeToggle;