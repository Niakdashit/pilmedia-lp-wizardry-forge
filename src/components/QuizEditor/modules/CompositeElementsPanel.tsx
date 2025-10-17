import React from 'react';
import { ModulesPanel, AssetsPanel } from '@/components/shared';
import type { ScreenId, Module } from '@/components/shared/modules';

export interface CompositeElementsPanelProps {
  currentScreen: ScreenId;
  onAddModule: (screen: ScreenId, module: Module) => void;
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  existingModules?: Module[];
}

const CompositeElementsPanel: React.FC<CompositeElementsPanelProps> = ({
  currentScreen,
  onAddModule,
  onAddElement,
  selectedElement,
  onElementUpdate,
  selectedDevice,
  existingModules
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
