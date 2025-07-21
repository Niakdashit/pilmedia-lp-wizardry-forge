
import React from 'react';
import { Layout, Smartphone, Tablet, Monitor, Move, RotateCcw, Shuffle } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';
import { applyResponsiveConsistency } from '../utils/responsiveUtils';

interface LayoutResponsiveTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const LayoutResponsiveTab: React.FC<LayoutResponsiveTabProps> = ({
  config,
  onConfigUpdate
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
      const synchronizedTexts = applyResponsiveConsistency(config.customTexts, baseDevice);
      onConfigUpdate({
        customTexts: synchronizedTexts
      });
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

      {/* Cohérence Responsive */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Shuffle className="w-4 h-4" />
          Cohérence entre appareils
        </h4>
        
        <div className="space-y-4">
          <p className="text-xs text-sidebar-text-muted">
            Synchronisez automatiquement les positions et tailles des textes entre tous les appareils
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => synchronizeTextsAcrossDevices('desktop')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Monitor className="w-3 h-3" />
              Sync depuis Desktop
            </button>
            <button
              onClick={() => synchronizeTextsAcrossDevices('tablet')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Tablet className="w-3 h-3" />
              Sync depuis Tablette
            </button>
            <button
              onClick={() => synchronizeTextsAcrossDevices('mobile')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Smartphone className="w-3 h-3" />
              Sync depuis Mobile
            </button>
          </div>
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
