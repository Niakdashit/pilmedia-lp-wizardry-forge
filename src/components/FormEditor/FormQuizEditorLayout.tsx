import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Save, X } from 'lucide-react';
const HybridSidebar = lazy(() => import('../QuizEditor/HybridSidebar'));
const DesignToolbar = lazy(() => import('../QuizEditor/DesignToolbar'));
const FunnelUnlockedGame = lazy(() => import('../funnels/FunnelUnlockedGame'));
import GradientBand from '../shared/GradientBand';
import ZoomSlider from '../QuizEditor/components/ZoomSlider';
const FormDesignCanvas = lazy(() => import('./components/FormDesignCanvas'));
import { useEditorStore } from '../../stores/editorStore';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { getDeviceDimensions } from '../../utils/deviceDimensions';
import { useCampaigns } from '@/hooks/useCampaigns';
const MobileStableEditor = lazy(() => import('../QuizEditor/components/MobileStableEditor'));

interface FormQuizEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}

const FormQuizEditorLayout: React.FC<FormQuizEditorLayoutProps> = ({ mode = 'campaign', hiddenTabs }) => {
  const navigate = useNavigate();
  
  // Détection automatique de l'appareil basée sur l'user-agent
  const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  };

  const [actualDevice] = useState<'desktop' | 'tablet' | 'mobile'>(detectDevice());

  // Zoom par défaut selon l'appareil
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
      case 'desktop': return 0.7;
      case 'tablet': return 0.55;
      case 'mobile': return 0.45;
      default: return 0.7;
    }
  };

  // Store centralisé
  const { 
    setCampaign,
    setIsLoading,
    setIsModified
  } = useEditorStore();
  const campaignState = useEditorStore((s) => s.campaign);

  // API
  const { saveCampaign } = useCampaigns();

  // États
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(actualDevice);
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>(() => (
    mode === 'template'
      ? { type: 'color', value: '#4ECDC4' }
      : { type: 'color', value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' }
  ));
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [canvasZoom, setCanvasZoom] = useState<number>(getDefaultZoom(actualDevice));
  const [showFunnel, setShowFunnel] = useState(false);
  const [previewButtonSide, setPreviewButtonSide] = useState<'left' | 'right'>('right');

  // Handlers
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setSelectedDevice(device);
    setCanvasZoom(getDefaultZoom(device));
  };

  // Undo/Redo
  const { undo, redo, canUndo, canRedo, addToHistory } = useUndoRedo({
    maxHistorySize: 50,
    onUndo: (state) => {
      if (state) {
        setCanvasElements(state.canvasElements || []);
        setCanvasBackground(state.canvasBackground || { type: 'color', value: '#ffffff' });
      }
    },
    onRedo: (state) => {
      if (state) {
        setCanvasElements(state.canvasElements || []);
        setCanvasBackground(state.canvasBackground || { type: 'color', value: '#ffffff' });
      }
    }
  });

  // Save handler
  const handleSaveAndContinue = useCallback(async () => {
    try {
      setIsLoading(true);
      if (campaignState) {
        await saveCampaign(campaignState as any);
        setIsModified(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignState, saveCampaign, setIsLoading, setIsModified]);

  // Element handlers
  const handleAddElement = useCallback((element: any) => {
    const newElements = [...canvasElements, element];
    setCanvasElements(newElements);
    addToHistory({ canvasElements: newElements, canvasBackground });
  }, [canvasElements, canvasBackground, addToHistory]);

  const handleElementUpdate = useCallback((updates: any) => {
    if (selectedElement) {
      const newElements = canvasElements.map(el => 
        el.id === selectedElement.id ? { ...el, ...updates } : el
      );
      setCanvasElements(newElements);
      addToHistory({ canvasElements: newElements, canvasBackground });
    }
  }, [selectedElement, canvasElements, canvasBackground, addToHistory]);

  const handleBackgroundChange = useCallback((background: { type: 'color' | 'image'; value: string }) => {
    setCanvasBackground(background);
    addToHistory({ canvasElements, canvasBackground: background });
  }, [canvasElements, addToHistory]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MobileStableEditor className="h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pt-[1.25cm] rounded-tl-[28px] rounded-tr-[28px] transform -translate-y-[0.4vh]">
        {/* Bande dégradée avec logo et icônes */}
        <GradientBand className="transform translate-y-[0.4vh]">
          {mode === 'template' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '-122px',
                marginLeft: '24px'
              }}
            >
              <span className="text-white font-semibold tracking-wide text-base sm:text-lg select-none">
                Edition de template Form
              </span>
            </div>
          ) : (
            <img 
              src="/logo.png" 
              alt="Prosplay Logo" 
              style={{
                height: '93px',
                width: 'auto',
                filter: 'brightness(0) invert(1)',
                maxWidth: '468px',
                marginTop: '-120px',
                marginLeft: '1.5%',
                padding: 0
              }} 
            />
          )}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            marginTop: '-122px',
            marginRight: '24px'
          }}>
            <button 
              onClick={() => {}}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
              title="Mon compte"
            >
              <User className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {}}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </GradientBand>

        {/* Top Toolbar - Hidden only in preview mode */}
        {!showFunnel && (
          <Suspense fallback={<div>Loading toolbar...</div>}>
            <DesignToolbar
              selectedDevice={selectedDevice}
              onDeviceChange={handleDeviceChange}
              onPreviewToggle={() => setShowFunnel(true)}
              isPreviewMode={showFunnel}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              previewButtonSide={previewButtonSide}
              onPreviewButtonSideChange={setPreviewButtonSide}
              mode={mode}
              onSave={handleSaveAndContinue}
              showSaveCloseButtons={false}
              onNavigateToSettings={() => {}}
            />
          </Suspense>
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {showFunnel ? (
            /* Funnel Preview Mode */
            <div className="group fixed inset-0 z-40 w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-transparent flex">
              {/* Floating Edit Mode Button */}
              <button
                onClick={() => setShowFunnel(false)}
                className={`absolute top-4 ${previewButtonSide === 'left' ? 'left-4' : 'right-4'} z-50 px-4 py-2 bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] shadow-none focus:shadow-none ring-0 focus:ring-0 drop-shadow-none filter-none backdrop-blur-0`}
              >
                Mode édition
              </button>
              <Suspense fallback={<div>Loading preview...</div>}>
                <FunnelUnlockedGame
                  campaign={campaignState}
                  previewMode={selectedDevice}
                />
              </Suspense>
            </div>
          ) : (
            /* Design Editor Mode */
            <>
              {/* Hybrid Sidebar - Design & Technical */}
              {actualDevice !== 'mobile' && (
                <Suspense fallback={<div>Loading sidebar...</div>}>
                  <HybridSidebar
                    onAddElement={handleAddElement}
                    onBackgroundChange={handleBackgroundChange}
                    onExtractedColorsChange={setExtractedColors}
                    currentBackground={canvasBackground}
                    extractedColors={extractedColors}
                    campaignConfig={campaignState}
                    onCampaignConfigChange={setCampaign}
                    elements={canvasElements}
                    onElementsChange={setCanvasElements}
                    selectedElement={selectedElement}
                    onElementUpdate={handleElementUpdate}
                    selectedElements={[]}
                    onSelectedElementsChange={() => {}}
                    onAddToHistory={addToHistory}
                    selectedDevice={selectedDevice}
                    hiddenTabs={hiddenTabs}
                  />
                </Suspense>
              )}

              {/* Canvas Area */}
              <Suspense fallback={<div>Loading canvas...</div>}>
                <FormDesignCanvas
                  config={campaignState}
                  selectedDevice={selectedDevice}
                  zoom={canvasZoom}
                />
              </Suspense>
              
              {/* Zoom Slider - Always visible in bottom center */}
              {selectedDevice !== 'mobile' && (
                <ZoomSlider 
                  zoom={canvasZoom}
                  onZoomChange={setCanvasZoom}
                  minZoom={0.1}
                  maxZoom={1}
                  step={0.05}
                  defaultZoom={getDefaultZoom(selectedDevice)}
                />
              )}
            </>
          )}
        </div>
        
        {/* Floating bottom-right actions */}
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
      </MobileStableEditor>
    </Suspense>
  );
};

export default FormQuizEditorLayout;
