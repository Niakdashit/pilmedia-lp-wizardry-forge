// @ts-nocheck
import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Gamepad2,
  Palette,
  FormInput,
  MessageSquare,
  Image,
  Type,
  MousePointer,
  List,
  Code2
} from 'lucide-react';
import { 
  BackgroundPanel, 
  CompositeElementsPanel, 
  TextEffectsPanel 
} from '@/components/shared';
import CodePanel from '../DesignEditor/panels/CodePanel';
import ImageModulePanel from '../QuizEditor/modules/ImageModulePanel';
import LogoModulePanel from '../QuizEditor/modules/LogoModulePanel';
import FooterModulePanel from '../QuizEditor/modules/FooterModulePanel';
import ButtonModulePanel from '../QuizEditor/modules/ButtonModulePanel';
import VideoModulePanel from '../QuizEditor/modules/VideoModulePanel';
import SocialModulePanel from '../QuizEditor/modules/SocialModulePanel';
import HtmlModulePanel from '../QuizEditor/modules/HtmlModulePanel';
import CartePanel from '../QuizEditor/panels/CartePanel';
import QuizConfigPanel from '../QuizEditor/panels/QuizConfigPanel';
import ModernFormTab from '../ModernEditor/ModernFormTab';
import ScratchGamePanel from './panels/ScratchGamePanel';
import WheelConfigPanel from './panels/WheelConfigPanel';
import MessagesPanel from './panels/MessagesPanel';
import ArticleSidebar from './ArticleSidebar';
import ArticleModePanel from '../DesignEditor/panels/ArticleModePanel';
import { useEditorStore } from '../../stores/editorStore';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';
import { quizTemplates } from '../../types/quizTemplates';
import type { Module, BlocImage, BlocCarte, BlocLogo, BlocPiedDePage } from '@/types/modularEditor';
import { useArticleBannerSync } from '@/hooks/useArticleBannerSync';

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
  // Inline wheel panel controls
  showWheelPanel?: boolean;
  onWheelPanelChange?: (show: boolean) => void;
  // Design panel controls
  showDesignPanel?: boolean;
  onDesignPanelChange?: (show: boolean) => void;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
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
  modules?: Module[];
  onModuleDelete?: (id: string) => void;
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
  // Article mode result props
  currentGameResult?: 'winner' | 'loser';
  onGameResultChange?: (result: 'winner' | 'loser') => void;
  onArticleStepChange?: (step: 'article' | 'form' | 'game' | 'result') => void;
  // Wheel configuration props
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
  onWheelPositionChange?: (position: 'left' | 'right' | 'center') => void;
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
  showWheelPanel = false,
  onWheelPanelChange,
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
  modules,
  onModuleDelete,
  activeTab,
  onActiveTabChange,
  // modular editor
  currentScreen,
  onAddModule,
  // article mode result
  currentGameResult,
  onGameResultChange,
  onArticleStepChange,
  // wheel configuration
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
  onWheelPositionChange
}: HybridSidebarProps, ref) => {
  // Détection du mode Article via URL
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const editorMode = searchParams?.get('mode') === 'article' ? 'article' : 'fullscreen';
  
  // Détection du format 9:16 (fenêtre portrait)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const isWindowMobile = windowSize.height > windowSize.width && windowSize.width < 768;
  
  // Détecter si on est sur mobile avec un hook React pour éviter les erreurs hydration
  const [isCollapsed, setIsCollapsed] = useState(selectedDevice === 'mobile' || isWindowMobile);
  // Centralized campaign state (Zustand)
  const campaign = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign);
  
  // Détection de la taille de fenêtre
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);
  
  // Forcer le collapse en format 9:16
  useEffect(() => {
    if (isWindowMobile) {
      setIsCollapsed(true);
    }
  }, [isWindowMobile]);
  
  // Synchroniser les uploads d'images avec la bannière article
  useArticleBannerSync(editorMode);

  // Détecter si l'appareil est réellement mobile via l'user-agent plutôt que la taille de la fenêtre
  React.useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    // Exposer la fonction pour forcer l'onglet Elements si elle est fournie
    if (onForceElementsTab) {
      (window as any).forceElementsTab = onForceElementsTab;
    }

    const deviceOverride = getEditorDeviceOverride();
    if (deviceOverride === 'desktop' && !isWindowMobile) {
      setIsCollapsed(false);
      return;
    }

    if (/Mobi|Android/i.test(ua) || isWindowMobile) {
      setIsCollapsed(true);
    }
  }, [onForceElementsTab, isWindowMobile]);
  // Initialiser l'onglet actif en fonction du mode : 'design' pour article, 'background' pour fullscreen
  const [internalActiveTab, setInternalActiveTab] = useState<string | null>(
    editorMode === 'article' ? 'design' : 'background'
  );
  // Flag to indicate a deliberate user tab switch to avoid auto-switch overrides
  const isUserTabSwitchingRef = React.useRef(false);
  // Short-lived guard to ignore external setActiveTab calls (e.g. onOpenElementsTab) after manual tab switch
  const ignoreExternalUntilRef = React.useRef<number>(0);
  // Prevent redundant onActiveTabChange emissions
  const lastSentTabRef = React.useRef<string | null>(null);
  // Reentrancy guard when deriving active tab from panel flags
  const derivingTabRef = React.useRef(false);

  React.useEffect(() => {
    if (activeTab !== undefined && activeTab !== internalActiveTab) {
      setInternalActiveTab(activeTab);
    }
  }, [activeTab, internalActiveTab]);
  
  // Exposer setActiveTab via ref
  useImperativeHandle(ref, () => ({
    setActiveTab: (tab: string) => {
      // Always allow external calls to open the Elements tab (e.g., after selecting a module)
      // and make sure the sidebar is expanded on mobile.
      if (tab === 'elements') {
        setIsCollapsed(false);
      }

      // Keep a soft guard for rapid repeat calls but do not block the switch
      if (Date.now() < ignoreExternalUntilRef.current && tab === 'elements') {
        ignoreExternalUntilRef.current = 0;
      }

      // Avoid redundant tab sets
      if (tab !== internalActiveTab) {
        setInternalActiveTab(tab);
        if (lastSentTabRef.current !== tab) {
          lastSentTabRef.current = tab;
          onActiveTabChange?.(tab);
        }
      }
      // Mettre à jour les états des panneaux en fonction de l'onglet sélectionné
      if (tab === 'background') {
        if (!showDesignPanel) onDesignPanelChange?.(true);
      } else if (tab === 'effects') {
        if (!showEffectsPanel) onEffectsPanelChange?.(true);
      } else if (tab === 'animations') {
        if (!showAnimationsPanel) onAnimationsPanelChange?.(true);
      } else if (tab === 'position') {
        if (!showPositionPanel) onPositionPanelChange?.(true);
      } else if (tab === 'quiz') {
        if (!showQuizPanel) onQuizPanelChange?.(true);
      } else if (tab === 'wheel') {
        if (!showWheelPanel) onWheelPanelChange?.(true);
      }
    }
  }), [onDesignPanelChange, onEffectsPanelChange, onAnimationsPanelChange, onPositionPanelChange, onQuizPanelChange, onWheelPanelChange, setIsCollapsed, internalActiveTab, showDesignPanel, showEffectsPanel, showAnimationsPanel, showPositionPanel, showQuizPanel, showWheelPanel]);

  // Removed event-based auto-switching to avoid flicker and unintended returns to Elements.

  // Désélectionner le module si l'onglet actif n'est pas 'elements' ou 'background'
  // (background est autorisé pour les BlocTexte)
  React.useEffect(() => {
    if (internalActiveTab !== 'elements' && internalActiveTab !== 'background') {
      onSelectedModuleChange?.(null);
    }
  }, [internalActiveTab, onSelectedModuleChange]);
  
  // Log pour debug - ne pas forcer le changement d'onglet ici pour éviter les boucles
  // La logique de changement d'onglet est gérée par DesignEditorLayout
  React.useEffect(() => {
    console.log('🎯 [HybridSidebar] selectedModuleId changed:', {
      selectedModuleId,
      selectedModule,
      internalActiveTab,
      moduleType: selectedModule?.type
    });
  }, [selectedModuleId, selectedModule?.type, internalActiveTab]);
  
  // Fonction interne pour gérer le changement d'onglet
  const activeTemplate = React.useMemo(() => {
    return quizTemplates.find((tpl) => tpl.id === selectedQuizTemplate) || quizTemplates[0];
  }, [selectedQuizTemplate]);
  const templateDesktopWidth = React.useMemo(() => `${activeTemplate?.style?.containerWidth ?? 450}px`, [activeTemplate]);
  const templateMobileWidth = React.useMemo(() => `${activeTemplate?.style?.containerWidth ?? 450}px`, [activeTemplate]);

  // Fonction interne pour gérer le changement d'onglet
  const setActiveTab = (tab: string | null) => {
    if (tab === internalActiveTab) return;
    setInternalActiveTab(tab);
    if (lastSentTabRef.current !== tab) {
      lastSentTabRef.current = tab;
      onActiveTabChange?.(tab);
    }
  };
  
  // Référence pour suivre les états précédents
  const prevStatesRef = useRef({
    showEffectsPanel,
    showAnimationsPanel,
    showPositionPanel,
    showQuizPanel,
    showWheelPanel,
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
      { key: 'wheel', active: showWheelPanel, prevActive: prev.showWheelPanel },
      { key: 'background', active: showDesignPanel, prevActive: prev.showDesignPanel }
    ];

    // Si le panneau Quiz est activé, forcer l'onglet quiz
    if (showQuizPanel && !prev.showQuizPanel) {
      newActiveTab = 'quiz';
      shouldUpdate = true;
    }
    // Si le panneau Wheel est activé, forcer l'onglet wheel
    else if (showWheelPanel && !prev.showWheelPanel) {
      newActiveTab = 'wheel';
      shouldUpdate = true;
    }
    // Si le panneau Design est activé, forcer l'onglet background (sauf si déjà sur background)
    else if (showDesignPanel && !prev.showDesignPanel && internalActiveTab !== 'background') {
      newActiveTab = 'background';
      shouldUpdate = true;
    } 
    // Si un autre panneau a été activé, basculer vers son onglet correspondant
    else {
      const activatedPanel = panelStates.find(p => p.active && !p.prevActive && p.key !== 'background' && p.key !== 'quiz' && p.key !== 'wheel');
      if (activatedPanel) {
        newActiveTab = activatedPanel.key;
        shouldUpdate = true;
      } 
      // Si l'onglet actif est un panneau qui a été désactivé, revenir à 'game' pour wheel ou 'elements' pour les autres
      else if (panelStates.some(p => p.key === internalActiveTab && !p.active && p.prevActive)) {
        newActiveTab = internalActiveTab === 'wheel' ? 'game' : 'elements';
        shouldUpdate = true;
      }
    }

    // Mettre à jour l'état si nécessaire (avec garde anti-réentrance)
    if (shouldUpdate && newActiveTab !== internalActiveTab) {
      if (derivingTabRef.current) {
        // Skip re-entrant derive within the same tick
      } else {
        derivingTabRef.current = true;
        setActiveTab(newActiveTab);
        // Release guard next tick
        setTimeout(() => { derivingTabRef.current = false; }, 0);
      }
    }

    // Mettre à jour la référence des états précédents
    prevStatesRef.current = {
      showEffectsPanel,
      showAnimationsPanel,
      showPositionPanel,
      showQuizPanel,
      showWheelPanel,
      showDesignPanel,
      activeTab: newActiveTab
    };

    // Ne pas notifier le parent ici pour éviter les boucles de feedback
    // Le parent (DesignEditorLayout) pilote showDesignPanel et l'onglet actif
    // Nous nous synchronisons uniquement en lecture via les props.

  }, [
    showEffectsPanel, 
    showAnimationsPanel, 
    showPositionPanel, 
    showQuizPanel,
    showWheelPanel,
    showDesignPanel,
    onDesignPanelChange,
    internalActiveTab
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

  // Onglets différents selon le mode (Article vs Fullscreen)
  const allTabs = editorMode === 'article' 
    ? [
        { id: 'design', label: 'Design', icon: Palette },
        { id: 'funnel', label: 'Funnel', icon: List },
        { id: 'form', label: 'Formulaire', icon: FormInput },
        { id: 'game', label: 'Jeu', icon: Gamepad2 },
        { id: 'messages', label: 'Sortie', icon: MessageSquare },
        { id: 'code', label: 'Code', icon: Code2 }
      ]
    : [
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
        },
        { 
          id: 'messages', 
          label: 'Sortie', 
          icon: MessageSquare
        },
        { 
          id: 'code', 
          label: 'Code', 
          icon: Code2
        }
      ];
  
  // Vérifier si hiddenTabs est défini et est un tableau
  const safeHiddenTabs = Array.isArray(hiddenTabs) ? hiddenTabs : [];
  
  const tabs = allTabs.filter(tab => !safeHiddenTabs.includes(tab.id));

  // Ensure a valid default active tab on mount and when visible tabs change
  React.useEffect(() => {
    const backgroundVisible = tabs.some(t => t.id === 'background');
    const activeIsVisible = internalActiveTab ? tabs.some(t => t.id === internalActiveTab) : false;
    const isTransientQuiz = internalActiveTab === 'quiz' && showQuizPanel;
    const isTransientWheel = internalActiveTab === 'wheel' && showWheelPanel;

    if (!activeIsVisible && !isTransientQuiz && !isTransientWheel) {
      setInternalActiveTab(backgroundVisible ? 'background' : (tabs[0]?.id ?? null));
    }
  }, [tabs, internalActiveTab, showQuizPanel, showWheelPanel]);

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
    
    // Fermer uniquement les panneaux ouverts pour éviter des re-renders inutiles
    if (showEffectsPanel) onEffectsPanelChange?.(false);
    if (showAnimationsPanel) onAnimationsPanelChange?.(false);
    if (showPositionPanel) onPositionPanelChange?.(false);
    if (showQuizPanel) onQuizPanelChange?.(false);
    if (showWheelPanel) onWheelPanelChange?.(false);
    if (showDesignPanel) onDesignPanelChange?.(false);
    
    // Si la cible N'EST PAS 'elements', toujours désélectionner le module pour éviter que le panel temporaire reste ouvert
    if (tabId !== 'elements' && onSelectedModuleChange) {
      onSelectedModuleChange(null);
    }

    // Ouvrir explicitement le panneau correspondant au tab ciblé
    if (tabId === 'background') {
      if (!showDesignPanel) onDesignPanelChange?.(true);
    } else if (tabId === 'effects') {
      if (!showEffectsPanel) onEffectsPanelChange?.(true);
    } else if (tabId === 'animations') {
      if (!showAnimationsPanel) onAnimationsPanelChange?.(true);
    } else if (tabId === 'position') {
      if (!showPositionPanel) onPositionPanelChange?.(true);
    } else if (tabId === 'quiz') {
      if (!showQuizPanel) onQuizPanelChange?.(true);
    } else if (tabId === 'wheel') {
      if (!showWheelPanel) onWheelPanelChange?.(true);
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
      case 'design':
        if (editorMode === 'article') {
          return (
            <ArticleModePanel
              campaign={campaign}
              onCampaignChange={(updates) => setCampaign((prev: any) => ({ ...(prev || {}), ...updates }))}
              activePanel={'banner'}
              grouped
            />
          );
        }
        return null;
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
      case 'wheel':
        return (
          <WheelConfigPanel
            onBack={() => {
              onWheelPanelChange?.(false);
              setActiveTab('game');
            }}
            wheelBorderStyle={wheelBorderStyle || 'solid'}
            wheelBorderColor={wheelBorderColor || '#ffd700'}
            wheelBorderWidth={wheelBorderWidth || 2}
            wheelScale={wheelScale || 67}
            wheelShowBulbs={wheelShowBulbs ?? true}
            wheelPosition={wheelPosition || 'center'}
            onBorderStyleChange={onWheelBorderStyleChange || (() => {})}
            onBorderColorChange={onWheelBorderColorChange || (() => {})}
            onBorderWidthChange={onWheelBorderWidthChange || (() => {})}
            onScaleChange={onWheelScaleChange || (() => {})}
            onShowBulbsChange={onWheelShowBulbsChange || (() => {})}
            onPositionChange={onWheelPositionChange || (() => {})}
            selectedDevice={selectedDevice}
          />
        );
      case 'banner':
      case 'text':
      case 'button':
        if (editorMode === 'article') {
          return (
            <ArticleModePanel
              campaign={campaign}
              onCampaignChange={(updates) => setCampaign(updates as any)}
              activePanel={tabId as 'banner' | 'text' | 'button'}
            />
          );
        }
        return null;
      case 'background':
        // Pour les modules texte, passer le module comme selectedElement
        const elementForBackground = selectedModule?.type === 'BlocTexte' ? selectedModule : selectedElement;
        const updateForBackground = selectedModule?.type === 'BlocTexte' && onModuleUpdate 
          ? (updates: any) => onModuleUpdate(selectedModule.id, updates)
          : onElementUpdate;
        
        return (
          <BackgroundPanel 
            onBackgroundChange={onBackgroundChange || (() => {})} 
            onExtractedColorsChange={onExtractedColorsChange}
            currentBackground={currentBackground}
            extractedColors={extractedColors}
            selectedElement={elementForBackground}
            onElementUpdate={updateForBackground}
            onModuleUpdate={onModuleUpdate}
            colorEditingContext={colorEditingContext}
            currentScreen={currentScreen}
            selectedDevice={selectedDevice}
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
        
        if (selectedModule?.type === 'BlocLogo' && onModuleUpdate) {
          return (
            <LogoModulePanel
              module={selectedModule as BlocLogo}
              onUpdate={(patch: Partial<BlocLogo>) => {
                onModuleUpdate(selectedModule.id, patch);
              }}
              onBack={() => {
                onSelectedModuleChange?.(null);
                setActiveTab('elements');
              }}
            />
          );
        }
        
        if (selectedModule?.type === 'BlocPiedDePage' && onModuleUpdate) {
          return (
            <FooterModulePanel
              module={selectedModule as BlocPiedDePage}
              onUpdate={(patch: Partial<BlocPiedDePage>) => {
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
        if (selectedModule?.type === 'BlocCarte' && onModuleUpdate) {
          return (
            <CartePanel
              module={selectedModule as BlocCarte}
              onUpdate={(id: string, patch: Partial<BlocCarte>) => onModuleUpdate(id, patch)}
              onAddChild={(parentId: string, childModule: Module) => {
                // Ajouter un enfant à la carte
                const carte = selectedModule as BlocCarte;
                const updatedChildren = [...(carte.children || []), childModule];
                onModuleUpdate(parentId, { children: updatedChildren } as any);
              }}
              onDeleteChild={(parentId: string, childId: string) => {
                // Supprimer un enfant de la carte
                const carte = selectedModule as BlocCarte;
                const updatedChildren = (carte.children || []).filter(c => c.id !== childId);
                onModuleUpdate(parentId, { children: updatedChildren } as any);
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
            elements={elements}
            onElementsChange={onElementsChange}
            selectedElements={selectedElements}
            onSelectedElementsChange={onSelectedElementsChange}
            onAddToHistory={onAddToHistory}
            modules={modules}
            selectedModuleId={selectedModuleId}
            onModuleSelect={onSelectedModuleChange}
            onModuleDelete={onModuleDelete}
          />
        );
      case 'game':
        return (
          <ScratchGamePanel
            campaign={campaign}
            setCampaign={setCampaign}
          />
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
      case 'messages':
        // En mode article, afficher le panneau de sortie (gagnant/perdant)
        if (editorMode === 'article') {
          return (
            <ArticleModePanel
              campaign={campaign}
              onCampaignChange={(updates) => setCampaign((prev: any) => ({ ...(prev || {}), ...updates }))}
              activePanel={'result'}
              currentGameResult={currentGameResult}
              onGameResultChange={onGameResultChange}
              onStepChange={onArticleStepChange}
            />
          );
        }
        // Sinon, afficher le panneau de messages classique
        return (
          <MessagesPanel 
            campaign={campaign}
            setCampaign={setCampaign}
          />
        );
      case 'code':
        return (
          <CodePanel 
            campaign={campaign}
            currentScreen={currentScreen}
            onCampaignChange={setCampaign}
          />
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
      <div className="w-20 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col shadow-sm min-h-0 rounded-bl-[18px]" style={themeVars}>
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
        <div className="w-80 bg-white border-r border-[hsl(var(--sidebar-border))] flex flex-col h-full min-h-0 shadow-sm">
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
