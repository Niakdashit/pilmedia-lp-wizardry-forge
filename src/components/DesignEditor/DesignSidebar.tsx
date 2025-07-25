import React, { useState } from 'react';
import { Layers, Upload, Type, Square, Palette, Image, Move3D, Undo, Redo } from 'lucide-react';
import ElementsPanel from './panels/ElementsPanel';
import UploadsPanel from './panels/UploadsPanel';
import BackgroundPanel from './panels/BackgroundPanel';
import LayersPanel from './components/LayersPanel';
import AlignmentTools from './components/AlignmentTools';

interface DesignSidebarProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  background?: {
    type: 'color' | 'image';
    value: string;
  };
  onBackgroundChange: (background: any) => void;
  selectedElements: string[];
  onElementSelect: (id: string, isCtrlPressed?: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canvasSize: { width: number; height: number };
}

const DesignSidebar: React.FC<DesignSidebarProps> = ({
  selectedDevice,
  elements,
  onElementsChange,
  background,
  onBackgroundChange,
  selectedElements,
  onElementSelect,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  canvasSize
}) => {
  const [activeTab, setActiveTab] = useState('elements');

  const tabs = [
    { id: 'elements', label: 'Éléments', icon: Square },
    { id: 'uploads', label: 'Uploads', icon: Upload },
    { id: 'text', label: 'Texte', icon: Type },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'background', label: 'Arrière-plan', icon: Palette },
    { id: 'layers', label: 'Calques', icon: Layers },
    { id: 'alignment', label: 'Alignement', icon: Move3D }
  ];

  return (
    <div className="w-80 bg-background border-r border-border flex flex-col h-full">
      {/* History controls */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex-1 p-2 rounded flex items-center justify-center gap-2 text-xs ${
              canUndo 
                ? 'bg-background hover:bg-muted text-foreground' 
                : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Undo className="w-3 h-3" />
            Annuler
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex-1 p-2 rounded flex items-center justify-center gap-2 text-xs ${
              canRedo 
                ? 'bg-background hover:bg-muted text-foreground' 
                : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Redo className="w-3 h-3" />
            Rétablir
          </button>
        </div>
      </div>

      <div className="border-t">
        {/* Tab buttons */}
        <div className="grid grid-cols-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 flex flex-col items-center gap-1 text-xs border-r last:border-r-0 ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'elements' && (
            <ElementsPanel 
              onAddElement={(element) => onElementsChange([...elements, element])}
            />
          )}
          {activeTab === 'uploads' && <UploadsPanel onElementsChange={onElementsChange} elements={elements} />}
          {activeTab === 'text' && <div className="p-4">Panel Texte</div>}
          {activeTab === 'images' && <div className="p-4">Panel Images</div>}
          {activeTab === 'background' && (
            <BackgroundPanel 
              onBackgroundChange={onBackgroundChange}
            />
          )}
          {activeTab === 'layers' && (
            <LayersPanel
              elements={elements}
              selectedElements={selectedElements}
              onElementsChange={onElementsChange}
              onElementSelect={onElementSelect}
            />
          )}
          {activeTab === 'alignment' && (
            <AlignmentTools
              selectedElements={selectedElements}
              elements={elements}
              onElementsChange={onElementsChange}
              canvasSize={canvasSize}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignSidebar;