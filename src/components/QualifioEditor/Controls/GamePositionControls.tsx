import React from 'react';
import { Move, RotateCcw } from 'lucide-react';
import type { DeviceType, EditorConfig } from '../QualifioEditorLayout';

interface GamePositionControlsProps {
  config: EditorConfig;
  selectedDevice: DeviceType;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const GamePositionControls: React.FC<GamePositionControlsProps> = ({
  config,
  selectedDevice,
  onConfigUpdate
}) => {
  const currentGamePosition = config.deviceConfig?.[selectedDevice]?.gamePosition || { x: 0, y: 0, scale: 1.0 };

  const updateGamePosition = (updates: Partial<{ x: number; y: number; scale: number }>) => {
    const defaultDeviceConfig = {
      fontSize: 16,
      gamePosition: { x: 0, y: 0, scale: 1.0 }
    };

    const newDeviceConfig = {
      mobile: config.deviceConfig?.mobile || defaultDeviceConfig,
      tablet: config.deviceConfig?.tablet || defaultDeviceConfig,
      desktop: config.deviceConfig?.desktop || defaultDeviceConfig,
      [selectedDevice]: {
        ...config.deviceConfig?.[selectedDevice],
        gamePosition: {
          ...currentGamePosition,
          ...updates
        }
      }
    };

    onConfigUpdate({
      deviceConfig: newDeviceConfig
    });
  };

  const resetPosition = () => {
    updateGamePosition({ x: 0, y: 0, scale: 1.0 });
  };

  const getDeviceDisplayName = (device: DeviceType) => {
    switch (device) {
      case 'desktop': return 'Desktop';
      case 'tablet': return 'Tablette';
      case 'mobile': return 'Mobile';
      default: return device;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-medium text-gray-900">
            Position & Échelle ({getDeviceDisplayName(selectedDevice)})
          </h3>
        </div>
        <button
          onClick={resetPosition}
          className="p-1 text-gray-400 hover:text-brand-primary transition-colors"
          title="Réinitialiser"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Position horizontale (X) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Position horizontale (X): {currentGamePosition.x}%
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={currentGamePosition.x}
            onChange={(e) => updateGamePosition({ x: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Gauche</span>
            <span>Centre</span>
            <span>Droite</span>
          </div>
        </div>

        {/* Position verticale (Y) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Position verticale (Y): {currentGamePosition.y}%
          </label>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={currentGamePosition.y}
            onChange={(e) => updateGamePosition({ y: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Haut</span>
            <span>Centre</span>
            <span>Bas</span>
          </div>
        </div>

        {/* Échelle */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Échelle: {Math.round(currentGamePosition.scale * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={currentGamePosition.scale}
            onChange={(e) => updateGamePosition({ scale: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50%</span>
            <span>100%</span>
            <span>200%</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <strong>Info:</strong> Ces réglages s'appliquent uniquement au mode {getDeviceDisplayName(selectedDevice).toLowerCase()}.
        Changez de device pour ajuster les autres formats.
      </div>

    </div>
  );
};

export default GamePositionControls;