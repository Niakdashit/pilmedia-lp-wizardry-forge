import React from 'react';
import ModulesPanel from './ModulesPanel';
import AssetsPanel from '../../DesignEditor/panels/AssetsPanel';
import type { ScreenId, Module } from '@/types/modularEditor';

export interface CompositeElementsPanelProps {
  currentScreen: ScreenId;
  onAddModule: (screen: ScreenId, module: Module) => void;
  onAddElement: (element: any) => void;
  existingModules?: Module[];
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}

const CompositeElementsPanel: React.FC<CompositeElementsPanelProps> = ({
  currentScreen,
  onAddModule,
  onAddElement,
  existingModules,
  selectedElement,
  onElementUpdate,
  selectedDevice
}) => {
  return (
    <div className="h-full overflow-y-auto">
      <ModulesPanel currentScreen={currentScreen} onAdd={onAddModule} existingModules={existingModules} />
      <div className="px-4 pt-2 pb-4">
        <div className="h-px bg-[hsl(var(--sidebar-border))]" />
      </div>
      <AssetsPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} selectedDevice={selectedDevice} />
    </div>
  );
};

export default CompositeElementsPanel;
