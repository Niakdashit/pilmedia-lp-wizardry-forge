import React, { useState, useMemo, useEffect, useRef, useCallback, lazy } from 'react';
import CampaignValidationModal from '@/components/shared/CampaignValidationModal';
import { useCampaignValidation } from '@/hooks/useCampaignValidation';
// Align routing with QuizEditor via router adapter
import { useLocation, useNavigate } from '@/lib/router-adapter';
import { Save, X } from 'lucide-react';

const HybridSidebar = lazy(() => import('./HybridSidebar'));
const DesignToolbar = lazy(() => import('./DesignToolbar'));
const FunnelUnlockedGame = lazy(() => import('@/components/funnels/FunnelUnlockedGame'));
const FunnelQuizParticipate = lazy(() => import('../funnels/FunnelQuizParticipate'));
// Scratch editor uses FunnelUnlockedGame for preview
import type { ModularPage, ScreenId, BlocBouton, Module } from '@/types/modularEditor';
import { createEmptyModularPage } from '@/types/modularEditor';

import PreviewRenderer from '@/components/preview/PreviewRenderer';
import ArticleCanvas from '@/components/ArticleEditor/ArticleCanvas';
import ZoomSlider from './components/ZoomSlider';
const DesignCanvas = lazy(() => import('./DesignCanvas'));
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
// Scratch Editor doesn't need wheel config sync
// import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
import { useGroupManager } from '../../hooks/useGroupManager';
import { getDeviceDimensions } from '../../utils/deviceDimensions';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';
import { recalculateAllElements } from '../../utils/recalculateAllModules';
import { useEditorPreviewSync } from '@/hooks/useEditorPreviewSync';
import { useCampaignSettings } from '@/hooks/useCampaignSettings';
import type { ScreenBackgrounds, DeviceSpecificBackground } from '@/types/background';


import { useCampaigns } from '@/hooks/useCampaigns';
import { createSaveAndContinueHandler, saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';
import { quizTemplates } from '../../types/quizTemplates';
import type { GameModalConfig } from '@/types/gameConfig';
import { createGameConfigFromQuiz } from '@/types/gameConfig';

const KeyboardShortcutsHelp = lazy(() => import('../shared/KeyboardShortcutsHelp'));
const MobileStableEditor = lazy(() => import('./components/MobileStableEditor'));

const LAUNCH_BUTTON_FALLBACK_GRADIENT = '#000000';
const LAUNCH_BUTTON_DEFAULT_TEXT_COLOR = '#ffffff';
const LAUNCH_BUTTON_DEFAULT_PADDING = '14px 28px';
const LAUNCH_BUTTON_DEFAULT_SHADOW = '0 4px 12px rgba(0, 0, 0, 0.15)';

const buildLaunchButtonStyles = (
  buttonModule: BlocBouton | undefined,
  quizStyleOverrides: Record<string, any>,
  quizConfig: {
    buttonBackgroundColor: string;
    buttonTextColor: string;
    buttonHoverBackgroundColor: string;
    buttonActiveBackgroundColor: string;
    borderRadius: number | string;
  }
): React.CSSProperties => {
  const moduleStyles =
    buttonModule && buttonModule.type === 'BlocBouton'
      ? {
          background: buttonModule.background,
          color: buttonModule.textColor,
          padding: buttonModule.padding,
          borderRadius:
            typeof buttonModule.borderRadius === 'number'
              ? `${buttonModule.borderRadius}px`
              : buttonModule.borderRadius,
          boxShadow: buttonModule.boxShadow
        }
      : {};

  const resolvedBorderRadius =
    quizStyleOverrides.borderRadius ||
    moduleStyles.borderRadius ||
    (typeof quizConfig.borderRadius === 'number'
      ? `${quizConfig.borderRadius}px`
      : quizConfig.borderRadius) ||
    '9999px';

  return {
    background:
      moduleStyles.background ||
      quizStyleOverrides.buttonBackgroundColor ||
      quizConfig.buttonBackgroundColor ||
      LAUNCH_BUTTON_FALLBACK_GRADIENT,
    color:
      moduleStyles.color ||
      quizStyleOverrides.buttonTextColor ||
      quizConfig.buttonTextColor ||
      LAUNCH_BUTTON_DEFAULT_TEXT_COLOR,
    padding:
      moduleStyles.padding ||
      quizStyleOverrides.buttonPadding ||
      LAUNCH_BUTTON_DEFAULT_PADDING,
    borderRadius: resolvedBorderRadius,
    boxShadow:
      moduleStyles.boxShadow ||
      quizStyleOverrides.buttonBoxShadow ||
      LAUNCH_BUTTON_DEFAULT_SHADOW,
    display: quizStyleOverrides.buttonDisplay || 'inline-flex',
    alignItems: quizStyleOverrides.buttonAlignItems || 'center',
    justifyContent: quizStyleOverrides.buttonJustifyContent || 'center',
    minWidth: quizStyleOverrides.buttonMinWidth,
    minHeight: quizStyleOverrides.buttonMinHeight,
    width: quizStyleOverrides.buttonWidth,
    height: quizStyleOverrides.buttonHeight,
    textTransform: quizStyleOverrides.buttonTextTransform,
    fontWeight: quizStyleOverrides.buttonFontWeight || 600
  } as React.CSSProperties;
};

interface JackpotEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}

