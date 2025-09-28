import React from 'react';
import ModulesPanel from './ModulesPanel';
import AssetsPanel from '../../DesignEditor/panels/AssetsPanel';
import SectionLayoutsPanel from './SectionLayoutsPanel';
import type { ScreenId, Module, SectionLayout } from '@/types/modularEditor';

export interface CompositeElementsPanelProps {
  currentScreen: ScreenId;
  onAddModule: (screen: ScreenId, module: Module) => void;
  onAddElement: (element: any) => void;
  onAddSection?: (screen: ScreenId, layout: SectionLayout) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}

const CompositeElementsPanel: React.FC<CompositeElementsPanelProps> = ({
  currentScreen,
  onAddModule,
  onAddElement,
  onAddSection,
  selectedElement,
  onElementUpdate,
  selectedDevice
}) => {
  return (
    <div className="h-full overflow-y-auto">
      <ModulesPanel currentScreen={currentScreen} onAdd={onAddModule} />
      <div className="px-4 pt-2">
        <div className="h-px bg-[hsl(var(--sidebar-border))]" />
      </div>
      {/* Section layouts selector */}
      <SectionLayoutsPanel
        onSelectLayout={(layout) => {
          if (onAddSection) {
            onAddSection(currentScreen, layout);
          } else {
            // Fallback: emit a window event so parent can optionally listen
            try {
              const evt = new CustomEvent('quiz:addSection', { detail: { screen: currentScreen, layout } });
              window.dispatchEvent(evt);
            } catch {}
          }
        }}
      />
      <div className="px-4 pt-2 pb-4">
        <div className="h-px bg-[hsl(var(--sidebar-border))]" />
      </div>
      <AssetsPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} selectedDevice={selectedDevice} />
    </div>
  );
};

export default CompositeElementsPanel;
