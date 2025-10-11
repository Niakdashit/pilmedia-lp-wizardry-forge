import React from 'react';
import { ModulesPanel, AssetsPanel } from '@/components/shared';
import type { ScreenId } from '@/components/shared/modules';
import type { DesignScreenId as OriginalDesignScreenId, DesignModule as OriginalDesignModule } from '@/types/designEditorModular';

export interface DesignCompositeElementsPanelProps {
  currentScreen: OriginalDesignScreenId;
  onAddModule: (screen: OriginalDesignScreenId, module: OriginalDesignModule) => void;
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}

const DesignCompositeElementsPanel: React.FC<DesignCompositeElementsPanelProps> = ({
  currentScreen,
  onAddModule,
  onAddElement,
  selectedElement,
  onElementUpdate,
  selectedDevice
}) => {
  return (
    <div className="h-full overflow-y-auto">
      <ModulesPanel 
        currentScreen={currentScreen as ScreenId} 
        onAdd={(screen, module) => {
          // Cast Module to DesignModule since they have compatible structure
          onAddModule(screen as OriginalDesignScreenId, module as any as OriginalDesignModule);
        }} 
      />
      <div className="px-4 pt-2 pb-4">
        <div className="h-px bg-[hsl(var(--sidebar-border))]" />
      </div>
      <AssetsPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} selectedDevice={selectedDevice} />
    </div>
  );
};

export default DesignCompositeElementsPanel;
