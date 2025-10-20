import React from 'react';
import ModulesPanel from './ModulesPanel';
import type { ScreenId, Module } from './ModulesPanel';
import ModulesLayersPanel from './ModulesLayersPanel';
import { Layers } from 'lucide-react';

export interface CompositeElementsPanelProps {
  currentScreen: ScreenId;
  onAddModule: (screen: ScreenId, module: Module) => void;
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  existingModules?: Module[];
  // Props pour le panneau de calques (éléments canvas - non utilisé pour l'instant)
  elements?: any[];
  onElementsChange?: (elements: any[]) => void;
  selectedElements?: any[];
  onSelectedElementsChange?: (elements: any[]) => void;
  onAddToHistory?: (snapshot: any) => void;
  // Props pour le panneau de calques modules
  modules?: Module[];
  selectedModuleId?: string | null;
  onModuleSelect?: (moduleId: string) => void;
  onModuleDelete?: (moduleId: string) => void;
}

const CompositeElementsPanel: React.FC<CompositeElementsPanelProps> = ({
  currentScreen,
  onAddModule,
  onAddElement,
  selectedElement,
  onElementUpdate,
  selectedDevice,
  existingModules,
  elements = [],
  onElementsChange,
  selectedElements = [],
  onSelectedElementsChange,
  onAddToHistory,
  modules = [],
  selectedModuleId,
  onModuleSelect,
  onModuleDelete
}) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Liste des modules */}
      <div className="flex-shrink-0">
        <ModulesPanel currentScreen={currentScreen} onAdd={onAddModule} />
      </div>
      
      {/* Séparateur */}
      <div className="px-4 py-3">
        <div className="h-px bg-[hsl(var(--sidebar-border))]" />
      </div>
      
      {/* Panneau des calques modules */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="px-4 pb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[hsl(var(--sidebar-icon))]" />
          <h3 className="text-sm font-semibold text-[hsl(var(--sidebar-text-primary))]">
            Calques
          </h3>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          <ModulesLayersPanel
            modules={modules}
            selectedModuleId={selectedModuleId}
            onModuleSelect={onModuleSelect}
            onModuleDelete={onModuleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default CompositeElementsPanel;
