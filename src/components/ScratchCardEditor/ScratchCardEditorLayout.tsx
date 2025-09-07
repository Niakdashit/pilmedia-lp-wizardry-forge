import React, { useState, useRef, useCallback, useEffect, lazy, useMemo } from 'react';
import HybridSidebar from './HybridSidebar';
import ScratchGrid from './ScratchGrid';
import { useEditorStore } from '../../stores/editorStore';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { createSaveAndContinueHandler } from '@/hooks/useModernCampaignEditor/saveHandler';
const MobileStableEditor = lazy(() => import('../DesignEditor/components/MobileStableEditor'));
const DesignToolbar = lazy(() => import('../DesignEditor/DesignToolbar'));
import GradientBand from '../shared/GradientBand';
import ZoomSlider from '../DesignEditor/components/ZoomSlider';
import { getDeviceDimensions } from '@/utils/deviceDimensions';
import { ProbabilityEngine } from '@/services/ProbabilityEngine';

interface ScratchCardEditorLayoutProps {
  mode?: 'campaign' | 'template';
}

const ScratchCardEditorLayout: React.FC<ScratchCardEditorLayoutProps> = ({ mode = 'campaign' }) => {
  const navigate = useNavigate();
  
  // Editor state
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [elements, setElements] = useState<any[]>([]);
  const [currentBackground, setCurrentBackground] = useState<{ type: 'color' | 'image'; value: string }>({ 
    type: 'color', 
    value: '#000000' 
  });
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  
  // Panel states
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [showAnimationsPanel, setShowAnimationsPanel] = useState(false);
  const [showPositionPanel, setShowPositionPanel] = useState(false);
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [showScratchPanel, setShowScratchPanel] = useState(false);
  
  // Device detection + zoom like other editors
  const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  };
  const [actualDevice, setActualDevice] = useState<'desktop' | 'tablet' | 'mobile'>(detectDevice());
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(actualDevice);
  const getDefaultZoom = (device: 'desktop' | 'tablet' | 'mobile'): number => {
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
  const [canvasZoom, setCanvasZoom] = useState<number>(getDefaultZoom(selectedDevice));
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setSelectedDevice(device);
    setCanvasZoom(getDefaultZoom(device));
  };
  useEffect(() => {
    const device = detectDevice();
    setActualDevice(device);
    setSelectedDevice(device);
    setCanvasZoom(getDefaultZoom(device));
  }, []);
  useEffect(() => {
    if (actualDevice === 'mobile') {
      const updateZoom = () => setCanvasZoom(getDefaultZoom('mobile'));
      window.addEventListener('resize', updateZoom);
      return () => window.removeEventListener('resize', updateZoom);
    }
  }, [actualDevice]);
  
  // Scratch card specific state
  const [scratchConfig, setScratchConfig] = useState({
    // legacy single area fields kept (not used by grid)
    scratchArea: { x: 50, y: 50, width: 300, height: 200 },
    revealedContent: { type: 'text', value: 'Félicitations!' },
    scratchTexture: 'silver',
    scratchOpacity: 0.8,
    scratchThickness: 20,
    // new grid options
    overlayColor: '#E3C6B7',
    brushSize: 40,
    revealThreshold: 0.6,
    cards: [
      { id: 'card-1', text: '🎉 Surprise 1' },
      { id: 'card-2', text: '💎 Bonus 2' },
      { id: 'card-3', text: '🏆 Prix 3' },
      { id: 'card-4', text: '🎁 Cadeau 4' }
    ],
    winningCardId: 'card-3'
  });
  // Scratch result state and prize assignment for current round
  const [scratchResult, setScratchResult] = useState<null | 'win' | 'lose'>(null);
  // const [revealedCardId, setRevealedCardId] = useState<string | null>(null); // unused
  const [assignment, setAssignment] = useState<{ cardId?: string; prizeId?: string } | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<any>(null);
  
  // Zustand store
  const campaign = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign);
  const { saveCampaign } = useCampaigns();
  const [showFunnel, setShowFunnel] = useState(false);
  const [previewButtonSide, setPreviewButtonSide] = useState<'left' | 'right'>(() =>
    (typeof window !== 'undefined' && localStorage.getItem('previewButtonSide') === 'left') ? 'left' : 'right'
  );
  useEffect(() => {
    try { localStorage.setItem('previewButtonSide', previewButtonSide); } catch {}
  }, [previewButtonSide]);

  // Build prize-aware segments from 2x2 cards
  const prizeSegments = useMemo(() => {
    const cards = Array.isArray((scratchConfig as any).cards) ? (scratchConfig as any).cards : [];
    const segments = cards.map((c: any, idx: number) => ({
      id: c.id || `card-${idx + 1}`,
      label: c.text || `Carte ${idx + 1}`,
      color: '#E3C6B7',
      textColor: '#111827',
      prizeId: c.prizeId || undefined
    }));
    return segments.length ? segments : [
      { id: 'card-1', label: 'Carte 1', color: '#E3C6B7', textColor: '#111827' },
      { id: 'card-2', label: 'Carte 2', color: '#E3C6B7', textColor: '#111827' },
      { id: 'card-3', label: 'Carte 3', color: '#E3C6B7', textColor: '#111827' },
      { id: 'card-4', label: 'Carte 4', color: '#E3C6B7', textColor: '#111827' }
    ];
  }, [scratchConfig]);

  const probability = useMemo(() => {
    const prizes = (campaign as any)?.prizes || [];
    return ProbabilityEngine.calculateSegmentProbabilities(prizeSegments as any, prizes);
  }, [prizeSegments, campaign]);

  const assignRound = useCallback(() => {
    const segments = probability?.segments || [];
    const winners = segments.filter((s: any) => s.prizeId && (s.probability || 0) > 0);
    const losers = segments.filter((s: any) => !s.prizeId || (s.probability || 0) <= 0);
    const totalWin = winners.reduce((sum: number, s: any) => sum + (s.probability || 0), 0);
    let chosen: any = null;
    if (totalWin > 0) {
      const r = Math.random() * totalWin;
      let acc = 0;
      for (const s of winners) {
        acc += s.probability || 0;
        if (r <= acc) { chosen = s; break; }
      }
    }
    if (!chosen) {
      const pool = losers.length > 0 ? losers : segments;
      chosen = pool[Math.floor(Math.random() * (pool.length || 1))] || null;
    }
    setAssignment(chosen ? { cardId: chosen.id, prizeId: chosen.prizeId } : { cardId: undefined, prizeId: undefined });
  }, [probability]);

  // Helper to synchronously sample an assignment (without setting state)
  const sampleAssignment = useCallback(() => {
    const segments = probability?.segments || [];
    const winners = segments.filter((s: any) => s.prizeId && (s.probability || 0) > 0);
    const losers = segments.filter((s: any) => !s.prizeId || (s.probability || 0) <= 0);
    const totalWin = winners.reduce((sum: number, s: any) => sum + (s.probability || 0), 0);
    let chosen: any = null;
    if (totalWin > 0) {
      const r = Math.random() * totalWin;
      let acc = 0;
      for (const s of winners) {
        acc += s.probability || 0;
        if (r <= acc) { chosen = s; break; }
      }
    }
    if (!chosen) {
      const pool = losers.length > 0 ? losers : segments;
      chosen = pool[Math.floor(Math.random() * (pool.length || 1))] || null;
    }
    return chosen ? { cardId: chosen.id, prizeId: chosen.prizeId } : { cardId: undefined, prizeId: undefined };
  }, [probability]);

  // Reassign when the configuration or prize pool changes
  useEffect(() => {
    setAssignment(null);
    const id = setTimeout(() => assignRound(), 0);
    return () => clearTimeout(id);
  }, [assignRound]);
  
  // Initialize campaign if needed
  useEffect(() => {
    if (!campaign) {
      const newCampaign = {
        id: `scratch-${Date.now()}`,
        name: 'Nouvelle carte à gratter',
        type: 'scratch' as const,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        design: {
          background: currentBackground.value,
          extractedColors,
          elements
        },
        // Champs de formulaire par défaut (parité avec les autres éditeurs)
        formFields: [
          { id: 'prenom', label: 'Prénom', type: 'text', required: true },
          { id: 'nom', label: 'Nom', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true }
        ],
        gameConfig: {
          scratch: scratchConfig
        },
        buttonConfig: {
          text: 'Jouer',
          style: 'primary'
        },
        scratchConfig
      };
      setCampaign(newCampaign as any);
    }
  }, [campaign, setCampaign, currentBackground, extractedColors, elements, scratchConfig]);

  // Harmoniser les champs par défaut si la campagne existe déjà sans formFields
  useEffect(() => {
    if (campaign && (!Array.isArray((campaign as any).formFields) || (campaign as any).formFields.length === 0)) {
      setCampaign((prev: any) => (prev ? {
        ...prev,
        formFields: [
          { id: 'prenom', label: 'Prénom', type: 'text', required: true },
          { id: 'nom', label: 'Nom', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true }
        ]
      } : prev));
    }
  }, [campaign, setCampaign]);

  // Handle element operations
  const handleAddElement = useCallback((element: any) => {
    const newElement = {
      ...element,
      id: element.id || `element-${Date.now()}`,
      zIndex: elements.length + 1
    };
    setElements(prev => [...prev, newElement]);
  }, [elements.length]);

  const handleElementUpdate = useCallback((updates: any) => {
    if (!selectedElement) return;
    
    setElements((prev: any) => prev.map((el: any) => 
      el.id === selectedElement.id ? { ...el, ...updates } : el
    ));
    setSelectedElement((prev: any) => prev ? { ...prev, ...updates } : null);
  }, [selectedElement]);

  const handleElementsChange = useCallback((newElements: any[]) => {
    setElements(newElements);
  }, []);

  // Handle background changes
  const handleBackgroundChange = useCallback((background: { type: 'color' | 'image'; value: string }) => {
    setCurrentBackground(background);
  }, []);

  const handleExtractedColorsChange = useCallback((colors: string[]) => {
    setExtractedColors(colors);
  }, []);

  // Handle scratch config changes
  const handleScratchConfigChange = useCallback((config: any) => {
    setScratchConfig(prev => ({ ...prev, ...config }));
  }, []);

  // Update campaign when state changes (excluding campaign itself to avoid infinite loop)
  useEffect(() => {
    if (campaign) {
      const updatedCampaign = {
        ...campaign,
        design: {
          ...campaign.design,
          background: currentBackground.value,
          extractedColors,
          elements
        },
        scratchConfig,
        updatedAt: new Date().toISOString()
      };
      setCampaign(updatedCampaign as any);
    }
  }, [currentBackground, extractedColors, elements, scratchConfig, setCampaign]);

  // Handler: save and continue to settings (keep parity with other editors)
  const handleSaveAndContinue = React.useCallback(() => {
    const fn = createSaveAndContinueHandler(
      campaign,
      saveCampaign,
      navigate,
      setCampaign as any
    );
    return fn();
  }, [campaign, saveCampaign, navigate, setCampaign]);

  return (
    <MobileStableEditor className="h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pt-[1.25cm] rounded-tl-[28px] rounded-tr-[28px] transform -translate-y-[0.4vh]">
      {/* Bande dégradée + logo, alignée aux autres éditeurs */}
      <GradientBand className="transform translate-y-[0.4vh]">
        <img 
          src="/logo.png" 
          alt="Prosplay Logo" 
          style={{
            height: '93px',
            width: 'auto',
            filter: 'brightness(0) invert(1)',
            maxWidth: '468px',
            marginTop: '-120px',
            marginLeft: '1.5%'
          }} 
        />
      </GradientBand>

      {/* Toolbar haut: masqué en mode preview comme les autres éditeurs */}
      {!showFunnel && (
        <DesignToolbar
          selectedDevice={selectedDevice}
          onDeviceChange={handleDeviceChange}
          onPreviewToggle={() => setShowFunnel(v => !v)}
          isPreviewMode={showFunnel}
          canUndo={false}
          canRedo={false}
          previewButtonSide={previewButtonSide}
          onPreviewButtonSideChange={setPreviewButtonSide}
          mode={mode}
          onSave={handleSaveAndContinue}
          showSaveCloseButtons={false}
          onNavigateToSettings={() => {
            let campaignId = (campaign as any)?.id as string | undefined;
            if (!campaignId) {
              campaignId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
                ? (crypto as any).randomUUID()
                : `draft-${Date.now()}`;
              try {
                const draft = { ...(campaign || {}), id: campaignId, _source: 'localStorage' };
                localStorage.setItem(`campaign:draft:${campaignId}`, JSON.stringify(draft));
              } catch {}
              setCampaign((prev: any) => ({ ...prev, id: campaignId }));
            }
            if (campaignId) navigate(`/campaign/${campaignId}/settings`);
          }}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {showFunnel ? (
          /* Mode Preview - Funnel complet comme les autres éditeurs */
          <div className="group fixed inset-0 z-40 w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-transparent flex">
            {/* Bouton Mode Edition flottant */}
            <div className="absolute top-4 left-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => setShowFunnel(false)}
                className="flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 transition-colors"
              >
                Mode édition
              </button>
            </div>
            
            {/* Contenu Preview centré */}
            <div className="flex-1 flex items-center justify-center bg-gray-100">
              <div className="max-w-md w-full mx-4">
                <ScratchGrid
                  key={roundKey}
                  overlayColor={scratchConfig.overlayColor}
                  brushSize={scratchConfig.brushSize}
                  revealThreshold={scratchConfig.revealThreshold}
                  zoom={0.8}
                  device={selectedDevice}
                  background={currentBackground}
                  cards={scratchConfig.cards?.map((c: any) => ({
                    id: c.id,
                    overlayColor: c.coverColor || scratchConfig.overlayColor || '#E3C6B7',
                    overlayImage: c.imageUrl,
                    contentBg: c.contentType === 'text' ? '#ffffff' : '#ffffff',
                    content: (() => {
                      if (c.contentType === 'text') {
                        return (
                          <span style={{ color: '#000000', fontSize: '18px', fontWeight: 600, textAlign: 'center' }}>
                            {c.text || '🎉 Surprise'}
                          </span>
                        );
                      }
                      const isWinningCard = assignment?.cardId === c.id;
                      if (isWinningCard && (scratchConfig as any).prizeImage) {
                        return (
                          <img
                            src={(scratchConfig as any).prizeImage}
                            alt="Prize won!"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        );
                      }
                      return (
                        <span style={{ color: '#333', fontSize: '18px', textAlign: 'center' }}>
                          {c.text || '🎁 Prize'}
                        </span>
                      );
                    })()
                  }))}
                  onReveal={(id) => {
                    let current = assignment || sampleAssignment();
                    const isWin = current && current.cardId === id && current.prizeId;
                    setScratchResult(isWin ? 'win' : 'lose');
                    if (isWin && current?.prizeId) {
                      const wonId = current.prizeId;
                      setCampaign((prev: any) => {
                        if (!prev) return prev;
                        const updatedPrizes = (prev.prizes || []).map((prize: any) => {
                          if (String(prize.id) === String(wonId)) {
                            const remaining = (prize.totalUnits || 0) - (prize.awardedUnits || 0);
                            if (remaining <= 0) return prize;
                            return { ...prize, awardedUnits: (prize.awardedUnits || 0) + 1 };
                          }
                          return prize;
                        });
                        return { ...prev, prizes: updatedPrizes, _lastUpdate: Date.now() };
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Mode Edition - Interface normale */
          <>
            {/* Sidebar */}
            <HybridSidebar
              ref={sidebarRef}
              onAddElement={handleAddElement}
              onBackgroundChange={handleBackgroundChange}
              onExtractedColorsChange={handleExtractedColorsChange}
              currentBackground={currentBackground}
              extractedColors={extractedColors}
              elements={elements}
              onElementsChange={handleElementsChange}
              selectedElement={selectedElement}
              onElementUpdate={handleElementUpdate}
              selectedElements={selectedElements}
              onSelectedElementsChange={setSelectedElements}
              showEffectsPanel={showEffectsPanel}
              onEffectsPanelChange={setShowEffectsPanel}
              showAnimationsPanel={showAnimationsPanel}
              onAnimationsPanelChange={setShowAnimationsPanel}
              showPositionPanel={showPositionPanel}
              onPositionPanelChange={setShowPositionPanel}
              showDesignPanel={showDesignPanel}
              onDesignPanelChange={setShowDesignPanel}
              showScratchPanel={showScratchPanel}
              onScratchPanelChange={setShowScratchPanel}
              canvasRef={canvasRef}
              selectedDevice={selectedDevice}
              scratchConfig={scratchConfig}
              onScratchConfigChange={handleScratchConfigChange}
            />

            {/* Zone principale d'édition */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Canvas / Game area */}
              <div className="flex-1 overflow-auto flex items-start justify-center py-6">
                  <ScratchGrid
                    key={roundKey}
                    overlayColor={scratchConfig.overlayColor}
                    brushSize={scratchConfig.brushSize}
                    revealThreshold={scratchConfig.revealThreshold}
                    zoom={canvasZoom}
                    device={selectedDevice}
                    background={currentBackground}
                    cards={scratchConfig.cards?.map((c: any) => {
                      console.log(`Card ${c.id}: imageUrl=${!!c.imageUrl}, cardColor=${c.coverColor}, globalColor=${scratchConfig.overlayColor}`);
                      return {
                        id: c.id,
                        overlayColor: c.coverColor || scratchConfig.overlayColor || '#E3C6B7',
                        overlayImage: c.imageUrl,
                        contentBg: c.contentType === 'text' ? '#ffffff' : '#ffffff',
                        content: (() => {
                          if (c.contentType === 'text') {
                            return (
                              <span style={{ color: '#000000', fontSize: '18px', fontWeight: 600, textAlign: 'center' }}>
                                {c.text || '🎉 Surprise'}
                              </span>
                            );
                          }
                          const isWinningCard = assignment?.cardId === c.id;
                          if (isWinningCard && (scratchConfig as any).prizeImage) {
                            return (
                              <img
                                src={(scratchConfig as any).prizeImage}
                                alt="Prize won!"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            );
                          }
                          return (
                            <span style={{ color: '#333', fontSize: '18px', textAlign: 'center' }}>
                              {c.text || '🎁 Prize'}
                            </span>
                          );
                        })()
                      };
                    })}
                    onReveal={(id) => {
                      let current = assignment || sampleAssignment();
                      const isWin = current && current.cardId === id && current.prizeId;
                      setScratchResult(isWin ? 'win' : 'lose');
                      if (isWin && current?.prizeId) {
                        const wonId = current.prizeId;
                        setCampaign((prev: any) => {
                          if (!prev) return prev;
                          const updatedPrizes = (prev.prizes || []).map((prize: any) => {
                            if (String(prize.id) === String(wonId)) {
                              const remaining = (prize.totalUnits || 0) - (prize.awardedUnits || 0);
                              if (remaining <= 0) return prize;
                              return { ...prize, awardedUnits: (prize.awardedUnits || 0) + 1 };
                            }
                            return prize;
                          });
                          return { ...prev, prizes: updatedPrizes, _lastUpdate: Date.now() };
                        });
                      }
                    }}
                  />
              </div>
              <ZoomSlider 
                zoom={canvasZoom}
                onZoomChange={setCanvasZoom}
                minZoom={0.1}
                maxZoom={1}
                step={0.05}
                defaultZoom={getDefaultZoom(selectedDevice)}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Floating bottom-right actions - masqués en mode preview */}
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
      {/* Simple result modal */}
      {scratchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[min(420px,92vw)] text-center">
            <h3 className="text-xl font-semibold mb-2">
              {scratchResult === 'win' ? 'Félicitations !' : 'Dommage'}
            </h3>
            <p className="text-gray-600 mb-4">
              {scratchResult === 'win'
                ? 'Vous avez gagné un lot !'
                : 'Cette carte n’est pas gagnante. Essayez une autre !'}
            </p>
            <button
              onClick={() => { setScratchResult(null); setAssignment(null); assignRound(); setRoundKey((k) => k + 1); }}
              className="px-4 py-2 rounded-lg bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white hover:opacity-95"
            >
              Continuer
            </button>
          </div>
        </div>
      )}
      </div>
    </MobileStableEditor>
  );
};

export default ScratchCardEditorLayout;
