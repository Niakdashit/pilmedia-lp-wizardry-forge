import React, { useState, useRef } from 'react';
import HybridSidebar from './HybridSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';
import ZoomSlider from './components/ZoomSlider';
import MobileStableEditor from './components/MobileStableEditor';
import MobileResponsiveLayout from './components/MobileResponsiveLayout';

const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
};

const DesignEditorLayout: React.FC = () => {
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

  const actualDevice = detectDevice();
  const isMobile = actualDevice === 'mobile' || actualDevice === 'tablet';

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

  const canvasContent = (
    <div className="flex-1 relative overflow-auto bg-gray-100 flex items-center justify-center">
      <DesignCanvas
        ref={canvasRef}
        selectedDevice={actualDevice}
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
  );

  return (
    <MobileStableEditor className="h-[100dvh] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <aside className="w-72 bg-white shadow-lg">
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
        )}

        <div className="flex flex-1 flex-col">
          {!isMobile && <DesignToolbar />}

          {isMobile ? (
            <MobileResponsiveLayout
              selectedElement={selectedElement}
              onElementUpdate={handleElementUpdate}
              canvasRef={canvasRef}
              zoom={zoom}
              onZoomChange={setZoom}
              onAddElement={handleAddElement}
              onBackgroundChange={setBackground}
              onExtractedColorsChange={setExtractedColors}
              campaignConfig={campaign}
              onCampaignConfigChange={setCampaign}
              elements={elements}
              onElementsChange={setElements}
              className="flex-1"
            >
              {canvasContent}
            </MobileResponsiveLayout>
          ) : (
            canvasContent
          )}
        </div>
      </div>
    </MobileStableEditor>
  );
};

export default DesignEditorLayout;

