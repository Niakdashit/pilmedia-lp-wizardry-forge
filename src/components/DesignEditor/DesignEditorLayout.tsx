'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback, lazy } from 'react';
// Align routing with QuizEditor via router adapter
import { useLocation, useNavigate } from '@/lib/router-adapter';
import { Save, X } from 'lucide-react';
const HybridSidebar = lazy(() => import('./HybridSidebar'));
const DesignToolbar = lazy(() => import('./DesignToolbar'));
import PreviewRenderer from '@/components/preview/PreviewRenderer';
// import GradientBand from '../shared/GradientBand';
import type { ModularPage, ScreenId, BlocBouton, Module } from '@/types/modularEditor';
import { createEmptyModularPage } from '@/types/modularEditor';

import ZoomSlider from './components/ZoomSlider';
const DesignCanvas = lazy(() => import('./DesignCanvas'));
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
import { useGroupManager } from '../../hooks/useGroupManager';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';
import { recalculateAllElements } from '../../utils/recalculateAllModules';
import { useEditorPreviewSync } from '@/hooks/useEditorPreviewSync';


import { useCampaigns } from '@/hooks/useCampaigns';
import { createSaveAndContinueHandler, saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';

const KeyboardShortcutsHelp = lazy(() => import('../shared/KeyboardShortcutsHelp'));
const MobileStableEditor = lazy(() => import('./components/MobileStableEditor'));

interface DesignEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}

