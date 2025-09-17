import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  FormInput,
  Palette,
  Gamepad2
} from 'lucide-react';
import BackgroundPanel from './panels/BackgroundPanel';
import AssetsPanel from './panels/AssetsPanel';
import TextEffectsPanel from './panels/TextEffectsPanel';
import TextAnimationsPanel from './panels/TextAnimationsPanel';
import WheelConfigPanel from './panels/WheelConfigPanel';
import ModernFormTab from '../ModernEditor/ModernFormTab';
import { useEditorStore } from '../../stores/editorStore';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';


// Lazy-loaded heavy panels
const loadPositionPanel = () => import('./panels/PositionPanel');
const loadLayersPanel = () => import('./panels/LayersPanel');

const LazyPositionPanel = React.lazy(loadPositionPanel);
const LazyLayersPanel = React.lazy(loadLayersPanel);


export interface HybridSidebarRef {
  setActiveTab: (tab: string) => void;
}

interface HybridSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onAddElement: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  currentBackground?: { type: 'color' | 'image'; value: string };
  extractedColors?: string[]; 
  // Campaign config from DesignEditorLayout (optional, not directly used here but passed through)
  campaignConfig?: any;
  onCampaignConfigChange?: (cfg: any) => void;
  elements?: any[];
  onElementsChange?: (elements: any[]) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  showEffectsPanel?: boolean;
  onEffectsPanelChange?: (show: boolean) => void;
  showAnimationsPanel?: boolean;
  onAnimationsPanelChange?: (show: boolean) => void;
  showPositionPanel?: boolean;
  onPositionPanelChange?: (show: boolean) => void;
  // Inline wheel panel controls
  showWheelPanel?: boolean;
  onWheelPanelChange?: (show: boolean) => void;
  // Design panel controls
  showDesignPanel?: boolean;
  onDesignPanelChange?: (show: boolean) => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
  // Props pour le système de groupes
  selectedElements?: any[];
  onSelectedElementsChange?: (elements: any[]) => void;
  onAddToHistory?: (snapshot: any) => void;
  // Wheel config values & callbacks (provided by parent)
  wheelBorderStyle?: string;
  wheelBorderColor?: string;
  wheelBorderWidth?: number;
  wheelScale?: number;
  wheelShowBulbs?: boolean;
  wheelPosition?: 'left' | 'right' | 'center';
  onWheelBorderStyleChange?: (style: string) => void;
  onWheelBorderColorChange?: (color: string) => void;
  onWheelBorderWidthChange?: (width: number) => void;
  onWheelScaleChange?: (scale: number) => void;
  onWheelShowBulbsChange?: (show: boolean) => void;
  onWheelPositionChange?: (pos: 'left' | 'right' | 'center') => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  // Callback pour forcer l'ouverture de l'onglet Elements
  onForceElementsTab?: () => void;
  // Tabs à masquer (par id: 'campaign', 'export', ...)
  hiddenTabs?: string[];
  // Propagate color editing context from toolbar -> layout -> sidebar -> background panel
  colorEditingContext?: 'fill' | 'border' | 'text';
}

