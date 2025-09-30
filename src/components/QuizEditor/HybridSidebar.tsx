import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Gamepad2,
  Palette,
  FormInput
} from 'lucide-react';
import BackgroundPanel from './panels/BackgroundPanel';
import CompositeElementsPanel from './modules/CompositeElementsPanel';
import TextEffectsPanel from './panels/TextEffectsPanel';
import ImageModulePanel from './modules/ImageModulePanel';
import ButtonModulePanel from './modules/ButtonModulePanel';
import VideoModulePanel from './modules/VideoModulePanel';
import SocialModulePanel from './modules/SocialModulePanel';
import HtmlModulePanel from './modules/HtmlModulePanel';
import QuizConfigPanel from './panels/QuizConfigPanel';
import ModernFormTab from '../ModernEditor/ModernFormTab';
import QuizManagementPanel from './panels/QuizManagementPanel';
import { useEditorStore } from '../../stores/editorStore';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';
import { quizTemplates } from '../../types/quizTemplates';
import type { Module, BlocImage } from '@/types/modularEditor';

// Lazy-loaded heavy panels
const loadPositionPanel = () => import('../DesignEditor/panels/PositionPanel');
const loadAnimationsPanel = () => import('./panels/TextAnimationsPanel');

const LazyPositionPanel = React.lazy(loadPositionPanel);
const LazyAnimationsPanel = React.lazy(loadAnimationsPanel);

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
  // Tab state controls
  activeTab?: string | null;
  onActiveTabChange?: (tab: string | null) => void;
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
  launchButtonStyles?: React.CSSProperties | null;
  launchButtonText?: string;
  onLaunchButtonStyleChange?: (styles: Partial<React.CSSProperties>) => void;
  onLaunchButtonTextChange?: (text: string) => void;
  onLaunchButtonReset?: () => void;
  selectedModuleId?: string | null;
  selectedModule?: Module | null;
  onModuleUpdate?: (id: string, patch: Partial<Module>) => void;
  onSelectedModuleChange?: (moduleId: string | null) => void;
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
  // Modular editor props
  currentScreen?: 'screen1' | 'screen2' | 'screen3';
  onAddModule?: (screen: 'screen1' | 'screen2' | 'screen3', module: any) => void;
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
  onQuizTemplateChange: handleQuizTemplateChange,
  onQuizWidthChange: handleQuizWidthChange,
  onQuizMobileWidthChange: handleQuizMobileWidthChange,
  selectedDevice = 'desktop',
  hiddenTabs = [],
  onForceElementsTab,
  colorEditingContext,
  launchButtonStyles,
  launchButtonText,
  onLaunchButtonStyleChange,
  onLaunchButtonTextChange,
  onLaunchButtonReset,
  selectedModuleId,
  selectedModule,
  onModuleUpdate,
  onSelectedModuleChange,
  activeTab,
  onActiveTabChange,
  // modular editor
  currentScreen,
  onAddModule
}: HybridSidebarProps, ref) => {
  // Détecter si on est sur mobile avec un hook React pour éviter les erreurs hydration
  const [isCollapsed, setIsCollapsed] = useState(selectedDevice === 'mobile');
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

  // Auto-expand when opening the transient Effects panel
  React.useEffect(() => {
    if (showEffectsPanel && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [showEffectsPanel, isCollapsed]);
  const [internalActiveTab, setInternalActiveTab] = useState<string | null>('elements');
  // Flag to indicate a deliberate user tab switch to avoid auto-switch overrides
  const isUserTabSwitchingRef = React.useRef(false);
  // Short-lived guard to ignore external setActiveTab calls (e.g. onOpenElementsTab) after manual tab switch
  const ignoreExternalUntilRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (activeTab !== undefined && activeTab !== internalActiveTab) {
      setInternalActiveTab(activeTab);
    }
  }, [activeTab, internalActiveTab]);
  
  // Exposer setActiveTab via ref
  useImperativeHandle(ref, () => ({
    setActiveTab: (tab: string) => {
      // If we just manually switched tabs, ignore external attempts to force back to 'elements'
      if (Date.now() < ignoreExternalUntilRef.current && tab === 'elements') {
        return;
      }
      // If no module is selected anymore, ignore external attempts to force Elements
      if (tab === 'elements' && !selectedModuleId && !selectedModule) {
        return;
      }
      // If a non-elements tab is currently active, block external ref-driven return to 'elements'
      if (tab === 'elements' && internalActiveTab !== 'elements') {
        return;
      }
      setInternalActiveTab(tab);
      onActiveTabChange?.(tab);
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

  // Removed event-based auto-switching to avoid flicker and unintended returns to Elements.

  // Toujours désélectionner le module si l'onglet actif n'est pas 'elements'
  React.useEffect(() => {
    if (internalActiveTab !== 'elements') {
      onSelectedModuleChange?.(null);
    }
  }, [internalActiveTab, onSelectedModuleChange]);
  
  // Fonction interne pour gérer le changement d'onglet
  const activeTemplate = React.useMemo(() => {
    return quizTemplates.find((tpl) => tpl.id === selectedQuizTemplate) || quizTemplates[0];
  }, [selectedQuizTemplate]);
  const templateDesktopWidth = React.useMemo(() => `${activeTemplate?.style?.containerWidth ?? 450}px`, [activeTemplate]);
  const templateMobileWidth = React.useMemo(() => `${activeTemplate?.style?.containerWidth ?? 450}px`, [activeTemplate]);

  // Fonction interne pour gérer le changement d'onglet
  const setActiveTab = (tab: string | null) => {
    setInternalActiveTab(tab);
    onActiveTabChange?.(tab);
  };
  
  // Référence pour suivre les états précédents
  const prevStatesRef = useRef({
    showEffectsPanel,
    showAnimationsPanel,
    showPositionPanel,
    showQuizPanel,
    showDesignPanel,
    activeTab: internalActiveTab
  });

  // Gérer l'affichage des onglets en fonction des états des panneaux
  React.useEffect(() => {
    const prev = prevStatesRef.current;
    let newActiveTab = internalActiveTab;
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
      else if (panelStates.some(p => p.key === internalActiveTab && !p.active && p.prevActive)) {
        newActiveTab = 'elements';
        shouldUpdate = true;
      }
    }

    // Mettre à jour l'état si nécessaire
    if (shouldUpdate && newActiveTab !== internalActiveTab) {
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
    if (internalActiveTab === 'effects' && (!selectedElement || selectedElement.type !== 'text')) {
      onEffectsPanelChange?.(false);
      setActiveTab('elements');
    }
  }, [selectedElement, internalActiveTab, onEffectsPanelChange]);

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
  
  const tabs = allTabs.filter(tab => !safeHiddenTabs.includes(tab.id));

  // Ensure a valid default active tab on mount and when visible tabs change
  React.useEffect(() => {
    const backgroundVisible = tabs.some(t => t.id === 'background');
    const activeIsVisible = internalActiveTab ? tabs.some(t => t.id === internalActiveTab) : false;
    const activeIsEphemeralOpen = (
      (internalActiveTab === 'effects' && showEffectsPanel) ||
      (internalActiveTab === 'animations' && showAnimationsPanel) ||
      (internalActiveTab === 'position' && showPositionPanel) ||
      (internalActiveTab === 'quiz' && showQuizPanel)
    );

    if (!activeIsVisible && !activeIsEphemeralOpen) {
      setInternalActiveTab(backgroundVisible ? 'background' : (tabs[0]?.id ?? null));
    }
  }, [tabs, internalActiveTab, showEffectsPanel, showAnimationsPanel, showPositionPanel, showQuizPanel]);

  // Prefetch on hover/touch to smooth first paint
  const prefetchTab = (tabId: string) => {
    if (tabId === 'position') {
      loadPositionPanel();
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
    // mark deliberate user tab change for a short window to ignore auto-switchers
    isUserTabSwitchingRef.current = true;
    ignoreExternalUntilRef.current = Date.now() + 2000;
    setTimeout(() => { isUserTabSwitchingRef.current = false; }, 300);
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
    // Si la cible N'EST PAS 'elements', toujours désélectionner le module pour éviter que le panel temporaire reste ouvert
    if (tabId !== 'elements' && onSelectedModuleChange) {
      onSelectedModuleChange(null);
    }

    // Ouvrir explicitement le panneau correspondant au tab ciblé
    if (tabId === 'elements') {
      onEffectsPanelChange?.(false);
      onAnimationsPanelChange?.(false);
      onPositionPanelChange?.(false);
      onQuizPanelChange?.(false);
      onDesignPanelChange?.(false);
    } else if (tabId === 'background') {
      onDesignPanelChange?.(true);
    } else if (tabId === 'effects') {
      onEffectsPanelChange?.(true);
    } else if (tabId === 'animations') {
      onAnimationsPanelChange?.(true);
    } else if (tabId === 'position') {
      onPositionPanelChange?.(true);
    } else if (tabId === 'quiz') {
      onQuizPanelChange?.(true);
    }
    
    if (internalActiveTab === tabId) {
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
          <React.Suspense fallback={<div className="p-4 text-sm text-gray-500">Chargement des animations…</div>}>
            <LazyAnimationsPanel 
              onBack={() => {
                onAnimationsPanelChange?.(false);
                setActiveTab('elements');
              }}
              selectedElement={selectedElement}
              onElementUpdate={onElementUpdate}
            />
          </React.Suspense>
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
            onTemplateChange={(template) => handleQuizTemplateChange?.(template.id)}
            quizWidth={(campaign?.design?.quizConfig as any)?.style?.width ?? templateDesktopWidth}
            quizMobileWidth={(campaign?.design?.quizConfig as any)?.style?.mobileWidth ?? templateMobileWidth}
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
              handleQuizWidthChange?.(width);
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
              handleQuizMobileWidthChange?.(width);
            }}
            selectedDevice={selectedDevice}
          />
        );
      case 'background':
        return (
          <BackgroundPanel 
            onBackgroundChange={onBackgroundChange || (() => {})} 
            onExtractedColorsChange={onExtractedColorsChange}
            currentBackground={currentBackground}
            extractedColors={extractedColors}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
            colorEditingContext={colorEditingContext}
          />
        );
      case 'elements':
        if (selectedModule?.type === 'BlocBouton' && onModuleUpdate) {
          return (
            <ButtonModulePanel
              module={selectedModule as any}
              onUpdate={(patch: any) => onModuleUpdate(selectedModule.id, patch)}
              onBack={() => {
                // Désélectionner le module et rester sur l'onglet éléments
                onSelectedModuleChange?.(null);
                setActiveTab('elements');
              }}
            />
          );
        }
        if (selectedModule?.type === 'BlocImage' && onModuleUpdate) {
          return (
            <ImageModulePanel
              module={selectedModule as BlocImage}
              onUpdate={(patch: Partial<BlocImage>) => {
                onModuleUpdate(selectedModule.id, patch);
              }}
              onBack={() => {
                onSelectedModuleChange?.(null);
                setActiveTab('elements');
              }}
            />
          );
        }
        
        if (selectedModule?.type === 'BlocVideo' && onModuleUpdate) {
          return (
            <VideoModulePanel
              module={selectedModule as any}
              onUpdate={(patch: any) => {
                onModuleUpdate(selectedModule.id, patch);
              }}
              onBack={() => {
                onSelectedModuleChange?.(null);
                setActiveTab('elements');
              }}
            />
          );
        }
        if (selectedModule?.type === 'BlocReseauxSociaux' && onModuleUpdate) {
          return (
            <SocialModulePanel
              module={selectedModule as any}
              onUpdate={(patch: any) => onModuleUpdate(selectedModule.id, patch)}
              onBack={() => {
                onSelectedModuleChange?.(null);
                setActiveTab('elements');
              }}
            />
          );
        }
        if (selectedModule?.type === 'BlocHtml' && onModuleUpdate) {
          return (
            <HtmlModulePanel
              module={selectedModule as any}
              onUpdate={(patch: any) => onModuleUpdate(selectedModule.id, patch)}
              onBack={() => {
                onSelectedModuleChange?.(null);
                setActiveTab('elements');
              }}
            />
          );
        }
        return (
          <CompositeElementsPanel
            currentScreen={currentScreen || 'screen1'}
            onAddModule={(screen, module) => {
              if (typeof onAddModule === 'function') {
                onAddModule(screen, module);
              }
            }}
            onAddElement={onAddElement}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
            selectedDevice={selectedDevice}
          />
        );
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
      default:
        return null;
    }
  };

  if (isCollapsed) {
    return (
      <div data-hybrid-sidebar="collapsed" className="w-16 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col" style={themeVars}>
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
            const isActive = internalActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCollapsed(false);
                  // Use same guarded flow as expanded to avoid external forcing
                  handleTabClick(tab.id);
                }}
                onMouseEnter={() => prefetchTab(tab.id)}
                onTouchStart={() => prefetchTab(tab.id)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
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
    <div data-hybrid-sidebar="expanded" className="flex h-full min-h-0">
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
            const isActive = internalActiveTab === tab.id;
            
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

      {internalActiveTab && (
        <div className="w-80 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col h-full min-h-0 shadow-sm">
          <div className="p-6 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))]">
            {(() => {
              const screenTitle = (currentScreen === 'screen2') ? 'Écran 2' : (currentScreen === 'screen3') ? 'Écran 3' : 'Écran 1';
              return (
                <h2 className="font-semibold text-[hsl(var(--sidebar-text-primary))] font-inter">
                  {screenTitle}
                </h2>
              );
            })()}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {renderPanel(internalActiveTab)}
          </div>
        </div>
      )}
    </div>
  );
});

HybridSidebar.displayName = 'HybridSidebar';

export default HybridSidebar;
