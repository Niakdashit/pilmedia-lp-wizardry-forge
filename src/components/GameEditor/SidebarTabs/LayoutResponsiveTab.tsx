
import React from 'react';
import { Layout, Smartphone, Tablet, Monitor, Move, RotateCcw, Shuffle, Bug } from 'lucide-react';
import type { EditorConfig } from '../GameEditorLayout';
import { applyResponsiveConsistency, debugResponsiveCalculations } from '../utils/responsiveUtils';

interface LayoutResponsiveTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
  triggerAutoSync?: (customTexts: any[]) => void;
}

const LayoutResponsiveTab: React.FC<LayoutResponsiveTabProps> = ({
  config,
  onConfigUpdate,
  triggerAutoSync: _triggerAutoSync
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

      {/* Automatisation de la synchronisation */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Shuffle className="w-4 h-4" />
          Auto-synchronisation
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sidebar-text-primary text-sm">Auto-sync changement d'appareil</label>
            <input
              type="checkbox"
              checked={config.autoSyncOnDeviceChange || false}
              onChange={e => onConfigUpdate({ autoSyncOnDeviceChange: e.target.checked })}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sidebar-text-primary text-sm">Auto-sync temps réel</label>
            <input
              type="checkbox"
              checked={config.autoSyncRealTime || false}
              onChange={e => onConfigUpdate({ autoSyncRealTime: e.target.checked })}
              className="rounded"
            />
          </div>
          
          <div className="form-group-premium">
            <label>Appareil de référence</label>
            <select
              value={config.autoSyncBaseDevice || 'desktop'}
              onChange={e => onConfigUpdate({ autoSyncBaseDevice: e.target.value as 'desktop' | 'tablet' | 'mobile' })}
            >
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablette</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-xs text-green-800">
              ✅ <strong>Mode automatique :</strong> 
              <br />• Auto-sync changement d'appareil : Synchronise automatiquement quand vous changez d'appareil
              <br />• Auto-sync temps réel : Synchronise pendant que vous éditez (recommandé)
              <br />• L'appareil de référence sert de base pour les calculs
            </p>
          </div>
        </div>
      </div>

      {/* Synchronisation manuelle */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Shuffle className="w-4 h-4" />
          Synchronisation manuelle
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-800">
              🎯 <strong>Guide d'utilisation :</strong> 
              <br />1. Positionnez vos textes sur l'appareil de votre choix
              <br />2. Cliquez sur "Sync depuis [Appareil]" pour adapter automatiquement sur les autres
              <br />3. Les positions relatives et proportions sont conservées
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
              onClick={() => synchronizeTextsAcrossDevices('desktop')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Applique les positions desktop (1200×675) vers tablette et mobile"
            >
              <Monitor className="w-3 h-3" />
              Sync depuis Desktop → Mobile/Tablette
            </button>
            <button
              onClick={() => synchronizeTextsAcrossDevices('tablet')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              title="Applique les positions tablette (768×1024) vers desktop et mobile"
            >
              <Tablet className="w-3 h-3" />
              Sync depuis Tablette → Desktop/Mobile
            </button>
            <button
              onClick={() => synchronizeTextsAcrossDevices('mobile')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              title="Applique les positions mobile (375×812) vers desktop et tablette"
            >
              <Smartphone className="w-3 h-3" />
              Sync depuis Mobile → Desktop/Tablette
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