const JackpotEditorLayout: React.FC<JackpotEditorLayoutProps> = ({ mode = 'campaign', hiddenTabs }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Détection du mode Article via URL (?mode=article)
  const searchParams = new URLSearchParams(location.search);
  const editorMode: 'article' | 'fullscreen' = searchParams.get('mode') === 'article' ? 'article' : 'fullscreen';
  
  console.log('🎨 [JackpotEditorLayout] Editor Mode:', editorMode);
  const getTemplateBaseWidths = useCallback((templateId?: string) => {
    const template = quizTemplates.find((tpl) => tpl.id === templateId) || quizTemplates[0];
    const width = template?.style?.containerWidth ?? 450;
    return { desktop: `${width}px`, mobile: `${width}px` };
  }, []);

  const initialTemplateWidths = useMemo(() => getTemplateBaseWidths('image-quiz'), [getTemplateBaseWidths]);

  // Détection automatique de l'appareil basée sur l'user-agent pour éviter le basculement lors du redimensionnement de fenêtre
  const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    const override = getEditorDeviceOverride();
    if (override) return override;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  };

  // Détection de l'appareil physique réel (pour l'interface)
  const [actualDevice, setActualDevice] = useState<'desktop' | 'tablet' | 'mobile'>(detectDevice());
  
  // Détection de la taille de fenêtre pour la responsivité
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const isWindowMobile = windowSize.height > windowSize.width && windowSize.width < 768;
  
  // Détection du ratio 9:16 ou moins pour padding adaptatif, ou appareil mobile
  const isNarrowRatio = windowSize.width > 0 && windowSize.height > 0 
    ? (windowSize.height / windowSize.width) >= (16 / 9) 
    : false;
  const shouldUseReducedPadding = isNarrowRatio || actualDevice === 'mobile' || isWindowMobile;

  // Zoom par défaut selon l'appareil, avec restauration depuis localStorage
  const getDefaultZoom = (device: 'desktop' | 'tablet' | 'mobile'): number => {
    try {
      const saved = localStorage.getItem(`editor-zoom-${device}`);
      if (saved) {
        const v = parseFloat(saved);
        if (!Number.isNaN(v) && v >= 0.1 && v <= 1) return v;
      }
    } catch {}
    // Uniformisation : même zoom que le mode preview pour tous les appareils
    // Cela garantit que l'écran a exactement la même taille en édition et en preview
    switch (device) {
      case 'desktop':
        return 0.7;
      case 'tablet':
        return 0.55;
      case 'mobile':
        return 1.0; // 100% - Identique au mode preview pour une taille uniforme
      default:
        return 0.7;
    }
  };

  // Store centralisé pour l'optimisation
  const { 
    campaign: storeCampaign,
    setCampaign,
    setPreviewDevice,
    setIsLoading,
    setIsModified,
    resetCampaign
  } = useEditorStore();
  // Campagne centralisée (source de vérité pour les champs de contact)
  const campaignState = useEditorStore((s) => s.campaign);

  // Supabase campaigns API
  const { saveCampaign } = useCampaigns();

  // Réinitialiser la campagne au montage de l'éditeur
  useEffect(() => {
    console.log('🎨 [JackpotEditor] Mounting - resetting campaign state');
    resetCampaign();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // État local pour la compatibilité existante
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(actualDevice);

  // Gestionnaire de changement d'appareil avec ajustement automatique du zoom
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setSelectedDevice(device);
    // Utiliser le zoom sauvegardé si présent
    setCanvasZoom(getDefaultZoom(device));
  };

  // États principaux
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  
  // Background par écran - chaque écran a son propre background
  const defaultBackground = mode === 'template'
    ? { type: 'color' as const, value: '#4ECDC4' }
    : { type: 'color' as const, value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' };
  
  const [screenBackgrounds, setScreenBackgrounds] = useState<ScreenBackgrounds>({
    screen1: defaultBackground,
    screen2: defaultBackground,
    screen3: defaultBackground
  });
  
  // Background global (fallback pour compatibilité)
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>(defaultBackground);
  
  const [canvasZoom, setCanvasZoom] = useState(getDefaultZoom(selectedDevice));

  useEffect(() => {
    if (!canvasElements.length) return;
    const hasMissingScreen = canvasElements.some((element) => !element?.screenId);
    if (!hasMissingScreen) return;

    setCanvasElements((prev) => {
      let mutated = false;
      const updated = prev.map((element) => {
        if (element?.screenId) return element;

        mutated = true;
        const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
        if (role.includes('exit-message')) {
          return { ...element, screenId: 'screen3' as const };
        }
        if (
          role.includes('form') ||
          role.includes('contact') ||
          role.includes('lead') ||
          role.includes('info') ||
          role.includes('screen2')
        ) {
          return { ...element, screenId: 'screen2' as const };
        }
        return { ...element, screenId: 'screen1' as const };
      });

      return mutated ? updated : prev;
    });
  }, [canvasElements]);

  // Sauvegarder le zoom à chaque changement pour persistance entre modes
  useEffect(() => {
    try {
      localStorage.setItem(`editor-zoom-${selectedDevice}`, String(canvasZoom));
    } catch {}
  }, [canvasZoom, selectedDevice]);

  // Synchronise l'état de l'appareil réel et sélectionné après le montage (corrige les différences entre Lovable et Safari)
  useEffect(() => {
    const device = detectDevice();
    setActualDevice(device);
    setSelectedDevice(device);
    setCanvasZoom(getDefaultZoom(device));
  }, []);

  // Réinitialiser l'image de fond quand on change de route (uniquement si on vient d'une autre page)
  const prevPathRef = useRef<string>('');
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;
    
    // Réinitialiser uniquement si on vient d'une autre page ET qu'il y a une image
    if (prevPath && prevPath !== currentPath && canvasBackground.type === 'image') {
      console.log('🧹 [ScratchEditor] Navigation détectée - réinitialisation du fond');
      setCanvasBackground(
        mode === 'template'
          ? { type: 'color', value: '#4ECDC4' }
          : { type: 'color', value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' }
      );
    }
    
    prevPathRef.current = currentPath;
  }, [location.pathname, mode, canvasBackground.type]); // Se déclenche au changement de route

  // Recharger l'image de fond correcte depuis la campaign quand on change de device
  useEffect(() => {
    if (campaignState?.design) {
      const design = campaignState.design as any;
      const bgImage = selectedDevice === 'mobile' 
        ? design.mobileBackgroundImage 
        : design.backgroundImage;
      
      if (bgImage) {
        console.log(`🔄 Switching to ${selectedDevice}, loading background:`, bgImage.substring(0, 50) + '...');
        setCanvasBackground({ type: 'image', value: bgImage });
      }
    }
  }, [selectedDevice, campaignState?.design]);

  // Écoute l'évènement global pour appliquer l'image de fond à tous les écrans par device (desktop/tablette/mobile distinct)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { url?: string; device?: string } | undefined;
      const url = detail?.url;
      const targetDevice = detail?.device || 'desktop';
      if (!url) return;
      
      // Mettre à jour le background local de l'éditeur seulement si c'est le device actuel
      if (targetDevice === selectedDevice) {
        setCanvasBackground({ type: 'image', value: url });
      }
      
      // Mettre à jour la campagne globale selon le device ciblé
      try {
        setCampaign((prev: any) => {
          if (!prev) return prev;
          const updatedDesign = { ...(prev.design || {}) };
          
          // Appliquer l'image uniquement au device approprié
          if (targetDevice === 'mobile') {
            updatedDesign.mobileBackgroundImage = url;
          } else {
            // Desktop et tablet partagent la même image
            updatedDesign.backgroundImage = url;
          }
          
          return {
            ...prev,
            name: prev.name || 'Campaign',
            design: updatedDesign,
            _lastUpdate: Date.now()
          };
        });
      } catch {}
      
      // Mettre à jour la config locale utilisée par l'éditeur si présente
      setCampaignConfig((prev: any) => {
        if (!prev) return prev;
        const updatedDesign = { ...(prev.design || {}) };
        
        if (targetDevice === 'mobile') {
          updatedDesign.mobileBackgroundImage = url;
        } else {
          updatedDesign.backgroundImage = url;
        }
        
        return {
          ...prev,
          design: updatedDesign
        };
      });
    };
    window.addEventListener('applyBackgroundAllScreens', handler as EventListener);
    return () => window.removeEventListener('applyBackgroundAllScreens', handler as EventListener);
  }, [setCampaign, selectedDevice]);

  // Détection de la taille de fenêtre
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Note: Le zoom mobile est maintenant fixe à 100% pour correspondre au mode preview
  // L'ancien code qui ajustait automatiquement le zoom lors du redimensionnement a été supprimé
  
  // Référence pour le canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // État pour gérer l'affichage des panneaux dans la sidebar
  const [showAnimationsInSidebar, setShowAnimationsInSidebar] = useState(false);
  const [showPositionInSidebar, setShowPositionInSidebar] = useState(false);
  const [showDesignInSidebar, setShowDesignInSidebar] = useState(false);
  const [showEffectsInSidebar, setShowEffectsInSidebar] = useState(false);
  void showEffectsInSidebar; // Used in callbacks below
  // Référence pour contrôler l'onglet actif dans HybridSidebar
  const sidebarRef = useRef<{ setActiveTab: (tab: string) => void }>(null); // Nouvelle référence pour suivre la demande d'ouverture
  // Context de couleur demandé depuis la toolbar ('fill' | 'border' | 'text')
  const [designColorContext, setDesignColorContext] = useState<'fill' | 'border' | 'text'>('fill');
  // Inline QuizConfigPanel visibility (controlled at layout level)
  const [showQuizPanel, setShowQuizPanel] = useState(false);
  // Inline JackpotConfigPanel visibility (controlled at layout level)
  const [showJackpotPanel, setShowJackpotPanel] = useState(false);
  const [campaignConfig, setCampaignConfig] = useState<any>({
    design: {
      quizConfig: {
        questionCount: 5,
        timeLimit: 30,
        style: {
          width: initialTemplateWidths.desktop,
          mobileWidth: initialTemplateWidths.mobile
        }
      }
    }
  });
  // Prompt for campaign name on first arrival
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');

  useEffect(() => {
    const id = (campaignState as any)?.id as string | undefined;
    const name = (campaignState as any)?.name as string | undefined;

    // Nouveau comportement: modale OBLIGATOIRE pour toute nouvelle campagne (pas d'ID)
    if (!id) {
      setNewCampaignName((name || '').trim());
      setIsNameModalOpen(true);
      return;
    }
    // Campagnes existantes: ne pas rouvrir automatiquement
    setIsNameModalOpen(false);
  }, [campaignState?.id, campaignState?.name]);

  const { upsertSettings, getSettings } = useCampaignSettings();

  const handleSaveCampaignName = useCallback(async () => {
    const currentId = (campaignState as any)?.id as string | undefined;
    const name = (newCampaignName || '').trim();
    if (!name) return;
    
    try {
      const payload: any = currentId ? { id: currentId, name } : { name };
      const updated = await saveCampaign(payload);
      
      if (updated) {
        setCampaign({
          ...(campaignState as any),
          ...updated,
          name // Ensure name is explicitly set
        } as any);
        
        const cid = (updated as any)?.id || currentId;
        
        // Update campaign_settings with the new name
        if (cid) {
          // Load existing settings first to preserve other publication data
          const existingSettings = await getSettings(cid);
          await upsertSettings(cid, { 
            publication: { 
              ...(existingSettings?.publication || {}),
              name 
            } 
          });
        }
        
        // Dispatch event for immediate UI update if modal is open
        window.dispatchEvent(new CustomEvent('campaign:name:update', { detail: { campaignId: cid, name } }));
        
        localStorage.setItem(`campaign:name:prompted:${cid || 'new:jackpot'}`, '1');
      }
    } catch (e) {
      console.error('Failed to save campaign name:', e);
    } finally {
      // Always close modal, even if save fails
      setIsNameModalOpen(false);
    }
  }, [campaignState, newCampaignName, saveCampaign, setCampaign, upsertSettings, getSettings]);
  
  const [quizConfig, setQuizConfig] = useState({
    questionCount: 5,
    timeLimit: 30,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    templateId: 'image-quiz',
    borderRadius: 12, // Valeur par défaut pour le border radius
    // Taille par défaut du quiz
    width: initialTemplateWidths.desktop,
    mobileWidth: initialTemplateWidths.mobile,
    height: 'auto',
    // Couleurs par défaut des boutons
    buttonBackgroundColor: '#f3f4f6',
    buttonTextColor: '#000000',
    buttonHoverBackgroundColor: '#9fa4a4',
    buttonActiveBackgroundColor: '#a7acb5'
  });

  // Quiz modal config - synchronisé avec quizConfig
  const [quizModalConfig, setQuizModalConfig] = useState<any>({
    templateId: quizConfig.templateId,
    borderRadius: quizConfig.borderRadius
  });

  // Synchroniser quizModalConfig avec quizConfig
  React.useEffect(() => {
    setQuizModalConfig((prev: any) => ({
      ...prev,
      templateId: quizConfig.templateId,
      borderRadius: quizConfig.borderRadius
    }));
  }, [quizConfig.templateId, quizConfig.borderRadius]);

  // État pour l'élément sélectionné
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  
  // Initialiser avec 'design' en mode article, 'elements' en mode fullscreen
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>(
    editorMode === 'article' ? 'design' : 'elements'
  );
  const [previousSidebarTab, setPreviousSidebarTab] = useState<string>(
    editorMode === 'article' ? 'design' : 'elements'
  );
  
  // Debug wrapper pour setSelectedElement
  const debugSetSelectedElement = (element: any) => {
    console.log('🎯 setSelectedElement called:', {
      element: element?.id || element?.type || 'null',
      elementType: element?.type,
      hasElement: !!element,
      timestamp: new Date().toISOString()
    });
    setSelectedElement(element);
  };
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  
  // État pour tracker la position de scroll (quel écran est visible)
  const [currentScreen, setCurrentScreen] = useState<'screen1' | 'screen2' | 'screen3'>('screen1');
  // Modular editor JSON state
  const [modularPage, setModularPage] = useState<ModularPage>(createEmptyModularPage());
  
  const selectedModule: Module | null = useMemo(() => {
    if (!selectedModuleId) return null;
    const allModules = (Object.values(modularPage.screens) as Module[][]).flat();
    return allModules.find((module) => module.id === selectedModuleId) || null;
  }, [selectedModuleId, modularPage.screens]);

  // 🔄 MIGRATION AUTOMATIQUE : Recalcule le scaling mobile (-48.2%) pour les modules existants
  const [hasRecalculated, setHasRecalculated] = useState(false);
  useEffect(() => {
    // Recalculer les éléments canvas (si présents)
    if (canvasElements.length > 0 && !hasRecalculated) {
      console.log('🔄 [Migration Canvas] Recalcul automatique du scaling mobile pour', canvasElements.length, 'éléments...');
      const recalculated = recalculateAllElements(canvasElements, 'desktop');
      setCanvasElements(recalculated);
      setHasRecalculated(true);
      console.log('✅ [Migration Canvas] Scaling recalculé avec succès !');
    }

    // Recalculer les modules modulaires (modularPage)
    const allModules = (Object.values(modularPage.screens) as Module[][]).flat();
    if (allModules.length > 0 && !hasRecalculated) {
      console.log('🔄 [Migration Modules] Recalcul automatique du scaling mobile pour', allModules.length, 'modules...');
      const recalculatedModules = recalculateAllElements(allModules as any[], 'desktop');
      
      // Reconstruire modularPage avec les modules recalculés
      const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
      let moduleIndex = 0;
      
      (Object.keys(nextScreens) as ScreenId[]).forEach((screenId) => {
        const screenModules = nextScreens[screenId] || [];
        nextScreens[screenId] = screenModules.map(() => {
          const recalculated = recalculatedModules[moduleIndex];
          moduleIndex++;
          return recalculated as Module;
        });
      });
      
      setModularPage({ screens: nextScreens, _updatedAt: Date.now() });
      setHasRecalculated(true);
      console.log('✅ [Migration Modules] Scaling recalculé avec succès !');
    }
  }, [canvasElements.length, modularPage.screens, hasRecalculated]);
  
  // Détecter la position de scroll pour changer l'écran courant avec IntersectionObserver
  useEffect(() => {
    const canvasScrollArea = document.querySelector('.canvas-scroll-area') as HTMLElement | null;
    if (!canvasScrollArea) return;

    const anchors = Array.from(canvasScrollArea.querySelectorAll('[data-screen-anchor]')) as HTMLElement[];
    if (anchors.length === 0) return;

    // Utiliser IntersectionObserver pour une détection plus précise
    const observerOptions = {
      root: canvasScrollArea,
      rootMargin: '-40% 0px -40% 0px', // Zone centrale pour détecter l'écran principal
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    const visibilityMap = new Map<string, number>();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const screenId = (entry.target as HTMLElement).dataset.screenAnchor as 'screen1' | 'screen2' | 'screen3';
        if (screenId) {
          visibilityMap.set(screenId, entry.intersectionRatio);
        }
      });

      // Trouver l'écran avec le ratio d'intersection le plus élevé
      let maxRatio = 0;
      let mostVisibleScreen: 'screen1' | 'screen2' | 'screen3' = 'screen1';
      
      visibilityMap.forEach((ratio, screenId) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          mostVisibleScreen = screenId as 'screen1' | 'screen2' | 'screen3';
        }
      });

      if (maxRatio > 0.1) { // Seuil minimum pour éviter les changements trop sensibles
        setCurrentScreen((prev) => (prev === mostVisibleScreen ? prev : mostVisibleScreen));
      }
    }, observerOptions);

    anchors.forEach((anchor) => observer.observe(anchor));

    return () => {
      observer.disconnect();
    };
  }, []);

  // Initialize modular page from campaignConfig if present
  useEffect(() => {
    const mp = (campaignConfig as any)?.design?.quizModules as ModularPage | undefined;
    if (mp && mp.screens) {
      setModularPage(mp);
    }
  }, [campaignConfig]);

  // Helper to persist modularPage into campaignConfig (and mark modified)
  const persistModular = useCallback((next: ModularPage) => {
    setModularPage(next);
    setCampaignConfig((prev: any) => {
      const updated = {
        ...(prev || {}),
        design: {
          ...(prev?.design || {}),
          quizModules: { ...next, _updatedAt: Date.now() }
        }
      };
      return updated;
    });
    try { setIsModified(true); } catch {}
  }, [setIsModified]);

  const scrollToScreen = useCallback((screen: ScreenId): boolean => {
    const canvasScrollArea = document.querySelector('.canvas-scroll-area') as HTMLElement | null;
    if (!canvasScrollArea) return false;
    const anchor = canvasScrollArea.querySelector(`[data-screen-anchor="${screen}"]`) as HTMLElement | null;
    if (!anchor) return false;

    const anchorTop = anchor.offsetTop;
    const centerOffset = Math.max(0, (canvasScrollArea.clientHeight - anchor.clientHeight) / 2);
    const target = anchorTop - centerOffset;
    const maxScroll = canvasScrollArea.scrollHeight - canvasScrollArea.clientHeight;
    const clamped = Math.min(Math.max(target, 0), Math.max(maxScroll, 0));

    canvasScrollArea.scrollTo({ top: clamped, behavior: 'smooth' });
    return true;
  }, []);

  const screenHasCardButton = useCallback((modules: Module[] = []) => {
    return modules.some((m) => m.type === 'BlocCarte' && Array.isArray((m as any).children) && (m as any).children.some((child: Module) => child?.type === 'BlocBouton'));
  }, []);

  const editorHasCardButton = useCallback(() => {
    return (Object.values(modularPage.screens) as Module[][]).some((modules) => screenHasCardButton(modules));
  }, [modularPage.screens, screenHasCardButton]);

  const getDefaultButtonLabel = useCallback((screen: ScreenId): string => {
    return screen === 'screen3' ? 'Rejouer' : 'Participer';
  }, []);

  // Bouton "Rejouer" sur l'écran 3 désactivé (retiré par demande utilisateur)
  // React.useEffect(() => {
  //   const screen3Modules = modularPage.screens.screen3 || [];
  //   const hasReplayButton = screen3Modules.some((m) => m.type === 'BlocBouton') || screenHasCardButton(screen3Modules);
  //   if (!hasReplayButton && currentScreen === 'screen3') {
  //     const replayButton: BlocBouton = {
  //       id: `bloc-bouton-replay-${Date.now()}`,
  //       type: 'BlocBouton',
  //       label: getDefaultButtonLabel('screen3'),
  //       href: '#',
  //       background: '#000000',
  //       textColor: '#ffffff',
  //       borderRadius: 9999,
  //       borderWidth: 0,
  //       borderColor: '#000000',
  //       boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  //       uppercase: false,
  //       bold: false,
  //       spacingTop: 0,
  //       spacingBottom: 0
  //     };
  //     const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
  //     nextScreens.screen3 = [...screen3Modules, replayButton];
  //     persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  //   }
  // }, [currentScreen, modularPage.screens.screen3, persistModular, screenHasCardButton, getDefaultButtonLabel]);

  // Modular handlers
  const handleAddModule = useCallback((screen: ScreenId, module: Module) => {
    // Logo : ajouté automatiquement sur tous les écrans en haut
    if (module.type === 'BlocLogo') {
      const logoId = module.id || `BlocLogo-${Date.now()}`;
      const cloneLogo = (base: typeof module): Module => ({
        ...(base as Module),
        id: logoId
      });

      const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
      (Object.keys(nextScreens) as ScreenId[]).forEach((screenId) => {
        const withoutLogo = (nextScreens[screenId] || []).filter((m) => m.type !== 'BlocLogo');
        nextScreens[screenId] = [cloneLogo(module), ...withoutLogo];
      });

      persistModular({ screens: nextScreens, _updatedAt: Date.now() });
      return;
    }

    // Pied de page : ajouté automatiquement sur tous les écrans en bas
    if (module.type === 'BlocPiedDePage') {
      const footerId = module.id || `BlocPiedDePage-${Date.now()}`;
      const cloneFooter = (base: typeof module): Module => {
        if (base.type !== 'BlocPiedDePage') return { ...base } as Module;
        const footer = base;
        return {
          ...footer,
          id: footerId,
          footerLinks: Array.isArray(footer.footerLinks)
            ? footer.footerLinks.map((link) => ({ ...link }))
            : footer.footerLinks,
          socialLinks: Array.isArray(footer.socialLinks)
            ? footer.socialLinks.map((link) => ({ ...link }))
            : footer.socialLinks
        } as Module;
      };

      const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
      (Object.keys(nextScreens) as ScreenId[]).forEach((screenId) => {
        const withoutFooter = (nextScreens[screenId] || []).filter((m) => m.type !== 'BlocPiedDePage');
        nextScreens[screenId] = [...withoutFooter, cloneFooter(module)];
      });

      persistModular({ screens: nextScreens, _updatedAt: Date.now() });
      return;
    }

    setModularPage((prev) => {
      let prevScreenModules = prev.screens[screen] || [];

      if (module.type === 'BlocCarte' && Array.isArray((module as any).children)) {
        const cardHasButton = (module as any).children.some((child: Module) => child?.type === 'BlocBouton');
        if (cardHasButton) {
          prevScreenModules = prevScreenModules.filter((m) => m.type !== 'BlocBouton');
          (module as any).children = (module as any).children.map((child: Module) => {
            if (child?.type === 'BlocBouton') {
              return {
                ...child,
                label: child?.label || getDefaultButtonLabel(screen)
              } as Module;
            }
            return child;
          });
        }
      }
      const isParticiperButton = module.type === 'BlocBouton' && (module.label || '').trim().toLowerCase() === 'participer';

      let updatedModules: Module[];
      if (isParticiperButton) {
        // Participer est supposé unique et restera en fin de tableau
        updatedModules = [...prevScreenModules, module];
      } else {
        const participateIndex = prevScreenModules.findIndex((m) => m.type === 'BlocBouton' && (m as BlocBouton).label?.trim().toLowerCase() === 'participer');
        if (participateIndex >= 0) {
          updatedModules = [
            module,
            ...prevScreenModules.slice(0, participateIndex),
            prevScreenModules[participateIndex],
            ...prevScreenModules.slice(participateIndex + 1)
          ];
        } else {
          updatedModules = [module, ...prevScreenModules];
        }
      }

      const next: ModularPage = {
        screens: {
          ...prev.screens,
          [screen]: updatedModules
        },
        _updatedAt: Date.now()
      };

      persistModular(next);
      return next;
    });
  }, [persistModular]);

  const handleUpdateModule = useCallback((id: string, patch: Partial<Module>) => {
    const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as ScreenId[]).forEach((s) => {
      nextScreens[s] = (nextScreens[s] || []).map((m) => (m.id === id ? { ...m, ...patch } as Module : m));
    });
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular]);

  const ensuredBlocBoutonRef = useRef(false);
  const createDefaultBlocBouton = useCallback((screen: ScreenId = 'screen1'): BlocBouton => ({
    id: `BlocBouton-${Date.now()}`,
    type: 'BlocBouton',
    label: getDefaultButtonLabel(screen),
    href: '#',
    align: 'center',
    borderRadius: 9999,
    background: LAUNCH_BUTTON_FALLBACK_GRADIENT,
    textColor: LAUNCH_BUTTON_DEFAULT_TEXT_COLOR,
    padding: LAUNCH_BUTTON_DEFAULT_PADDING,
    boxShadow: LAUNCH_BUTTON_DEFAULT_SHADOW
  }), [getDefaultButtonLabel]);

  useEffect(() => {
    if (ensuredBlocBoutonRef.current) return;
    const hasStandaloneButton = (Object.values(modularPage.screens) as Module[][]).some((modules) => modules?.some((m) => m.type === 'BlocBouton'));
    if (!hasStandaloneButton && !editorHasCardButton()) {
      const targetScreen = currentScreen || 'screen1';
      const defaultModule = createDefaultBlocBouton(targetScreen);
      const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
      nextScreens[targetScreen] = [...(nextScreens[targetScreen] || []), defaultModule];
      persistModular({ screens: nextScreens, _updatedAt: Date.now() });
    }
    ensuredBlocBoutonRef.current = true;
  }, [modularPage.screens, currentScreen, persistModular, createDefaultBlocBouton, editorHasCardButton]);

  useEffect(() => {
    const legacyButton = canvasElements.find((el) => typeof el?.role === 'string' && el.role.toLowerCase().includes('button'));
    if (!legacyButton) return;

    const hasStandalone = (Object.values(modularPage.screens) as Module[][]).some((modules) => modules?.some((m) => m.type === 'BlocBouton'));
    if (!hasStandalone && !editorHasCardButton()) {
      const newModule: BlocBouton = {
        ...createDefaultBlocBouton((legacyButton.screenId as ScreenId) || currentScreen || 'screen1'),
        label: legacyButton.content || legacyButton.text || 'Participer',
        background: legacyButton.customCSS?.background || LAUNCH_BUTTON_FALLBACK_GRADIENT,
        textColor: legacyButton.customCSS?.color || LAUNCH_BUTTON_DEFAULT_TEXT_COLOR,
        padding: legacyButton.customCSS?.padding || LAUNCH_BUTTON_DEFAULT_PADDING,
        boxShadow: legacyButton.customCSS?.boxShadow || LAUNCH_BUTTON_DEFAULT_SHADOW,
        borderRadius: (() => {
          const cssRadius = legacyButton.customCSS?.borderRadius;
          if (typeof cssRadius === 'number') return cssRadius;
          if (typeof cssRadius === 'string') {
            const parsed = parseFloat(cssRadius.replace('px', ''));
            if (!Number.isNaN(parsed)) return parsed;
          }
          return 9999;
        })()
      };
      const targetScreen = (legacyButton.screenId as ScreenId) || currentScreen || 'screen1';
      const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
      nextScreens[targetScreen] = [...(nextScreens[targetScreen] || []), newModule];
      persistModular({ screens: nextScreens, _updatedAt: Date.now() });
    }
    setCanvasElements((prev) => prev.filter((el) => el !== legacyButton));
  }, [canvasElements, modularPage.screens, currentScreen, persistModular, createDefaultBlocBouton]);

  const handleDeleteModule = useCallback((id: string) => {
    const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as ScreenId[]).forEach((s) => {
      nextScreens[s] = (nextScreens[s] || []).filter((m) => m.id !== id);
    });

    const flattened = (Object.values(nextScreens) as Module[][]).flat();
    const hasStandaloneButton = flattened.some((m) => m.type === 'BlocBouton');
    const hasCardButton = flattened.some((m) => m.type === 'BlocCarte' && Array.isArray((m as any).children) && (m as any).children.some((c: Module) => c?.type === 'BlocBouton'));

    // Réintroduire un bouton par défaut si plus aucun bouton n'est présent
    if (!hasStandaloneButton && !hasCardButton) {
      const defaultButton = createDefaultBlocBouton();
      const targetScreen = currentScreen || 'screen1';
      nextScreens[targetScreen] = [...(nextScreens[targetScreen] || []), defaultButton];
    }

    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular, createDefaultBlocBouton, currentScreen]);

  const handleMoveModule = useCallback((id: string, direction: 'up' | 'down') => {
    const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as ScreenId[]).forEach((s) => {
      const arr = [...(nextScreens[s] || [])];
      const idx = arr.findIndex((m) => m.id === id);
      if (idx >= 0) {
        const swapWith = direction === 'up' ? idx - 1 : idx + 1;
        if (swapWith >= 0 && swapWith < arr.length) {
          const tmp = arr[swapWith];
          arr[swapWith] = arr[idx];
          arr[idx] = tmp;
          nextScreens[s] = arr;
        }
      }
    });
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular]);

  const handleDuplicateModule = useCallback((id: string) => {
    type ModuleWithMeta = Module & { moduleId?: string; label?: string };

    const nextScreens: Record<ScreenId, Module[]> = { ...modularPage.screens };
    let moduleToDuplicate: ModuleWithMeta | null = null;
    let foundScreenId: ScreenId | null = null;
    let originalIndex = -1;

    for (const screenId of Object.keys(nextScreens) as ScreenId[]) {
      const modules = nextScreens[screenId] ?? [];
      const index = modules.findIndex((m) => m.id === id);
      if (index >= 0) {
        moduleToDuplicate = modules[index] as ModuleWithMeta;
        foundScreenId = screenId;
        originalIndex = index;
        break;
      }
    }

    if (!moduleToDuplicate || !foundScreenId || originalIndex < 0) {
      console.warn(`⚠️ Impossible de trouver le module à dupliquer (ID: ${id})`);
      return;
    }

    const newId = `module-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const duplicatedModule: ModuleWithMeta = {
      ...moduleToDuplicate,
      id: newId
    };

    if (typeof moduleToDuplicate.label === 'string' && moduleToDuplicate.label.trim().length > 0) {
      duplicatedModule.label = `${moduleToDuplicate.label} (copie)`;
    }

    if (typeof moduleToDuplicate.moduleId === 'string' && moduleToDuplicate.moduleId.trim().length > 0) {
      duplicatedModule.moduleId = newId;
    }

    const currentModules = nextScreens[foundScreenId] ?? [];
    const updatedModules = [...currentModules];
    updatedModules.splice(originalIndex + 1, 0, duplicatedModule);
    nextScreens[foundScreenId] = updatedModules;

    persistModular({ screens: nextScreens, _updatedAt: Date.now() });

    console.log(`✅ Module dupliqué avec succès (${id} → ${duplicatedModule.id})`);
  }, [modularPage.screens, persistModular]);
  
  // Fonction pour sélectionner tous les éléments (textes, images, etc.)
  const handleSelectAll = useCallback(() => {
    // Filtrer tous les éléments visibles sur le canvas (textes, images, formes, etc.)
    const selectableElements = canvasElements.filter(element => 
      element && element.id && (element.type === 'text' || element.type === 'image' || element.type === 'shape' || element.type)
    );
    
    if (selectableElements.length > 0) {
      setSelectedElements([...selectableElements]);
      setSelectedElement(null); // Désélectionner l'élément unique
      console.log('🎯 Selected all canvas elements:', {
        total: selectableElements.length,
        types: selectableElements.reduce((acc, el) => {
          acc[el.type] = (acc[el.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    } else {
      console.log('🎯 No selectable elements found on canvas');
    }
  }, [canvasElements]);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  // Game modal config unifié (nouveau) - doit être après extractedColors
  const gameModalConfig: GameModalConfig = useMemo(() => createGameConfigFromQuiz({
    ...quizModalConfig,
    extractedColors
  }, 'jackpot'), [quizModalConfig, extractedColors]);
  const [showFunnel, setShowFunnel] = useState(false);
  const [currentStep, setCurrentStep] = useState<'article' | 'form' | 'game' | 'result'>('article');
  const [previewButtonSide, setPreviewButtonSide] = useState<'left' | 'right'>(() =>
    (typeof window !== 'undefined' && localStorage.getItem('previewButtonSide') === 'left') ? 'left' : 'right'
  );
  // Calcul des onglets à masquer selon le mode
  const effectiveHiddenTabs = useMemo(
    () => {
      const result = hiddenTabs ?? (mode === 'template' ? ['campaign', 'export', 'form'] : []);
      console.log('🔍 [DesignEditorLayout] effectiveHiddenTabs:', result, 'mode:', mode);
      return result;
    },
    [hiddenTabs, mode]
  );

  useEffect(() => {
    try {
      localStorage.setItem('previewButtonSide', previewButtonSide);
    } catch {}
  }, [previewButtonSide]);

  // Activer la saisie directe sur double-clic pour tous les curseurs (input[type="range"]) de l'éditeur
  useEffect(() => {
    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Rechercher l'input range le plus proche (utile si on double-clique sur le track personnalisé)
      const range = target.closest('input[type="range"]') as HTMLInputElement | null;
      if (!range) return;

      // Empêcher les comportements par défaut, puis demander une saisie
      e.preventDefault();

      const min = Number(range.min || '0');
      const max = Number(range.max || '100');
      const step = Number(range.step || '1');
      const current = range.value || String((min + max) / 2);

      const suffixFromAria = /%/.test(range.getAttribute('aria-label') || '') ? '%' : '';
      const suffix = range.dataset.suffix || suffixFromAria;

      const label = `Entrer une valeur (${min} - ${max})${suffix ? ' ' + suffix : ''}`;
      const raw = window.prompt(label, current);
      if (raw == null) return; // annulé

      // Supporter virgule décimale et espaces
      const normalized = raw.replace(/\s+/g, '').replace(',', '.');
      let val = Number(normalized);
      if (Number.isNaN(val)) return;

      // Clamp min/max
      val = Math.min(max, Math.max(min, val));

      // Respecter le pas si applicable
      if (!Number.isNaN(step) && step > 0) {
        val = Math.round(val / step) * step;
      }

      // Appliquer la valeur et émettre les événements React
      range.value = String(val);
      range.dispatchEvent(new Event('input', { bubbles: true }));
      range.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // Utiliser la capture pour attraper le double-clic même sur des éléments enfants stylisés
    document.addEventListener('dblclick', handleDblClick, true);
    return () => document.removeEventListener('dblclick', handleDblClick, true);
  }, []);

  // Chargement d'un modèle transmis via navigation state
  useEffect(() => {
    const state = (location as any)?.state as any;
    const template = state?.templateCampaign;
    if (template) {
      const tplCanvas = template.canvasConfig || {};
      const bg = tplCanvas.background || template.design?.background || { type: 'color', value: '#ffffff' };

      setCanvasElements(Array.isArray(tplCanvas.elements) ? tplCanvas.elements : []);
      setCanvasBackground(typeof bg === 'string' ? { type: 'color', value: bg } : bg);

      if (template.design?.extractedColors && Array.isArray(template.design.extractedColors)) {
        setExtractedColors(template.design.extractedColors);
      }

      setCampaignConfig((prev: any) => ({
        ...prev,
        design: {
          ...(prev?.design || {}),
          ...(template.design || {}),
          wheelConfig: {
            ...((prev?.design as any)?.wheelConfig || {}),
            ...((template.design as any)?.wheelConfig || {})
          }
        }
      }));

      if (tplCanvas.device && ['desktop', 'tablet', 'mobile'].includes(tplCanvas.device)) {
        setSelectedDevice(tplCanvas.device);
        setCanvasZoom(getDefaultZoom(tplCanvas.device));
      }
    }
  }, [location]);

  // Ajoute à l'historique lors de l'ajout d'un nouvel élément (granulaire)
  const handleAddElement = (element: any) => {
    const resolvedScreenId = element?.screenId
      || (currentScreen === 'screen2'
        ? 'screen2'
        : currentScreen === 'screen3' ? 'screen3' : 'screen1');
    const enrichedElement = element?.screenId ? element : { ...element, screenId: resolvedScreenId };
    setCanvasElements(prev => {
      const newArr = [...prev, enrichedElement];
      setTimeout(() => {
        addToHistory({
          campaignConfig: { ...campaignConfig },
          canvasElements: JSON.parse(JSON.stringify(newArr)),
          canvasBackground: { ...canvasBackground }
        }, 'element_create');
      }, 0);
      return newArr;
    });
    setSelectedElement(enrichedElement);
  };

  // Ajoute à l'historique lors du changement de background (granulaire)
  const handleBackgroundChange = (bg: any, options?: { screenId?: 'screen1' | 'screen2' | 'screen3'; applyToAllScreens?: boolean; device?: 'desktop' | 'tablet' | 'mobile' }) => {
    console.log('🎨 [JackpotEditor] handleBackgroundChange:', { bg, options });
    
    if (options?.applyToAllScreens) {
      // Appliquer à tous les écrans
      console.log('✅ Applying background to ALL screens');
      setScreenBackgrounds({
        screen1: bg,
        screen2: bg,
        screen3: bg
      });
      setCanvasBackground(bg); // Fallback global
    } else if (options?.screenId && options?.device) {
      // 📱 Appliquer uniquement à l'écran ET appareil spécifiés
      console.log(`✅ Applying background to ${options.screenId} on ${options.device} ONLY`);
      setScreenBackgrounds(prev => {
        const screenKey = options.screenId!;
        const deviceKey = options.device!;
        const currentScreenBg = prev[screenKey];
        
        // Structure: { type, value, devices: { desktop: {...}, mobile: {...}, tablet: {...} } }
        const newScreenBg = {
          ...currentScreenBg,
          devices: {
            ...(currentScreenBg?.devices || {}),
            [deviceKey]: bg
          }
        };
        
        console.log('📱 Updated screen background with device-specific data:', {
          screenKey,
          deviceKey,
          newScreenBg
        });
        
        return {
          ...prev,
          [screenKey]: newScreenBg
        };
      });
    } else if (options?.screenId) {
      // Appliquer uniquement à l'écran spécifié (tous devices)
      console.log(`✅ Applying background to ${options.screenId} ONLY`);
      setScreenBackgrounds(prev => ({
        ...prev,
        [options.screenId!]: bg
      }));
      // Ne pas modifier canvasBackground global
    } else {
      // Pas d'options : comportement par défaut (appliquer globalement)
      console.log('⚠️ No options provided, applying globally (fallback)');
      setScreenBackgrounds({
        screen1: bg,
        screen2: bg,
        screen3: bg
      });
      setCanvasBackground(bg);
    }
    
    setTimeout(() => {
      addToHistory({
        campaignConfig: { ...campaignConfig },
        canvasElements: JSON.parse(JSON.stringify(canvasElements)),
        canvasBackground: { ...bg },
        screenBackgrounds: { ...screenBackgrounds }
      }, 'background_update');
    }, 0);

    // Auto-theme quiz + form based on solid background color
    try {
      if (bg?.type === 'color' && typeof bg.value === 'string') {
        const base = bg.value as string;

        const toRgb = (color: string): { r: number; g: number; b: number } | null => {
          if (!color) return null;
          const hex = color.trim();
          const rgbMatch = hex.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
          if (rgbMatch) {
            return { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
          }
          const h = hex.replace('#', '');
          if (h.length === 3) {
            const r = parseInt(h[0] + h[0], 16);
            const g = parseInt(h[1] + h[1], 16);
            const b = parseInt(h[2] + h[2], 16);
            return { r, g, b };
          }
          if (h.length === 6) {
            const r = parseInt(h.slice(0, 2), 16);
            const g = parseInt(h.slice(2, 4), 16);
            const b = parseInt(h.slice(4, 6), 16);
            return { r, g, b };
          }
          return null;
        };
        const toHex = (rgb: { r: number; g: number; b: number }): string => {
          const c = (n: number) => n.toString(16).padStart(2, '0');
          return `#${c(Math.max(0, Math.min(255, Math.round(rgb.r))))}${c(Math.max(0, Math.min(255, Math.round(rgb.g))))}${c(Math.max(0, Math.min(255, Math.round(rgb.b))))}`;
        };
        const luminance = (rgb: { r: number; g: number; b: number }) => {
          const a = [rgb.r, rgb.g, rgb.b].map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
        };
        const darken = (rgb: { r: number; g: number; b: number }, pct: number) => ({
          r: rgb.r * (1 - pct),
          g: rgb.g * (1 - pct),
          b: rgb.b * (1 - pct)
        });
        const lighten = (rgb: { r: number; g: number; b: number }, pct: number) => ({
          r: rgb.r + (255 - rgb.r) * pct,
          g: rgb.g + (255 - rgb.g) * pct,
          b: rgb.b + (255 - rgb.b) * pct
        });
        const getTextOn = (rgb: { r: number; g: number; b: number }) => (luminance(rgb) > 0.55 ? '#111111' : '#ffffff');

        const baseRgb = toRgb(base);
        if (baseRgb) {
          // Choose a primary accent that contrasts with background
          const primaryRgb = luminance(baseRgb) > 0.6 ? darken(baseRgb, 0.35) : lighten(baseRgb, 0.35);
          const primaryHex = toHex(primaryRgb);
          const buttonText = getTextOn(primaryRgb);
          const hoverHex = toHex(darken(primaryRgb, 0.12));
          const activeHex = toHex(darken(primaryRgb, 0.24));

          setCampaignConfig((prev: any) => {
            const next = {
              ...(prev || {}),
              design: {
                ...(prev?.design || {}),
                // expose brand colors for forms + other UIs
                customColors: {
                  ...(prev?.design?.customColors || {}),
                  primary: primaryHex,
                  secondary: '#ffffff',
                  _updatedAt: Date.now()
                },
                quizConfig: {
                  ...(prev?.design?.quizConfig || {}),
                  style: {
                    ...(prev?.design?.quizConfig?.style || {}),
                    buttonBackgroundColor: primaryHex,
                    buttonTextColor: buttonText,
                    buttonHoverBackgroundColor: hoverHex,
                    buttonActiveBackgroundColor: activeHex
                  }
                }
              }
            };
            return next;
          });
        }
      }
    } catch (e) {
      console.warn('Auto-theme from background color failed:', e);
    }
  };

  // Ajoute à l'historique lors du changement de config (granulaire)
  const handleCampaignConfigChange = (cfg: any) => {
    setCampaignConfig(cfg);
    setTimeout(() => {
      addToHistory({
        campaignConfig: { ...cfg },
        canvasElements: JSON.parse(JSON.stringify(canvasElements)),
        canvasBackground: { ...canvasBackground }
      }, 'config_update');
    }, 0);
  };

  // Ajoute à l'historique à chaque modification d'élément (granulaire)
  const handleElementUpdate = (updates: any) => {
    console.log('🔄 handleElementUpdate called:', {
      updates,
      selectedElementId: selectedElement?.id,
      selectedElementType: selectedElement?.type,
      selectedElementRole: (selectedElement as any)?.role,
      hasSelectedElement: !!selectedElement,
      totalElements: canvasElements.length
    });

    const isModuleText = (selectedElement as any)?.role === 'module-text' && (selectedElement as any)?.moduleId;
    if (isModuleText) {
      const moduleId = (selectedElement as any).moduleId as string;

      // Route ALL updates to the module (including rotation)
      const modulePatch: Partial<Module> & Record<string, any> = {};
      if (updates.fontFamily) modulePatch.bodyFontFamily = updates.fontFamily;
      if (updates.color) modulePatch.bodyColor = updates.color;
      if (updates.fontSize) modulePatch.bodyFontSize = updates.fontSize;
      if (updates.fontWeight) modulePatch.bodyBold = updates.fontWeight === 'bold';
      if (updates.fontStyle) modulePatch.bodyItalic = updates.fontStyle === 'italic';
      if (updates.textDecoration) modulePatch.bodyUnderline = updates.textDecoration?.includes('underline');
      if (updates.textAlign) modulePatch.align = updates.textAlign;
      
      // Add rotation to module
      if (typeof updates.rotation === 'number') {
        modulePatch.rotation = updates.rotation;
      }

      if (Object.keys(modulePatch).length > 0) {
        handleUpdateModule(moduleId, modulePatch);
      }

      // Update local selectedElement to reflect changes
      setSelectedElement((prev: any) => (prev ? { ...prev, ...updates } : prev));
      return;
    }

    if (selectedElement) {
      const deviceScopedKeys = ['x', 'y', 'width', 'height', 'fontSize', 'textAlign'];
      const isDeviceScoped = selectedDevice !== 'desktop';
      const workingUpdates: Record<string, any> = { ...updates };
      const devicePatch: Record<string, any> = {};

      if (isDeviceScoped) {
        for (const key of deviceScopedKeys) {
          if (workingUpdates[key] !== undefined) {
            devicePatch[key] = workingUpdates[key];
            delete workingUpdates[key];
          }
        }
      }

      let updatedElement: any = {
        ...selectedElement,
        ...workingUpdates,
        ...(isDeviceScoped
          ? {
              [selectedDevice]: {
                ...(selectedElement as any)[selectedDevice],
                ...devicePatch
              }
            }
          : {})
      };

      setCanvasElements(prev => {
        const newArr = prev.map(el =>
          el.id === selectedElement.id ? updatedElement : el
        );
        setTimeout(() => {
          addToHistory({
            campaignConfig: { ...campaignConfig },
            canvasElements: JSON.parse(JSON.stringify(newArr)),
            canvasBackground: { ...canvasBackground }
          }, 'element_update');
        }, 0);
        console.log('🎯 Elements updated, new array:', newArr);
        return newArr;
      });
      console.log('🎯 Setting selected element to:', updatedElement);
      setSelectedElement(updatedElement);
    }
  };

  // Mettre à jour les éléments du canvas avec le nouveau border radius
  const updateCanvasElementsBorderRadius = useCallback((borderRadius: number) => {
    console.log('🔄 updateCanvasElementsBorderRadius appelé avec:', borderRadius);
    
    // Mettre à jour campaignConfig avec le nouveau border radius
    setCampaignConfig((currentConfig: any) => {
      const updatedConfig = { ...currentConfig };
      updatedConfig.design = updatedConfig.design || {};
      updatedConfig.design.quizConfig = updatedConfig.design.quizConfig || {};
      // Ne pas écraser les couleurs; ne mettre à jour que borderRadius
      updatedConfig.design.quizConfig.style = {
        ...(updatedConfig.design.quizConfig.style || {}),
        borderRadius: `${borderRadius}px`
      };
      console.log('🎯 CampaignConfig mise à jour (borderRadius uniquement):', updatedConfig.design.quizConfig.style);
      return updatedConfig;
    });
    
    // Émettre un événement pour forcer le re-render du TemplatedQuiz
    const event = new CustomEvent('quizStyleUpdate', { 
      detail: { 
        borderRadius: `${borderRadius}px`
      } 
    });
    window.dispatchEvent(event);
    
    // Mettre à jour les éléments du canvas (pour compatibilité)
    setCanvasElements(currentElements => 
      currentElements.map(element => {
        if (element?.type === 'quiz' || element?.id === 'quiz-template') {
          return {
            ...element,
            borderRadius: `${borderRadius}px`,
            style: {
              ...(element.style || {}),
              borderRadius: `${borderRadius}px`
            }
          };
        }
        return element;
      })
    );
  }, [setCampaignConfig]);

  // Quiz Editor doesn't need wheel config sync - using quiz config instead
  const wheelModalConfig = null;

  // Système d'historique pour undo/redo avec le nouveau hook
  const {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo({
    maxHistorySize: 50,
    onUndo: (restoredSnapshot) => {
      console.log(' Undo: Restauration du snapshot', restoredSnapshot);
      if (restoredSnapshot) {
        // Restaure tous les sous-états à partir du snapshot
        setCampaignConfig(restoredSnapshot.campaignConfig || {});
        setCanvasElements(restoredSnapshot.canvasElements || []);
        setCanvasBackground(restoredSnapshot.canvasBackground || { type: 'color', value: '#ffffff' });
        setSelectedElement(null);
      }
    },
    onRedo: (restoredSnapshot) => {
      console.log(' Redo: Restauration du snapshot', restoredSnapshot);
      if (restoredSnapshot) {
        setCampaignConfig(restoredSnapshot.campaignConfig || {});
        setCanvasElements(restoredSnapshot.canvasElements || []);
        setCanvasBackground(restoredSnapshot.canvasBackground || { type: 'color', value: '#ffffff' });
        setSelectedElement(null);
      }
    },
    onStateChange: (state, action) => {
      console.log(` Changement d'état dans l'historique: ${action}`, state);
      setIsModified(true);
    }
  });

  // Raccourcis clavier pour undo/redo
  useUndoRedoShortcuts(undo, redo, {
    enabled: true,
    preventDefault: true
  });
  
  // Hook de gestion des groupes (après addToHistory)
  const groupManager = useGroupManager({
    elements: canvasElements,
    onElementsChange: setCanvasElements,
    onAddToHistory: addToHistory
  });
  
  // Hook de synchronisation preview
  const { syncBackground } = useEditorPreviewSync();
  
  const {
    createGroup,
    ungroupElements,
    selectedGroupId,
    setSelectedGroupId,
    getGroupElements
  } = groupManager;
  
  // Fonctions pour les raccourcis clavier d'éléments
  const handleDeselectAll = useCallback(() => {
    setSelectedElement(null);
    setSelectedElements([]);
    console.log('🎯 Deselected all elements');
  }, []);
  
  const handleElementDelete = useCallback((elementId?: string) => {
    const targetElementId = elementId || selectedElement?.id;
    if (targetElementId) {
      setCanvasElements(prev => {
        const newElements = prev.filter(el => el.id !== targetElementId);
        setTimeout(() => {
          addToHistory({
            campaignConfig: { ...campaignConfig },
            canvasElements: JSON.parse(JSON.stringify(newElements)),
            canvasBackground: { ...canvasBackground }
          }, 'element_delete');
        }, 0);
        return newElements;
      });
      setSelectedElement(null);
      console.log('🗑️ Deleted element:', targetElementId);
    } else {
      console.log('🗑️ No element to delete - selectedElement:', selectedElement);
    }
  }, [selectedElement, campaignConfig, canvasBackground, addToHistory]);
  
  const handleElementCopy = useCallback(() => {
    if (selectedElement) {
      localStorage.setItem('clipboard-element', JSON.stringify(selectedElement));
      console.log('📋 Copied element:', selectedElement.id);
    }
  }, [selectedElement]);
  
  const handleElementCut = useCallback(() => {
    if (selectedElement) {
      // D'abord copier l'élément
      localStorage.setItem('clipboard-element', JSON.stringify(selectedElement));
      console.log('✂️ Cut element (copied):', selectedElement.id);
      
      // Puis le supprimer
      const elementId = selectedElement.id;
      setCanvasElements(prev => {
        const newElements = prev.filter(el => el.id !== elementId);
        setTimeout(() => {
          addToHistory({
            campaignConfig: { ...campaignConfig },
            canvasElements: JSON.parse(JSON.stringify(newElements)),
            canvasBackground: { ...canvasBackground }
          }, 'element_cut');
        }, 0);
        return newElements;
      });
      setSelectedElement(null);
      console.log('✂️ Cut element (deleted):', elementId);
    } else {
      console.log('✂️ No element to cut - selectedElement:', selectedElement);
    }
  }, [selectedElement, campaignConfig, canvasBackground, addToHistory]);
  
  const handleElementPaste = useCallback(() => {
    try {
      const clipboardData = localStorage.getItem('clipboard-element');
      if (clipboardData) {
        const element = JSON.parse(clipboardData);
        const newElement = {
          ...element,
          id: `${element.type}-${Date.now()}`,
          x: (element.x || 0) + 20,
          y: (element.y || 0) + 20
        };
        handleAddElement(newElement);
        console.log('📋 Pasted element:', newElement.id);
      }
    } catch (error) {
      console.error('Error pasting element:', error);
    }
  }, [handleAddElement]);
  
  const handleElementDuplicate = useCallback(() => {
    if (selectedElement) {
      const newElement = {
        ...selectedElement,
        id: `${selectedElement.type}-${Date.now()}`,
        x: (selectedElement.x || 0) + 20,
        y: (selectedElement.y || 0) + 20
      };
      handleAddElement(newElement);
      console.log('🔄 Duplicated element:', newElement.id);
    }
  }, [selectedElement, handleAddElement]);
  
  const quizStyleOverrides = useMemo<Record<string, any>>(() => {
    return (campaignConfig?.design?.quizConfig?.style || {}) as Record<string, any>;
  }, [campaignConfig]);

  const buttonModule = useMemo(() => {
    return (Object.values(modularPage.screens).flat() as BlocBouton[]).find((module) => module.type === 'BlocBouton');
  }, [modularPage.screens]);

  const lastModuleSelectionRef = useRef<string | null>(null);

  useEffect(() => {
    const role = (selectedElement as any)?.role;
    const moduleId = (selectedElement as any)?.moduleId as string | undefined;
    const isModularRole =
      role === 'module-button' ||
      role === 'module-image' ||
      role === 'module-video' ||
      role === 'module-social' ||
      role === 'module-html' ||
      role === 'module-carte' ||
      role === 'module-logo' ||
      role === 'module-footer' ||
      role === 'module-text';

    if (!moduleId || !isModularRole) {
      if (selectedModuleId !== null) {
        setSelectedModuleId(null);
      }
      return;
    }

    const isNewSelection = selectedModuleId !== moduleId;
    
    if (isNewSelection) {
      lastModuleSelectionRef.current = moduleId;
      setSelectedModuleId(moduleId);
      
      const allModules = (Object.values(modularPage.screens) as Module[][]).flat();
      const module = allModules.find((m) => m.id === moduleId);
      
      // En mode article, ne pas forcer l'onglet background car il n'existe pas
      if (module?.type === 'BlocTexte' && editorMode !== 'article') {
        if (activeSidebarTab !== 'background') {
          setActiveSidebarTab('background');
          if (sidebarRef.current) {
            sidebarRef.current.setActiveTab('background');
          }
        }
        setShowDesignInSidebar(true);
      } else {
        if (activeSidebarTab !== 'elements') {
          setActiveSidebarTab('elements');
          if (sidebarRef.current) {
            sidebarRef.current.setActiveTab('elements');
          }
        }
        setShowDesignInSidebar(false);
      }
      
      setShowEffectsInSidebar(false);
      setShowAnimationsInSidebar(false);
      setShowPositionInSidebar(false);
    }
  }, [selectedElement, selectedModuleId, activeSidebarTab, modularPage.screens]);

  const exitMessageElement = useMemo(() => {
    return canvasElements.find(
      (el) => el.type === 'text' && typeof el?.role === 'string' && el.role.toLowerCase() === 'exit-message'
    );
  }, [canvasElements]);

  const campaignQuizStyle = (campaignConfig?.design?.quizConfig?.style ?? {}) as Record<string, any>;

  const launchButtonStyles = useMemo(() => {
    const base = buildLaunchButtonStyles(buttonModule, quizStyleOverrides, {
      buttonBackgroundColor:
        typeof quizStyleOverrides.buttonBackgroundColor === 'string' && quizStyleOverrides.buttonBackgroundColor.length > 0
          ? quizStyleOverrides.buttonBackgroundColor
          : ((campaignQuizStyle as any)?.buttonBackgroundColor as string | undefined) || LAUNCH_BUTTON_FALLBACK_GRADIENT,
      buttonTextColor:
        typeof quizStyleOverrides.buttonTextColor === 'string' && quizStyleOverrides.buttonTextColor.length > 0
          ? quizStyleOverrides.buttonTextColor
          : (quizConfig.buttonTextColor || LAUNCH_BUTTON_DEFAULT_TEXT_COLOR),
      buttonHoverBackgroundColor: quizConfig.buttonHoverBackgroundColor,
      buttonActiveBackgroundColor: quizConfig.buttonActiveBackgroundColor,
      borderRadius: quizConfig.borderRadius
    });
    if (exitMessageElement) {
      return {
        ...base,
        display: 'none'
      } satisfies React.CSSProperties;
    }
    return base;
  }, [buttonModule, quizStyleOverrides, campaignQuizStyle, quizConfig.buttonHoverBackgroundColor, quizConfig.buttonActiveBackgroundColor, quizConfig.borderRadius, exitMessageElement]);

  const launchButtonText = useMemo(() => {
    return buttonModule?.label || (quizStyleOverrides.buttonLabel as string | undefined) || 'Participer';
  }, [buttonModule, quizStyleOverrides.buttonLabel]);

  const emitQuizStyleUpdate = useCallback((detail: Record<string, any>) => {
    if (!detail || Object.keys(detail).length === 0) return;
    try {
      const target = document.getElementById('quiz-preview-container') || window;
      const event = new CustomEvent('quizStyleUpdate', { detail });
      const dispatched = target.dispatchEvent(event);
      if (!dispatched) {
        const fallback = new CustomEvent('quizStyleUpdateFallback', { detail });
        target.dispatchEvent(fallback);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'émission de quizStyleUpdate pour le bouton:', error);
    }
  }, []);

  const updateCampaignQuizStyle = useCallback((changes: Record<string, any>) => {
    setCampaignConfig((prev: any) => {
      const next = { ...(prev || {}) };
      const design = { ...(next.design || {}) };
      const quizDesign = { ...(design.quizConfig || {}) };
      const style = { ...(quizDesign.style || {}) };

      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          delete style[key];
        } else {
          (style as any)[key] = value;
        }
      });

      next.design = {
        ...design,
        quizConfig: {
          ...quizDesign,
          style
        }
      };

      return next;
    });
  }, [setCampaignConfig]);

  const handleLaunchButtonStyleChange = useCallback((styles: Partial<React.CSSProperties>) => {
    if (!styles || Object.keys(styles).length === 0) return;
    const targetModule = buttonModule;
    if (!targetModule) return;

    const patch: Partial<BlocBouton> = {};
    const quizStyleDetail: Record<string, any> = {};

    if (styles.background !== undefined) {
      const backgroundValue: string =
        typeof styles.background === 'string' && styles.background.length > 0
          ? styles.background
          : LAUNCH_BUTTON_FALLBACK_GRADIENT;
      patch.background = backgroundValue;
      setQuizConfig(prev => ({ ...prev, buttonBackgroundColor: backgroundValue }));
      updateCampaignQuizStyle({ buttonBackgroundColor: backgroundValue });
      quizStyleDetail.buttonBackgroundColor = backgroundValue;
    }

    if (styles.color !== undefined) {
      const textColorValue: string =
        typeof styles.color === 'string' && styles.color.length > 0
          ? styles.color
          : LAUNCH_BUTTON_DEFAULT_TEXT_COLOR;
      patch.textColor = textColorValue;
      setQuizConfig(prev => ({ ...prev, buttonTextColor: textColorValue }));
      updateCampaignQuizStyle({ buttonTextColor: textColorValue });
      quizStyleDetail.buttonTextColor = textColorValue;
    }

    if (styles.borderRadius !== undefined) {
      const radiusValue = typeof styles.borderRadius === 'number'
        ? styles.borderRadius
        : parseFloat(String(styles.borderRadius).replace('px', ''));
      const normalizedRadius = Number.isNaN(radiusValue) ? 9999 : radiusValue;
      patch.borderRadius = normalizedRadius;
      setQuizConfig(prev => ({ ...prev, borderRadius: normalizedRadius }));
      updateCampaignQuizStyle({ borderRadius: `${normalizedRadius}px` });
      quizStyleDetail.borderRadius = `${normalizedRadius}px`;
    }

    if (styles.padding !== undefined) {
      const paddingValue = typeof styles.padding === 'number' ? `${styles.padding}px` : styles.padding || LAUNCH_BUTTON_DEFAULT_PADDING;
      patch.padding = paddingValue;
      updateCampaignQuizStyle({ buttonPadding: paddingValue });
      quizStyleDetail.buttonPadding = paddingValue;
    }

    if (styles.boxShadow !== undefined) {
      const shadowValue = styles.boxShadow || LAUNCH_BUTTON_DEFAULT_SHADOW;
      patch.boxShadow = shadowValue;
      updateCampaignQuizStyle({ buttonBoxShadow: shadowValue });
      quizStyleDetail.buttonBoxShadow = shadowValue;
    }

    if (styles.textTransform !== undefined) {
      const transformValue = styles.textTransform || undefined;
      updateCampaignQuizStyle({ buttonTextTransform: transformValue });
      quizStyleDetail.buttonTextTransform = transformValue;
    }

    if (styles.fontWeight !== undefined) {
      const fontWeightValue = styles.fontWeight || undefined;
      updateCampaignQuizStyle({ buttonFontWeight: fontWeightValue });
      quizStyleDetail.buttonFontWeight = fontWeightValue;
    }

    handleUpdateModule(targetModule.id, patch);
    emitQuizStyleUpdate(quizStyleDetail);
  }, [buttonModule, handleUpdateModule, updateCampaignQuizStyle, emitQuizStyleUpdate, setQuizConfig]);

  const handleLaunchButtonTextChange = useCallback((text: string) => {
    const targetModule = buttonModule;
    if (!targetModule) return;
    handleUpdateModule(targetModule.id, { label: text });
    updateCampaignQuizStyle({ buttonLabel: text });
  }, [buttonModule, handleUpdateModule, updateCampaignQuizStyle]);

  const handleLaunchButtonReset = useCallback(() => {
    handleLaunchButtonStyleChange({
      background: LAUNCH_BUTTON_FALLBACK_GRADIENT,
      color: LAUNCH_BUTTON_DEFAULT_TEXT_COLOR,
      padding: LAUNCH_BUTTON_DEFAULT_PADDING,
      borderRadius: '9999px',
      boxShadow: LAUNCH_BUTTON_DEFAULT_SHADOW,
      textTransform: undefined,
      fontWeight: 600
    });
    handleLaunchButtonTextChange('Participer');
  }, [handleLaunchButtonStyleChange, handleLaunchButtonTextChange]);
  
  // Synchronisation avec le store
  useEffect(() => {
    setPreviewDevice(selectedDevice);
  }, [selectedDevice, setPreviewDevice]);

  // Configuration de campagne dynamique optimisée avec synchronisation forcée
  const campaignData = useMemo(() => {
    const titleElement = canvasElements.find(el => el.type === 'text' && el.role === 'title');
    const descriptionElement = canvasElements.find(el => el.type === 'text' && el.role === 'description');
    const fallbackButtonText = launchButtonText;

    const customTexts = canvasElements.filter(el => 
      el.type === 'text' && !['title', 'description', 'button'].includes(el.role)
    );
    const customImages = canvasElements.filter(el => el.type === 'image');
    
    // Inclure les modules dans les éléments pour l'aperçu
    const allModules = Object.values(modularPage.screens).flat();
    console.log('📦 [DesignEditorLayout] Modules trouvés:', {
      modulesCount: allModules.length,
      modules: allModules.map((m: any) => ({ id: m.id, type: m.type, label: m.label }))
    });

    // Primary color used by quiz buttons and participation form
    const toRgb = (color: string): { r: number; g: number; b: number } | null => {
      if (!color) return null;
      const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
      if (m) return { r: +m[1], g: +m[2], b: +m[3] };
      const h = color.replace('#', '');
      if (h.length === 3) return { r: parseInt(h[0]+h[0],16), g: parseInt(h[1]+h[1],16), b: parseInt(h[2]+h[2],16) };
      if (h.length === 6) return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
      return null;
    };
    const toHex = (rgb: { r: number; g: number; b: number }): string => {
      const c = (n: number) => n.toString(16).padStart(2, '0');
      return `#${c(Math.max(0, Math.min(255, Math.round(rgb.r))))}${c(Math.max(0, Math.min(255, Math.round(rgb.g))))}${c(Math.max(0, Math.min(255, Math.round(rgb.b))))}`;
    };
    const luminance = (rgb: { r: number; g: number; b: number }) => {
      const a = [rgb.r, rgb.g, rgb.b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };
    const darken = (rgb: { r: number; g: number; b: number }, pct: number) => ({ r: rgb.r * (1 - pct), g: rgb.g * (1 - pct), b: rgb.b * (1 - pct) });
    const lighten = (rgb: { r: number; g: number; b: number }, pct: number) => ({ r: rgb.r + (255 - rgb.r) * pct, g: rgb.g + (255 - rgb.g) * pct, b: rgb.b + (255 - rgb.b) * pct });

    const configuredPrimary = campaignConfig?.design?.customColors?.primary as string | undefined;
    const primaryColor = (() => {
      if (configuredPrimary) return configuredPrimary;
      if (canvasBackground.type === 'image' && extractedColors[0]) return extractedColors[0];
      if (canvasBackground.type === 'color' && typeof canvasBackground.value === 'string') {
        const baseRgb = toRgb(canvasBackground.value);
        if (baseRgb) {
          const accentRgb = luminance(baseRgb) > 0.6 ? darken(baseRgb, 0.35) : lighten(baseRgb, 0.35);
          return toHex(accentRgb);
        }
      }
      return '#841b60';
    })();
    const secondaryColor = '#ffffff';

    // Build dynamic quiz questions for preview:
    const configuredQuestions = (
      (campaignState as any)?.quizConfig?.questions ||
      (campaignConfig as any)?.quizConfig?.questions ||
      (campaignState as any)?.gameConfig?.quiz?.questions ||
      (campaignConfig as any)?.gameConfig?.quiz?.questions ||
      []
    );
    
    console.log('🧭 [QuizEditorLayout] campaignData questions:', {
      count: Array.isArray(configuredQuestions) ? configuredQuestions.length : 0,
      device: selectedDevice
    });

    

    const screenSources = [
      (campaignState as any)?.screens,
      (campaignConfig as any)?.screens,
      (campaignConfig as any)?.design?.screens
    ].find((screens): screens is any[] => Array.isArray(screens)) || [];

    const fallbackExitContent = (exitMessageElement as any)?.content?.trim() || '';

    const defaultScreens = [
      {
        title: 'Testez vos connaissances !',
        description: 'Répondez aux questions et découvrez votre score',
        buttonText: fallbackButtonText
      },
      {
        title: 'Vos informations',
        description: '',
        buttonText: 'Continuer'
      },
      {
        title: '',
        description: '',
        buttonText: 'Valider'
      },
      {
        confirmationTitle: fallbackExitContent,
        confirmationMessage: fallbackExitContent,
        description: fallbackExitContent,
        replayButtonText: 'Rejouer'
      }
    ];

    defaultScreens.map((defaults, index) => {
      const existing = screenSources[index] || {};
      const merged: Record<string, any> = { ...defaults, ...existing };

      if (index === 0) {
        merged.title = titleElement?.content || merged.title;
        merged.description = descriptionElement?.content || merged.description;
        merged.buttonText = fallbackButtonText;
      }

      if (index === 3) {
        const exitContent = (exitMessageElement as any)?.content?.trim();
        if (exitContent) {
          merged.confirmationMessage = exitContent;
          merged.description = exitContent;
        }
        if (!merged.confirmationTitle) {
          merged.confirmationTitle = defaults.confirmationTitle;
        }
        if (!merged.replayButtonText) {
          merged.replayButtonText = defaults.replayButtonText;
        }
      }

      return merged;
    });

    // Scratch-specific transformation
    const primaryRgb = toRgb(primaryColor) ?? { r: 132, g: 27, b: 96 };
    const hoverHex = toHex(lighten(primaryRgb, 0.12));
    const activeHex = toHex(darken(primaryRgb, 0.1));

    const styleSource =
      (campaignConfig as any)?.design?.scratchConfig?.style ||
      (campaignConfig as any)?.design?.quizConfig?.style ||
      {};

    const buttonLabel = fallbackButtonText || 'Gratter maintenant';

    const scratchStyle = {
      width: styleSource.width || (quizConfig.width || initialTemplateWidths.desktop),
      mobileWidth: styleSource.mobileWidth || (quizConfig.mobileWidth || initialTemplateWidths.mobile),
      backgroundOpacity: styleSource.backgroundOpacity ?? 100,
      borderRadius: styleSource.borderRadius || `${quizConfig.borderRadius}px` || '12px',
      textColor: styleSource.textColor || '#000000',
      buttonBackgroundColor: styleSource.buttonBackgroundColor || primaryColor,
      buttonTextColor: styleSource.buttonTextColor || '#ffffff',
      buttonHoverBackgroundColor: styleSource.buttonHoverBackgroundColor || hoverHex,
      buttonActiveBackgroundColor: styleSource.buttonActiveBackgroundColor || activeHex
    };

    const jackpotConfig = (campaignState as any)?.jackpotConfig || {
      reels: 3,
    };

    return {
      id: 'jackpot-design-preview',
      type: 'jackpot',
      design: {
        background: canvasBackground,
        screenBackgrounds: screenBackgrounds, // Backgrounds par écran pour le preview
        customTexts: customTexts,
        customImages: customImages,
        extractedColors: extractedColors,
        customColors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: extractedColors[2] || '#45b7d1'
        },
        jackpotConfig: jackpotConfig,
        designModules: modularPage
      },
      gameConfig: {
        jackpot: jackpotConfig
      },
      buttonConfig: {
        text: buttonLabel,
        color: scratchStyle.buttonBackgroundColor,
        textColor: scratchStyle.buttonTextColor,
        borderRadius: scratchStyle.borderRadius || '12px'
      },
      screens: [
        {
          title: titleElement?.content || 'Tentez votre chance !',
          description: descriptionElement?.content || 'Lancez le jackpot pour découvrir votre gain.',
          buttonText: buttonLabel
        }
      ],
      // Champs de contact dynamiques depuis le store (fallback uniquement si indéfini)
      formFields: ((campaignState as any)?.formFields !== undefined)
        ? ((campaignState as any)?.formFields as any)
        : [
            { id: 'prenom', label: 'Prénom', type: 'text', required: true },
            { id: 'nom', label: 'Nom', type: 'text', required: true },
            { id: 'email', label: 'Email', type: 'email', required: true }
          ],
      // Garder la configuration canvas pour compatibilité - INCLURE LES MODULES
      canvasConfig: {
        elements: [...canvasElements, ...allModules],
        background: canvasBackground,
        screenBackgrounds: screenBackgrounds, // Backgrounds par écran
        device: selectedDevice
      },
      // Ajouter modularPage pour compatibilité
      modularPage: modularPage,
      // Inclure articleConfig depuis le store pour le mode Article
      articleConfig: (campaignState as any)?.articleConfig
    };
  }, [
    canvasElements,
    canvasBackground,
    screenBackgrounds,
    campaignConfig,
    extractedColors,
    selectedDevice,
    wheelModalConfig,
    campaignState,
    quizConfig,
    modularPage,
    launchButtonText
  ]);
  
  // Log pour vérifier que campaignData contient bien les éléments
  console.log('📊 [DesignEditorLayout] campaignData construit:', {
    canvasElementsCount: canvasElements.length,
    campaignDataCanvasConfigElements: campaignData?.canvasConfig?.elements?.length || 0,
    customTextsCount: campaignData?.design?.customTexts?.length || 0,
    customImagesCount: campaignData?.design?.customImages?.length || 0,
    showFunnel
  });

  // Synchronisation avec le store (éviter les boucles d'updates)
  const lastTransformedSigRef = useRef<string>('');
  useEffect(() => {
    if (!campaignData) return;

    const transformedCampaign = {
      ...campaignData,
      name: 'Ma Campagne',
      type: (campaignData.type || 'wheel') as 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'form' | 'memory' | 'puzzle',
      design: {
        ...campaignData.design,
        background: typeof campaignData.design?.background === 'object'
          ? campaignData.design.background.value || '#ffffff'
          : campaignData.design?.background || '#ffffff'
      }
    };

    // Signature stable pour éviter les mises à jour redondantes
    const signature = (() => {
      try {
        return JSON.stringify(transformedCampaign);
      } catch {
        return String(Date.now());
      }
    })();

    if (signature !== lastTransformedSigRef.current) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[DesignEditorLayout] setCampaign: content changed, merging into store');
      }
      // Preserve existing wheel segments (including prizeId) to avoid overwriting
      // them with generated/fallback segments during preview sync.
      setCampaign((prev: any) => {
        if (!prev) return transformedCampaign as any;

        const prevSegments = (prev?.gameConfig?.wheel?.segments?.length
          ? prev.gameConfig.wheel.segments
          : (prev?.config?.roulette?.segments || [])) as any[];
        const nextSegments = (transformedCampaign as any)?.gameConfig?.wheel?.segments as any[] | undefined;
        const mergedSegments = (prevSegments && prevSegments.length) ? prevSegments : (nextSegments || []);

        if (process.env.NODE_ENV !== 'production') {
          try {
            const hasPrizeIds = Array.isArray(mergedSegments) && mergedSegments.some((s: any) => s && 'prizeId' in s && s.prizeId);
            console.debug('🎯 [DesignEditorLayout] Preserving wheel segments during merge', {
              prevCount: Array.isArray(prevSegments) ? prevSegments.length : 0,
              nextCount: Array.isArray(nextSegments) ? nextSegments.length : 0,
              used: (prevSegments && prevSegments.length) ? 'prev' : 'next',
              hasPrizeIds
            });
          } catch {}
        }

        return {
          ...prev,
          ...transformedCampaign,
          gameConfig: {
            ...prev.gameConfig,
            ...(transformedCampaign as any).gameConfig,
            wheel: {
              ...prev.gameConfig?.wheel,
              ...(transformedCampaign as any)?.gameConfig?.wheel,
              segments: mergedSegments
            }
          },
          // Mirror segments to legacy config.roulette as well for compatibility
          config: {
            ...prev.config,
            ...(transformedCampaign as any).config,
            roulette: {
              ...prev.config?.roulette,
              ...(transformedCampaign as any)?.config?.roulette,
              segments: mergedSegments
            }
          },
          // Préserver modularPage pour la synchronisation avec le preview
          modularPage: (transformedCampaign as any).modularPage || prev.modularPage,
          // Préserver design.quizModules si présent
          design: {
            ...(transformedCampaign as any).design,
            quizModules: (transformedCampaign as any).modularPage || prev.design?.quizModules
          }
        } as any;
      });
      lastTransformedSigRef.current = signature;
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[DesignEditorLayout] Skipping setCampaign: no material change');
      }
    }
  }, [campaignData, setCampaign]);

  // Actions optimisées
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const saved = await saveCampaignToDB(campaignState, saveCampaign);
      if (saved?.id && !(campaignState as any)?.id) {
        setCampaign((prev: any) => ({ ...prev, id: saved.id }));
      }
      setIsModified(false);
    } catch (e) {
      console.error('[DesignEditorLayout] Save failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setShowFunnel(!showFunnel);
    // Reset to article step when entering preview
    if (!showFunnel) {
      setCurrentStep('article');
    }
  };

  // Funnel progression handlers
  const handleCTAClick = () => {
    console.log('🎯 [JackpotEditor] CTA clicked, moving to form step');
    setCurrentStep('form');
  };

  const handleFormSubmit = (data: Record<string, string>) => {
    console.log('📝 [JackpotEditor] Form submitted:', data);
    setCurrentStep('game');
  };

  const handleGameComplete = () => {
    console.log('🎮 [JackpotEditor] Game completed');
    setCurrentStep('result');
  };

  // Save & Quit with validation modal
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const { validateCampaign } = useCampaignValidation();
  const validation = validateCampaign();

  const handleSaveAndQuit = useCallback(async () => {
    const result = validateCampaign();
    if (!result.isValid) {
      setIsValidationModalOpen(true);
      return;
    }
    await handleSave();
    navigate('/dashboard');
  }, [validateCampaign, handleSave, navigate]);

  // Navigate to settings without saving (same destination as Save & Continue)
  const handleNavigateToSettings = useCallback(() => {
    let campaignId = (campaignState as any)?.id as string | undefined;
    if (!campaignId) {
      campaignId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? (crypto as any).randomUUID()
        : `draft-${Date.now()}`;
      try {
        const draft = { ...(campaignState || {}), id: campaignId, _source: 'localStorage' };
        localStorage.setItem(`campaign:draft:${campaignId}`, JSON.stringify(draft));
      } catch {}
      setCampaign((prev: any) => ({ ...prev, id: campaignId }));
    }
    if (campaignId) {
      navigate(`/campaign/${campaignId}/settings`);
    }
  }, [campaignState, navigate, setCampaign]);

  // Fonction pour appliquer les couleurs extraites à la roue et aux segments
  const handleExtractedColorsChange = (colors: string[]) => {
    if (!colors || !Array.isArray(colors) || colors.length === 0) return;
    
    console.log('🎨 handleExtractedColorsChange - Nouvelles couleurs extraites:', colors);
    
    // Mettre à jour les couleurs extraites dans l'état
    setExtractedColors(colors);
    
    // Créer une copie profonde de la configuration actuelle
    setCampaignConfig((prev: any) => {
      if (!prev) return prev;
      
      // Créer une copie profonde de la configuration actuelle
      const currentConfig = JSON.parse(JSON.stringify(prev));
      
      // Mettre à jour les couleurs extraites dans l'objet campaign pour le mode preview
      if (!currentConfig.design) currentConfig.design = {};
      currentConfig.design.extractedColors = [...colors];
      
      // Récupérer la configuration actuelle de la roue
      const currentWheelConfig = currentConfig?.design?.wheelConfig || {};
      const isClassicBorder = (currentWheelConfig?.borderStyle || 'classic') === 'classic';
      const shouldUpdateBorderColor = isClassicBorder && 
        (!currentWheelConfig?.borderColor || currentWheelConfig.borderColor === '#841b60');
      
      // Couleurs principales à utiliser
      const primaryColor = colors[0] || currentConfig?.design?.brandColors?.primary || '#841b60';
      const secondaryColor = '#ffffff'; // Toujours blanc pour les segments secondaires
      const accentColor = colors[2] || currentConfig?.design?.brandColors?.accent || '#45b7d1';
      
      // Mettre à jour les segments de la roue avec les nouvelles couleurs
      const currentSegments = currentConfig?.gameConfig?.wheel?.segments || [];
      const updatedSegments = currentSegments.map((segment: any, index: number) => {
        // Déterminer si le segment est gagnant (alternance par défaut si non spécifié)
        const isWinning = segment.isWinning ?? (index % 2 === 0);
        
        // Pour les segments gagnants, utiliser la couleur primaire, sinon blanc
        const segmentColor = isWinning ? primaryColor : secondaryColor;
        const textColor = isWinning ? secondaryColor : primaryColor;
        
        return {
          ...segment,
          // Forcer la mise à jour de la couleur
          color: segmentColor,
          // Définir la couleur du texte pour un bon contraste
          textColor: textColor,
          // S'assurer que la propriété value est définie pour chaque segment
          value: segment.value || segment.label || `segment-${index + 1}`,
          // Forcer la mise à jour en modifiant un timestamp
          _updatedAt: Date.now()
        };
      });
      
      // Mettre à jour la configuration avec les nouvelles couleurs
      const toRgb = (color: string): { r: number; g: number; b: number } | null => {
        if (!color) return null;
        const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (m) return { r: +m[1], g: +m[2], b: +m[3] };
        const h = color.replace('#', '');
        if (h.length === 3) return { r: parseInt(h[0]+h[0],16), g: parseInt(h[1]+h[1],16), b: parseInt(h[2]+h[2],16) };
        if (h.length === 6) return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
        return null;
      };
      const toHex = (rgb: { r: number; g: number; b: number }): string => {
        const c = (n: number) => n.toString(16).padStart(2, '0');
        return `#${c(Math.max(0, Math.min(255, Math.round(rgb.r))))}${c(Math.max(0, Math.min(255, Math.round(rgb.g))))}${c(Math.max(0, Math.min(255, Math.round(rgb.b))))}`;
      };
      const luminance = (rgb: { r: number; g: number; b: number }) => {
        const a = [rgb.r, rgb.g, rgb.b].map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
      };
      const darken = (rgb: { r: number; g: number; b: number }, pct: number) => ({ r: rgb.r * (1 - pct), g: rgb.g * (1 - pct), b: rgb.b * (1 - pct) });
      const getTextOn = (rgb: { r: number; g: number; b: number }) => (luminance(rgb) > 0.55 ? '#111111' : '#ffffff');

      const primaryRgb = toRgb(primaryColor) || { r: 132, g: 27, b: 96 }; // fallback #841b60
      const buttonText = getTextOn(primaryRgb);
      const hoverHex = toHex(darken(primaryRgb, 0.12));
      const activeHex = toHex(darken(primaryRgb, 0.24));

      const updatedConfig = {
        ...currentConfig,
        design: {
          ...currentConfig.design,
          // Mettre à jour la configuration de la roue
          wheelConfig: {
            ...currentWheelConfig,
            // Mettre à jour la couleur de bordure si nécessaire
            ...(shouldUpdateBorderColor && {
              borderColor: primaryColor,
              // Forcer la mise à jour en modifiant un timestamp
              _updatedAt: Date.now()
            })
          },
          // Mettre à jour les couleurs de la marque
          brandColors: {
            ...currentConfig.design?.brandColors,
            primary: primaryColor,
            secondary: secondaryColor,
            accent: accentColor,
            // Forcer la mise à jour
            _updatedAt: Date.now()
          },
          // Mettre à jour les couleurs personnalisées
          customColors: {
            ...currentConfig.design?.customColors,
            primary: primaryColor,
            secondary: secondaryColor,
            // Forcer la mise à jour
            _updatedAt: Date.now()
          },
          // Appliquer aussi aux styles du quiz
          quizConfig: {
            ...(currentConfig.design?.quizConfig || {}),
            style: {
              ...(currentConfig.design?.quizConfig?.style || {}),
              buttonBackgroundColor: (primaryColor.startsWith('#') ? primaryColor : toHex(primaryRgb)),
              buttonTextColor: buttonText,
              buttonHoverBackgroundColor: hoverHex,
              buttonActiveBackgroundColor: activeHex
            }
          },
          // Forcer la mise à jour du design
          _updatedAt: Date.now()
        },
        // Mettre à jour les segments de la roue avec les nouvelles couleurs
        gameConfig: {
          ...currentConfig.gameConfig,
          wheel: {
            ...currentConfig.gameConfig?.wheel,
            segments: updatedSegments,
            // Forcer la mise à jour
            _updatedAt: Date.now()
          },
          // Forcer la mise à jour
          _updatedAt: Date.now()
        },
        // Forcer la mise à jour globale
        _updatedAt: Date.now()
      };
      
      console.log('🎨 Mise à jour des couleurs extraites:', {
        colors,
        primaryColor,
        secondaryColor,
        accentColor,
        segmentsCount: updatedSegments.length,
        firstSegment: updatedSegments[0],
        config: updatedConfig.design.wheelConfig,
        hasSegments: !!updatedConfig.gameConfig?.wheel?.segments?.length
      });
      
      return updatedConfig;
    });
  };

  // Raccourcis clavier professionnels
  const { shortcuts } = useKeyboardShortcuts({
    selectedElement,
    onSave: () => {
      handleSave();
    },
    onPreview: () => {
      handlePreview();
    },
    onUndo: () => {
      undo();
    },
    onRedo: () => {
      redo();
    },
    onZoomIn: () => {
      setCanvasZoom(prev => Math.min(prev + 0.1, 1));
    },
    onZoomOut: () => {
      setCanvasZoom(prev => Math.max(prev - 0.1, 0.1));
    },
    onZoomReset: () => {
      setCanvasZoom(1);
    },
    onZoomFit: () => {
      setCanvasZoom(1);
    },
    onSelectAll: handleSelectAll,
    onDeselectAll: handleDeselectAll,
    onElementDelete: handleElementDelete,
    onElementCopy: handleElementCopy,
    onElementCut: handleElementCut,
    onElementPaste: handleElementPaste,
    onDuplicate: handleElementDuplicate,
    onGroup: () => {
      console.log('🎯 🔥 GROUP FUNCTION CALLED!');
      console.log('🎯 Selected elements:', selectedElements);
      console.log('🎯 Selected elements length:', selectedElements?.length);
      
      const validElements = selectedElements.filter(el => el && !el.isGroup && el.type !== 'group');
      
      if (validElements.length >= 2) {
        console.log('🎯 ✅ Conditions met, creating group with', validElements.length, 'elements');
        const elementIds = validElements.map(el => el.id);
        console.log('🎯 Element IDs to group:', elementIds);
        
        const groupId = createGroup(elementIds, `Groupe ${Date.now()}`);
        console.log('🎯 Group created with ID:', groupId);
        
        if (groupId) {
          addToHistory({
            canvasElements: [...canvasElements],
            canvasBackground: { ...canvasBackground },
            campaignConfig: { ...campaignConfig },
            selectedElements: [],
            selectedGroupId: groupId
          });
          
          setSelectedElements([]);
          setSelectedElement(null);
          setSelectedGroupId(groupId);
          
          console.log('🎯 ✅ Group created successfully!');
        }
      } else {
        console.log('🎯 ❌ Need at least 2 elements to create a group. Found:', validElements.length);
      }
    },
    onUngroup: () => {
      console.log('🎯 Ungrouping selected group:', selectedGroupId);
      
      let targetGroupId = selectedGroupId;
      
      if (!targetGroupId && selectedElements.length > 0) {
        const selectedGroup = selectedElements.find(el => el.isGroup || el.type === 'group');
        if (selectedGroup) {
          targetGroupId = selectedGroup.id;
        }
      }
      
      if (targetGroupId) {
        console.log('🎯 Dissociating group:', targetGroupId);
        
        const groupElements = getGroupElements(targetGroupId);
        console.log('🎯 Group elements to liberate:', groupElements.map(el => el.id));
        
        ungroupElements(targetGroupId);
        
        addToHistory({
          canvasElements: [...canvasElements],
          canvasBackground: { ...canvasBackground },
          campaignConfig: { ...campaignConfig },
          selectedElements: groupElements,
          selectedGroupId: null
        });
        
        setSelectedElements(groupElements);
        setSelectedElement(null);
        setSelectedGroupId(null);
        
        console.log('🎯 ✅ Group ungrouped successfully!');
      } else {
        console.log('🎯 ❌ No group selected to ungroup');
      }
    },
    // --- Raccourcis de texte (élément texte sélectionné) ---
    onToggleBoldText: () => {
      if (selectedElement?.type === 'text') {
        handleElementUpdate({
          fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold'
        });
      }
    },
    onToggleItalicText: () => {
      if (selectedElement?.type === 'text') {
        handleElementUpdate({
          fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic'
        });
      }
    },
    onToggleUnderlineText: () => {
      if (selectedElement?.type === 'text') {
        const current = selectedElement.textDecoration || 'none';
        const next = current.includes('underline')
          ? (current.replace('underline', '').replace(/\s+/g, ' ').trim() || 'none')
          : ((current === 'none' || !current) ? 'underline' : `${current} underline`);
        handleElementUpdate({ textDecoration: next });
      }
    },
    onAlignTextLeft: () => {
      if (selectedElement?.role === 'module-text' && (selectedElement as any)?.moduleId) {
        handleUpdateModule((selectedElement as any).moduleId, { align: 'left' } as any);
        return;
      }
      if (selectedElement?.type === 'text') {
        handleElementUpdate({ textAlign: 'left' });
      }
    },
    onAlignTextCenter: () => {
      if (selectedElement?.role === 'module-text' && (selectedElement as any)?.moduleId) {
        handleUpdateModule((selectedElement as any).moduleId, { align: 'center' } as any);
        return;
      }
      if (selectedElement?.type === 'text') {
        handleElementUpdate({ textAlign: 'center' });
      }
    },
    onAlignTextRight: () => {
      if (selectedElement?.role === 'module-text' && (selectedElement as any)?.moduleId) {
        handleUpdateModule((selectedElement as any).moduleId, { align: 'right' } as any);
        return;
      }
      if (selectedElement?.type === 'text') {
        handleElementUpdate({ textAlign: 'right' });
      }
    },
    onIncrementFontSize: () => {
      if (selectedElement?.type === 'text') {
        const size = typeof selectedElement.fontSize === 'number' ? selectedElement.fontSize : 16;
        handleElementUpdate({ fontSize: Math.min(200, (isNaN(size) ? 16 : size) + 1) });
      }
    },
    onDecrementFontSize: () => {
      if (selectedElement?.type === 'text') {
        const size = typeof selectedElement.fontSize === 'number' ? selectedElement.fontSize : 16;
        handleElementUpdate({ fontSize: Math.max(8, (isNaN(size) ? 16 : size) - 1) });
      }
    }
  });

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: showFunnel ? 'none' : 
          'radial-gradient(130% 130% at 12% 20%, rgba(235, 155, 100, 0.8) 0%, rgba(235, 155, 100, 0) 55%), radial-gradient(120% 120% at 78% 18%, rgba(128, 82, 180, 0.85) 0%, rgba(128, 82, 180, 0) 60%), radial-gradient(150% 150% at 55% 82%, rgba(68, 52, 128, 0.75) 0%, rgba(68, 52, 128, 0) 65%), linear-gradient(90deg, #E07A3A 0%, #9A5CA9 50%, #3D2E72 100%)',
        backgroundBlendMode: showFunnel ? 'normal' : 'screen, screen, lighten, normal',
        backgroundColor: showFunnel ? 'transparent' : '#3D2E72',
        padding: showFunnel ? '0' : (isWindowMobile ? '9px' : '0 9px 9px 9px'),
        boxSizing: 'border-box'
      }}
    >
    <MobileStableEditor className={showFunnel ? "h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden" : (isWindowMobile ? "h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pb-[6px] rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] transform -translate-y-[0.4vh]" : "h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pt-[1.25cm] pb-[6px] rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] transform -translate-y-[0.4vh]")}>

      {/* Top Toolbar - Hidden only in preview mode */}
      {!showFunnel && (
        <>
          <DesignToolbar
            selectedDevice={selectedDevice}
            onDeviceChange={handleDeviceChange}
            onPreviewToggle={handlePreview}
            isPreviewMode={showFunnel}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            previewButtonSide={previewButtonSide}
            onPreviewButtonSideChange={setPreviewButtonSide}
            mode={mode}
            onSave={handleSaveAndQuit}
            showSaveCloseButtons={false}
            onNavigateToSettings={handleNavigateToSettings}
            campaignId={(campaignState as any)?.id || new URLSearchParams(location.search).get('campaign') || undefined}
          />

          {/* Bouton d'aide des raccourcis clavier */}
          <div className="absolute top-4 right-4 z-10">
            <KeyboardShortcutsHelp shortcuts={shortcuts} />
          </div>
        </>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {showFunnel ? (
          /* Funnel Preview Mode */
          <div className="group fixed inset-0 z-40 w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#2c2c35] flex items-center justify-center">
            {/* Floating Edit Mode Button */}
            <button
              onClick={() => setShowFunnel(false)}
              className={`absolute top-4 ${previewButtonSide === 'left' ? 'left-4' : 'right-4'} z-[9999] px-4 py-2 bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] shadow-none focus:shadow-none ring-0 focus:ring-0 drop-shadow-none filter-none backdrop-blur-0 pointer-events-auto`}
            >
              Mode édition
            </button>
            {(selectedDevice === 'mobile' && actualDevice !== 'mobile') ? (
              /* Mobile Preview sur Desktop: Canvas centré avec cadre */
              <div className="flex items-center justify-center w-full h-full">
                <div 
                  className="relative overflow-y-auto rounded-[32px] shadow-2xl"
                  style={{
                    width: '430px',
                    height: '932px',
                    maxHeight: '90vh'
                  }}
                >
                  {editorMode === 'article' ? (
                    <ArticleCanvas
                      articleConfig={(campaignState as any)?.articleConfig || {}}
                      onBannerChange={() => {}}
                      onBannerRemove={() => {}}
                      onTitleChange={(title) => {
                        if (campaignState) {
                          setCampaign({
                            ...campaignState,
                            articleConfig: {
                              ...(campaignState as any).articleConfig,
                              content: {
                                ...(campaignState as any).articleConfig?.content,
                                title,
                              },
                            },
                          });
                        }
                      }}
                      onDescriptionChange={(description) => {
                        if (campaignState) {
                          setCampaign({
                            ...campaignState,
                            articleConfig: {
                              ...(campaignState as any).articleConfig,
                              content: {
                                ...(campaignState as any).articleConfig?.content,
                                description,
                              },
                            },
                          });
                        }
                      }}
                      onCTAClick={handleCTAClick}
                      onFormSubmit={handleFormSubmit}
                      onGameComplete={handleGameComplete}
                      currentStep={currentStep}
                      editable={false}
                      maxWidth={810}
                      campaignType={(campaignState as any)?.type || 'jackpot'}
                      formFields={(campaignState as any)?.formFields}
                      campaign={campaignData}
                      wheelModalConfig={wheelModalConfig}
                      gameModalConfig={wheelModalConfig}
                    />
                  ) : campaignData?.type === 'quiz' ? (
                    <FunnelQuizParticipate
                      campaign={campaignData as any}
                      previewMode="mobile"
                    />
                  ) : (
                    <FunnelUnlockedGame
                      campaign={campaignData}
                      previewMode="mobile"
                      wheelModalConfig={wheelModalConfig}
                      launchButtonStyles={launchButtonStyles}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Desktop/Tablet Preview OU Mobile physique: Fullscreen */
              editorMode === 'article' ? (
                <div className="w-full h-full flex items-start justify-center bg-gray-100 overflow-y-auto py-8" style={{ backgroundColor: '#2c2c35' }}>
                  <ArticleCanvas
                    articleConfig={(campaignState as any)?.articleConfig || {}}
                    onBannerChange={() => {}}
                    onBannerRemove={() => {}}
                    onTitleChange={(title) => {
                      if (campaignState) {
                        setCampaign({
                          ...campaignState,
                          articleConfig: {
                            ...(campaignState as any).articleConfig,
                            content: {
                              ...(campaignState as any).articleConfig?.content,
                              title,
                            },
                          },
                        });
                      }
                    }}
                    onDescriptionChange={(description) => {
                      if (campaignState) {
                        setCampaign({
                          ...campaignState,
                          articleConfig: {
                            ...(campaignState as any).articleConfig,
                            content: {
                              ...(campaignState as any).articleConfig?.content,
                              description,
                            },
                          },
                        });
                      }
                    }}
                    onCTAClick={handleCTAClick}
                    onFormSubmit={handleFormSubmit}
                    onGameComplete={handleGameComplete}
                    currentStep={currentStep}
                    editable={false}
                    maxWidth={810}
                    campaignType={(campaignState as any)?.type || 'jackpot'}
                    formFields={(campaignState as any)?.formFields}
                    campaign={campaignData}
                    wheelModalConfig={wheelModalConfig}
                    gameModalConfig={wheelModalConfig}
                  />
                </div>
              ) : (
                <div className="w-full h-full pointer-events-auto flex items-center justify-center">
                  {campaignData?.type === 'quiz' ? (
                    <FunnelQuizParticipate
                      campaign={campaignData as any}
                      previewMode={selectedDevice}
                    />
                  ) : (
                    <FunnelUnlockedGame
                      campaign={campaignData}
                      previewMode={actualDevice === 'desktop' && selectedDevice === 'desktop' ? 'desktop' : selectedDevice}
                      wheelModalConfig={wheelModalConfig}
                      launchButtonStyles={launchButtonStyles}
                    />
                  )}
                </div>
              )
            )}
          </div>
        ) : (
          /* Design Editor Mode */
          <>
            {/* Hybrid Sidebar - Design & Technical (always vertical, with drawer from bottom) */}
              <HybridSidebar
                ref={sidebarRef}
                onAddElement={handleAddElement}
                onBackgroundChange={handleBackgroundChange}
                onExtractedColorsChange={handleExtractedColorsChange}
                currentBackground={canvasBackground}
                extractedColors={extractedColors} // Ajout des couleurs extraites
                campaignConfig={campaignConfig}
                onCampaignConfigChange={handleCampaignConfigChange}
                elements={canvasElements}
                onElementsChange={setCanvasElements}
                selectedElement={selectedElement}
                onElementUpdate={handleElementUpdate}
                // Modular editor wiring
                currentScreen={currentScreen}
                onScreenChange={(screen) => {
                  const scrolled = scrollToScreen(screen);
                  if (scrolled) {
                    setCurrentScreen(screen);
                  }
                }}
                onAddModule={handleAddModule}
                showAnimationsPanel={showAnimationsInSidebar}
                onAnimationsPanelChange={setShowAnimationsInSidebar}
                showPositionPanel={showPositionInSidebar}
                onPositionPanelChange={setShowPositionInSidebar}
                showQuizPanel={showQuizPanel}
                onQuizPanelChange={setShowQuizPanel}
                showJackpotPanel={showJackpotPanel}
                onJackpotPanelChange={setShowJackpotPanel}
                showDesignPanel={showDesignInSidebar}
                onDesignPanelChange={setShowDesignInSidebar}
                activeTab={activeSidebarTab}
                onActiveTabChange={(tabId) => {
                  const nextTab = tabId || 'elements';
                  setActiveSidebarTab(nextTab);
                  setPreviousSidebarTab(nextTab);
                  if (nextTab !== 'background') {
                    setShowDesignInSidebar(false);
                  }
                }}
                canvasRef={canvasRef}
                selectedElements={selectedElements}
                onSelectedElementsChange={(elements) => setSelectedElements(elements)}
                onAddToHistory={addToHistory}
                launchButtonStyles={launchButtonStyles}
                launchButtonText={launchButtonText}
                onLaunchButtonStyleChange={handleLaunchButtonStyleChange}
                onLaunchButtonTextChange={handleLaunchButtonTextChange}
                onLaunchButtonReset={handleLaunchButtonReset}
                selectedModuleId={selectedModuleId}
                selectedModule={selectedModule}
                onModuleUpdate={handleUpdateModule}
                onSelectedModuleChange={setSelectedModuleId}
                // Modules de l'écran actuel pour le panneau de calques
                modules={modularPage.screens[currentScreen] || []}
                onModuleDelete={handleDeleteModule}
                // Quiz config props for HybridSidebar
                quizQuestionCount={quizConfig.questionCount}
                quizTimeLimit={quizConfig.timeLimit}
                quizDifficulty={quizConfig.difficulty}
                quizBorderRadius={quizConfig.borderRadius}
                selectedQuizTemplate={quizConfig.templateId}
                onQuizQuestionCountChange={(count) => setQuizConfig(prev => ({ ...prev, questionCount: count }))}
                onQuizTimeLimitChange={(time) => setQuizConfig(prev => ({ ...prev, timeLimit: time }))}
                onQuizDifficultyChange={(difficulty) => setQuizConfig(prev => ({ ...prev, difficulty }))}
                onQuizBorderRadiusChange={(borderRadius) => {
                  setQuizConfig(prev => ({ ...prev, borderRadius }));
                  updateCanvasElementsBorderRadius(borderRadius);
                }}
                onQuizTemplateChange={(templateId) => {
                  console.log('🎯 Changement de template quiz:', templateId);
                  const { desktop, mobile } = getTemplateBaseWidths(templateId);

                  setQuizConfig(prev => ({
                    ...prev,
                    templateId
                  }));

                  try {
                    const event = new CustomEvent('quizStyleUpdate', {
                      detail: { width: desktop, mobileWidth: mobile }
                    });
                    (document.getElementById('quiz-preview-container') || window).dispatchEvent(event);
                  } catch (error) {
                    console.error('❌ Erreur lors de la diffusion de quizStyleUpdate après changement de template:', error);
                  }
                }}
                // Gestion de la largeur du quiz
                quizWidth={typeof quizConfig.width === 'string' ? quizConfig.width : initialTemplateWidths.desktop}
                onQuizWidthChange={(width) => {
                  // S'assurer que width est une chaîne avec 'px' à la fin
                  const normalizedWidth = width.endsWith('px') ? width : `${width}px`;
                  console.log('🔄 Mise à jour de la largeur du quiz:', normalizedWidth);
                  
                  setQuizConfig(prev => ({ ...prev, width: normalizedWidth }));
                  
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => {
                    const updated = {
                      ...current,
                      design: {
                        ...current.design,
                        quizConfig: {
                          ...current.design.quizConfig,
                          style: {
                            ...(current.design.quizConfig?.style || {}),
                            width: normalizedWidth
                          }
                        }
                      }
                    };
                    console.log('📝 Nouvelle configuration de campagne (width):', updated);
                    return updated;
                  });
                  
                  // Créer et dispatcher l'événement personnalisé
                  try {
                    const event = new CustomEvent('quizStyleUpdate', {
                      detail: { width }
                    });
                    
                    const logData = {
                      type: 'quizStyleUpdate',
                      detail: { width },
                      timestamp: new Date().toISOString(),
                      target: 'window',
                      bubbles: true,
                      cancelable: true,
                      composed: true
                    };
                    
                    console.log('📤 [DesignEditorLayout] Émission de l\'événement quizStyleUpdate (width):', logData);
                    
                    // Émettre l'événement de manière synchrone
                    const target = document.getElementById('quiz-preview-container') || window;
                    const eventDispatched = target.dispatchEvent(event);
                    
                    console.log('📤 [DesignEditorLayout] Événement émis avec succès:', {
                      eventDispatched,
                      target: target === window ? 'window' : 'quiz-preview-container'
                    });
                    
                    // Si l'événement n'a pas été traité, émettre un événement de secours
                    if (!eventDispatched) {
                      console.warn('⚠️ [DesignEditorLayout] L\'événement n\'a pas été traité, tentative avec un événement de secours');
                      const fallbackEvent = new CustomEvent('quizStyleUpdateFallback', {
                        detail: { width },
                        bubbles: true,
                        cancelable: true
                      });
                      target.dispatchEvent(fallbackEvent);
                    }
                  } catch (error) {
                    console.error('❌ Erreur lors de l\'émission de l\'événement quizStyleUpdate:', error);
                  }
                }}
                // Gestion de la largeur mobile du quiz
                quizMobileWidth={typeof quizConfig.mobileWidth === 'string' ? quizConfig.mobileWidth : initialTemplateWidths.mobile}
                onQuizMobileWidthChange={(width: string) => {
                  // S'assurer que width est une chaîne avec 'px' à la fin
                  const normalizedWidth = width.endsWith('px') ? width : `${width}px`;
                  console.log('🔄 Mise à jour de la largeur mobile du quiz:', normalizedWidth);
                  
                  setQuizConfig(prev => ({ ...prev, mobileWidth: normalizedWidth }));
                  
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => {
                    const updated = {
                      ...current,
                      design: {
                        ...current.design,
                        quizConfig: {
                          ...current.design.quizConfig,
                          style: {
                            ...(current.design.quizConfig?.style || {}),
                            mobileWidth: normalizedWidth
                          }
                        }
                      }
                    };
                    console.log('📝 Nouvelle configuration de campagne (mobileWidth):', updated);
                    return updated;
                  });
                  
                  // Créer et dispatcher l'événement personnalisé
                  try {
                    const event = new CustomEvent('quizStyleUpdate', {
                      detail: { mobileWidth: width }
                    });
                    
                    const logData = {
                      type: 'quizStyleUpdate',
                      detail: { mobileWidth: width },
                      timestamp: new Date().toISOString(),
                      target: 'window',
                      bubbles: true,
                      cancelable: true,
                      composed: true
                    };
                    
                    console.log('📤 [DesignEditorLayout] Émission de l\'événement quizStyleUpdate (mobileWidth):', logData);
                    
                    // Émettre l'événement de manière synchrone
                    const target = document.getElementById('quiz-preview-container') || window;
                    const eventDispatched = target.dispatchEvent(event);
                    
                    console.log('✅ [DesignEditorLayout] Événement quizStyleUpdate (mobileWidth) émis avec succès:', eventDispatched);
                  } catch (error) {
                    console.error('❌ Erreur lors de l\'émission de l\'événement quizStyleUpdate (mobileWidth):', error);
                  }
                }}
                // Gestion des couleurs des boutons
                onButtonBackgroundColorChange={(color) => {
                  setQuizConfig(prev => ({
                    ...prev,
                    buttonBackgroundColor: color,
                    // Mettre à jour automatiquement la couleur de survol si elle n'a pas été personnalisée
                    buttonHoverBackgroundColor: prev.buttonHoverBackgroundColor === prev.buttonBackgroundColor 
                      ? color 
                      : prev.buttonHoverBackgroundColor,
                    buttonActiveBackgroundColor: prev.buttonActiveBackgroundColor === prev.buttonBackgroundColor
                      ? color
                      : prev.buttonActiveBackgroundColor
                  }));
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      quizConfig: {
                        ...current.design.quizConfig,
                        style: {
                          ...(current.design.quizConfig?.style || {}),
                          buttonBackgroundColor: color
                        }
                      }
                    }
                  }));
                }}
                onButtonTextColorChange={(color) => {
                  setQuizConfig(prev => ({ ...prev, buttonTextColor: color }));
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      quizConfig: {
                        ...current.design.quizConfig,
                        style: {
                          ...(current.design.quizConfig?.style || {}),
                          buttonTextColor: color
                        }
                      }
                    }
                  }));
                }}
                onButtonHoverBackgroundColorChange={(color) => {
                  setQuizConfig(prev => ({
                    ...prev,
                    buttonHoverBackgroundColor: color,
                    // Mettre à jour automatiquement la couleur active si elle n'a pas été personnalisée
                    buttonActiveBackgroundColor: prev.buttonActiveBackgroundColor === prev.buttonHoverBackgroundColor
                      ? color
                      : prev.buttonActiveBackgroundColor
                  }));
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      quizConfig: {
                        ...current.design.quizConfig,
                        style: {
                          ...(current.design.quizConfig?.style || {}),
                          buttonHoverBackgroundColor: color
                        }
                      }
                    }
                  }));
                }}
                onButtonActiveBackgroundColorChange={(color) => {
                  setQuizConfig(prev => ({ ...prev, buttonActiveBackgroundColor: color }));
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      quizConfig: {
                        ...current.design.quizConfig,
                        style: {
                          ...(current.design.quizConfig?.style || {}),
                          buttonActiveBackgroundColor: color
                        }
                      }
                    }
                  }));
                }}
                // Passer les couleurs actuelles
                buttonBackgroundColor={quizConfig.buttonBackgroundColor}
                buttonTextColor={quizConfig.buttonTextColor}
                buttonHoverBackgroundColor={quizConfig.buttonHoverBackgroundColor}
                buttonActiveBackgroundColor={quizConfig.buttonActiveBackgroundColor}
                onForceElementsTab={() => {
                  // Utiliser la référence pour changer l'onglet actif
                  if (sidebarRef.current) {
                    sidebarRef.current.setActiveTab('elements');
                  }
                  // Fermer les autres panneaux
                  setShowEffectsInSidebar(false);
                  setShowAnimationsInSidebar(false);
                  setShowPositionInSidebar(false);
                }}
                selectedDevice={selectedDevice}
                hiddenTabs={effectiveHiddenTabs}
                colorEditingContext={designColorContext}
                className={isWindowMobile ? "vertical-sidebar-drawer" : ""}
              />
            {/* Canvas Scrollable Area */}
            <div className="flex-1 canvas-scroll-area relative z-20 rounded-br-[28px] rounded-bl-none" style={{ borderBottomLeftRadius: '0 !important' }}>
              <div className="min-h-full flex flex-col">
                {/* Premier Canvas */}
                <div data-screen-anchor="screen1" className="relative">
                  <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative">
                    {editorMode === 'article' ? (
                      /* Article Mode: Show ArticleCanvas with funnel */
                      <div className="w-full h-full flex items-start justify-center bg-gray-100 overflow-y-auto p-8">
                        <ArticleCanvas
                          articleConfig={(campaignState as any)?.articleConfig || {}}
                          onBannerChange={(imageUrl) => {
                            if (campaignState) {
                              setCampaign({
                                ...campaignState,
                                articleConfig: {
                                  ...(campaignState as any).articleConfig,
                                  banner: {
                                    ...(campaignState as any).articleConfig?.banner,
                                    imageUrl,
                                  },
                                },
                              });
                            }
                          }}
                          onBannerRemove={() => {
                            if (campaignState) {
                              setCampaign({
                                ...campaignState,
                                articleConfig: {
                                  ...(campaignState as any).articleConfig,
                                  banner: {
                                    ...(campaignState as any).articleConfig?.banner,
                                    imageUrl: undefined,
                                  },
                                },
                              });
                            }
                          }}
                          onTitleChange={(title) => {
                            if (campaignState) {
                              setCampaign({
                                ...campaignState,
                                articleConfig: {
                                  ...(campaignState as any).articleConfig,
                                  content: {
                                    ...(campaignState as any).articleConfig?.content,
                                    title,
                                  },
                                },
                              });
                            }
                          }}
                          onDescriptionChange={(description) => {
                            if (campaignState) {
                              setCampaign({
                                ...campaignState,
                                articleConfig: {
                                  ...(campaignState as any).articleConfig,
                                  content: {
                                    ...(campaignState as any).articleConfig?.content,
                                    description,
                                  },
                                },
                              });
                            }
                          }}
                          onCTAClick={handleCTAClick}
                          onFormSubmit={handleFormSubmit}
                          onGameComplete={handleGameComplete}
                          currentStep={currentStep}
                          editable={true}
                          maxWidth={810}
                          campaignType={(campaignState as any)?.type || 'jackpot'}
                          formFields={(campaignState as any)?.formFields}
                          campaign={campaignData}
                          wheelModalConfig={wheelModalConfig}
                          gameModalConfig={wheelModalConfig}
                          onStepChange={setCurrentStep}
                        />
                      </div>
                    ) : null}
                  </div>
                  {editorMode !== 'article' && (
                  <DesignCanvas
                    editorMode={editorMode}
                    screenId="screen1"
                    ref={canvasRef}
                    selectedDevice={selectedDevice}
                    elements={canvasElements}
                    onElementsChange={setCanvasElements}
                    background={screenBackgrounds.screen1?.devices?.[selectedDevice] || screenBackgrounds.screen1}
                    campaign={campaignData}
                    onCampaignChange={handleCampaignConfigChange}
                    zoom={canvasZoom}
                    enableInternalAutoFit={true}
                    onZoomChange={setCanvasZoom}
                    selectedElement={selectedElement}
                    onSelectedElementChange={debugSetSelectedElement}
                    selectedElements={selectedElements}
                    onSelectedElementsChange={setSelectedElements}
                    onElementUpdate={handleElementUpdate}
                    // Quiz sync props
                    extractedColors={extractedColors}
                    quizModalConfig={quizModalConfig}
                    containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                    hideInlineQuizPreview
                    elementFilter={(element: any) => {
                      const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                      return !role.includes('exit-message') && 
                             element?.screenId !== 'screen2' && 
                             element?.screenId !== 'screen3';
                    }}
                    // Sidebar panel triggers
                    onShowAnimationsPanel={() => {
                      if (!isWindowMobile) {
                        setShowAnimationsInSidebar(true);
                        setShowPositionInSidebar(false);
                      }
                    }}
                    onShowPositionPanel={() => {
                      if (!isWindowMobile) {
                        setShowPositionInSidebar(true);
                        setShowAnimationsInSidebar(false);
                        setShowDesignInSidebar(false);
                      }
                    }}
                    onShowDesignPanel={(context?: 'fill' | 'border' | 'text') => {
                      if (!isWindowMobile) {
                        // Met à jour le contexte immédiatement même si le panneau est déjà ouvert
                        if (context) {
                          setDesignColorContext(context);
                        }
                        // Toujours ouvrir/forcer l'onglet Design
                        setShowDesignInSidebar(true);
                        setShowEffectsInSidebar(false);
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);

                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('background');
                        }
                      }
                    }}
                     onOpenElementsTab={() => {
                       // Ouvrir le panneau de configuration du Jackpot (templates)
                       setShowJackpotPanel(true);
                       setActiveSidebarTab('jackpot');
                       // S'assurer que l'onglet jackpot est actif
                       if (sidebarRef.current) {
                         sidebarRef.current.setActiveTab('jackpot');
                       }
                       // Fermer les autres panneaux
                       setShowAnimationsInSidebar(false);
                       setShowPositionInSidebar(false);
                       setShowDesignInSidebar(false);
                     }}
                    // Mobile sidebar integrations
                    onAddElement={handleAddElement}
                    onBackgroundChange={handleBackgroundChange}
                    onExtractedColorsChange={handleExtractedColorsChange}
                    // Group selection wiring
                    selectedGroupId={selectedGroupId as any}
                    onSelectedGroupChange={setSelectedGroupId as any}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    // Quiz panels
                    showQuizPanel={showQuizPanel}
                    onQuizPanelChange={setShowQuizPanel}
                    // Modular page (screen1)
                    modularModules={(() => {
                      return modularPage.screens.screen1;
                    })()}
                    onModuleUpdate={handleUpdateModule}
                    onModuleDelete={handleDeleteModule}
                    onModuleMove={handleMoveModule}
                    onModuleDuplicate={handleDuplicateModule}
                    selectedModuleId={selectedModuleId}
                    selectedModule={selectedModule}
                    onSelectedModuleChange={setSelectedModuleId}
                  />
                  )}
                </div>
                
                {/* Deuxième Canvas - Seulement en mode Fullscreen */}
                {editorMode === 'fullscreen' && (
                <div className="mt-4 relative" data-screen-anchor="screen2">
                  {/* Background pour éviter la transparence de la bande magenta */}
                  <div 
                    className="absolute inset-0 z-0"
                    style={{
                      background: canvasBackground.type === 'image'
                        ? `url(${canvasBackground.value}) center/cover no-repeat`
                        : canvasBackground.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
                    }}
                  />
                  {/* Background supplémentaire pour l'espace entre les canvas */}
                  <div 
                    className="absolute -top-4 left-0 right-0 h-4 z-0"
                    style={{
                      background: '#ffffff'
                    }}
                  />
                  <div className="relative z-10">
                    <DesignCanvas
                      editorMode={editorMode}
                      screenId="screen2"
                      selectedDevice={selectedDevice}
                      elements={canvasElements}
                      onElementsChange={setCanvasElements}
                      background={screenBackgrounds.screen2?.devices?.[selectedDevice] || screenBackgrounds.screen2}
                      campaign={campaignData}
                      onCampaignChange={handleCampaignConfigChange}
                      zoom={canvasZoom}
                      onZoomChange={setCanvasZoom}
                      enableInternalAutoFit={true}
                      selectedElement={selectedElement}
                      onSelectedElementChange={setSelectedElement}
                      selectedElements={selectedElements}
                      onSelectedElementsChange={setSelectedElements}
                      onElementUpdate={handleElementUpdate}
                      // Quiz sync props
                      extractedColors={extractedColors}
                      quizModalConfig={quizModalConfig}
                      containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                      elementFilter={(element: any) => {
                        const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                        return !role.includes('exit-message') && 
                               (element?.screenId === 'screen2' || 
                                role.includes('form') || 
                                role.includes('contact'));
                      }}
                      // Sidebar panel triggers
                      onShowEffectsPanel={() => {
                        if (!isWindowMobile) {
                          setShowEffectsInSidebar(true);
                          setShowAnimationsInSidebar(false);
                          setShowPositionInSidebar(false);
                        }
                      }}
                      onShowAnimationsPanel={() => {
                        if (!isWindowMobile) {
                          setShowAnimationsInSidebar(true);
                          setShowEffectsInSidebar(false);
                          setShowPositionInSidebar(false);
                        }
                      }}
                      onShowDesignPanel={(context?: 'fill' | 'border' | 'text') => {
                        // Met à jour le contexte immédiatement même si le panneau est déjà ouvert
                        if (context) {
                          setDesignColorContext(context);
                        }
                        // Toujours ouvrir/forcer l'onglet Design
                        setShowDesignInSidebar(true);
                        setShowEffectsInSidebar(false);
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);

                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('background');
                        }
                      }}
                      onOpenElementsTab={() => {
                        // Ouvrir le panneau de configuration du Jackpot (templates)
                        setShowJackpotPanel(true);
                        setActiveSidebarTab('jackpot');
                        // S'assurer que l'onglet jackpot est actif
                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('jackpot');
                        }
                        // Fermer les autres panneaux
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);
                        setShowDesignInSidebar(false);
                      }}
                      // Mobile sidebar integrations
                      onAddElement={handleAddElement}
                      onBackgroundChange={handleBackgroundChange}
                      onExtractedColorsChange={handleExtractedColorsChange}
                      // Group selection wiring
                      selectedGroupId={selectedGroupId as any}
                      onSelectedGroupChange={setSelectedGroupId as any}
                      onUndo={undo}
                      onRedo={redo}
                      canUndo={canUndo}
                      canRedo={canRedo}
                      // Modular page (screen2)
                      modularModules={modularPage.screens.screen2}
                      onModuleUpdate={handleUpdateModule}
                      onModuleDelete={handleDeleteModule}
                      onModuleMove={handleMoveModule}
                      onModuleDuplicate={handleDuplicateModule}
                      selectedModuleId={selectedModuleId}
                      selectedModule={selectedModule}
                      onSelectedModuleChange={setSelectedModuleId}
                    />
                  </div>
                </div>
                )}

                {/* Troisième Canvas - Seulement en mode Fullscreen */}
                {editorMode === 'fullscreen' && (
                <div className="mt-4 relative" data-screen-anchor="screen3">
                  {/* Background pour éviter la transparence de la bande magenta */}
                  <div 
                    className="absolute inset-0 z-0"
                    style={{
                      background: canvasBackground.type === 'image'
                        ? `url(${canvasBackground.value}) center/cover no-repeat`
                        : canvasBackground.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
                    }}
                  />
                  {/* Background supplémentaire pour l'espace entre les canvas */}
                  <div 
                    className="absolute -top-4 left-0 right-0 h-4 z-0"
                    style={{
                      background: '#ffffff'
                    }}
                  />
                  <div className="relative z-10">
                    <DesignCanvas
                      editorMode={editorMode}
                      screenId="screen3"
                      selectedDevice={selectedDevice}
                      elements={canvasElements}
                      onElementsChange={setCanvasElements}
                      background={screenBackgrounds.screen3?.devices?.[selectedDevice] || screenBackgrounds.screen3}
                      campaign={campaignData}
                      onCampaignChange={handleCampaignConfigChange}
                      zoom={canvasZoom}
                      onZoomChange={setCanvasZoom}
                      enableInternalAutoFit={true}
                      selectedElement={selectedElement}
                      onSelectedElementChange={setSelectedElement}
                      selectedElements={selectedElements}
                      onSelectedElementsChange={setSelectedElements}
                      onElementUpdate={handleElementUpdate}
                      // Quiz sync props
                      extractedColors={extractedColors}
                      quizModalConfig={quizModalConfig}
                      containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                      elementFilter={(element: any) => {
                        const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                        return role.includes('exit-message') || element?.screenId === 'screen3';
                      }}
                      // Sidebar panel triggers
                      onShowEffectsPanel={() => {
                        if (!isWindowMobile) {
                          setShowEffectsInSidebar(true);
                          setShowAnimationsInSidebar(false);
                          setShowPositionInSidebar(false);
                        }
                      }}
                      onShowAnimationsPanel={() => {
                        if (!isWindowMobile) {
                          setShowAnimationsInSidebar(true);
                          setShowEffectsInSidebar(false);
                          setShowPositionInSidebar(false);
                        }
                      }}
                      onShowPositionPanel={() => {
                        if (!isWindowMobile) {
                          setShowPositionInSidebar(true);
                          setShowEffectsInSidebar(false);
                          setShowAnimationsInSidebar(false);
                          setShowDesignInSidebar(false);
                        }
                      }}
                      onShowDesignPanel={(context?: 'fill' | 'border' | 'text') => {
                        // Met à jour le contexte immédiatement même si le panneau est déjà ouvert
                        if (context) {
                          setDesignColorContext(context);
                        }
                        // Toujours ouvrir/forcer l'onglet Design
                        setShowDesignInSidebar(true);
                        setShowEffectsInSidebar(false);
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);

                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('background');
                        }
                      }}
                      onOpenElementsTab={() => {
                        // Ouvrir le panneau de configuration du Jackpot (templates)
                        setShowJackpotPanel(true);
                        setActiveSidebarTab('jackpot');
                        // S'assurer que l'onglet jackpot est actif
                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('jackpot');
                        }
                        // Fermer les autres panneaux
                        setShowEffectsInSidebar(false);
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);
                        setShowDesignInSidebar(false);
                      }}
                      // Mobile sidebar integrations
                      onAddElement={handleAddElement}
                      onBackgroundChange={handleBackgroundChange}
                      onExtractedColorsChange={handleExtractedColorsChange}
                      // Group selection wiring
                      selectedGroupId={selectedGroupId as any}
                      onSelectedGroupChange={setSelectedGroupId as any}
                      onUndo={undo}
                      onRedo={redo}
                      canUndo={canUndo}
                      canRedo={canRedo}
                      // Modular page (screen3)
                      modularModules={modularPage.screens.screen3}
                      onModuleUpdate={handleUpdateModule}
                      onModuleDelete={handleDeleteModule}
                      onModuleMove={handleMoveModule}
                      onModuleDuplicate={handleDuplicateModule}
                      selectedModuleId={selectedModuleId}
                      selectedModule={selectedModule}
                      onSelectedModuleChange={setSelectedModuleId}
                    />
                  </div>
                </div>
                )}
              </div>
            </div>
            {/* Zoom Slider with integrated Screen navigation button */}
            {!isWindowMobile && (
              <ZoomSlider 
                zoom={canvasZoom}
                onZoomChange={setCanvasZoom}
                minZoom={0.1}
                maxZoom={1}
                step={0.05}
                onNavigateToScreen2={() => {
                  const nextScreen = currentScreen === 'screen1'
                    ? 'screen2'
                    : currentScreen === 'screen2'
                      ? 'screen3'
                      : 'screen1';
                  const scrolled = scrollToScreen(nextScreen);
                  if (scrolled) {
                    setCurrentScreen(nextScreen);
                  }
                }}
                currentScreen={currentScreen}
              />
            )}
          </>
        )}
      </div>
      {/* Floating bottom-right actions (no band) */}
      {!showFunnel && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 z-30">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-3 py-2 text-xs sm:text-sm border border-gray-300 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors shadow-sm"
            title="Fermer"
          >
            <X className="w-4 h-4 mr-1" />
            Fermer
          </button>
          <button
            onClick={handleSaveAndQuit}
            className="flex items-center px-3 py-2 text-xs sm:text-sm rounded-lg text-white bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:opacity-95 transition-colors shadow-sm"
            title="Sauvegarder et quitter"
          >
            <Save className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Sauvegarder et quitter</span>
            <span className="sm:hidden">Sauvegarder</span>
          </button>
        </div>
      )}
      {/* Validation modal */}
      <CampaignValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        errors={validation.errors}
        onOpenSettings={() => window.dispatchEvent(new Event('openCampaignSettingsModal'))}
      />
      {/* First-time campaign name modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsNameModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-white shadow-2xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Nommer votre campagne</h3>
              <p className="mt-1 text-sm text-gray-500">Donnez un nom clair pour identifier ce projet.</p>
            </div>
            <div className="px-5 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la campagne</label>
              <input
                type="text"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="Ex: Jackpot Octobre"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                autoFocus
              />
            </div>
            <div className="px-5 py-4 flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setIsNameModalOpen(false)}
                className="inline-flex items-center px-3 py-1.5 text-sm rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveCampaignName}
                disabled={!newCampaignName.trim()}
                className="inline-flex items-center px-4 py-2 text-sm rounded-xl bg-gradient-to-br from-[#841b60] to-[#b41b60] backdrop-blur-sm text-white font-medium border border-white/20 shadow-lg shadow-[#841b60]/20 hover:from-[#841b60] hover:to-[#6d164f] hover:shadow-xl hover:shadow-[#841b60]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileStableEditor>
    </div>
  );
};

export default JackpotEditorLayout;
