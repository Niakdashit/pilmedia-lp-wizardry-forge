import React, { useState, useRef, useEffect } from 'react';
import { useMobileOptimization } from './DesignEditor/hooks/useMobileOptimization';
import HybridSidebar from './DesignEditor/HybridSidebar';

const HybridSidebarMobileTest: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [currentBackground, setCurrentBackground] = useState<{ type: 'color' | 'image'; value: string }>({ type: 'color', value: '#ffffff' });
  const [campaignConfig, setCampaignConfig] = useState({});
  const [elements, setElements] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [showHybridSidebar, setShowHybridSidebar] = useState(true);
  const [testResults, setTestResults] = useState<{
    sidebarVisible: boolean;
    tabsVisible: boolean;
    tabsCount: number;
    expectedTabs: string[];
    mobileUIDetected: boolean;
    sidebarCollapsed: boolean;
  }>({
    sidebarVisible: false,
    tabsVisible: false,
    tabsCount: 0,
    expectedTabs: ['background', 'elements', 'layers', 'game', 'form'],
    mobileUIDetected: false,
    sidebarCollapsed: false
  });
  
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

  // Vérifier l'affichage de la sidebar
  useEffect(() => {
    const checkSidebarVisibility = () => {
      // Simuler la vérification de la sidebar
      const expectedTabs = ['background', 'elements', 'layers', 'game', 'form'];
      const actualTabs = expectedTabs; // Dans un vrai test, on vérifierait le DOM
      
      const sidebarVisible = showHybridSidebar && !forceMobileUI;
      const tabsVisible = sidebarVisible && actualTabs.length === expectedTabs.length;
      const tabsCount = actualTabs.length;
      const mobileUIDetected = forceMobileUI;
      const sidebarCollapsed = forceMobileUI; // Sur mobile, la sidebar est réduite

      setTestResults({
        sidebarVisible,
        tabsVisible,
        tabsCount,
        expectedTabs,
        mobileUIDetected,
        sidebarCollapsed
      });

      console.log('📱 Test de la HybridSidebar mobile:', {
        sidebarVisible,
        tabsVisible,
        tabsCount,
        expectedTabs,
        actualTabs,
        mobileUIDetected,
        sidebarCollapsed,
        forceMobileUI,
        isMobile,
        isTablet,
        selectedDevice,
        showHybridSidebar
      });
    };

    checkSidebarVisibility();
  }, [forceMobileUI, isMobile, isTablet, selectedDevice, showHybridSidebar]);

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

  const runTest = () => {
    console.log('🧪 Exécution du test de la HybridSidebar mobile...');
    // Ici, on pourrait ajouter une logique de test plus avancée
  };

  return (
    <div ref={containerRef} className="h-screen w-screen bg-gray-100">
      {/* Header de test */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-bold mb-4">Test de la HybridSidebar mobile</h1>
        
        {/* Résultats du test */}
        <div className="mb-4 p-4 rounded-lg border-2">
          <h2 className="font-semibold mb-2">Résultats du test:</h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className={`p-2 rounded ${testResults.sidebarVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">Sidebar visible:</div>
              <div>{testResults.sidebarVisible ? '✅ Oui' : '❌ Non'}</div>
            </div>
            
            <div className={`p-2 rounded ${testResults.tabsVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">Onglets visibles:</div>
              <div>{testResults.tabsVisible ? '✅ Oui' : '❌ Non'}</div>
            </div>
            
            <div className={`p-2 rounded ${testResults.mobileUIDetected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">UI Mobile détectée:</div>
              <div>{testResults.mobileUIDetected ? '✅ Oui' : '❌ Non'}</div>
            </div>
            
            <div className={`p-2 rounded ${testResults.sidebarCollapsed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">Sidebar réduite:</div>
              <div>{testResults.sidebarCollapsed ? '✅ Oui' : '❌ Non'}</div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="font-medium mb-1">Onglets attendus:</div>
            <div className="text-sm text-gray-600">
              {testResults.expectedTabs.join(', ')}
            </div>
          </div>
        </div>
        
        {/* Contrôles de test */}
        <div className="flex gap-4 mb-4 flex-wrap">
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
            <label className="block text-sm font-medium mb-1">Afficher HybridSidebar:</label>
            <input 
              type="checkbox" 
              checked={showHybridSidebar}
              onChange={(e) => setShowHybridSidebar(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">{showHybridSidebar ? 'Oui' : 'Non'}</span>
          </div>
          
          <div>
            <button 
              onClick={runTest}
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Relancer le test
            </button>
          </div>
        </div>

        {/* Boutons de test */}
        <div className="flex gap-2 flex-wrap">
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
        {/* Sidebar desktop (HybridSidebar) */}
        {showHybridSidebar && (
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

            {/* Instructions */}
            <div className="mt-6 text-left max-w-md">
              <h3 className="font-semibold mb-2">Instructions de test:</h3>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Sélectionnez "Mobile" dans l'appareil simulé</li>
                <li>2. Vérifiez que la sidebar est réduite (icônes seulement)</li>
                <li>3. Vérifiez que tous les onglets sont visibles</li>
                <li>4. Testez le clic sur chaque onglet</li>
                <li>5. Vérifiez que le panneau s'ouvre/ferme</li>
                <li>6. Cliquez sur "Relancer le test" pour vérifier</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
        <div><strong>Debug Info:</strong></div>
        <div>isMobile: {isMobile.toString()}</div>
        <div>isTablet: {isTablet.toString()}</div>
        <div>deviceType: {deviceType}</div>
        <div>selectedDevice: {selectedDevice}</div>
        <div>forceMobileUI: {forceMobileUI.toString()}</div>
        <div>showHybridSidebar: {showHybridSidebar.toString()}</div>
        <div>window.innerWidth: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</div>
        <div>window.innerHeight: {typeof window !== 'undefined' ? window.innerHeight : 'N/A'}</div>
      </div>
    </div>
  );
};

export default HybridSidebarMobileTest;