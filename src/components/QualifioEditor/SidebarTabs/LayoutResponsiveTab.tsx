
import React from 'react';
import { Layout, Smartphone, Tablet, Monitor, Move, RotateCcw, Bug, Zap, Settings } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';
import { applyResponsiveConsistency, debugResponsiveCalculations } from '../utils/responsiveUtils';

interface LayoutResponsiveTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
  autoSyncSettings?: {
    isAutoSyncEnabled: boolean;
    setIsAutoSyncEnabled: (enabled: boolean) => void;
    isRealTimeSyncEnabled: boolean;
    setIsRealTimeSyncEnabled: (enabled: boolean) => void;
    onManualSync: (baseDevice?: 'desktop' | 'tablet' | 'mobile') => void;
  };
}

const LayoutResponsiveTab: React.FC<LayoutResponsiveTabProps> = ({
  config,
  onConfigUpdate,
  autoSyncSettings
}) => {
  const devices = [
    { key: 'mobile', label: 'Mobile', icon: Smartphone },
    { key: 'tablet', label: 'Tablette', icon: Tablet },
    { key: 'desktop', label: 'Desktop', icon: Monitor }
  ] as const;

  const updateDeviceConfig = (device: 'mobile' | 'tablet' | 'desktop', updates: any) => {
    const defaultDeviceConfig = {
      fontSize: 16,
      gamePosition: { x: 0, y: 0, scale: 1.0 }
    };

    onConfigUpdate({
      deviceConfig: {
        mobile: config.deviceConfig?.mobile || defaultDeviceConfig,
        tablet: config.deviceConfig?.tablet || defaultDeviceConfig,
        desktop: config.deviceConfig?.desktop || defaultDeviceConfig,
        [device]: {
          ...(config.deviceConfig?.[device] || defaultDeviceConfig),
          ...updates
        }
      }
    });
  };

  const synchronizeTextsAcrossDevices = (baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
    if (config.customTexts && config.customTexts.length > 0) {
      console.log(`🔄 Synchronisation depuis ${baseDevice} vers les autres appareils`);
      
      // Debug des calculs avant synchronisation
      config.customTexts.forEach(text => {
        debugResponsiveCalculations(text, baseDevice);
      });
      
      const synchronizedTexts = applyResponsiveConsistency(config.customTexts, baseDevice);
      onConfigUpdate({
        customTexts: synchronizedTexts
      });
      
      console.log('✅ Synchronisation terminée');
    }
  };

  return (
    <div className="space-y-6 my-[30px]">
      <h3 className="section-title text-center">Layout & Responsive</h3>
      
      {/* Auto-Sync Controls - NEW SECTION */}
      {autoSyncSettings && (
        <div className="premium-card mx-[30px]">
          <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Synchronisation automatique
          </h4>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-800 mb-2">
                <strong>🤖 Modes automatiques :</strong>
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• <strong>Changement d'appareil :</strong> Sync auto quand vous changez d'appareil</li>
                <li>• <strong>Temps réel :</strong> Sync auto à chaque modification sur desktop</li>
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sidebar-text-primary text-sm font-medium">
                  Sync au changement d'appareil
                </label>
                <p className="text-xs text-sidebar-text-muted">
                  Synchronise depuis desktop quand vous changez d'appareil
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoSyncSettings.isAutoSyncEnabled}
                onChange={(e) => autoSyncSettings.setIsAutoSyncEnabled(e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sidebar-text-primary text-sm font-medium">
                  Sync temps réel
                </label>
                <p className="text-xs text-sidebar-text-muted">
                  Synchronise à chaque modification (peut ralentir)
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoSyncSettings.isRealTimeSyncEnabled}
                onChange={(e) => autoSyncSettings.setIsRealTimeSyncEnabled(e.target.checked)}
                className="rounded"
              />
            </div>

            {(autoSyncSettings.isAutoSyncEnabled || autoSyncSettings.isRealTimeSyncEnabled) && (
              <div className="p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Mode automatique activé - Les textes se synchronisent automatiquement !
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Layout Settings */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Configuration générale
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Largeur du conteneur</label>
            <input
              type="number"
              value={config.width}
              onChange={e => onConfigUpdate({ width: parseInt(e.target.value) })}
              min="300"
              max="1200"
              step="10"
            />
          </div>

          <div className="form-group-premium">
            <label>Hauteur du conteneur</label>
            <input
              type="number"
              value={config.height}
              onChange={e => onConfigUpdate({ height: parseInt(e.target.value) })}
              min="400"
              max="2000"
              step="10"
            />
          </div>

          <div className="form-group-premium">
            <label>Ancrage</label>
            <select
              value={config.anchor}
              onChange={e => onConfigUpdate({ anchor: e.target.value as 'fixed' | 'center' })}
            >
              <option value="fixed">Position fixe</option>
              <option value="center">Centré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alignment Options */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Move className="w-4 h-4" />
          Alignement des éléments
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sidebar-text-primary text-sm">Centrer le texte</label>
            <input
              type="checkbox"
              checked={config.centerText || false}
              onChange={e => onConfigUpdate({ centerText: e.target.checked })}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sidebar-text-primary text-sm">Centrer le formulaire</label>
            <input
              type="checkbox"
              checked={config.centerForm || false}
              onChange={e => onConfigUpdate({ centerForm: e.target.checked })}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sidebar-text-primary text-sm">Centrer la zone de jeu</label>
            <input
              type="checkbox"
              checked={config.centerGameZone || false}
              onChange={e => onConfigUpdate({ centerGameZone: e.target.checked })}
              className="rounded"
            />
          </div>
        </div>
      </div>

      {/* Manual Synchronization */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Synchronisation manuelle
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-xs text-amber-800">
              🎯 <strong>Utilisation :</strong> 
              <br />1. Positionnez vos textes sur l'appareil de votre choix
              <br />2. Cliquez sur "Sync depuis [Appareil]" pour synchroniser
            </p>
          </div>
          
          <div className="text-xs text-sidebar-text-muted space-y-1">
            <p>📏 <strong>Dimensions des conteneurs :</strong></p>
            <p>• Desktop: 1200 × 675px (16:9)</p>
            <p>• Tablette: 768 × 1024px (portrait)</p>
            <p>• Mobile: 375 × 812px (portrait)</p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => {
                if (autoSyncSettings) {
                  autoSyncSettings.onManualSync('desktop');
                } else {
                  synchronizeTextsAcrossDevices('desktop');
                }
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Applique les positions desktop vers tablette et mobile"
            >
              <Monitor className="w-3 h-3" />
              Sync depuis Desktop
            </button>
            <button
              onClick={() => {
                if (autoSyncSettings) {
                  autoSyncSettings.onManualSync('tablet');
                } else {
                  synchronizeTextsAcrossDevices('tablet');
                }
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              title="Applique les positions tablette vers desktop et mobile"
            >
              <Tablet className="w-3 h-3" />
              Sync depuis Tablette
            </button>
            <button
              onClick={() => {
                if (autoSyncSettings) {
                  autoSyncSettings.onManualSync('mobile');
                } else {
                  synchronizeTextsAcrossDevices('mobile');
                }
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              title="Applique les positions mobile vers desktop et tablette"
            >
              <Smartphone className="w-3 h-3" />
              Sync depuis Mobile
            </button>
          </div>
          
          {/* Debug section pour le développement */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                config.customTexts?.forEach(text => {
                  debugResponsiveCalculations(text, 'desktop');
                });
              }}
              className="flex items-center justify-center gap-2 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <Bug className="w-3 h-3" />
              Debug positions (Console)
            </button>
          )}
        </div>
      </div>

      {/* Device-Specific Settings */}
      {devices.map(device => {
        const Icon = device.icon;
        const deviceConfig = config.deviceConfig?.[device.key];
        
        return (
          <div key={device.key} className="premium-card mx-[30px]">
            <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {device.label}
            </h4>
            
            <div className="space-y-4">
              <div className="form-group-premium">
                <label>Taille de police</label>
                <input
                  type="number"
                  value={deviceConfig?.fontSize || 16}
                  onChange={e => updateDeviceConfig(device.key, { fontSize: parseInt(e.target.value) })}
                  min="10"
                  max="24"
                  step="1"
                />
              </div>

              {deviceConfig?.gamePosition && (
                <>
                  <div className="form-group-premium">
                    <label>Position horizontale (%)</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={deviceConfig.gamePosition.x}
                      onChange={e => updateDeviceConfig(device.key, {
                        gamePosition: {
                          ...deviceConfig.gamePosition,
                          x: parseInt(e.target.value)
                        }
                      })}
                      className="w-full"
                    />
                    <div className="text-xs text-sidebar-text-muted text-center mt-1">
                      {deviceConfig.gamePosition.x}%
                    </div>
                  </div>

                  <div className="form-group-premium">
                    <label>Position verticale (%)</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={deviceConfig.gamePosition.y}
                      onChange={e => updateDeviceConfig(device.key, {
                        gamePosition: {
                          ...deviceConfig.gamePosition,
                          y: parseInt(e.target.value)
                        }
                      })}
                      className="w-full"
                    />
                    <div className="text-xs text-sidebar-text-muted text-center mt-1">
                      {deviceConfig.gamePosition.y}%
                    </div>
                  </div>

                  <div className="form-group-premium">
                    <label>Échelle</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={deviceConfig.gamePosition.scale}
                      onChange={e => updateDeviceConfig(device.key, {
                        gamePosition: {
                          ...deviceConfig.gamePosition,
                          scale: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full"
                    />
                    <div className="text-xs text-sidebar-text-muted text-center mt-1">
                      {deviceConfig.gamePosition.scale}x
                    </div>
                  </div>

                  <button
                    onClick={() => updateDeviceConfig(device.key, {
                      gamePosition: { x: 0, y: 0, scale: 1.0 }
                    })}
                    className="flex items-center gap-2 text-sm text-sidebar-text-muted hover:text-sidebar-text-primary transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser la position
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LayoutResponsiveTab;