const DesignEditorLayout: React.FC<DesignEditorLayoutProps> = ({ mode = 'campaign', hiddenTabs }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Détection du mode Article via URL (?mode=article)
  const searchParams = new URLSearchParams(location.search);
  const editorMode = searchParams.get('mode') === 'article' ? 'article' : 'fullscreen';
  
  console.log('🎨 [DesignEditorLayout] Editor Mode:', editorMode);
  
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

  // Zoom par défaut selon l'appareil avec persistance (aligné avec QuizEditor)
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
    setCampaign,
    setPreviewDevice,
    setIsLoading,
    setIsModified
  } = useEditorStore();
  // Campagne centralisée (source de vérité pour les champs de contact)
  const campaignState = useEditorStore((s) => s.campaign);

  // Supabase campaigns API
  const { saveCampaign } = useCampaigns();

  // État local pour la compatibilité existante
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(actualDevice);

  // Gestionnaire de changement d'appareil avec ajustement automatique du zoom
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setSelectedDevice(device);
    setCanvasZoom(getDefaultZoom(device));
  };

  // États principaux
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  
  // Background par écran - chaque écran a son propre background
  const defaultBackground = mode === 'template'
    ? { type: 'color' as const, value: '#4ECDC4' }
    : { type: 'color' as const, value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' };
  
  const [screenBackgrounds, setScreenBackgrounds] = useState<Record<'screen1' | 'screen2' | 'screen3', { type: 'color' | 'image'; value: string }>>({
    screen1: defaultBackground,
    screen2: defaultBackground,
    screen3: defaultBackground
  });
  
  // Background global (fallback pour compatibilité)
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>(defaultBackground);
  
  const [canvasZoom, setCanvasZoom] = useState(getDefaultZoom(selectedDevice));

  // État pour tracker la position de scroll (quel écran est visible)
  const [currentScreen, setCurrentScreen] = useState<'screen1' | 'screen2' | 'screen3'>('screen1');
  
  // Modular editor JSON state
  const [modularPage, setModularPage] = useState<ModularPage>(createEmptyModularPage());
  
  // Debug: Log screen1 modules
  React.useEffect(() => {
    console.log('🎯 [DesignEditorLayout] Screen1 modules:', modularPage.screens.screen1?.length || 0, modularPage.screens.screen1);
  }, [modularPage.screens.screen1]);
  
  // Scroll vers le haut au chargement pour afficher l'écran 1
  React.useEffect(() => {
    const scrollArea = document.querySelector('.canvas-scroll-area');
    if (scrollArea) {
      console.log('📜 [DesignEditorLayout] Scrolling to top to show screen1');
      scrollArea.scrollTop = 0;
    }
  }, []); // Seulement au montage
  
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const lastModuleSelectionRef = useRef<string | null>(null);
  
  const selectedModule: Module | null = useMemo(() => {
    if (!selectedModuleId) return null;
    const allModules = (Object.values(modularPage.screens) as Module[][]).flat();
    return allModules.find((module) => module.id === selectedModuleId) || null;
  }, [selectedModuleId, modularPage.screens]);
  
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
    
    // Nettoyer les anciennes valeurs de zoom mobile pour forcer le nouveau zoom à 100%
    try {
      const savedMobileZoom = localStorage.getItem('editor-zoom-mobile');
      if (savedMobileZoom && parseFloat(savedMobileZoom) < 1.0) {
        console.log('🧹 Nettoyage ancien zoom mobile:', savedMobileZoom, '→ 1.0');
        localStorage.removeItem('editor-zoom-mobile');
      }
    } catch {}
    
    setCanvasZoom(getDefaultZoom(device));
  }, []);

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
  
  // Référence pour le canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // État pour gérer l'affichage des panneaux dans la sidebar
  const [showEffectsInSidebar, setShowEffectsInSidebar] = useState(false);
  const [showAnimationsInSidebar, setShowAnimationsInSidebar] = useState(false);
  const [showPositionInSidebar, setShowPositionInSidebar] = useState(false);
  const [showDesignInSidebar, setShowDesignInSidebar] = useState(false);
  // État pour l'onglet actif dans HybridSidebar
  const [activeTab, setActiveTab] = useState<string | null>('background');
  // Référence pour contrôler l'onglet actif dans HybridSidebar
  const sidebarRef = useRef<{ setActiveTab: (tab: string) => void }>(null); // Nouvelle référence pour suivre la demande d'ouverture
  // Context de couleur demandé depuis la toolbar ('fill' | 'border' | 'text')
  const [designColorContext, setDesignColorContext] = useState<'fill' | 'border' | 'text'>('fill');
  // Inline WheelConfigPanel visibility (controlled at layout level)
  const [showWheelPanel, setShowWheelPanel] = useState(false);
  const [campaignConfig, setCampaignConfig] = useState<any>({
    design: {
      wheelConfig: {
        scale: 2
      }
    }
  });

  // Hook de synchronisation preview
  const { syncBackground } = useEditorPreviewSync();

  // (handler defined later in file; see existing implementation around background history)

  // Détecter la position de scroll pour changer l'écran courant
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
    const mp = (campaignConfig as any)?.design?.designModules as ModularPage | undefined;
    if (mp && mp.screens) {
      setModularPage(mp);
    }
  }, [campaignConfig]);

  // Migration pour mettre à jour la taille par défaut de la roue
  useEffect(() => {
    if (campaignConfig?.design?.wheelConfig && campaignConfig.design.wheelConfig.scale !== 2.4) {
      setCampaignConfig((prev: any) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          design: {
            ...prev.design,
            wheelConfig: {
              ...prev.design.wheelConfig,
              scale: 2.4
            }
          }
        };
        return updated;
      });
    }
    // Migration localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('wheel') && key.includes('scale')) {
          const value = localStorage.getItem(key);
          if (value && parseFloat(value) !== 2.4) {
            localStorage.setItem(key, '2.4');
          }
        }
      });
    } catch {}
  }, [campaignConfig?.design?.wheelConfig?.scale]);

  // Initialize modular page from campaignConfig if present
  useEffect(() => {
    const mp = (campaignConfig as any)?.design?.designModules as ModularPage | undefined;
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
          designModules: { ...next, _updatedAt: Date.now() }
        }
      };
      return updated;
    });
    try { setIsModified(true); } catch {}
  }, [setIsModified]);

  // Helper functions for button management
  const screenHasCardButton = useCallback((modules: Module[]): boolean => {
    return modules.some((m) => {
      if (m.type === 'BlocCarte' && Array.isArray((m as any).children)) {
        return (m as any).children.some((child: Module) => child?.type === 'BlocBouton');
      }
      return false;
    });
  }, []);

  // const editorHasCardButton = useCallback(() => {
  //   return (Object.values(modularPage.screens) as Module[][]).some((modules) => screenHasCardButton(modules));
  // }, [modularPage.screens, screenHasCardButton]);

  const getDefaultButtonLabel = useCallback((screen: ScreenId): string => {
    return screen === 'screen3' ? 'Rejouer' : 'Participer';
  }, []);

  // Assurer la présence d'un bouton "Participer" sur l'écran 1 en mode édition
  React.useEffect(() => {
    // Ne s'exécute que lorsque l'écran 1 est affiché pour éviter des insertions inutiles
    if (currentScreen !== 'screen1') return;

    const screen1Modules = Array.isArray(modularPage.screens.screen1)
      ? modularPage.screens.screen1
      : [];

    const hasStandaloneParticiper = screen1Modules.some(
      (m) => m.type === 'BlocBouton' && typeof (m as any).label === 'string'
    );
    const hasCardButton = screenHasCardButton(screen1Modules);

    if (hasStandaloneParticiper || hasCardButton) return; // déjà présent

    const participerButton: BlocBouton = {
      id: `bloc-bouton-participer-${Date.now()}`,
      type: 'BlocBouton',
      label: getDefaultButtonLabel('screen1'),
      href: '#',
      background: '#000000',
      textColor: '#ffffff',
      borderRadius: 9999,
      borderWidth: 0,
      borderColor: '#000000',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      uppercase: false,
      bold: false,
      spacingTop: 0,
      spacingBottom: 0
    };

    const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
    nextScreens.screen1 = [...screen1Modules, participerButton];
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [currentScreen, modularPage.screens, persistModular, screenHasCardButton, getDefaultButtonLabel]);

  // Bouton "Rejouer" sur l'écran 3 désactivé (retiré par demande utilisateur)
  // React.useEffect(() => {
  //   if (currentScreen !== 'screen3') return;
  //   const screen3Modules = Array.isArray(modularPage.screens.screen3)
  //     ? modularPage.screens.screen3
  //     : [];
  //   const hasStandaloneReplay = screen3Modules.some(
  //     (m) => m.type === 'BlocBouton' && typeof (m as any).label === 'string'
  //   );
  //   const hasCardReplay = screenHasCardButton(screen3Modules);
  //   if (hasStandaloneReplay || hasCardReplay) return;
  //   const replayButton: BlocBouton = {
  //     id: `bloc-bouton-replay-${Date.now()}`,
  //     type: 'BlocBouton',
  //     label: getDefaultButtonLabel('screen3'),
  //     href: '#',
  //     background: '#000000',
  //     textColor: '#ffffff',
  //     borderRadius: 9999,
  //     borderWidth: 0,
  //     borderColor: '#000000',
  //     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  //     uppercase: false,
  //     bold: false,
  //     spacingTop: 0,
  //     spacingBottom: 0
  //   };
  //   const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
  //   nextScreens.screen3 = [...screen3Modules, replayButton];
  //   persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  // }, [currentScreen, modularPage.screens, persistModular, screenHasCardButton, getDefaultButtonLabel]);

  // Module management functions (cloned from QuizEditor)
  const handleAddModule = useCallback((screen: ScreenId, module: Module) => {
    // Gestion spéciale pour les logos (synchronisés sur tous les écrans)
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

    // Gestion spéciale pour les pieds de page (synchronisés sur tous les écrans)
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

    let prevScreenModules = modularPage.screens[screen] || [];

    // Si on ajoute une carte avec un bouton, supprimer les boutons standalone
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

    // Gestion spéciale pour le bouton "Participer" (doit rester en fin de tableau)
    const isParticiperButton = module.type === 'BlocBouton' && (module.label || '').trim().toLowerCase() === 'participer';

    let updatedModules: Module[];
    if (isParticiperButton) {
      // Participer est supposé unique et restera en fin de tableau
      updatedModules = [...prevScreenModules, module];
    } else {
      const participateIndex = prevScreenModules.findIndex((m) => m.type === 'BlocBouton' && (m as BlocBouton).label?.trim().toLowerCase() === 'participer');
      if (participateIndex >= 0) {
        // Insérer le nouveau module avant le bouton Participer
        updatedModules = [
          module,
          ...prevScreenModules.slice(0, participateIndex),
          prevScreenModules[participateIndex],
          ...prevScreenModules.slice(participateIndex + 1)
        ];
      } else {
        // Pas de bouton Participer, ajouter normalement au début
        updatedModules = [module, ...prevScreenModules];
      }
    }

    const next: ModularPage = {
      screens: {
        ...modularPage.screens,
        [screen]: updatedModules
      },
      _updatedAt: Date.now()
    };

    persistModular(next);
  }, [modularPage, persistModular, getDefaultButtonLabel, screenHasCardButton]);

  const handleUpdateModule = useCallback((id: string, patch: Partial<Module>) => {
    console.log('🔄 [DesignEditorLayout] handleUpdateModule called:', { id, patch });
    const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as ScreenId[]).forEach((s) => {
      nextScreens[s] = (nextScreens[s] || []).map((m) => (m.id === id ? { ...m, ...patch } as Module : m));
    });
    console.log('✅ [DesignEditorLayout] Module updated, persisting:', nextScreens);
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular]);

  const handleDeleteModule = useCallback((id: string) => {
    const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as ScreenId[]).forEach((s) => {
      nextScreens[s] = (nextScreens[s] || []).filter((m) => m.id !== id);
    });
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular]);

  const handleMoveModule = useCallback((id: string, direction: 'up' | 'down') => {
    const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as ScreenId[]).forEach((s) => {
      const arr = [...(nextScreens[s] || [])];
      const idx = arr.findIndex((m) => m.id === id);
      if (idx >= 0) {
        const swapWith = direction === 'up' ? idx - 1 : idx + 1;
        if (swapWith >= 0 && swapWith < arr.length) {
          [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
          nextScreens[s] = arr;
        }
      }
    });
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular]);

  const handleDuplicateModule = useCallback((id: string) => {
    const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as ScreenId[]).forEach((s) => {
      const arr = [...(nextScreens[s] || [])];
      const idx = arr.findIndex((m) => m.id === id);
      if (idx >= 0) {
        const original = arr[idx];
        const duplicate = {
          ...original,
          id: `${original.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        };
        arr.splice(idx + 1, 0, duplicate);
        nextScreens[s] = arr;
      }
    });
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular]);

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

  // État pour l'élément sélectionné
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  
  // Détecter quand selectedElement contient un moduleId et mettre à jour selectedModuleId + ouvrir le panneau
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

    console.log('🔍 [DesignEditor] selectedElement changed:', {
      role,
      moduleId,
      isModularRole,
      selectedElement,
      currentSelectedModuleId: selectedModuleId
    });

    if (!moduleId || !isModularRole) {
      if (selectedModuleId !== null) {
        console.log('❌ [DesignEditor] Clearing selectedModuleId');
        setSelectedModuleId(null);
      }
      return;
    }

    const isNewSelection = selectedModuleId !== moduleId;
    
    if (isNewSelection) {
      console.log('✅ [DesignEditor] Setting selectedModuleId to:', moduleId);
      lastModuleSelectionRef.current = moduleId;
      setSelectedModuleId(moduleId);
      
      // Trouver le module pour vérifier son type
      const allModules = (Object.values(modularPage.screens) as Module[][]).flat();
      const module = allModules.find((m) => m.id === moduleId);
      
      // Si c'est un BlocTexte, ouvrir l'onglet Design (background) pour éditer le texte
      // Sinon, ouvrir l'onglet Elements pour les autres modules
      if (module?.type === 'BlocTexte') {
        console.log('📝 [DesignEditor] Opening Background tab for BlocTexte');
        // Ne changer l'onglet que si on n'est pas déjà sur background
        if (activeTab !== 'background') {
          setActiveTab('background');
          if (sidebarRef.current) {
            sidebarRef.current.setActiveTab('background');
          }
        }
        setShowDesignInSidebar(true);
      } else {
        console.log('📂 [DesignEditor] Opening Elements tab for module');
        // Ne changer l'onglet que si on n'est pas déjà sur elements
        if (activeTab !== 'elements') {
          setActiveTab('elements');
          if (sidebarRef.current) {
            sidebarRef.current.setActiveTab('elements');
          }
        }
        setShowDesignInSidebar(false);
      }
      
      // Fermer les autres panneaux
      setShowEffectsInSidebar(false);
      setShowAnimationsInSidebar(false);
      setShowPositionInSidebar(false);
    }
  }, [selectedElement, selectedModuleId, activeTab, modularPage.screens]);
  
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
  const [showFunnel, setShowFunnel] = useState(false);
  const [previewButtonSide, setPreviewButtonSide] = useState<'left' | 'right'>(() =>
    (typeof window !== 'undefined' && localStorage.getItem('previewButtonSide') === 'left') ? 'left' : 'right'
  );
  // Calcul des onglets à masquer selon le mode
  const effectiveHiddenTabs = useMemo(
    () => {
      // Ne jamais masquer l'onglet 'game'
      const defaultHidden = mode === 'template' ? ['campaign', 'export', 'form'] : [];
      const result = hiddenTabs ? [...hiddenTabs] : [...defaultHidden];
      
      // S'assurer que 'game' n'est pas dans les onglets masqués
      const filteredResult = result.filter(tab => tab !== 'game');
      
      console.log('🔍 [DesignEditorLayout] effectiveHiddenTabs:', filteredResult, 'mode:', mode);
      return filteredResult;
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

  // Assurer que tous les éléments ont un screenId
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
    console.log('🎨 [DesignEditor] handleBackgroundChange:', { bg, options });
    
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

    // 🔗 Mode Article: refléter toute image de background vers la bannière de l'article pour feedback immédiat
    try {
      if (editorMode === 'article' && bg?.type === 'image' && typeof bg?.value === 'string') {
        // Mettre à jour le store Zustand
        setCampaign((prev: any) => {
          const base = prev || {};
          const baseArticle = base.articleConfig || {};
          const baseBanner = baseArticle.banner || {};
          return {
            ...base,
            articleConfig: {
              ...baseArticle,
              banner: {
                ...baseBanner,
                imageUrl: bg.value
              }
            }
          };
        });
        // Mettre à jour aussi le state local pour que campaignData le reflète immédiatement
        setCampaignConfig((prev: any) => {
          const base = prev || {};
          const baseArticle = base.articleConfig || {};
          const baseBanner = baseArticle.banner || {};
          return {
            ...base,
            articleConfig: {
              ...baseArticle,
              banner: {
                ...baseBanner,
                imageUrl: bg.value
              }
            }
          };
        });
        try { setIsModified(true); } catch {}
      }
    } catch {}
    
    setTimeout(() => {
      addToHistory({
        campaignConfig: { ...campaignConfig },
        canvasElements: JSON.parse(JSON.stringify(canvasElements)),
        canvasBackground: { ...bg },
        screenBackgrounds: { ...screenBackgrounds }
      }, 'background_update');
    }, 0);

    // Auto-theme wheel based on solid background color
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
          return `#${c(Math.max(0, Math.min(255, Math.round(rgb.r))))}${c(Math.max(0, Math.min(255, Math.round(rgb.g))))}${c(Math.max(0, Math.min(255, Math.round(rgb.b))))}`.toUpperCase();
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
        const baseRgb = toRgb(base);
        if (baseRgb) {
          const primaryRgb = luminance(baseRgb) > 0.6 ? darken(baseRgb, 0.35) : lighten(baseRgb, 0.35);
          const primaryHex = toHex(primaryRgb);

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
                // Update wheel border color if using classic style
                wheelConfig: {
                  ...(prev?.design?.wheelConfig || {}),
                  borderColor: primaryHex,
                  _updatedAt: Date.now()
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

      const updatedElement = {
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
        return newArr;
      });
      setSelectedElement(updatedElement);
    }
  };

  // Utilisation du hook de synchronisation unifié
  const {
    wheelModalConfig,
    // Individual setters for wheel config to wire into the sidebar panel
    setWheelBorderStyle,
    setWheelBorderColor,
    setWheelBorderWidth,
    setWheelScale,
    setShowBulbs,
    setWheelPosition
  } = useWheelConfigSync({
    campaign: campaignConfig,
    extractedColors,
    onCampaignChange: setCampaignConfig
  });

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
  
  // Synchronisation avec le store
  useEffect(() => {
    setPreviewDevice(selectedDevice);
  }, [selectedDevice, setPreviewDevice]);

  // Configuration de campagne dynamique optimisée avec synchronisation forcée
  const campaignData = useMemo(() => {
    const titleElement = canvasElements.find(el => el.type === 'text' && el.role === 'title');
    const descriptionElement = canvasElements.find(el => el.type === 'text' && el.role === 'description');
    const buttonElement = canvasElements.find(el => el.type === 'text' && el.role === 'button');
    
    const customTexts = canvasElements.filter(el => 
      el.type === 'text' && !['title', 'description', 'button'].includes(el.role)
    );
    const customImages = canvasElements.filter(el => el.type === 'image');

    const currentWheelConfig = {
      borderStyle: wheelModalConfig?.wheelBorderStyle || campaignConfig?.wheelConfig?.borderStyle || campaignConfig?.design?.wheelBorderStyle || 'classic',
      borderColor: wheelModalConfig?.wheelBorderColor || campaignConfig?.wheelConfig?.borderColor || campaignConfig?.design?.wheelConfig?.borderColor || '#841b60',
      scale: wheelModalConfig?.wheelScale !== undefined ? wheelModalConfig.wheelScale : (campaignConfig?.wheelConfig?.scale !== undefined ? campaignConfig.wheelConfig.scale : (campaignConfig?.design?.wheelConfig?.scale || 2.4))
    };

    console.log('🔄 CampaignData wheel config sync:', {
      wheelModalConfigScale: wheelModalConfig?.wheelScale,
      campaignConfigScale: campaignConfig?.wheelConfig?.scale,
      finalScale: currentWheelConfig.scale,
      showFunnel
    });

    const primaryColor = canvasBackground.type === 'image' && extractedColors[0]
      ? extractedColors[0]
      : currentWheelConfig.borderColor;
    const secondaryColor = '#ffffff';

    // Build dynamic wheel segments for preview:
    // Prefer central editor store (campaignState) updated by panels/modals,
    // then fallback to local campaignConfig, else generate by count
    const configuredSegments = (
      (campaignState as any)?.wheelConfig?.segments ||
      (campaignConfig as any)?.wheelConfig?.segments ||
      (campaignState as any)?.gameConfig?.wheel?.segments ||
      (campaignState as any)?.config?.roulette?.segments ||
      (campaignConfig as any)?.gameConfig?.wheel?.segments ||
      (campaignConfig as any)?.config?.roulette?.segments ||
      []
    );
    const fallbackCount = configuredSegments.length > 0 ? configuredSegments.length : 6;
    const generatedSegments = Array.from({ length: fallbackCount }, (_, i) => {
      const isWinning = i % 2 === 0;
      return {
        id: String(i + 1),
        label: isWinning ? `Prix ${Math.floor(i / 2) + 1}` : 'Dommage',
        color: isWinning ? primaryColor : secondaryColor,
        textColor: isWinning ? secondaryColor : primaryColor,
        probability: 1,
        isWinning
      } as any;
    });
    const wheelSegments = configuredSegments.length > 0 ? configuredSegments : generatedSegments;
    // Debug: trace the segment flow feeding the preview campaign
    try {
      const segIds = Array.isArray(wheelSegments) ? wheelSegments.map((s: any) => s?.id ?? '?') : [];
      const source = configuredSegments.length > 0 ? 'configured' : `generated(${fallbackCount})`;
      console.log('🧭 [DesignEditorLayout] campaignData segments:', {
        source,
        count: Array.isArray(wheelSegments) ? wheelSegments.length : 0,
        ids: segIds,
        haveCampaignStateWheelConfig: Boolean((campaignState as any)?.wheelConfig?.segments),
        haveCampaignConfigWheelConfig: Boolean((campaignConfig as any)?.wheelConfig?.segments),
        haveCampaignState: Boolean((campaignState as any)?.gameConfig?.wheel?.segments || (campaignState as any)?.config?.roulette?.segments),
        haveCampaignConfig: Boolean((campaignConfig as any)?.gameConfig?.wheel?.segments || (campaignConfig as any)?.config?.roulette?.segments),
        campaignStateSegments: (campaignState as any)?.wheelConfig?.segments,
        campaignConfigSegments: (campaignConfig as any)?.wheelConfig?.segments,
        device: selectedDevice
      });
    } catch (e) {
      console.warn('🧭 [DesignEditorLayout] segment log error', e);
    }

    return {
      id: 'wheel-design-preview',
      type: 'wheel',
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
        wheelConfig: currentWheelConfig,
        wheelBorderStyle: currentWheelConfig.borderStyle,
        designModules: modularPage
      },
      gameConfig: {
        wheel: {
          segments: wheelSegments,
          winProbability: 0.75,
          maxWinners: 100,
          buttonLabel: buttonElement?.content || 'Faire tourner'
        }
      },
      buttonConfig: {
        text: buttonElement?.content || 'Faire tourner',
        color: primaryColor,
        textColor: buttonElement?.style?.color || '#ffffff',
        borderRadius: campaignConfig.borderRadius || '8px'
      },
      screens: [
        {
          title: titleElement?.content || 'Tentez votre chance !',
          description: descriptionElement?.content || 'Tournez la roue et gagnez des prix incroyables',
          buttonText: buttonElement?.content || 'Jouer'
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
      // Article config pour le mode Article
      articleConfig: (campaignState as any)?.articleConfig || campaignConfig?.articleConfig,
      // Garder la configuration canvas pour compatibilité
      canvasConfig: {
        elements: canvasElements,
        background: canvasBackground,
        screenBackgrounds: screenBackgrounds, // Backgrounds par écran
        device: selectedDevice
      }
    };
  }, [canvasElements, canvasBackground, screenBackgrounds, campaignConfig, extractedColors, selectedDevice, wheelModalConfig, campaignState, modularPage]);

  // Synchronisation avec le store (éviter les boucles d'updates)
  const lastTransformedSigRef = useRef<string>('');
  useEffect(() => {
    // Ne pas synchroniser en mode preview pour éviter les boucles infinies
    if (!campaignData || showFunnel) return;

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
          }
        } as any;
      });
      lastTransformedSigRef.current = signature;
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[DesignEditorLayout] Skipping setCampaign: no material change');
      }
    }
  }, [campaignData, setCampaign, showFunnel]);

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
    // Logique intelligente pour l'aperçu :
    // - Sur desktop physique + mode desktop → Fullscreen preview en mode PC
    // - Sur desktop physique + mode mobile → Fullscreen avec fond #2c2c35 et canvas mobile centré
    // - Sur mobile/tablet physique → Toujours fullscreen avec le mode actuel
    
    // Si on est sur desktop physique et en mode desktop, on force le preview en mode desktop
    if (actualDevice === 'desktop' && selectedDevice === 'desktop' && !showFunnel) {
      console.log('💻 [Preview] Desktop → Desktop preview: forcing desktop mode');
      // On s'assure que le preview s'affiche en mode desktop
      setPreviewDevice('desktop');
    }
    
    // Si on est en mode mobile, on affiche toujours le fullscreen avec canvas mobile centré
    if (selectedDevice === 'mobile' && !showFunnel) {
      console.log('📱 [Preview] Mobile view: showing fullscreen with centered mobile canvas');
    }
    
    // Tous les cas : toggle fullscreen preview
    setShowFunnel(!showFunnel);
  };

  // Save and continue: persist then navigate to settings page
  const handleSaveAndContinue = useCallback(() => {
    const fn = createSaveAndContinueHandler(
      campaignState,
      saveCampaign,
      navigate,
      setCampaign
    );
    return fn();
  }, [campaignState, saveCampaign, navigate, setCampaign]);

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
      if (selectedElement?.type === 'text') {
        handleElementUpdate({ textAlign: 'left' });
      }
    },
    onAlignTextCenter: () => {
      if (selectedElement?.type === 'text') {
        handleElementUpdate({ textAlign: 'center' });
      }
    },
    onAlignTextRight: () => {
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
            onSave={handleSaveAndContinue}
            showSaveCloseButtons={false}
            onNavigateToSettings={handleNavigateToSettings}
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
          <div 
            className="group fixed inset-0 z-40 w-full h-[100dvh] min-h-[100dvh] overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: (selectedDevice === 'mobile' && actualDevice !== 'mobile') ? '#2c2c35' : 'transparent'
            }}
          >
            {/* Floating Edit Mode Button */}
            <button
              onClick={() => setShowFunnel(false)}
              className={`absolute top-4 ${previewButtonSide === 'left' ? 'left-4' : 'right-4'} z-50 px-4 py-2 bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] shadow-none focus:shadow-none ring-0 focus:ring-0 drop-shadow-none filter-none backdrop-blur-0`}
            >
              Mode édition
            </button>
            {(selectedDevice === 'mobile' && actualDevice !== 'mobile') ? (
              /* Mobile Preview sur Desktop: Canvas centré avec fond #2c2c35 - Dimensions identiques au mode édition */
              <div className="flex items-center justify-center w-full h-full">
                <div 
                  className="relative overflow-hidden rounded-[32px] shadow-2xl"
                  style={{
                    width: '430px',
                    height: '932px',
                    maxHeight: '90vh'
                  }}
                >
                  <PreviewRenderer
                    campaign={campaignData}
                    previewMode="mobile"
                    wheelModalConfig={wheelModalConfig}
                    constrainedHeight={true}
                  />
                </div>
              </div>
            ) : (
              /* Desktop/Tablet Preview OU Mobile physique: Fullscreen sans cadre */
              <PreviewRenderer
                campaign={campaignData}
                previewMode={actualDevice === 'desktop' && selectedDevice === 'desktop' ? 'desktop' : selectedDevice}
                wheelModalConfig={wheelModalConfig}
              />
            )}
          </div>
        ) : (
          /* Design Editor Mode */
          <>
            {/* Hybrid Sidebar - Design & Technical (always vertical, with drawer from bottom) */}
            <HybridSidebar
                ref={sidebarRef}
                currentScreen={currentScreen}
                onScreenChange={(screen) => {
                  const scrolled = scrollToScreen(screen);
                  if (scrolled) {
                    setCurrentScreen(screen);
                  }
                }}
                onAddElement={handleAddElement}
                onAddModule={handleAddModule}
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
                showEffectsPanel={showEffectsInSidebar}
                onEffectsPanelChange={setShowEffectsInSidebar}
                showAnimationsPanel={showAnimationsInSidebar}
                onAnimationsPanelChange={setShowAnimationsInSidebar}
                showPositionPanel={showPositionInSidebar}
                onPositionPanelChange={setShowPositionInSidebar}
                showWheelPanel={showWheelPanel}
                onWheelPanelChange={setShowWheelPanel}
                showDesignPanel={showDesignInSidebar}
                onDesignPanelChange={(isOpen) => {
                  if (!isOpen) {
                    setShowDesignInSidebar(false);
                  }
                }}
                activeTab={activeTab}
                onActiveTabChange={setActiveTab}
                canvasRef={canvasRef}
                selectedElements={selectedElements}
                onSelectedElementsChange={setSelectedElements}
                onAddToHistory={addToHistory}
                // Modules de l'écran actuel pour le panneau de calques
                modules={modularPage.screens[currentScreen] || []}
                onModuleDelete={handleDeleteModule}
                wheelBorderStyle={wheelModalConfig?.wheelBorderStyle || campaignConfig?.design?.wheelConfig?.borderStyle}
                wheelBorderColor={wheelModalConfig?.wheelBorderColor || campaignConfig?.design?.wheelConfig?.borderColor}
                wheelBorderWidth={campaignConfig?.design?.wheelConfig?.borderWidth}
                wheelScale={
                  wheelModalConfig?.wheelScale !== undefined
                    ? wheelModalConfig.wheelScale
                    : campaignConfig?.design?.wheelConfig?.scale
                }
                wheelShowBulbs={campaignConfig?.design?.wheelConfig?.showBulbs}
                wheelPosition={campaignConfig?.design?.wheelConfig?.position}
                onWheelBorderStyleChange={setWheelBorderStyle}
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
                onWheelBorderColorChange={setWheelBorderColor}
                onWheelBorderWidthChange={setWheelBorderWidth}
                onWheelScaleChange={setWheelScale}
                onWheelShowBulbsChange={setShowBulbs}
                onWheelPositionChange={setWheelPosition}
                selectedDevice={selectedDevice}
                forceFullTabs={editorMode === 'article'}
                hiddenTabs={effectiveHiddenTabs}
                colorEditingContext={designColorContext}
                className={isWindowMobile ? "vertical-sidebar-drawer" : ""}
                // Module selection props
                selectedModuleId={selectedModuleId}
                selectedModule={selectedModule}
                onSelectedModuleChange={setSelectedModuleId}
                onModuleUpdate={handleUpdateModule}
              />
            {/* Main Canvas Area - Multi-Screen Layout */}
            <div 
              className="canvas-scroll-area flex-1 overflow-y-auto overflow-x-hidden bg-[#f5f5f5]"
              style={{ borderBottomLeftRadius: '0 !important' }}
              onMouseDown={(e) => {
                // Only left button
                if (e.button !== 0) return;
                const target = e.target as HTMLElement | null;
                if (!target) return;
                // Ignore clicks inside any canvas root
                const isInsideCanvas = target.closest('[data-canvas-root="true"]');
                if (isInsideCanvas) return;
                // Ignore UI controls to avoid disrupting interactions
                const interactive = target.closest('button, [role="button"], input, textarea, select, [contenteditable="true"]');
                if (interactive) return;
                // Clear selection when clicking light gray background/empty area
                setSelectedElement(null);
                setSelectedElements([]);
              }}
            >
              <div className="min-h-full flex flex-col">
                {/* Premier Canvas - Screen 1 */}
                <div data-screen-anchor="screen1" className="relative">
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
                    onSelectedElementChange={setSelectedElement}
                    selectedElements={selectedElements}
                    onSelectedElementsChange={setSelectedElements}
                    onElementUpdate={handleElementUpdate}
                    // Wheel sync props
                    wheelModalConfig={wheelModalConfig}
                    extractedColors={extractedColors}
                    containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                    elementFilter={(element: any) => {
                      const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                      return !role.includes('exit-message') && element?.screenId !== 'screen2' && element?.screenId !== 'screen3';
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
                      if (!isWindowMobile) {
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
                    onOpenWheelPanel={() => {
                      setShowWheelPanel(true);
                      if (sidebarRef.current) {
                        sidebarRef.current.setActiveTab('wheel');
                      }
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
                    showWheelPanel={showWheelPanel}
                    onWheelPanelChange={setShowWheelPanel}
                    // Modular page (screen1)
                    modularModules={modularPage.screens.screen1}
                    onModuleUpdate={handleUpdateModule}
                    onModuleDelete={handleDeleteModule}
                    onModuleMove={handleMoveModule}
                    onModuleDuplicate={handleDuplicateModule}
                    selectedModuleId={selectedModuleId}
                    selectedModule={selectedModule}
                    onSelectedModuleChange={setSelectedModuleId}
                  />
                </div>
                
                {/* Deuxième Canvas - Screen 2 (Wheel Game) - Seulement en mode Fullscreen */}
                {editorMode === 'fullscreen' && (
                <div className="mt-4 relative" data-screen-anchor="screen2">
                  {/* Background pour éviter la transparence */}
                  <div 
                    className="absolute inset-0 z-0"
                    style={{
                      background: screenBackgrounds.screen2.type === 'image'
                        ? `url(${screenBackgrounds.screen2.value}) center/cover no-repeat`
                        : screenBackgrounds.screen2.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
                    }}
                  />
                  {/* Background supplémentaire pour l'espace entre les canvas */}
                  <div 
                    className="absolute -top-4 left-0 right-0 h-4 z-0"
                    style={{
                      background: '#f5f5f5'
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
                      // Wheel sync props
                      wheelModalConfig={wheelModalConfig}
                      extractedColors={extractedColors}
                      containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                      elementFilter={(element: any) => {
                        const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                        return !role.includes('exit-message') && (element?.screenId === 'screen2' || role.includes('form') || role.includes('contact'));
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
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);
                      }}
                      onOpenWheelPanel={() => {
                        setShowWheelPanel(true);
                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('wheel');
                        }
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
                      showWheelPanel={showWheelPanel}
                      onWheelPanelChange={setShowWheelPanel}
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

                {/* Troisième Canvas - Screen 3 (Result Screen) - Seulement en mode Fullscreen */}
                {editorMode === 'fullscreen' && (
                <div className="mt-4 relative" data-screen-anchor="screen3">
                  {/* Background pour éviter la transparence */}
                  <div 
                    className="absolute inset-0 z-0"
                    style={{
                      background: screenBackgrounds.screen3.type === 'image'
                        ? `url(${screenBackgrounds.screen3.value}) center/cover no-repeat`
                        : screenBackgrounds.screen3.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
                    }}
                  />
                  {/* Background supplémentaire pour l'espace entre les canvas */}
                  <div 
                    className="absolute -top-4 left-0 right-0 h-4 z-0"
                    style={{
                      background: '#f5f5f5'
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
                      // Wheel sync props
                      wheelModalConfig={wheelModalConfig}
                      extractedColors={extractedColors}
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
                      onOpenWheelPanel={() => {
                        setShowWheelPanel(true);
                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('wheel');
                        }
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
                      showWheelPanel={showWheelPanel}
                      onWheelPanelChange={setShowWheelPanel}
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
          </>
        )}
        {/* Zoom Slider intégré dans le canvas avec navigation entre écrans */}
        {!isWindowMobile && !showFunnel && (
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
      </div>
      {/* Floating bottom-right actions (no band) */}
      {!showFunnel && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 z-30">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-3 py-1.5 text-sm rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            title="Fermer"
          >
            <X className="w-4 h-4 mr-1" />
            Fermer
          </button>
          <button
            onClick={handleSaveAndContinue}
            className="inline-flex items-center px-4 py-2 text-sm rounded-xl bg-gradient-to-br from-[#841b60] to-[#b41b60] backdrop-blur-sm text-white font-medium border border-white/20 shadow-lg shadow-[#841b60]/20 hover:from-[#841b60] hover:to-[#6d164f] hover:shadow-xl hover:shadow-[#841b60]/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[#841b60]/20"
            title="Sauvegarder et continuer"
          >
            <Save className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Sauvegarder et continuer</span>
            <span className="sm:hidden">Sauvegarder</span>
          </button>
        </div>
      )}
    </MobileStableEditor>
    </div>
  );
};

export default DesignEditorLayout;
