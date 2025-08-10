import React, { useState, useRef } from 'react';
import HybridSidebar from './HybridSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';
import ZoomSlider from './components/ZoomSlider';
import MobileStableEditor from './components/MobileStableEditor';

const DesignEditorLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [elements, setElements] = useState<any[]>([]);
  const [background, setBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: '#ffffff'
  });
  const [campaign, setCampaign] = useState<any>({ design: {} });
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleAddElement = (el: any) => {
    setElements(prev => [...prev, el]);
    setSelectedElement(el);
  };

  const handleElementUpdate = (updates: any) => {
    setElements(prev => prev.map(el => (el.id === selectedElement?.id ? { ...el, ...updates } : el)));
    if (selectedElement) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  return (
    <MobileStableEditor className="h-[100dvh] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-72 bg-white shadow-lg transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <HybridSidebar
            onAddElement={handleAddElement}
            onBackgroundChange={setBackground}
            onExtractedColorsChange={setExtractedColors}
            campaignConfig={campaign}
            onCampaignConfigChange={setCampaign}
            elements={elements}
            onElementsChange={setElements}
            selectedElement={selectedElement}
            onElementUpdate={handleElementUpdate}
            selectedElements={selectedElements}
            onSelectedElementsChange={setSelectedElements}
            canvasRef={canvasRef}
          />
        </aside>

        {/* Main area */}
        <div className="flex flex-1 flex-col">
          <div className="relative">
            <DesignToolbar />
            <button
              className="md:hidden absolute left-4 top-2 z-30 p-2 bg-white rounded-md shadow"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
              <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
              <span className="block w-5 h-0.5 bg-gray-700" />
            </button>
          </div>

          <div className="flex-1 relative overflow-auto bg-gray-100 flex items-center justify-center">
            <DesignCanvas
              ref={canvasRef}
              selectedDevice="desktop"
              elements={elements}
              onElementsChange={setElements}
              background={background}
              campaign={campaign}
              onCampaignChange={setCampaign}
              zoom={zoom}
              onZoomChange={setZoom}
              selectedElement={selectedElement}
              onSelectedElementChange={setSelectedElement}
              selectedElements={selectedElements}
              onSelectedElementsChange={setSelectedElements}
              onElementUpdate={handleElementUpdate}
              onAddElement={handleAddElement}
              onBackgroundChange={setBackground}
              onExtractedColorsChange={setExtractedColors}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <ZoomSlider zoom={zoom} onZoomChange={setZoom} minZoom={0.1} maxZoom={2} step={0.05} />
            </div>
          </div>
        </div>
      </div>
    </MobileStableEditor>
  );
};

export default DesignEditorLayout;