const HybridSidebar = forwardRef<HybridSidebarRef, HybridSidebarProps>(({
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  currentBackground,
  extractedColors = [],
  campaignConfig,
  onCampaignConfigChange,
  elements = [],
  onElementsChange,
  selectedElement,
  onElementUpdate,
  showEffectsPanel = false,
  onEffectsPanelChange,
  showAnimationsPanel = false,
  onAnimationsPanelChange,
  showPositionPanel = false,
  onPositionPanelChange,
  showWheelPanel = false,
  onWheelPanelChange,
  showDesignPanel = false,
  onDesignPanelChange,
  canvasRef,
  selectedElements = [],
  onSelectedElementsChange,
  onAddToHistory,
  wheelBorderStyle,
  wheelBorderColor,
  wheelBorderWidth,
  wheelScale,
  wheelShowBulbs,
  wheelPosition,
  onWheelBorderStyleChange,
  onWheelBorderColorChange,
  onWheelBorderWidthChange,
  onWheelScaleChange,
  onWheelShowBulbsChange,
  onWheelPositionChange,
  selectedDevice = 'desktop',
  hiddenTabs = [],
  onForceElementsTab,
  colorEditingContext
}: HybridSidebarProps, ref) => {
  // Détecter si on est sur mobile avec un hook React pour éviter les erreurs hydration
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Centralized campaign state (Zustand)
  const campaign = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign);
  
  // Détecter si l'appareil est réellement mobile via l'user-agent plutôt que la taille de la fenêtre
  React.useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    
    // Exposer la fonction pour forcer l'onglet Elements si elle est fournie
    if (onForceElementsTab) {
      (window as any).forceElementsTab = onForceElementsTab;
    }
    
    // Debug logging pour la détection mobile
    const deviceOverride = getEditorDeviceOverride();

    console.log('📱 HybridSidebar - Mobile detection:', {
      userAgent: ua,
      isMobileUA: /Mobi|Android/i.test(ua),
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A',
      selectedDevice,
      willCollapse: deviceOverride === null && /Mobi|Android/i.test(ua),
      deviceOverride
    });

    if (deviceOverride === 'desktop') {
      setIsCollapsed(false);
      return;
    }

    if (/Mobi|Android/i.test(ua)) {
      setIsCollapsed(true);
    }
  }, [onForceElementsTab, selectedDevice]);
  // Default to 'Design' tab on entry
  const [activeTab, _setActiveTab] = useState<string | null>('background');

  // Monitor activeTab state changes for debugging
  useEffect(() => {
    console.log('🔄 [USE EFFECT] activeTab changed to:', activeTab);
    console.log('🔄 [USE EFFECT] Component will re-render');
  }, [activeTab]);
  
  // Exposer setActiveTab via ref
  useImperativeHandle(ref, () => ({
    setActiveTab: (tab: string) => {
      _setActiveTab(tab);
      // Mettre à jour les états des panneaux en fonction de l'onglet sélectionné
      if (tab === 'background') {
        onDesignPanelChange?.(true);
      } else if (tab === 'effects') {
        onEffectsPanelChange?.(true);
      } else if (tab === 'animations') {
        onAnimationsPanelChange?.(true);
      } else if (tab === 'position') {
        onPositionPanelChange?.(true);
      } else if (tab === 'wheel') {
        onWheelPanelChange?.(true);
      }
    }
  }), [onDesignPanelChange, onEffectsPanelChange, onAnimationsPanelChange, onPositionPanelChange, onWheelPanelChange]);
  
  // Fonction interne pour gérer le changement d'onglet
  const setActiveTab = (tab: string | null) => {
    _setActiveTab(tab);
  };
  
  // Référence pour suivre les états précédents
  const prevStatesRef = useRef({
    showEffectsPanel,
    showAnimationsPanel,
    showPositionPanel,
    showWheelPanel,
    showDesignPanel,
    activeTab
  });

  // Gérer l'affichage des onglets en fonction des états des panneaux
  React.useEffect(() => {
    const prev = prevStatesRef.current;
    let newActiveTab = activeTab;
    let shouldUpdate = false;

    // Vérifier si un panneau a été activé/désactivé
    const panelStates = [
      { key: 'effects', active: showEffectsPanel, prevActive: prev.showEffectsPanel },
      { key: 'animations', active: showAnimationsPanel, prevActive: prev.showAnimationsPanel },
      { key: 'position', active: showPositionPanel, prevActive: prev.showPositionPanel },
      { key: 'wheel', active: showWheelPanel, prevActive: prev.showWheelPanel },
      { key: 'background', active: showDesignPanel, prevActive: prev.showDesignPanel }
    ];

    // Si le panneau Design est activé, forcer l'onglet background
    if (showDesignPanel && !prev.showDesignPanel) {
      newActiveTab = 'background';
      shouldUpdate = true;
    } 
    // Si un autre panneau a été activé, basculer vers son onglet correspondant
    else {
      const activatedPanel = panelStates.find(p => p.active && !p.prevActive && p.key !== 'background');
      if (activatedPanel) {
        newActiveTab = activatedPanel.key;
        shouldUpdate = true;
      } 
      // Si l'onglet actif est un panneau qui a été désactivé, revenir à 'elements'
      else if (panelStates.some(p => p.key === activeTab && !p.active && p.prevActive)) {
        newActiveTab = 'elements';
        shouldUpdate = true;
      }
    }

    // Mettre à jour l'état si nécessaire
    if (shouldUpdate && newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
    }

    // Mettre à jour la référence des états précédents
    prevStatesRef.current = {
      showEffectsPanel,
      showAnimationsPanel,
      showPositionPanel,
      showWheelPanel,
      showDesignPanel,
      activeTab: newActiveTab
    };

    // Notifier le parent des changements de l'onglet Design
    if (onDesignPanelChange) {
      const isDesignActive = newActiveTab === 'background' || showDesignPanel;
      if (isDesignActive !== prev.showDesignPanel) {
        onDesignPanelChange(isDesignActive);
      }
    }
  }, [
    showEffectsPanel, 
    showAnimationsPanel, 
    showPositionPanel, 
    showWheelPanel,
    showDesignPanel,
    activeTab,
    onDesignPanelChange
  ]);

  // La gestion de onForceElementsTab a été déplacée dans le premier useEffect
  // pour éviter la duplication de code et les effets secondaires multiples

  // Fermer automatiquement le panneau d'effets si aucun élément texte n'est sélectionné
  React.useEffect(() => {
    if (activeTab === 'effects' && (!selectedElement || selectedElement.type !== 'text')) {
      onEffectsPanelChange?.(false);
      setActiveTab('elements');
    }
  }, [selectedElement, activeTab, onEffectsPanelChange]);

  // Idle prefetch heavy panels to smooth first open without blocking initial render
  React.useEffect(() => {
    const win: any = typeof window !== 'undefined' ? window : undefined;
    const schedule = (cb: () => void) =>
      win && typeof win.requestIdleCallback === 'function'
        ? win.requestIdleCallback(cb, { timeout: 2000 })
        : setTimeout(cb, 1200);
    const cancel = (id: any) =>
      win && typeof win.cancelIdleCallback === 'function' ? win.cancelIdleCallback(id) : clearTimeout(id);

    const id = schedule(() => {
      try {
        if (activeTab !== 'layers') {
          loadLayersPanel();
        }
        // Position panel can be opened via toggles; prefetch proactively
        loadPositionPanel();
      } catch (e) {
        // no-op: prefetch is best-effort
      }
    });
    return () => cancel(id);
  }, [activeTab]);

  const allTabs = [
    { 
      id: 'background', 
      label: 'Design', 
      icon: Palette,
      debug: 'Onglet Design (background)'
    },
    { 
      id: 'elements', 
      label: 'Éléments', 
      icon: Plus
    },
    { 
      id: 'layers', 
      label: 'Calques', 
      icon: Layers
    },
    {
      id: 'game',
      label: 'Jeu',
      icon: Gamepad2
    },
    { 
      id: 'form', 
      label: 'Formulaire', 
      icon: FormInput
    }
  ];
  console.log('📌 hiddenTabs:', hiddenTabs);
  // Vérifier si hiddenTabs est défini et est un tableau
  const safeHiddenTabs = Array.isArray(hiddenTabs) ? hiddenTabs : [];
  console.log('🔍 [HybridSidebar] hiddenTabs reçus:', hiddenTabs);
  console.log('🔍 [HybridSidebar] hiddenTabs après vérification:', safeHiddenTabs);
  
  const tabs = allTabs.filter(tab => {
    const isHidden = safeHiddenTabs.includes(tab.id);
    console.log(`🔍 [${tab.id}] ${tab.label} - Masqué: ${isHidden}`, tab);
    return !isHidden;
  });
  
  // Log détaillé du filtrage des onglets
  console.log('🔍 [HybridSidebar] Filtrage des onglets:', {
    allTabs: allTabs.map(t => t.id),
    safeHiddenTabs,
    filteredTabs: tabs.map(t => t.id),
    hasBackgroundTab: allTabs.some(t => t.id === 'background'),
    isBackgroundHidden: safeHiddenTabs.includes('background')
  });
  
  console.log('🔍 [HybridSidebar] Tous les onglets disponibles:', allTabs.map(t => `${t.id} (${t.label})`));
  console.log('✅ [HybridSidebar] Onglets visibles après filtrage:', tabs.map(t => `${t.id} (${t.label})`));
  console.log('📋 [HybridSidebar] Onglets masqués:', safeHiddenTabs);
  
  // Ensure a valid default active tab on mount and when visible tabs change
  React.useEffect(() => {
    const backgroundVisible = tabs.some(t => t.id === 'background');
    const activeIsVisible = activeTab ? tabs.some(t => t.id === activeTab) : false;
    if (!activeIsVisible) {
      _setActiveTab(backgroundVisible ? 'background' : (tabs[0]?.id ?? null));
    }
  }, [tabs]);

  // Vérifier si l'onglet 'background' (Design) est présent
  const hasBackgroundTab = allTabs.some(tab => tab.id === 'background');
  console.log('🔍 [HybridSidebar] L\'onglet background (Design) est présent:', hasBackgroundTab);
  
  // Vérifier si l'onglet 'background' est masqué
  const isBackgroundHidden = safeHiddenTabs.includes('background');
  console.log('🔍 [HybridSidebar] L\'onglet background (Design) est masqué:', isBackgroundHidden);
  
  // Effet pour vérifier l'état des onglets au chargement
  React.useEffect(() => {
    console.log('🔄 [HybridSidebar] Vérification des onglets au chargement...');
    console.log('📋 Nombre total d\'onglets:', allTabs.length);
    console.log('📋 Onglets cachés:', safeHiddenTabs);
    console.log('📋 Onglets visibles:', tabs.map(t => t.id));
    
    // Vérifier si l'onglet 'background' est dans les onglets visibles
    const backgroundTab = tabs.find(tab => tab.id === 'background');
    console.log('🔍 Onglet background trouvé dans les onglets visibles:', !!backgroundTab);
    
    if (backgroundTab) {
      console.log('✅ L\'onglet Design est présent et visible');
    } else {
      console.warn('⚠️ L\'onglet Design est masqué ou non trouvé dans les onglets visibles');
    }
  }, [tabs, allTabs, safeHiddenTabs]);

  // Prefetch on hover/touch to smooth first paint
  const prefetchTab = (tabId: string) => {
    if (tabId === 'position') {
      loadPositionPanel();
    } else if (tabId === 'layers') {
      loadLayersPanel();
    }
  };

  // Theme variables to align with Home sidebar colors
  // Approximations in HSL for:
  // - background: #2c2c34 -> hsl(240 8% 19%)
  // - border: #4b5563 -> hsl(220 10% 34%)
  // - hover: #3f3f46 -> hsl(240 5% 26%)
  // - icon default: #d1d5db -> hsl(220 9% 72%)
  // - icon active/text primary: #ffffff -> hsl(0 0% 100%)
  // - active background (approx mid of gradient #841b60 -> #b41b60): use #9e1b60 -> hsl(326 70% 37%)
  // - active accent/border: #b41b60 -> hsl(336 75% 41%)
  const themeVars: React.CSSProperties = {
    // Container/backgrounds
    ['--sidebar-bg' as any]: '240 8% 19%',
    ['--sidebar-surface' as any]: '240 8% 16%',
    // Borders and hover
    ['--sidebar-border' as any]: '220 10% 34%',
    ['--sidebar-hover' as any]: '240 5% 26%',
    // Icons/text
    ['--sidebar-icon' as any]: '220 9% 72%',
    ['--sidebar-icon-active' as any]: '0 0% 100%',
    ['--sidebar-text-primary' as any]: '0 0% 100%',
    // Active states
    ['--sidebar-active-bg' as any]: '326 70% 37%',
    ['--sidebar-active' as any]: '336 75% 41%'
  } as React.CSSProperties;

  const handleTabClick = (tabId: string) => {
    console.log('🗂️ Clic sur onglet détecté:', tabId, 'État actuel:', activeTab);
    
    // Si on clique sur un onglet différent, fermer les panneaux spéciaux
    if (showEffectsPanel && tabId !== 'effects') {
      console.log('🗂️ Fermeture du panneau effects');
      onEffectsPanelChange?.(false);
    }
    if (showAnimationsPanel && tabId !== 'animations') {
      console.log('🗂️ Fermeture du panneau animations');
      onAnimationsPanelChange?.(false);
    }
    if (showPositionPanel && tabId !== 'position') {
      console.log('🗂️ Fermeture du panneau position');
      onPositionPanelChange?.(false);
    }
    if (showWheelPanel && tabId !== 'wheel') {
      console.log('🗂️ Fermeture du panneau roue');
      onWheelPanelChange?.(false);
    }
    
    if (activeTab === tabId) {
      console.log('🗂️ Fermeture de l\'onglet actif:', tabId);
      setActiveTab(null); // Close if clicking on active tab
    } else {
      console.log('🗂️ Ouverture du nouvel onglet:', tabId);
      setActiveTab(tabId);
      
      // Log supplémentaire pour le tab game
      if (tabId === 'game') {
        console.log('🎮 [GAME TAB] Onglet Jeu activé!');
        console.log('🎮 [GAME TAB] setActiveTab appelé avec:', tabId);
        setTimeout(() => {
          console.log('🎮 [GAME TAB] Vérification activeTab après timeout');
        }, 100);
      }
    }
  };

  const renderPanel = (tabId: string) => {
    console.log('🎯 [RENDER PANEL] Rendu du panneau pour:', tabId);
    switch (tabId) {
      case 'effects':
        return (
          <TextEffectsPanel 
            onBack={() => {
              onEffectsPanelChange?.(false);
              setActiveTab('elements');
            }}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
          />
        );
      case 'animations':
        return (
          <TextAnimationsPanel 
            onBack={() => {
              onAnimationsPanelChange?.(false);
              setActiveTab('elements');
            }}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
          />
        );
      case 'position':
        return (
          <React.Suspense fallback={<div className="p-4 text-sm text-gray-500">Chargement du panneau de position…</div>}>
            <LazyPositionPanel 
              onBack={() => {
                onPositionPanelChange?.(false);
                setActiveTab('elements');
              }}
              selectedElement={selectedElement}
              onElementUpdate={onElementUpdate}
              canvasRef={canvasRef}
            />
          </React.Suspense>
        );
      case 'wheel':
        return (
          <WheelConfigPanel
            onBack={() => {
              onWheelPanelChange?.(false);
              setActiveTab('elements');
            }}
            wheelBorderStyle={wheelBorderStyle || 'solid'}
            wheelBorderColor={wheelBorderColor || '#000000'}
            wheelBorderWidth={wheelBorderWidth || 2}
            wheelScale={wheelScale || 1}
            wheelShowBulbs={wheelShowBulbs || false}
            wheelPosition={wheelPosition || 'right'}
            onBorderStyleChange={(s) => onWheelBorderStyleChange?.(s)}
            onBorderColorChange={(c) => onWheelBorderColorChange?.(c)}
            onBorderWidthChange={(w) => onWheelBorderWidthChange?.(w)}
            onScaleChange={(s) => onWheelScaleChange?.(s)}
            onShowBulbsChange={(b) => onWheelShowBulbsChange?.(b)}
            onPositionChange={(p) => onWheelPositionChange?.(p)}
            selectedDevice={selectedDevice}
          />
        );
      case 'background':
        return (
          <div className="h-full overflow-y-auto">
            <BackgroundPanel 
              onBackgroundChange={onBackgroundChange || (() => {})} 
              onExtractedColorsChange={onExtractedColorsChange}
              currentBackground={currentBackground}
              extractedColors={extractedColors}
              selectedElement={selectedElement}
              onElementUpdate={onElementUpdate}
              colorEditingContext={colorEditingContext}
            />
          </div>
        );
      case 'elements':
        return <AssetsPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} selectedDevice={selectedDevice} />;
      case 'game':
        console.log('🔄 [GAME TAB] Début du rendu du panneau Jeu');
        console.log('🔄 [GAME TAB] activeTab:', activeTab);
        console.log('🔄 [GAME TAB] Création du contenu...');
        
        return (
          <div className="p-6 text-[hsl(var(--sidebar-text-primary))] min-h-full overflow-y-auto">
            <div className="bg-green-600/20 border border-green-500/50 text-green-100 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <div className="text-lg">🎮</div>
                <div>
                  <div className="font-semibold">Panneau de configuration du jeu</div>
                  <div className="text-sm opacity-80">Gérez les symboles et les paramètres du jeu</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Templates de cadres */}
              <div className="bg-[hsl(var(--sidebar-surface))] p-4 rounded-lg border border-[hsl(var(--sidebar-border))]">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span>🖼️</span>
                  <span>Templates de cadres</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { name: 'Jackpot Frame', file: 'jackpot-frame.svg', description: 'Cadre principal' },
                    { name: 'Jackpot 2', file: 'Jackpot 2.svg', description: 'Style vintage' },
                    { name: 'Jackpot 3', file: 'Jackpot 3.svg', description: 'Bordure néon rouge' },
                    { name: 'Jackpot 4', file: 'Jackpot 4.svg', description: 'Design orange moderne' },
                    { name: 'Jackpot 5', file: 'Jackpot 5.svg', description: 'Cadre doré lumineux' },
                    { name: 'Jackpot 6', file: 'Jackpot 6.svg', description: 'Style cylindre classique' }
                  ].map((template, idx) => (
                    <div 
                      key={idx} 
                      className="bg-[hsl(var(--sidebar-active-bg))] p-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border border-[hsl(var(--sidebar-border))] relative overflow-hidden"
                      title={template.description}
                      onClick={() => console.log('Template sélectionné:', template.name, template.file)}
                    >
                      <div className="text-center">
                        <div className="w-full h-16 mb-2 flex items-center justify-center bg-white/5 rounded">
                          <img 
                            src={`/assets/slot-frames/${template.file}`}
                            alt={template.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              console.log('Erreur de chargement:', template.file);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="text-xs font-medium text-[hsl(var(--sidebar-text-primary))]">{template.name}</div>
                        <div className="text-xs text-[hsl(var(--sidebar-text-secondary))] mt-1">{template.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    onClick={() => console.log('Importer template personnalisé')}
                  >
                    <span>📁</span>
                    <span>Importer SVG</span>
                  </button>
                </div>
              </div>

              <div className="bg-[hsl(var(--sidebar-surface))] p-4 rounded-lg border border-[hsl(var(--sidebar-border))]">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span>🎰</span>
                  <span>Symboles du jeu</span>
                </h3>
                
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'].map((symbol, idx) => (
                    <div 
                      key={idx} 
                      className="bg-[hsl(var(--sidebar-active-bg))] p-3 rounded-lg text-center text-2xl hover:opacity-90 transition-opacity cursor-pointer"
                      title={`Symbole ${idx + 1}`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    onClick={() => console.log('Ajouter un symbole')}
                  >
                    <span>+</span>
                    <span>Ajouter un symbole</span>
                  </button>
                  <button 
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    onClick={() => console.log('Importer des symboles')}
                  >
                    <span>📁</span>
                    <span>Importer</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-[hsl(var(--sidebar-surface))] p-4 rounded-lg border border-[hsl(var(--sidebar-border))]">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Paramètres du jeu</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--sidebar-text-secondary))] mb-1">
                      Difficulté
                    </label>
                    <select className="w-full bg-[hsl(var(--sidebar-bg))] border border-[hsl(var(--sidebar-border))] rounded-lg px-3 py-2 text-sm">
                      <option>Facile</option>
                      <option>Moyen</option>
                      <option>Difficile</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-[hsl(var(--sidebar-text-secondary))]">
                      Activer les effets sonores
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'form':
        return (
          <div className="p-4">
            <ModernFormTab 
              campaign={campaign}
              setCampaign={setCampaign as any}
            />
          </div>
        );
      case 'layers':
        return (
          <React.Suspense fallback={<div className="p-4 text-sm text-gray-500">Chargement des calques…</div>}>
            <LazyLayersPanel 
              elements={elements} 
              onElementsChange={onElementsChange || (() => {})} 
              selectedElements={selectedElements}
              onSelectedElementsChange={onSelectedElementsChange}
              onAddToHistory={onAddToHistory}
            />
          </React.Suspense>
        );
      default:
        return null;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col" style={themeVars}>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-4 hover:bg-[hsl(var(--sidebar-hover))] border-b border-[hsl(var(--sidebar-border))]"
          title="Développer la sidebar"
        >
          <ChevronRight className="w-5 h-5 text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]" />
        </button>
        
        {/* Collapsed Icons */}
        <div className="flex flex-col space-y-2 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  console.log('🗂️ Clic sur onglet réduit:', tab.id);
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCollapsed(false);
                  setActiveTab(tab.id);
                }}
                onMouseEnter={() => prefetchTab(tab.id)}
                onTouchStart={() => prefetchTab(tab.id)}
                onMouseDown={(e) => {
                  console.log('🗂️ MouseDown sur onglet réduit:', tab.id);
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-icon-active))]'
                    : 'text-[hsl(var(--sidebar-icon))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-icon-active))]'
                }`}
                title={tab.label}
                style={{ 
                  pointerEvents: 'auto',
                  userSelect: 'none'
                }}
              >
                <Icon className="w-5 h-5" style={{ pointerEvents: 'none' }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Vertical Tab Sidebar */}
      <div className="w-20 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col shadow-sm min-h-0" style={themeVars}>
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-3 hover:bg-[hsl(var(--sidebar-hover))] border-b border-[hsl(var(--sidebar-border))] transition-all duration-200"
          title="Réduire la sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]" />
        </button>
        
        {/* Vertical Tabs */}
        <div className="flex flex-col flex-1">
          {(() => {
            console.log('📊 Rendu des onglets:', tabs.map(t => t.id));
            return null;
          })()}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  console.log('🗂️ Événement clic sur bouton onglet:', tab.id);
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabClick(tab.id);
                }}
                onMouseEnter={() => prefetchTab(tab.id)}
                onMouseDown={(e) => {
                  console.log('🗂️ Événement mouseDown sur bouton onglet:', tab.id);
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  console.log('🗂️ Événement touchStart sur bouton onglet:', tab.id);
                  prefetchTab(tab.id);
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`p-4 flex flex-col items-center justify-center border-b border-[hsl(var(--sidebar-border))] transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-icon-active))] border-r-2 border-r-[hsl(var(--sidebar-active))] shadow-sm' 
                    : 'text-[hsl(var(--sidebar-icon))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-icon-active))]'
                }`}
                title={tab.label}
                style={{ 
                  pointerEvents: 'auto',
                  userSelect: 'none'
                }}
              >
                <Icon className="w-6 h-6 mb-1" style={{ pointerEvents: 'none' }} />
                <span className="text-xs font-medium" style={{ pointerEvents: 'none' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Content */}
      {(() => {
        console.log('🎯 [PANEL WRAPPER] activeTab:', activeTab);
        console.log('🎯 [PANEL WRAPPER] Condition activeTab &&:', activeTab && true);
        return null;
      })()}
      {activeTab && (
        <div className="w-80 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col h-full min-h-0 shadow-sm">
          {/* Panel Header */}
          <div className="p-6 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))]">
            <h2 className="font-semibold text-[hsl(var(--sidebar-text-primary))] font-inter">
              {activeTab === 'effects' ? 'Effets de texte' : 
               activeTab === 'animations' ? 'Animations de texte' : 
               activeTab === 'position' ? 'Position' : 
               activeTab === 'wheel' ? 'Roue de fortune' : 
               activeTab === 'game' ? 'Jeu' :
               tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
          </div>

          {/* Panel Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {(() => {
              console.log('🎯 [PANEL CONTENT] Rendu du contenu pour activeTab:', activeTab);
              console.log('🎯 [PANEL CONTENT] activeTab === "game":', activeTab === 'game');
              const panelContent = renderPanel(activeTab);
              console.log('🎯 [PANEL CONTENT] Contenu généré:', panelContent ? 'OUI' : 'NON');
              console.log('🎯 [PANEL CONTENT] Type du contenu:', typeof panelContent);
              return panelContent;
            })()}
          </div>
        </div>
      )}
    </div>
  );
});

// Ajouter displayName pour le débogage
HybridSidebar.displayName = 'HybridSidebar';

export default HybridSidebar;