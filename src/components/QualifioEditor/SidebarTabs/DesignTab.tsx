
import React from 'react';
import type { EditorConfig, DeviceType } from '../QualifioEditorLayout';

interface DesignTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
  currentDevice: DeviceType;
}

const DesignTab: React.FC<DesignTabProps> = ({ config, onConfigUpdate, currentDevice }) => {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Couleurs de marque</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur primaire
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.brandAssets?.primaryColor || '#4ECDC4'}
                onChange={(e) => onConfigUpdate({
                  brandAssets: {
                    ...config.brandAssets,
                    primaryColor: e.target.value
                  }
                })}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={config.brandAssets?.primaryColor || '#4ECDC4'}
                onChange={(e) => onConfigUpdate({
                  brandAssets: {
                    ...config.brandAssets,
                    primaryColor: e.target.value
                  }
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="#4ECDC4"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur secondaire
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.brandAssets?.secondaryColor || '#F7B731'}
                onChange={(e) => onConfigUpdate({
                  brandAssets: {
                    ...config.brandAssets,
                    secondaryColor: e.target.value
                  }
                })}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={config.brandAssets?.secondaryColor || '#F7B731'}
                onChange={(e) => onConfigUpdate({
                  brandAssets: {
                    ...config.brandAssets,
                    secondaryColor: e.target.value
                  }
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="#F7B731"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Style de bordure</h3>
        <select
          value={config.borderStyle || 'classic'}
          onChange={(e) => onConfigUpdate({ borderStyle: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="classic">Classique</option>
          <option value="modern">Moderne</option>
          <option value="elegant">Élégant</option>
        </select>
      </div>
    </div>
  );
};

export default DesignTab;
