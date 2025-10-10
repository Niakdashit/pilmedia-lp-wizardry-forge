import React, { useState, useRef } from 'react';
import { useMobileOptimization } from './DesignEditor/hooks/useMobileOptimization';
import MobileSidebarDrawer from './DesignEditor/components/MobileSidebarDrawer';
import HybridSidebar from './DesignEditor/HybridSidebar';

const MobileEditorTest: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [currentBackground, setCurrentBackground] = useState<{ type: 'color' | 'image'; value: string }>({ type: 'color', value: '#ffffff' });
  const [campaignConfig, setCampaignConfig] = useState({});
  const [elements, setElements] = useState<any[]>([]);
  const [, setShowMobileUI] = useState(false);
  void setShowMobileUI; // Mark as intentionally unused
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Détection mobile
  const { isMobile, isTablet, deviceType } = useMobileOptimization(containerRef, {
    preventScrollBounce: true,
    stabilizeViewport: true,
    optimizeTouchEvents: true,
    preventZoomGestures: false
  });

  // Forcer l'affichage mobile pour les tests
  const forceMobileUI = selectedDevice === 'mobile' || selectedDevice === 'tablet' || isMobile || isTablet;

  const handleAddElement = (element: any) => {
    console.log('Ajout d\'élément:', element);
    setElements(prev => [...prev, element]);
  };

  const handleBackgroundChange = (background: { type: 'color' | 'image'; value: string }) => {
    setCurrentBackground(background);
  };

  const handleElementUpdate = (updates: any) => {
    console.log('Mise à jour élément:', updates);
  };

  const handleCampaignConfigChange = (config: any) => {
    setCampaignConfig(config);
  };

  const handleElementsChange = (newElements: any[]) => {
    setElements(newElements);
  };

  const handleUndo = () => {
    console.log('Undo');
  };

  const handleRedo = () => {
    console.log('Redo');
  };

  return (
    <div ref={containerRef} className="h-screen w-screen bg-gray-100">
      {/* Header de test */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-bold mb-4">Test des éditeurs mobiles</h1>
        
        {/* Contrôles de test */}
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Appareil simulé:</label>
            <select 
              value={selectedDevice} 
              onChange={(e) => setSelectedDevice(e.target.value as any)}
              className="border rounded px-2 py-1"
            >
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Détection réelle:</label>
            <div className="text-sm">
              <div>Mobile: {isMobile ? '✅' : '❌'}</div>
              <div>Tablet: {isTablet ? '✅' : '❌'}</div>
              <div>Type: {deviceType}</div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">UI Mobile:</label>
            <div className="text-sm">
              <div>Forcée: {forceMobileUI ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>

        {/* Boutons de test */}
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedElement({ type: 'text', id: 'test' })}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Sélectionner élément
          </button>
          <button 
            onClick={() => setSelectedElement(null)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Désélectionner
          </button>
        </div>
      </div>

      {/* Zone de contenu principal */}
      <div className="flex h-full">
        {/* Sidebar desktop (masquée sur mobile) */}
        {!forceMobileUI && (
          <div className="w-80 bg-white border-r">
            <HybridSidebar
              onAddElement={handleAddElement}
              onBackgroundChange={handleBackgroundChange}
              currentBackground={currentBackground}
              campaignConfig={campaignConfig}
              onCampaignConfigChange={handleCampaignConfigChange}
              elements={elements}
              onElementsChange={handleElementsChange}
              selectedElement={selectedElement}
              onElementUpdate={handleElementUpdate}
              selectedDevice={selectedDevice}
            />
          </div>
        )}

        {/* Zone canvas */}
        <div ref={canvasRef} className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Zone de prévisualisation</h2>
            <p className="text-gray-600 mb-4">
              {forceMobileUI ? 'Mode mobile/tablette activé' : 'Mode desktop'}
            </p>
            
            {selectedElement && (
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-blue-800">Élément sélectionné: {selectedElement.type}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar mobile (drawer) */}
      {forceMobileUI && (
        <MobileSidebarDrawer
          onAddElement={handleAddElement}
          onBackgroundChange={handleBackgroundChange}
          currentBackground={currentBackground}
          campaignConfig={campaignConfig}
          onCampaignConfigChange={handleCampaignConfigChange}
          elements={elements}
          onElementsChange={handleElementsChange}
          selectedElement={selectedElement}
          onElementUpdate={handleElementUpdate}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={true}
          canRedo={true}
        />
      )}

      {/* Debug info */}
      <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
        <div><strong>Debug Info:</strong></div>
        <div>isMobile: {isMobile.toString()}</div>
        <div>isTablet: {isTablet.toString()}</div>
        <div>deviceType: {deviceType}</div>
        <div>selectedDevice: {selectedDevice}</div>
        <div>forceMobileUI: {forceMobileUI.toString()}</div>
        <div>window.innerWidth: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</div>
        <div>window.innerHeight: {typeof window !== 'undefined' ? window.innerHeight : 'N/A'}</div>
      </div>
    </div>
  );
};

export default MobileEditorTest;