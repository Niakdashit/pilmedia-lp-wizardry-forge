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
import ModernFormTab from '../ModernEditor/ModernFormTab';
import QuizManagementPanel from './panels/QuizManagementPanel';
import { useEditorStore } from '../../stores/editorStore';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';

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
  quizWidth?: string;
  quizMobileWidth?: string;
  selectedQuizTemplate?: string;
  // Style properties that need to be available
  backgroundColor?: string;
  backgroundOpacity?: number;
  textColor?: string;
  width?: string;
  mobileWidth?: string;
  // Button colors
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonHoverBackgroundColor?: string;
  buttonActiveBackgroundColor?: string;
  onQuizWidthChange?: (width: string) => void;
  onQuizMobileWidthChange?: (width: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  onBackgroundOpacityChange?: (opacity: number) => void;
  onTextColorChange?: (color: string) => void;
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
  const setCampaign = useEditorStore((s) => s.setCampaign);
  
  // Détecter si l'appareil est réellement mobile via l'user-agent plutôt que la taille de la fenêtre
  React.useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    // Exposer la fonction pour forcer l'onglet Elements si elle est fournie
    if (onForceElementsTab) {
      (window as any).forceElementsTab = onForceElementsTab;
    }

    const deviceOverride = getEditorDeviceOverride();
    if (deviceOverride === 'desktop') {
      setIsCollapsed(false);
      return;
    }

    if (/Mobi|Android/i.test(ua)) {
      setIsCollapsed(true);
    }
  }, [onForceElementsTab]);
  const [activeTab, _setActiveTab] = useState<string | null>('elements');
  
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
      label: 'Jeu', 
      icon: Gamepad2
    }
  ];
  
  // Vérifier si hiddenTabs est défini et est un tableau
  const safeHiddenTabs = Array.isArray(hiddenTabs) ? hiddenTabs : [];
  
  const tabs = allTabs.filter(tab => {
    const isHidden = safeHiddenTabs.includes(tab.id);
    return !isHidden;
  });
  
  // Ensure a valid default active tab on mount and when visible tabs change
  React.useEffect(() => {
    const backgroundVisible = tabs.some(t => t.id === 'background');
    const activeIsVisible = activeTab ? tabs.some(t => t.id === activeTab) : false;
    if (!activeIsVisible) {
      _setActiveTab(backgroundVisible ? 'background' : (tabs[0]?.id ?? null));
    }
  }, [tabs]);

  // Prefetch on hover/touch to smooth first paint
  const prefetchTab = (tabId: string) => {
    if (tabId === 'position') {
      loadPositionPanel();
    } else if (tabId === 'layers') {
      loadLayersPanel();
    }
  };

  // Theme variables to align with Home sidebar colors
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
    // Si on clique sur un onglet différent, fermer les panneaux spéciaux
    if (showEffectsPanel && tabId !== 'effects') {
      onEffectsPanelChange?.(false);
    }
    if (showAnimationsPanel && tabId !== 'animations') {
      onAnimationsPanelChange?.(false);
    }
    if (showPositionPanel && tabId !== 'position') {
      onPositionPanelChange?.(false);
    }
    if (showQuizPanel && tabId !== 'quiz') {
      onQuizPanelChange?.(false);
    }
    
    if (activeTab === tabId) {
      setActiveTab(null); // Close if clicking on active tab
    } else {
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
            quizWidth={(campaign?.design?.quizConfig as any)?.style?.width ?? '800px'}
            quizMobileWidth={(campaign?.design?.quizConfig as any)?.style?.mobileWidth ?? '400px'}
            backgroundColor={(campaign?.design?.quizConfig as any)?.style?.backgroundColor ?? '#ffffff'}
            backgroundOpacity={(campaign?.design?.quizConfig as any)?.style?.backgroundOpacity ?? 100}
            textColor={(campaign?.design?.quizConfig as any)?.style?.textColor ?? '#000000'}
            buttonBackgroundColor={(campaign?.design?.quizConfig as any)?.style?.buttonBackgroundColor ?? '#f3f4f6'}
            buttonTextColor={(campaign?.design?.quizConfig as any)?.style?.buttonTextColor ?? '#000000'}
            buttonHoverBackgroundColor={(campaign?.design?.quizConfig as any)?.style?.buttonHoverBackgroundColor ?? '#9fa4a4'}
            buttonActiveBackgroundColor={(campaign?.design?.quizConfig as any)?.style?.buttonActiveBackgroundColor ?? '#a7acb5'}
            onQuizWidthChange={(width: string) => {
              setCampaign((prev: any) => {
                if (!prev) return null;
                return {
                  ...prev,
                  name: prev.name || 'Campaign',
                  design: {
                    ...prev.design,
                    quizConfig: {
                      ...prev.design?.quizConfig,
                      style: {
                        ...prev.design?.quizConfig?.style,
                        width
                      }
                    }
                  }
                };
              });
            }}
            onQuizMobileWidthChange={(width: string) => {
              setCampaign((prev: any) => {
                if (!prev) return null;
                return {
                  ...prev,
                  name: prev.name || 'Campaign',
                  design: {
                    ...prev.design,
                    quizConfig: {
                      ...prev.design?.quizConfig,
                      style: {
                        ...prev.design?.quizConfig?.style,
                        mobileWidth: width
                      }
                    }
                  }
                };
              });
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
          <div className="h-full overflow-y-auto">
            <QuizManagementPanel 
              campaign={campaign}
              setCampaign={setCampaign}
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
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-4 hover:bg-[hsl(var(--sidebar-hover))] border-b border-[hsl(var(--sidebar-border))]"
          title="Développer la sidebar"
        >
          <ChevronRight className="w-5 h-5 text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]" />
        </button>
        
        <div className="flex flex-col space-y-2 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCollapsed(false);
                  setActiveTab(tab.id);
                }}
                onMouseEnter={() => prefetchTab(tab.id)}
                onTouchStart={() => prefetchTab(tab.id)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-icon-active))]'
                    : 'text-[hsl(var(--sidebar-icon))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-icon-active))]'
                }`}
                title={tab.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="w-20 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col shadow-sm min-h-0" style={themeVars}>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-3 hover:bg-[hsl(var(--sidebar-hover))] border-b border-[hsl(var(--sidebar-border))] transition-all duration-200"
          title="Réduire la sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]" />
        </button>
        
        <div className="flex flex-col flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabClick(tab.id);
                }}
                onMouseEnter={() => prefetchTab(tab.id)}
                onTouchStart={() => prefetchTab(tab.id)}
                className={`p-4 flex flex-col items-center justify-center border-b border-[hsl(var(--sidebar-border))] transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-icon-active))] border-r-2 border-r-[hsl(var(--sidebar-active))] shadow-sm' 
                    : 'text-[hsl(var(--sidebar-icon))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-icon-active))]'
                }`}
                title={tab.label}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab && (
        <div className="w-80 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col h-full min-h-0 shadow-sm">
          <div className="p-6 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))]">
            <h2 className="font-semibold text-[hsl(var(--sidebar-text-primary))] font-inter">
              {activeTab === 'effects' ? 'Effets de texte' : 
               activeTab === 'animations' ? 'Animations de texte' : 
               activeTab === 'position' ? 'Position' : 
               activeTab === 'quiz' ? 'Configuration Quiz' : 
               tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {renderPanel(activeTab)}
          </div>
        </div>
      )}
    </div>
  );
});

HybridSidebar.displayName = 'HybridSidebar';

export default HybridSidebar;