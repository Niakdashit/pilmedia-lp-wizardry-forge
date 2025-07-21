
import React from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw, Settings } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface LayoutResponsiveTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
  triggerAutoSync?: (customTexts: any[]) => void;
}

const LayoutResponsiveTab: React.FC<LayoutResponsiveTabProps> = ({
  config,
  onConfigUpdate,
  triggerAutoSync
}) => {
  const handleAutoSyncToggle = (field: 'autoSyncOnDeviceChange' | 'autoSyncRealTime', value: boolean) => {
    onConfigUpdate({ [field]: value });
    if (value && triggerAutoSync && config.customTexts) {
      triggerAutoSync(config.customTexts);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Layout & Responsive</h3>
      
      {/* Auto-Sync Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Synchronisation automatique
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm text-gray-700">Sync au changement d'appareil</label>
              <p className="text-xs text-gray-500">Synchronise automatiquement lors du changement d'appareil</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoSyncOnDeviceChange || false}
                onChange={(e) => handleAutoSyncToggle('autoSyncOnDeviceChange', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm text-gray-700">Sync en temps réel</label>
              <p className="text-xs text-gray-500">Synchronise automatiquement pendant l'édition</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoSyncRealTime || false}
                onChange={(e) => handleAutoSyncToggle('autoSyncRealTime', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Appareil de référence</label>
            <select 
              value={config.autoSyncBaseDevice || 'desktop'} 
              onChange={(e) => onConfigUpdate({ autoSyncBaseDevice: e.target.value as 'desktop' | 'tablet' | 'mobile' })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablette</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Options de layout</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Centrer le texte</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.centerText || false}
                onChange={(e) => onConfigUpdate({ centerText: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Centrer le formulaire</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.centerForm || false}
                onChange={(e) => onConfigUpdate({ centerForm: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Centrer la zone de jeu</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.centerGameZone || false}
                onChange={(e) => onConfigUpdate({ centerGameZone: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Manual Sync */}
      {config.customTexts && config.customTexts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Synchronisation manuelle</h4>
          <button
            onClick={() => triggerAutoSync && triggerAutoSync(config.customTexts || [])}
            className="w-full flex items-center justify-center gap-2 p-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Synchroniser maintenant
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Synchronise tous les éléments selon l'appareil de référence
          </p>
        </div>
      )}

      {/* Device Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Informations responsive</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Monitor className="w-4 h-4" />
            <span>Desktop: 1200x675px</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tablet className="w-4 h-4" />
            <span>Tablette: 768x1024px</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Smartphone className="w-4 h-4" />
            <span>Mobile: 375x812px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutResponsiveTab;
