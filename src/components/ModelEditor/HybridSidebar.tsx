import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  FormInput,
  Gamepad2,
  Palette
} from 'lucide-react';
import BackgroundPanel from '../DesignEditor/panels/BackgroundPanel';
import AssetsPanel from '../DesignEditor/panels/AssetsPanel';
import TextEffectsPanel from '../DesignEditor/panels/TextEffectsPanel';
import TextAnimationsPanel from '../DesignEditor/panels/TextAnimationsPanel';
import QuizConfigPanel from './panels/QuizConfigPanel';
import JackpotConfigPanel from '../SlotJackpot/panels/JackpotConfigPanel';
import ModernFormTab from '../ModernEditor/ModernFormTab';
import TabJackpot from '../configurators/TabJackpot';
import TabForm from '../configurators/TabForm';
import { useEditorStore } from '../../stores/editorStore';


// Lazy-loaded heavy panels
const loadPositionPanel = () => import('../DesignEditor/panels/PositionPanel');
const loadLayersPanel = () => import('../DesignEditor/panels/LayersPanel');

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
  // Inline quiz panel controls
  showQuizPanel?: boolean;
  onQuizPanelChange?: (show: boolean) => void;
  // Inline jackpot panel controls
  showJackpotPanel?: boolean;
  onJackpotPanelChange?: (show: boolean) => void;
  // Design panel controls
  showDesignPanel?: boolean;
  onDesignPanelChange?: (show: boolean) => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
  // Props pour le système de groupes
  selectedElements?: any[];
  onSelectedElementsChange?: (elements: any[]) => void;
  onAddToHistory?: (snapshot: any) => void;
  // Quiz config values & callbacks (provided by parent)
  quizQuestionCount?: number;
  quizTimeLimit?: number;
  quizDifficulty?: 'easy' | 'medium' | 'hard';
  quizBorderRadius?: number;
  selectedQuizTemplate?: string;
  // Quiz layout properties
  quizWidth?: string;
  onQuizWidthChange?: (width: string) => void;
  quizMobileWidth?: string;
  onQuizMobileWidthChange?: (width: string) => void;
  backgroundColor?: string;
  backgroundOpacity?: number;
  textColor?: string;
  // Button colors
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonHoverBackgroundColor?: string;
  buttonActiveBackgroundColor?: string;
  onButtonBackgroundColorChange?: (color: string) => void;
  onButtonTextColorChange?: (color: string) => void;
  onButtonHoverBackgroundColorChange?: (color: string) => void;
  onButtonActiveBackgroundColorChange?: (color: string) => void;
  onQuizQuestionCountChange?: (count: number) => void;
  onQuizTimeLimitChange?: (time: number) => void;
  onQuizDifficultyChange?: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onQuizBorderRadiusChange?: (radius: number) => void;
  onQuizTemplateChange?: (templateId: string) => void;
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
  quizBorderRadius,
  onQuizBorderRadiusChange,
  showQuizPanel = false,
  onQuizPanelChange,
  showJackpotPanel = false,
  onJackpotPanelChange,
  showDesignPanel = false,
  onDesignPanelChange,
  canvasRef,
  selectedElements = [],
  onSelectedElementsChange,
  onAddToHistory,
  quizQuestionCount = 5,
  quizTimeLimit = 30,
  quizDifficulty = 'medium',
  selectedQuizTemplate,
  onQuizQuestionCountChange,
  onQuizTimeLimitChange,
  onQuizDifficultyChange,
  onQuizTemplateChange,
  selectedDevice = 'desktop',
  hiddenTabs = [],
  onForceElementsTab,
  colorEditingContext
}: HybridSidebarProps, ref) => {
  // Détecter si on est sur mobile avec un hook React pour éviter les erreurs hydration
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Centralized campaign state (Zustand)
  const campaign = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign) as unknown as (updater: any) => void;
  // Jackpot symbols management
  const jackpotSymbols = (campaign as any)?.gameConfig?.jackpot?.symbols || ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝', '🍒'];
  const jackpotTemplate = (campaign as any)?.gameConfig?.jackpot?.template || 'jackpot-frame';
  const jackpotStyle = (campaign as any)?.gameConfig?.jackpot?.style || {};
  const customFrame = (campaign as any)?.gameConfig?.jackpot?.customFrame || {
    frameColor: '#f4d555',
    backgroundColor: '#c1ae44',
    showBorder: true,
    borderColor: '#b8860b',
    frameThickness: 5
  };
  const customTemplateUrl = (campaign as any)?.gameConfig?.jackpot?.customTemplateUrl || '';
  const jackpotBorderColor = jackpotStyle.borderColor || '#ffd700';
  const jackpotBackgroundColor = jackpotStyle.backgroundColor || '#ffffff';
  const jackpotTextColor = jackpotStyle.textColor || '#333333';

  const handleJackpotSymbolsChange = (symbols: string[]) => {
    setCampaign((prev: any) => {
      const base = prev || {};
      return {
        ...base,
        gameConfig: {
          ...(base.gameConfig || {}),
          jackpot: {
            ...(base.gameConfig?.jackpot || {}),
            symbols
          }
        }
      };
    });
  };

  const handleCustomTemplateChange = (url: string) => {
    setCampaign((prev: any) => {
      const base = prev || {};
      return {
        ...base,
        gameConfig: {
          ...(base.gameConfig || {}),
          jackpot: {
            ...(base.gameConfig?.jackpot || {}),
            customTemplateUrl: url
          }
        }
      };
    });
  };

  const handleCustomFrameChange = (updates: Partial<typeof customFrame>) => {
    setCampaign((prev: any) => {
      const base = prev || {};
      return {
        ...base,
        gameConfig: {
          ...(base.gameConfig || {}),
          jackpot: {
            ...(base.gameConfig?.jackpot || {}),
            customFrame: {
              ...(base.gameConfig?.jackpot?.customFrame || {}),
              ...updates
            }
          }
        }
      };
    });
  };

  const handleJackpotTemplateChange = (templateId: string) => {
    console.log('🎰 [HybridSidebar] handleJackpotTemplateChange called with:', templateId);
    setCampaign((prev: any) => {
      const base = prev || {};
      const defaults = {
        frameColor: '#f4d555',
        backgroundColor: '#c1ae44',
        showBorder: true,
        borderColor: '#b8860b',
        frameThickness: 5
      };
      const existingCF = base?.gameConfig?.jackpot?.customFrame || {};
      const needsCustomDefaults = templateId === 'custom-frame' && (
        !base?.gameConfig?.jackpot?.customFrame ||
        Object.keys(defaults).some((k) => (existingCF as any)[k] === undefined)
      );
      const updated = {
        ...base,
        gameConfig: {
          ...(base.gameConfig || {}),
          jackpot: {
            ...(base.gameConfig?.jackpot || {}),
            template: templateId,
            ...(needsCustomDefaults
              ? {
                  customFrame: { ...defaults, ...existingCF }
                }
              : {})
          }
        }
      };
      console.log('🎰 [HybridSidebar] Updated campaign:', updated);
      return updated;
    });
  };

  const handleJackpotBorderColorChange = (color: string) => {
    setCampaign((prev: any) => {
      const base = prev || {};
      return {
        ...base,
        gameConfig: {
          ...(base.gameConfig || {}),
          jackpot: {
            ...(base.gameConfig?.jackpot || {}),
            style: {
              ...(base.gameConfig?.jackpot?.style || {}),
              borderColor: color
            }
          }
        }
      };
    });
  };

  const handleJackpotBackgroundColorChange = (color: string) => {
    setCampaign((prev: any) => {
      const base = prev || {};
      return {
        ...base,
        gameConfig: {
          ...(base.gameConfig || {}),
          jackpot: {
            ...(base.gameConfig?.jackpot || {}),
            style: {
              ...(base.gameConfig?.jackpot?.style || {}),
              backgroundColor: color
            }
          }
        }
      };
    });
  };

  const handleJackpotTextColorChange = (color: string) => {
    setCampaign((prev: any) => {
      const base = prev || {};
      return {
        ...base,
        gameConfig: {
          ...(base.gameConfig || {}),
          jackpot: {
            ...(base.gameConfig?.jackpot || {}),
            style: {
              ...(base.gameConfig?.jackpot?.style || {}),
              textColor: color
            }
          }
        }
      };
    });
  };
  
  // Détecter si l'appareil est réellement mobile via l'user-agent plutôt que la taille de la fenêtre
  React.useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    
    // Exposer la fonction pour forcer l'onglet Elements si elle est fournie
    if (onForceElementsTab) {
      (window as any).forceElementsTab = onForceElementsTab;
    }
    
    if (/Mobi|Android/i.test(ua)) {
      setIsCollapsed(true);
    }
  }, []);

  // Si le template actuel est 'custom-frame', fusionner les valeurs manquantes avec les défauts pour refléter visuellement
  React.useEffect(() => {
    if (jackpotTemplate === 'custom-frame') {
      const defaults = {
        frameColor: '#f4d555',
        backgroundColor: '#c1ae44',
        showBorder: true,
        borderColor: '#b8860b',
        frameThickness: 5
      };
      const currentCF = (campaign as any)?.gameConfig?.jackpot?.customFrame || {};
      const needsUpdate = Object.keys(defaults).some((k) => (currentCF as any)[k] === undefined);
      if (needsUpdate) {
        setCampaign((prev: any) => {
          const base = prev || {};
          return {
            ...base,
            gameConfig: {
              ...(base.gameConfig || {}),
              jackpot: {
                ...(base.gameConfig?.jackpot || {}),
                customFrame: { ...defaults, ...currentCF }
              }
            }
          };
        });
      }
    }
  }, [jackpotTemplate]);

  const [activeTab, _setActiveTab] = useState<string | null>('elements');

  // Gestion des changements de showJackpotPanel
  React.useEffect(() => {
    if (showJackpotPanel) {
      _setActiveTab('jackpot');
    } else if (activeTab === 'jackpot') {
      _setActiveTab('elements');
    }
  }, [showJackpotPanel]);
  
  // Gestion des changements d'onglet
  React.useEffect(() => {
    if (activeTab === 'jackpot') {
      onJackpotPanelChange?.(true);
    } else if (activeTab !== 'jackpot' && showJackpotPanel) {
      onJackpotPanelChange?.(false);
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (showQuizPanel) {
      _setActiveTab('quiz');
    } else if (activeTab === 'quiz') {
      _setActiveTab('elements');
    }
  }, [showQuizPanel, activeTab]);
  
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
      } else if (tab === 'quiz') {
        onQuizPanelChange?.(true);
      }
    }
  }), [onDesignPanelChange, onEffectsPanelChange, onAnimationsPanelChange, onPositionPanelChange, onQuizPanelChange]);
  
  // Fonction interne pour gérer le changement d'onglet
  const setActiveTab = (tab: string | null) => {
    if (tab === activeTab) return; // Éviter les mises à jour inutiles
    _setActiveTab(tab);
  };
  
  // Référence pour suivre les états précédents
  const prevStatesRef = useRef({
    showEffectsPanel,
    showAnimationsPanel,
    showPositionPanel,
    showQuizPanel,
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
      { key: 'quiz', active: showQuizPanel, prevActive: prev.showQuizPanel },
      { key: 'background', active: showDesignPanel, prevActive: prev.showDesignPanel }
    ];

    // Si le panneau Quiz est activé, forcer l'onglet quiz
    if (showQuizPanel && !prev.showQuizPanel) {
      newActiveTab = 'quiz';
      shouldUpdate = true;
    }
    // Si le panneau Design est activé, forcer l'onglet background
    else if (showDesignPanel && !prev.showDesignPanel) {
      newActiveTab = 'background';
      shouldUpdate = true;
    } 
    // Si un autre panneau a été activé, basculer vers son onglet correspondant
    else {
      const activatedPanel = panelStates.find(p => p.active && !p.prevActive && p.key !== 'background' && p.key !== 'quiz');
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
      showQuizPanel,
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
    showQuizPanel,
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
      id: 'form', 
      label: 'Formulaire', 
      icon: FormInput
    },
    { 
      id: 'game', 
      label: 'Jackpot', 
      icon: Gamepad2
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
    if (showQuizPanel && tabId !== 'quiz') {
      console.log('🗂️ Fermeture du panneau quiz');
      onQuizPanelChange?.(false);
    }
    
    if (activeTab === tabId) {
      console.log('🗂️ Fermeture de l\'onglet actif:', tabId);
      setActiveTab(null); // Close if clicking on active tab
    } else {
      console.log('🗂️ Ouverture du nouvel onglet:', tabId);
      setActiveTab(tabId);
    }
  };

  const renderPanel = (tabId: string) => {
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
      case 'game':
        // Restore the original Game tab to control form preview styles (fond, bordures, couleurs, police, rayon, position, largeur, hauteur)
        return (
          <div className="p-0">
            <TabForm campaign={campaign} setCampaign={setCampaign as any} />
          </div>
        );
      case 'jackpot':
        return (
          <JackpotConfigPanel
            onBack={() => {
              onJackpotPanelChange?.(false);
              _setActiveTab('elements');
            }}
            reelSymbols={jackpotSymbols}
            onReelSymbolsChange={handleJackpotSymbolsChange}
            selectedTemplate={jackpotTemplate}
            onTemplateChange={handleJackpotTemplateChange}
            borderColor={jackpotBorderColor}
            backgroundColor={jackpotBackgroundColor}
            textColor={jackpotTextColor}
            onBorderColorChange={handleJackpotBorderColorChange}
            onBackgroundColorChange={handleJackpotBackgroundColorChange}
            onTextColorChange={handleJackpotTextColorChange}
            customFrame={customFrame}
            onCustomFrameChange={handleCustomFrameChange}
            customTemplateUrl={customTemplateUrl}
            onCustomTemplateChange={handleCustomTemplateChange}
          />
        );
      case 'quiz':
        return (
          <QuizConfigPanel
            onBack={() => {
              onQuizPanelChange?.(false);
              setActiveTab('elements');
            }}
            quizQuestionCount={quizQuestionCount || 5}
            quizTimeLimit={quizTimeLimit || 30}
            quizDifficulty={quizDifficulty || 'medium'}
            quizBorderRadius={quizBorderRadius}
            selectedTemplate={selectedQuizTemplate}
            onQuestionCountChange={(c) => onQuizQuestionCountChange?.(c)}
            onTimeLimitChange={(t) => onQuizTimeLimitChange?.(t)}
            onDifficultyChange={(d) => onQuizDifficultyChange?.(d)}
            onBorderRadiusChange={(r) => onQuizBorderRadiusChange?.(r)}
            onTemplateChange={(template) => onQuizTemplateChange?.(template.id)}
            // Zoom controls wiring
            quizWidth={(campaign as any)?.design?.quizConfig?.style?.width ?? `${(campaign as any)?.design?.quizConfig?.style?.containerWidth || 800}px`}
            quizMobileWidth={(campaign as any)?.design?.quizConfig?.style?.mobileWidth ?? `${(campaign as any)?.design?.quizConfig?.style?.mobileContainerWidth || 400}px`}
            // Color controls (with safe defaults for panel display)
            backgroundColor={(campaign as any)?.design?.quizConfig?.style?.backgroundColor ?? '#ffffff'}
            backgroundOpacity={(campaign as any)?.design?.quizConfig?.style?.backgroundOpacity ?? 100}
            textColor={(campaign as any)?.design?.quizConfig?.style?.textColor ?? '#000000'}
            buttonBackgroundColor={(campaign as any)?.design?.quizConfig?.style?.buttonBackgroundColor ?? '#f3f4f6'}
            buttonTextColor={(campaign as any)?.design?.quizConfig?.style?.buttonTextColor ?? '#000000'}
            buttonHoverBackgroundColor={(campaign as any)?.design?.quizConfig?.style?.buttonHoverBackgroundColor ?? '#9fa4a4'}
            buttonActiveBackgroundColor={(campaign as any)?.design?.quizConfig?.style?.buttonActiveBackgroundColor ?? '#a7acb5'}
            onQuizWidthChange={(width) => {
              setCampaign((prev: any) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  design: {
                    ...prev?.design,
                    quizConfig: {
                      ...(prev?.design as any)?.quizConfig,
                      style: {
                        ...((prev?.design as any)?.quizConfig?.style || {}),
                        width
                      }
                    }
                  }
                };
              });
              window.dispatchEvent(new CustomEvent('quizStyleUpdate', { detail: { width } }));
            }}
            onQuizMobileWidthChange={(width) => {
              setCampaign((prev: any) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  design: {
                    ...prev?.design,
                    quizConfig: {
                      ...(prev?.design as any)?.quizConfig,
                      style: {
                        ...((prev?.design as any)?.quizConfig?.style || {}),
                        mobileWidth: width
                      }
                    }
                  }
                };
              });
              window.dispatchEvent(new CustomEvent('quizStyleUpdate', { detail: { mobileWidth: width } }));
            }}
            onBackgroundColorChange={(color) => {
              setCampaign((prev: any) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  design: {
                    ...prev.design,
                    quizConfig: {
                      ...(prev.design as any)?.quizConfig,
                      style: {
                        ...((prev.design as any)?.quizConfig?.style || {}),
                        backgroundColor: color
                      }
                    }
                  }
                };
              });
              // Notify preview to re-render
              window.dispatchEvent(new CustomEvent('quizStyleUpdate', { 
                detail: { 
                  backgroundColor: color,
                  buttonBackgroundColor: (campaign as any)?.design?.quizConfig?.style?.buttonBackgroundColor,
                  buttonTextColor: (campaign as any)?.design?.quizConfig?.style?.buttonTextColor,
                  buttonHoverBackgroundColor: (campaign as any)?.design?.quizConfig?.style?.buttonHoverBackgroundColor,
                  buttonActiveBackgroundColor: (campaign as any)?.design?.quizConfig?.style?.buttonActiveBackgroundColor
                } 
              }));
            }}
            onBackgroundOpacityChange={(opacity) => {
              setCampaign((prev: any) => ({
                ...prev,
                design: {
                  ...prev.design,
                  quizConfig: {
                    ...(prev.design as any).quizConfig,
                    style: {
                      ...((prev.design as any).quizConfig?.style || {}),
                      backgroundOpacity: opacity
                    }
                  }
                }
              }));
              // Notify preview to re-render
              window.dispatchEvent(new CustomEvent('quizStyleUpdate', { 
                detail: { 
                  backgroundOpacity: opacity
                } 
              }));
            }}
            onTextColorChange={(color) => {
              setCampaign((prev: any) => ({
                ...prev,
                design: {
                  ...prev.design,
                  quizConfig: {
                    ...(prev.design as any).quizConfig,
                    style: {
                      ...((prev.design as any).quizConfig?.style || {}),
                      textColor: color
                    }
                  }
                }
              }));
              window.dispatchEvent(new CustomEvent('quizStyleUpdate', { 
                detail: { 
                  textColor: color,
                  buttonTextColor: (campaign as any)?.design?.quizConfig?.style?.buttonTextColor
                } 
              }));
            }}
            onButtonBackgroundColorChange={(color) => {
              setCampaign((prev: any) => ({
                ...prev,
                design: {
                  ...prev.design,
                  quizConfig: {
                    ...(prev.design as any).quizConfig,
                    style: {
                      ...((prev.design as any).quizConfig?.style || {}),
                      buttonBackgroundColor: color
                    }
                  }
                }
              }));
              window.dispatchEvent(new CustomEvent('quizStyleUpdate', { 
                detail: { buttonBackgroundColor: color } 
              }));
            }}
            onButtonTextColorChange={(color) => {
              setCampaign((prev: any) => ({
                ...prev,
                design: {
                  ...prev.design,
                  quizConfig: {
                    ...(prev.design as any).quizConfig,
                    style: {
                      ...((prev.design as any).quizConfig?.style || {}),
                      buttonTextColor: color
                    }
                  }
                }
              }));
              window.dispatchEvent(new CustomEvent('quizStyleUpdate', { 
                detail: { buttonTextColor: color } 
              }));
            }}
            onButtonHoverBackgroundColorChange={(color) => {
              setCampaign((prev: any) => ({
                ...prev,
                design: {
                  ...prev.design,
                  quizConfig: {
                    ...(prev.design as any).quizConfig,
                    style: {
                      ...((prev.design as any).quizConfig?.style || {}),
                      buttonHoverBackgroundColor: color
                    }
                  }
                }
              }));
              window.dispatchEvent(new CustomEvent('quizStyleUpdate', { 
                detail: { buttonHoverBackgroundColor: color } 
              }));
            }}
            onButtonActiveBackgroundColorChange={(color) => {
              setCampaign((prev: any) => ({
                ...prev,
                design: {
                  ...prev.design,
                  quizConfig: {
                    ...(prev.design as any).quizConfig,
                    style: {
                      ...((prev.design as any).quizConfig?.style || {}),
                      buttonActiveBackgroundColor: color
                    }
                  }
                }
              }));
              window.dispatchEvent(new CustomEvent('quizStyleUpdate', { 
                detail: { buttonActiveBackgroundColor: color } 
              }));
            }}
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
        return (
          <div className="h-full overflow-y-auto p-4">
            <TabJackpot 
              campaign={campaign}
              setCampaign={setCampaign as any}
            />
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
                  userSelect: 'text'
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
                  userSelect: 'text'
                }}
              >
                <Icon className="w-6 h-6 mb-1" style={{ pointerEvents: 'none' }} />
                <span className="text-xs font-medium select-text" style={{ pointerEvents: 'none' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Content */}
      {activeTab && (
        <div className="w-80 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col h-full min-h-0 shadow-sm">
          {/* Panel Header */}
          <div className="p-6 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))]">
            <h2 className="font-semibold text-[hsl(var(--sidebar-text-primary))] font-inter select-text">
              {activeTab === 'effects' ? 'Effets de texte' : 
               activeTab === 'animations' ? 'Animations de texte' : 
               activeTab === 'position' ? 'Position' : 
               activeTab === 'quiz' ? 'Configuration Quiz' : 
               tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
          </div>

          {/* Panel Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {renderPanel(activeTab)}
          </div>
        </div>
      )}
    </div>
  );
});

// Ajouter displayName pour le débogage
HybridSidebar.displayName = 'HybridSidebar';

export default HybridSidebar;