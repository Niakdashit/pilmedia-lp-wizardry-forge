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
  elements,
  onElementsChange,
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
    <div className="w-80 bg-white border-r border-gray-200 flex">
      {/* Tab Navigation */}
      <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title={tab.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* History controls */}
        <div className="p-3 border-b bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex-1 p-2 rounded flex items-center justify-center gap-2 text-xs ${
                canUndo 
                  ? 'bg-white hover:bg-gray-100 text-gray-700 border' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
                  ? 'bg-white hover:bg-gray-100 text-gray-700 border' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Redo className="w-3 h-3" />
              Rétablir
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
        </div>
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