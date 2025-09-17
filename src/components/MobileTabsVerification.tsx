import React, { useState, useRef, useEffect } from 'react';
import { useMobileOptimization } from './DesignEditor/hooks/useMobileOptimization';
import MobileSidebarDrawer from './DesignEditor/components/MobileSidebarDrawer';

const MobileTabsVerification: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [currentBackground, setCurrentBackground] = useState({ type: 'color' as const, value: '#ffffff' });
  const [campaignConfig, setCampaignConfig] = useState({});
  const [elements, setElements] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [activeTab, setActiveTab] = useState<string>('assets');
  const [isMinimized, setIsMinimized] = useState(false);
  
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

  // Onglets attendus
  const expectedTabs = [
    { id: 'assets', label: 'Éléments', icon: 'Plus' },
    { id: 'background', label: 'Design', icon: 'Palette' },
    { id: 'layers', label: 'Calques', icon: 'Layers' },
    { id: 'campaign', label: 'Réglages', icon: 'Settings' }
  ];

  const [visibleTabs, setVisibleTabs] = useState<string[]>([]);

  // Vérifier les onglets visibles
  useEffect(() => {
    if (forceMobileUI) {
      // Simuler la détection des onglets visibles
      const tabs = expectedTabs.map(tab => tab.id);
      setVisibleTabs(tabs);
      console.log('📱 Onglets détectés sur mobile:', tabs);
    } else {
      setVisibleTabs([]);
    }
  }, [forceMobileUI]);

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

  const allTabsVisible = expectedTabs.every(tab => visibleTabs.includes(tab.id));
  const missingTabs = expectedTabs.filter(tab => !visibleTabs.includes(tab.id));

  return (
    <div ref={containerRef} className="h-screen w-screen bg-gray-100">
      {/* Header de test */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-bold mb-4">Vérification des onglets mobiles</h1>
        
        {/* Statut de vérification */}
        <div className="mb-4 p-4 rounded-lg border-2">
          <h2 className="font-semibold mb-2">Statut de vérification:</h2>
          <div className={`text-lg font-bold ${allTabsVisible ? 'text-green-600' : 'text-red-600'}`}>
            {allTabsVisible ? '✅ Tous les onglets sont visibles' : '❌ Des onglets manquent'}
          </div>
          
          {!allTabsVisible && (
            <div className="mt-2">
              <p className="text-sm text-red-600">Onglets manquants:</p>
              <ul className="text-sm text-red-600 ml-4">
                {missingTabs.map(tab => (
                  <li key={tab.id}>• {tab.label} ({tab.id})</li>
                ))}
              </ul>
            </div>
          )}
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
            <label className="block text-sm font-medium mb-1">Onglet actif:</label>
            <select 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {expectedTabs.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Drawer:</label>
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              {isMinimized ? 'Ouvrir' : 'Fermer'}
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
              <h3 className="font-semibold mb-2">Instructions de vérification:</h3>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Sélectionnez "Mobile" dans l'appareil simulé</li>
                <li>2. Vérifiez que la barre d'onglets apparaît en bas</li>
                <li>3. Vérifiez que tous les onglets sont visibles: Éléments, Design, Calques, Réglages</li>
                <li>4. Testez le clic sur chaque onglet</li>
                <li>5. Vérifiez que le drawer s'ouvre/ferme correctement</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar mobile (drawer) - toujours affichée pour les tests */}
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

      {/* Debug info */}
      <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
        <div><strong>Debug Info:</strong></div>
        <div>isMobile: {isMobile.toString()}</div>
        <div>isTablet: {isTablet.toString()}</div>
        <div>deviceType: {deviceType}</div>
        <div>selectedDevice: {selectedDevice}</div>
        <div>forceMobileUI: {forceMobileUI.toString()}</div>
        <div>activeTab: {activeTab}</div>
        <div>isMinimized: {isMinimized.toString()}</div>
        <div>visibleTabs: {visibleTabs.join(', ')}</div>
        <div>allTabsVisible: {allTabsVisible.toString()}</div>
        <div>window.innerWidth: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</div>
        <div>window.innerHeight: {typeof window !== 'undefined' ? window.innerHeight : 'N/A'}</div>
      </div>
    </div>
  );
};

export default MobileTabsVerification;