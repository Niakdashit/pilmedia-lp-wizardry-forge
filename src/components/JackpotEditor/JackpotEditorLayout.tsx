import React, { useState, useMemo, useEffect, useRef, useCallback, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Save, X } from 'lucide-react';
const HybridSidebar = lazy(() => import('../ModelEditor/HybridSidebar'));
const DesignToolbar = lazy(() => import('../ModelEditor/DesignToolbar'));
const FunnelUnlockedGame = lazy(() => import('../funnels/FunnelUnlockedGame'));
import GradientBand from '../shared/GradientBand';

import ZoomSlider from '../ModelEditor/components/ZoomSlider';
const JackpotDesignCanvas = lazy(() => import('./JackpotDesignCanvas'));
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
import { useGroupManager } from '../../hooks/useGroupManager';
import { getDeviceDimensions } from '../../utils/deviceDimensions';

import { useCampaigns } from '@/hooks/useCampaigns';
import { createSaveAndContinueHandler, saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';

const KeyboardShortcutsHelp = lazy(() => import('../shared/KeyboardShortcutsHelp'));
const MobileStableEditor = lazy(() => import('../ModelEditor/components/MobileStableEditor'));

interface JackpotEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}

const JackpotEditorLayout: React.FC<JackpotEditorLayoutProps> = ({ mode = 'campaign', hiddenTabs }) => {
  const navigate = useNavigate();
  
  const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  };

  const [actualDevice, setActualDevice] = useState<'desktop' | 'tablet' | 'mobile'>(detectDevice());

  const getDefaultZoom = (device: 'desktop' | 'tablet' | 'mobile'): number => {
    try {
      const saved = localStorage.getItem(`editor-zoom-${device}`);
      if (saved) {
        const v = parseFloat(saved);
        if (!Number.isNaN(v) && v >= 0.1 && v <= 1) return v;
      }
    } catch {}
    if (device === 'mobile' && typeof window !== 'undefined') {
      const { width, height } = getDeviceDimensions('mobile');
      const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
      return Math.min(scale, 1);
    }
    switch (device) {
      case 'desktop':
        return 0.7;
      case 'tablet':
        return 0.55;
      case 'mobile':
        return 0.45;
      default:
        return 0.7;
    }
  };

  const { 
    setCampaign,
    setPreviewDevice,
    setIsLoading,
    setIsModified
  } = useEditorStore();
  
  const campaignState = useEditorStore((s) => s.campaign);
  const { saveCampaign } = useCampaigns();

  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(actualDevice);

  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setSelectedDevice(device);
    setCanvasZoom(getDefaultZoom(device));
  };

  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>(() => (
    mode === 'template'
      ? { type: 'color', value: '#4ECDC4' }
      : { type: 'color', value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' }
  ));
  const [canvasZoom, setCanvasZoom] = useState(getDefaultZoom(selectedDevice));

  // Configuration du Jackpot
  const [jackpotConfig, setJackpotConfig] = useState({
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#1f2937',
    slotBackgroundColor: '#ffffff',
    symbols: ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '🍀'],
    winProbability: 0.15,
    rollDuration: 2000,
    borderRadius: 16,
    slotSize: 80,
    containerPadding: 20
  });

  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [campaignConfig, setCampaignConfig] = useState<any>({
    id: 'jackpot-campaign',
    name: 'Campagne Jackpot',
    type: 'jackpot',
    design: {
      jackpotConfig: jackpotConfig
    }
  });

  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [showFunnel, setShowFunnel] = useState(false);
  const [showEffectsInSidebar, setShowEffectsInSidebar] = useState(false);
  const [showAnimationsInSidebar, setShowAnimationsInSidebar] = useState(false);
  const [showPositionInSidebar, setShowPositionInSidebar] = useState(false);
  const [showDesignInSidebar, setShowDesignInSidebar] = useState(false);
  const [designColorContext, setDesignColorContext] = useState<'fill' | 'border' | 'text'>('fill');
  const [showQuizPanel, setShowQuizPanel] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<any>(null);

  const { undo, redo, canUndo, canRedo, saveState } = useUndoRedo({
    initialState: { elements: canvasElements, background: canvasBackground },
    maxHistorySize: 50
  });

  const { selectedGroupId, setSelectedGroupId } = useGroupManager({
    elements: canvasElements,
    onElementsChange: setCanvasElements
  });

  useUndoRedoShortcuts({ undo, redo, canUndo, canRedo });

  const effectiveHiddenTabs = useMemo(() => {
    const base = hiddenTabs || [];
    if (mode === 'template') {
      return [...base, 'game'];
    }
    return base;
  }, [hiddenTabs, mode]);

  const handleCampaignConfigChange = useCallback((newConfig: any) => {
    setCampaignConfig(newConfig);
    if (newConfig?.design?.jackpotConfig) {
      setJackpotConfig(newConfig.design.jackpotConfig);
    }
    setIsModified(true);
  }, [setIsModified]);

  const handleElementUpdate = useCallback((updates: any) => {
    if (selectedElement) {
      const updatedElements = canvasElements.map(el => 
        el.id === selectedElement.id ? { ...el, ...updates } : el
      );
      setCanvasElements(updatedElements);
      setSelectedElement({ ...selectedElement, ...updates });
      saveState({ elements: updatedElements, background: canvasBackground });
    }
  }, [selectedElement, canvasElements, canvasBackground, saveState]);

  const handleAddElement = useCallback((element: any) => {
    const newElement = {
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    const updatedElements = [...canvasElements, newElement];
    setCanvasElements(updatedElements);
    saveState({ elements: updatedElements, background: canvasBackground });
  }, [canvasElements, canvasBackground, saveState]);

  const handleBackgroundChange = useCallback((background: { type: 'color' | 'image'; value: string }) => {
    setCanvasBackground(background);
    saveState({ elements: canvasElements, background });
  }, [canvasElements, saveState]);

  const handleExtractedColorsChange = useCallback((colors: string[]) => {
    setExtractedColors(colors);
  }, []);

  const handleJackpotConfigChange = useCallback((config: any) => {
    setJackpotConfig(config);
    setCampaignConfig(prev => ({
      ...prev,
      design: {
        ...prev.design,
        jackpotConfig: config
      }
    }));
    setIsModified(true);
  }, [setIsModified]);

  const handleSaveAndContinue = createSaveAndContinueHandler({
    campaignState,
    saveCampaign,
    setIsLoading,
    setIsModified,
    navigate
  });

  useKeyboardShortcuts({
    onSave: handleSaveAndContinue,
    onUndo: undo,
    onRedo: redo,
    canUndo,
    canRedo
  });

  useEffect(() => {
    try {
      localStorage.setItem(`editor-zoom-${selectedDevice}`, canvasZoom.toString());
    } catch {}
  }, [canvasZoom, selectedDevice]);

  return (
    <MobileStableEditor>
      <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
        {/* Header avec GradientBand */}
        <div className="relative z-20 bg-white/95 backdrop-blur-sm">
          <GradientBand />
          <DesignToolbar
            selectedDevice={selectedDevice}
            onDeviceChange={handleDeviceChange}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onSave={handleSaveAndContinue}
            showFunnel={showFunnel}
            onToggleFunnel={() => setShowFunnel(!showFunnel)}
          />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex overflow-hidden relative z-30" style={{ marginTop: '1.16cm', height: 'calc(100vh - 1.16cm)' }}>
          {showFunnel ? (
            <FunnelUnlockedGame />
          ) : (
            <>
              {/* Sidebar */}
              {actualDevice === 'desktop' && (
                <HybridSidebar
                  ref={sidebarRef}
                  elements={canvasElements}
                  onElementsChange={setCanvasElements}
                  background={canvasBackground}
                  onBackgroundChange={handleBackgroundChange}
                  selectedElement={selectedElement}
                  onSelectedElementChange={setSelectedElement}
                  selectedElements={selectedElements}
                  onSelectedElementsChange={setSelectedElements}
                  onElementUpdate={handleElementUpdate}
                  onAddElement={handleAddElement}
                  extractedColors={extractedColors}
                  onExtractedColorsChange={handleExtractedColorsChange}
                  showEffectsPanel={showEffectsInSidebar}
                  onShowEffectsPanel={setShowEffectsInSidebar}
                  showAnimationsPanel={showAnimationsInSidebar}
                  onShowAnimationsPanel={setShowAnimationsInSidebar}
                  showPositionPanel={showPositionInSidebar}
                  onShowPositionPanel={setShowPositionInSidebar}
                  showDesignPanel={showDesignInSidebar}
                  onShowDesignPanel={setShowDesignInSidebar}
                  selectedDevice={selectedDevice}
                  hiddenTabs={effectiveHiddenTabs}
                  colorEditingContext={designColorContext}
                  // Props spécifiques au Jackpot
                  jackpotConfig={jackpotConfig}
                  onJackpotConfigChange={handleJackpotConfigChange}
                />
              )}

              {/* Canvas principal avec le jeu Jackpot intégré */}
              <JackpotDesignCanvas
                ref={canvasRef}
                selectedDevice={selectedDevice}
                elements={canvasElements}
                onElementsChange={setCanvasElements}
                background={canvasBackground}
                campaign={campaignConfig}
                onCampaignChange={handleCampaignConfigChange}
                zoom={canvasZoom}
                onZoomChange={setCanvasZoom}
                selectedElement={selectedElement}
                onSelectedElementChange={setSelectedElement}
                selectedElements={selectedElements}
                onSelectedElementsChange={setSelectedElements}
                onElementUpdate={handleElementUpdate}
                extractedColors={extractedColors}
                containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                onShowEffectsPanel={() => {
                  setShowEffectsInSidebar(true);
                  setShowAnimationsInSidebar(false);
                  setShowPositionInSidebar(false);
                }}
                onShowAnimationsPanel={() => {
                  setShowAnimationsInSidebar(true);
                  setShowEffectsInSidebar(false);
                  setShowPositionInSidebar(false);
                }}
                onShowPositionPanel={() => {
                  setShowPositionInSidebar(true);
                  setShowEffectsInSidebar(false);
                  setShowAnimationsInSidebar(false);
                  setShowDesignInSidebar(false);
                }}
                onShowDesignPanel={(context?: 'fill' | 'border' | 'text') => {
                  if (context) {
                    setDesignColorContext(context);
                  }
                  setShowDesignInSidebar(true);
                  setShowEffectsInSidebar(false);
                  setShowAnimationsInSidebar(false);
                  setShowPositionInSidebar(false);

                  if (sidebarRef.current) {
                    sidebarRef.current.setActiveTab('background');
                  }
                }}
                onOpenElementsTab={() => {
                  if (sidebarRef.current) {
                    sidebarRef.current.setActiveTab('elements');
                  }
                  setShowEffectsInSidebar(false);
                  setShowAnimationsInSidebar(false);
                  setShowPositionInSidebar(false);
                }}
                onAddElement={handleAddElement}
                onBackgroundChange={handleBackgroundChange}
                onExtractedColorsChange={handleExtractedColorsChange}
                selectedGroupId={selectedGroupId as any}
                onSelectedGroupChange={setSelectedGroupId as any}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                showQuizPanel={showQuizPanel}
                onQuizPanelChange={setShowQuizPanel}
                // Configuration du Jackpot
                jackpotConfig={jackpotConfig}
                onJackpotConfigChange={handleJackpotConfigChange}
              />

              {/* Zoom Slider pour mobile */}
              {selectedDevice === 'mobile' && (
                <ZoomSlider 
                  zoom={canvasZoom}
                  onZoomChange={setCanvasZoom}
                  minZoom={0.1}
                  maxZoom={1}
                  step={0.05}
                />
              )}
            </>
          )}
        </div>

        {/* Actions flottantes */}
        {!showFunnel && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-3 py-2 text-xs sm:text-sm border border-gray-300 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors shadow-sm"
              title="Fermer"
            >
              <X className="w-4 h-4 mr-1" />
              Fermer
            </button>
            <button
              onClick={handleSaveAndContinue}
              className="flex items-center px-3 py-2 text-xs sm:text-sm rounded-lg text-white bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:opacity-95 transition-colors shadow-sm"
              title="Sauvegarder et continuer"
            >
              <Save className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Sauvegarder et continuer</span>
              <span className="sm:hidden">Sauvegarder</span>
            </button>
          </div>
        )}
      </div>
    </MobileStableEditor>
  );
};

export default JackpotEditorLayout;
