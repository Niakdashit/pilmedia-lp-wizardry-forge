import React from 'react';
import type { Module, ScreenId } from '@/types/modularEditor';
import type { DeviceType } from '@/utils/deviceDimensions';

export interface ModularCanvasProps {
  screen: ScreenId;
  modules: Module[];
  onUpdate: (id: string, patch: Partial<Module>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onDuplicate?: (id: string) => void;
  onSelect?: (module: Module) => void;
  selectedModuleId?: string;
  device?: DeviceType;
  readOnly?: boolean;
}

const ModularCanvas: React.FC<ModularCanvasProps> = ({
  screen,
  modules,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
  onSelect,
  selectedModuleId,
  device = 'desktop',
  readOnly = false
}) => {
  return (
    <div className="w-full h-full p-4 bg-white">
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg font-medium">ModularCanvas - PollEditor</p>
        <p className="text-sm mt-2">Screen: {screen}</p>
        <p className="text-sm">Modules: {modules.length}</p>
        <p className="text-xs mt-4 text-gray-400">
          Ce composant sera implémenté avec les modules spécifiques au PollEditor
        </p>
      </div>
    </div>
  );
};

export default ModularCanvas;
