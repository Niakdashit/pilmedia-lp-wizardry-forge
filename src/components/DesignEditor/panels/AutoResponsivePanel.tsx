import React from 'react';
import { Zap, Settings, Eye } from 'lucide-react';
import AutoResponsiveIndicator from '../components/AutoResponsiveIndicator';

interface AutoResponsivePanelProps {
  elements: any[];
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  adaptationSuggestions: Array<{
    elementId: string;
    device: 'desktop' | 'tablet' | 'mobile';
    issue: string;
    suggestion: string;
  }>;
}

const AutoResponsivePanel: React.FC<AutoResponsivePanelProps> = ({
  elements,
  selectedDevice,
  onDeviceChange,
  adaptationSuggestions
}) => {
  return (
    <div className="p-4 space-y-6">
      {/* En-tête Auto-Responsive */}
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Auto-Responsive</h2>
        <p className="text-sm text-gray-600">
          Concevez sur Desktop, nous adaptons automatiquement pour tous les appareils
        </p>
      </div>

      {/* Indicateur de statut */}
      <AutoResponsiveIndicator
        selectedDevice={selectedDevice}
        adaptationSuggestions={adaptationSuggestions}
      />

      {/* Actions rapides */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Aperçu rapide
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          {(['desktop', 'tablet', 'mobile'] as const).map(device => (
            <button
              key={device}
              onClick={() => onDeviceChange(device)}
              className={`p-3 rounded-lg border transition-all ${
                selectedDevice === device
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="text-xs font-medium">
                {device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablette' : 'Mobile'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conseils et informations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Comment ça marche ?
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Créez votre design sur Desktop (écran principal)</li>
          <li>• Les textes, images et positions s'adaptent automatiquement</li>
          <li>• Les tailles de police sont optimisées pour chaque appareil</li>
          <li>• La mise en page reste cohérente et lisible partout</li>
        </ul>
      </div>

      {/* Statistiques */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Statistiques</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-gray-800">{elements.length}</div>
            <div className="text-xs text-gray-500">Éléments</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">
              {3 - adaptationSuggestions.filter(s => s.device !== selectedDevice).length}
            </div>
            <div className="text-xs text-gray-500">Appareils OK</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoResponsivePanel;