import React, { useCallback } from 'react';
import { Download, Database, Shield } from 'lucide-react';

interface WheelAdvancedConfigProps {
  campaign?: any;
  onCampaignUpdate?: (updates: any) => void;
}

const WheelAdvancedConfig: React.FC<WheelAdvancedConfigProps> = ({
  campaign,
  onCampaignUpdate
}) => {
  const gameConfig = campaign?.gameConfig?.wheel || {};
  const enableSound = gameConfig.enableSound !== false; // Default true
  const showConfetti = gameConfig.showConfetti !== false; // Default true
  const enableStats = gameConfig.enableStats || false;
  const exportFormat = gameConfig.exportFormat || 'json';

  const handleSoundToggle = useCallback(() => {
    onCampaignUpdate?.({
      gameConfig: {
        ...campaign?.gameConfig,
        wheel: {
          ...gameConfig,
          enableSound: !enableSound
        }
      }
    });
  }, [campaign?.gameConfig, gameConfig, enableSound, onCampaignUpdate]);

  const handleConfettiToggle = useCallback(() => {
    onCampaignUpdate?.({
      gameConfig: {
        ...campaign?.gameConfig,
        wheel: {
          ...gameConfig,
          showConfetti: !showConfetti
        }
      }
    });
  }, [campaign?.gameConfig, gameConfig, showConfetti, onCampaignUpdate]);

  const handleStatsToggle = useCallback(() => {
    onCampaignUpdate?.({
      gameConfig: {
        ...campaign?.gameConfig,
        wheel: {
          ...gameConfig,
          enableStats: !enableStats
        }
      }
    });
  }, [campaign?.gameConfig, gameConfig, enableStats, onCampaignUpdate]);

  const handleExportFormatChange = useCallback((format: string) => {
    onCampaignUpdate?.({
      gameConfig: {
        ...campaign?.gameConfig,
        wheel: {
          ...gameConfig,
          exportFormat: format
        }
      }
    });
  }, [campaign?.gameConfig, gameConfig, onCampaignUpdate]);

  const exportConfiguration = () => {
    const config = {
      campaign: campaign?.name || 'wheel-campaign',
      type: 'wheel',
      segments: gameConfig.segments || [],
      design: campaign?.design || {},
      mechanics: {
        winProbability: gameConfig.winProbability || 0.3,
        maxWinners: gameConfig.maxWinners || 100,
        spinDuration: gameConfig.spinDuration || 3000,
        autoSpin: gameConfig.autoSpin || false
      },
      settings: {
        enableSound,
        showConfetti,
        enableStats
      },
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wheel-config-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Options avancées</h3>
        <p className="text-sm text-gray-600">Configuration avancée et paramètres système</p>
      </div>

      {/* Audio & Visual Effects */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Effets audio et visuels
        </h4>
        
        {/* Sound Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">Sons de jeu</label>
            <p className="text-xs text-gray-600">Active les effets sonores durant la rotation</p>
          </div>
          <button
            onClick={handleSoundToggle}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${enableSound ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${enableSound ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Confetti Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">Animation de victoire</label>
            <p className="text-xs text-gray-600">Affiche des confettis en cas de gain</p>
          </div>
          <button
            onClick={handleConfettiToggle}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${showConfetti ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${showConfetti ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Analytiques et données
        </h4>
        
        {/* Stats Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">Statistiques détaillées</label>
            <p className="text-xs text-gray-600">Collecte des données de performance et d'engagement</p>
          </div>
          <button
            onClick={handleStatsToggle}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${enableStats ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${enableStats ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Export & Import */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export et sauvegarde
        </h4>
        
        {/* Export Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Format d'export</label>
          <select
            value={exportFormat}
            onChange={(e) => handleExportFormatChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="json">JSON (Recommandé)</option>
            <option value="csv">CSV (Segments uniquement)</option>
            <option value="xml">XML</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={exportConfiguration}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter la configuration
        </button>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Informations système</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">ID Campagne:</span>
            <span className="font-mono">{campaign?.id || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{campaign?.type || 'wheel'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Segments:</span>
            <span className="font-medium">{gameConfig.segments?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dernière modification:</span>
            <span className="font-medium">{campaign?.updatedAt ? new Date(campaign.updatedAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h5 className="text-sm font-medium text-yellow-900 mb-1">⚠️ Attention</h5>
        <p className="text-xs text-yellow-800">
          Les modifications avancées peuvent affecter les performances du jeu. 
          Testez toujours votre configuration avant la mise en production.
        </p>
      </div>
    </div>
  );
};

export default WheelAdvancedConfig;