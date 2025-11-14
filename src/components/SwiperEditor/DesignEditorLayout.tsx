'use client';

// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef, useCallback, lazy } from 'react';
import CampaignValidationModal from '@/components/shared/CampaignValidationModal';
import { useCampaignValidation } from '@/hooks/useCampaignValidation';
import { useLocation, useNavigate } from '@/lib/router-adapter';
import { Save, X } from 'lucide-react';

const HybridSidebar = lazy(() => import('./HybridSidebar'));
const DesignToolbar = lazy(() => import('./DesignToolbar'));
const FullScreenPreviewModal = lazy(() => import('@/components/shared/modals/FullScreenPreviewModal'));
import GameCanvasPreview from '@/components/ModernEditor/components/GameCanvasPreview';
import PreviewRenderer from '@/components/preview/PreviewRenderer';
import { getArticleConfigWithDefaults } from '@/utils/articleConfigHelpers';
import type { ModularPage, ScreenId, BlocBouton, Module } from '@/types/modularEditor';
import { createEmptyModularPage } from '@/types/modularEditor';

import ZoomSlider from './components/ZoomSlider';
const DesignCanvas = lazy(() => import('./DesignCanvas'));
import EditorHeader from '@/components/shared/EditorHeader';
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
// Swiper Editor doesn't need wheel config sync
// import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
import { useGroupManager } from '../../hooks/useGroupManager';
import { getDeviceDimensions } from '../../utils/deviceDimensions';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';
import { useEditorPreviewSync } from '@/hooks/useEditorPreviewSync';
import { useCampaignSettings } from '@/hooks/useCampaignSettings';
import type { ScreenBackgrounds } from '@/types/background';
import { useEditorUnmountSave } from '@/hooks/useEditorUnmountSave';


import { useCampaigns } from '@/hooks/useCampaigns';
import { saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';
import { useCampaignStateSync } from '@/hooks/useCampaignStateSync';
import { swiperTemplates } from '../../types/swiperTemplates';
import { supabase } from '@/integrations/supabase/client';
// import { CampaignStorage } from '@/utils/campaignStorage';
import { useAutoSaveToSupabase } from '@/hooks/useAutoSaveToSupabase';
import { generateTempCampaignId, isTempCampaignId, isPersistedCampaignId, clearTempCampaignData, replaceTempWithPersistedId } from '@/utils/tempCampaignId';

const KeyboardShortcutsHelp = lazy(() => import('../shared/KeyboardShortcutsHelp'));
const MobileStableEditor = lazy(() => import('./components/MobileStableEditor'));

const LAUNCH_BUTTON_FALLBACK_GRADIENT = '#000000';
const LAUNCH_BUTTON_DEFAULT_TEXT_COLOR = '#ffffff';
const LAUNCH_BUTTON_DEFAULT_PADDING = '14px 28px';
const LAUNCH_BUTTON_DEFAULT_SHADOW = '0 4px 12px rgba(0, 0, 0, 0.15)';

const buildLaunchButtonStyles = (
  buttonModule: BlocBouton | undefined,
  swiperStyleOverrides: Record<string, any>,
  swiperConfig: {
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
    swiperStyleOverrides.borderRadius ||
    moduleStyles.borderRadius ||
    (typeof swiperConfig.borderRadius === 'number'
      ? `${swiperConfig.borderRadius}px`
      : swiperConfig.borderRadius) ||
    '9999px';

  return {
    background:
      moduleStyles.background ||
      swiperStyleOverrides.buttonBackgroundColor ||
      swiperConfig.buttonBackgroundColor ||
      LAUNCH_BUTTON_FALLBACK_GRADIENT,
    color:
      moduleStyles.color ||
      swiperStyleOverrides.buttonTextColor ||
      swiperConfig.buttonTextColor ||
      LAUNCH_BUTTON_DEFAULT_TEXT_COLOR,
    padding:
      moduleStyles.padding ||
      swiperStyleOverrides.buttonPadding ||
      LAUNCH_BUTTON_DEFAULT_PADDING,
    borderRadius: resolvedBorderRadius,
    boxShadow:
      moduleStyles.boxShadow ||
      swiperStyleOverrides.buttonBoxShadow ||
      LAUNCH_BUTTON_DEFAULT_SHADOW,
    display: swiperStyleOverrides.buttonDisplay || 'inline-flex',
    alignItems: swiperStyleOverrides.buttonAlignItems || 'center',
    justifyContent: swiperStyleOverrides.buttonJustifyContent || 'center',
    minWidth: swiperStyleOverrides.buttonMinWidth,
    minHeight: swiperStyleOverrides.buttonMinHeight,
    width: swiperStyleOverrides.buttonWidth,
    height: swiperStyleOverrides.buttonHeight,
    textTransform: swiperStyleOverrides.buttonTextTransform,
    fontWeight: swiperStyleOverrides.buttonFontWeight || 600
  } as React.CSSProperties;
};

interface SwiperEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}

const SwiperEditorLayout: React.FC<SwiperEditorLayoutProps> = ({ mode = 'campaign', hiddenTabs }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Détection du mode Article via URL (?mode=article)
  const searchParams = new URLSearchParams(location.search);
  const editorMode: 'article' | 'fullscreen' = searchParams.get('mode') === 'article' ? 'article' : 'fullscreen';
  
  console.log('🎨 [SwiperEditorLayout] Editor Mode:', editorMode);

  useEffect(() => {
    const previousBackground = document.body.style.background;
    const previousBackgroundAttachment = document.body.style.backgroundAttachment;
    const previousBackgroundSize = document.body.style.backgroundSize;
    const previousMinHeight = document.body.style.minHeight;
    const previousMargin = document.body.style.margin;

    document.body.style.background = 'linear-gradient(180deg, rgba(59, 56, 135, 0.855), rgba(156, 26, 96, 0.72), rgba(195, 85, 70, 0.775), rgba(156, 26, 96, 0.72))';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundSize = 'cover';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';

    // Suppress CSS transitions/animations briefly on mount to avoid initial flicker when restoring saved campaigns
    let styleEl: HTMLStyleElement | null = null;
    try {
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-no-anim', 'true');
      styleEl.textContent = `* { transition: none !important; animation: none !important; }`;
      document.head.appendChild(styleEl);
      setTimeout(() => {
        try { if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl); } catch {}
      }, 300);
    } catch {}

    return () => {
      document.body.style.background = previousBackground;
      document.body.style.backgroundAttachment = previousBackgroundAttachment;
      document.body.style.backgroundSize = previousBackgroundSize;
      document.body.style.minHeight = previousMinHeight;
      document.body.style.margin = previousMargin;
    };
  }, []);
  const getTemplateBaseWidths = useCallback((templateId?: string) => {
    const template = swiperTemplates.find((tpl) => tpl.id === templateId) || swiperTemplates[0];
    const width = template?.style?.containerWidth ?? 450;
    // Zoom mobile par défaut à 70%
    const mobileWidth = Math.round(width * 0.7);
    return { desktop: `${width}px`, mobile: `${mobileWidth}px` };
  }, []);

  // 🧹 CRITICAL: Reset store when leaving editor to prevent contamination
  const resetCampaign = useEditorStore(s => s.resetCampaign);
  useEffect(() => {
    return () => {
      console.log('🧹 [SwiperEditor] Unmounting - resetting store for next editor');
      resetCampaign();
    };
  }, [resetCampaign]);

  // Initialisation session: nettoyer les anciennes clés localStorage sans namespacing
  useEffect(() => {
    try {
      const w = window as any;
      if (!w.__swiperBgSessionInitialized) {
        w.__swiperBgSessionInitialized = true;
        
        // CRITICAL: Clean up old localStorage keys without namespacing
        console.log('🧹 [SwiperEditor] Cleaning up old localStorage background keys');
        const screens: Array<'screen1' | 'screen2' | 'screen3'> = ['screen1', 'screen2', 'screen3'];
        const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
        
        screens.forEach((s) => devices.forEach((d) => {
          try { 
            // Remove old keys without campaign ID
            localStorage.removeItem(`swiper-bg-${d}-${s}`);
          } catch {}
        }));
        
        // Remove global owner key
        try { localStorage.removeItem('swiper-bg-owner'); } catch {}
        
        console.log('✅ [SwiperEditor] Old background keys cleaned');
      }
    } catch {}
  }, []);

  // --- Save Design: floating action + throttled autosave ---
  // (moved below after campaignState/saveCampaign declarations to avoid TDZ)

  // Effet de montage: ne plus nettoyer les images de fond pour préserver l'édition après un aperçu
  useEffect(() => {
    // Laisser intacts les overrides en localStorage et l'état en mémoire
    // Optionnel: notifier les canvases pour re-synchroniser visuellement
    try {
      window.dispatchEvent(new CustomEvent('swiper-bg-sync', { detail: { screenId: 'screen1' } }));
      window.dispatchEvent(new CustomEvent('swiper-bg-sync', { detail: { screenId: 'screen2' } }));
      window.dispatchEvent(new CustomEvent('swiper-bg-sync', { detail: { screenId: 'screen3' } }));
    } catch {}
  }, []);

  const initialTemplateWidths = useMemo(() => getTemplateBaseWidths('image-swiper'), [getTemplateBaseWidths]);

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

  // Zoom par défaut selon l'appareil, avec restauration depuis localStorage
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

  // Store centralisé pour l'optimisation
  const { 
    setCampaign,
    setPreviewDevice,
    setIsLoading,
    setIsModified,
    saveToCampaignCache,
    loadFromCampaignCache,
    initializeNewCampaignWithId
  } = useEditorStore();
  const isNewCampaignGlobal = useEditorStore((s) => s.isNewCampaignGlobal);
  const beginNewCampaign = useEditorStore((s) => s.beginNewCampaign);
  const clearNewCampaignFlag = useEditorStore((s) => s.clearNewCampaignFlag);
  const selectCampaign = useEditorStore((s) => s.selectCampaign);
  
  // Hook de synchronisation preview
  const { syncBackground } = useEditorPreviewSync();
  // Campagne centralisée (source de vérité pour les champs de contact)
  const campaignState = useEditorStore((s) => s.campaign);

// Supabase campaigns API
const { saveCampaign, duplicateCampaign } = useCampaigns();

// 🔄 Load campaign data from Supabase when campaign ID is in URL
useEffect(() => {
  const sp = new URLSearchParams(location.search);
  const campaignId = sp.get('campaign');
  const isUuid = (v?: string | null) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  
  // CRITICAL: Skip loading for temporary campaign IDs - they should remain blank
  if (isTempCampaignId(campaignId)) {
    console.log('⏭️ [SwiperEditor] Skipping load for temporary campaign:', campaignId);
    dataHydratedRef.current = true; // Mark as hydrated to prevent default data loading
    return;
  }
  
  if (!campaignId || !isUuid(campaignId)) return;
  
  // Check if we're switching campaigns
  const currentCampaignId = (campaignState as any)?.id;
  if (currentCampaignId && currentCampaignId !== campaignId) {
    console.log('🔄 [SwiperEditor] Switching campaigns, saving current state');
    
    // Local cache disabled
  }
  
  // Skip if this campaign is already loaded
  if (currentCampaignId === campaignId) {
    const hasPayload = campaignState && Object.keys(campaignState).length > 0;
    if (hasPayload) {
      console.log('✅ [SwiperEditor] Campaign already loaded:', campaignId);
      return;
    }
    console.log('⚠️ [SwiperEditor] Campaign id matches but store empty, forcing reload');
  }
  
  console.log('🔄 [SwiperEditor] Loading campaign:', campaignId);
  
  // Try to load from cache first (but NOT for temp campaigns)
  if (!isTempCampaignId(campaignId)) {
    const cachedData = loadFromCampaignCache(campaignId);
    if (cachedData && cachedData.campaign) {
      console.log('📦 [SwiperEditor] Restoring from cache');
      setCampaign(cachedData.campaign);
      if (cachedData.canvasElements) setCanvasElements(cachedData.canvasElements);
      if (cachedData.modularPage) setModularPage(cachedData.modularPage);
      if (cachedData.screenBackgrounds) {
        setScreenBackgrounds(cachedData.screenBackgrounds);
        bgHydratedRef.current = true;
      }
      if (cachedData.canvasZoom) setCanvasZoom(cachedData.canvasZoom);
      dataHydratedRef.current = true;
      return;
    }
  }
  
  // Otherwise, load from Supabase
  const loadCampaignData = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        console.log('✅ [SwiperEditor] Campaign loaded from DB:', {
          id: data.id,
          name: data.name,
          hasConfig: !!data.config,
          hasDesign: !!data.design,
          hasModules: !!((data.design as any)?.swiperModules || (data.config as any)?.modularPage)
        });

        // Transform database row to OptimizedCampaign format
        const campaignData: any = {
          ...data,
          id: data.id,
          name: data.name || 'Campaign',
          type: data.type || 'swiper',
          // Map DB fields to editor-friendly shape
          editorMode: (data as any).editor_mode || (data as any).editorMode || editorMode,
          articleConfig: (data as any).article_config || (data as any).articleConfig,
          design: data.design || {},
          gameConfig: (data.game_config || {}) as any,
          buttonConfig: {},
          config: data.config || {},
          formFields: data.form_fields || [],
          _lastUpdate: Date.now(),
          _version: 1
        };
        
        // Update campaign state with loaded data
        setCampaign(campaignData);
        
        // Local cache disabled
      }
    } catch (error) {
      console.error('❌ [SwiperEditor] Failed to load campaign:', error);
    }
  };
  
  loadCampaignData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.search, campaignState, setCampaign, saveToCampaignCache, loadFromCampaignCache]);
  
// Campaign state synchronization hook
const { syncAllStates, syncModularPage } = useCampaignStateSync();

  // Nouvelle campagne via header: si aucun id dans l'URL, créer une campagne vierge et activer le flag global
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cid = params.get('campaign');
    if (!cid) {
      console.log('🆕 [SwiperEditor] Creating new blank campaign');
      beginNewCampaign('swiper');
      // Générer un ID temporaire unique
      const tempId = generateTempCampaignId('swiper');
      
      // CRITICAL: Nettoyer TOUTES les données d'abord pour garantir une campagne vierge
      clearTempCampaignData(tempId);
      
      // Purge additionnelle des clés legacy non-namespacées
      try {
        const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
        const screens: Array<'screen1' | 'screen2' | 'screen3'> = ['screen1', 'screen2', 'screen3'];
        devices.forEach((d) => screens.forEach((s) => {
          try { localStorage.removeItem(`swiper-modules-${d}-${s}`); } catch {}
          try { localStorage.removeItem(`swiper-bg-${d}-${s}`); } catch {}
          try { localStorage.removeItem(`design-bg-${d}-${s}`); } catch {}
        }));
      } catch {}
      
      // CRITICAL: Initialiser la campagne avec l'ID temporaire dans le store
      // pour que campaign.id soit défini immédiatement et évite les fallback 'global'
      initializeNewCampaignWithId('swiper', tempId);
      
      // Mettre à jour l'URL pour inclure le temp ID
      navigate(`${location.pathname}?campaign=${tempId}${searchParams.get('mode') ? `&mode=${searchParams.get('mode')}` : ''}`, { replace: true });
      
      requestAnimationFrame(() => clearNewCampaignFlag());
    } else {
      // S'assurer que le flag est désactivé quand on charge une campagne existante
      if (isNewCampaignGlobal) clearNewCampaignFlag();
    }
  }, [location.pathname]);
  
  
  
  // CRITICAL: Reset all local state when campaign ID changes to ensure complete isolation
  const prevCampaignIdRef = useRef<string | undefined>(undefined);
  const dataHydratedRef = useRef(false);
  useEffect(() => {
    const currentCampaignId = (campaignState as any)?.id;
    const prevCampaignId = prevCampaignIdRef.current;
    
    // If campaign ID changed, reset all local states to prevent data mixing
    // BUT ONLY if data is not currently being hydrated from DB
    if (prevCampaignId && currentCampaignId && prevCampaignId !== currentCampaignId && !dataHydratedRef.current) {
      console.log('🔄 [SwiperEditor] Campaign changed from', prevCampaignId, 'to', currentCampaignId, '→ Resetting all local state');
      
      // Reset canvas elements
      setCanvasElements([]);
      
      // Reset backgrounds to empty instead of default
      setScreenBackgrounds({
        screen1: { type: 'color', value: '' },
        screen2: { type: 'color', value: '' },
        screen3: { type: 'color', value: '' }
      });
      setCanvasBackground({ type: 'color', value: '' });
      bgHydratedRef.current = false;
      dataHydratedRef.current = false;
      bgAppliedRef.current = {};
      
      // Reset modular page
      setModularPage(createEmptyModularPage());
      
      // LocalStorage cleanup disabled (DB is the source of truth)
      try {
        // no-op
      } catch {}
    }
    
    prevCampaignIdRef.current = currentCampaignId;
  }, [campaignState?.id]);

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
  
  // State refs for campaign switching (to avoid dependency issues)
  const canvasElementsRef = useRef<any[]>([]);
  const modularPageRef = useRef<ModularPage | null>(null);
  const screenBackgroundsRef = useRef<ScreenBackgrounds | null>(null);
  const canvasZoomRef = useRef<number>(0.7);
  
  // Modular editor JSON state - DOIT être déclaré AVANT les callbacks qui l'utilisent
  const [modularPage, setModularPage] = useState<ModularPage>(createEmptyModularPage());
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  
  // Update refs when state changes
  useEffect(() => {
    canvasElementsRef.current = canvasElements;
  }, [canvasElements]);
  
  // Background par écran - chaque écran a son propre background
  // IMPORTANT: Initialize with empty/null to force loading from DB instead of using default
  const defaultBackground = { type: 'color' as const, value: '' };
  
  const [screenBackgrounds, setScreenBackgrounds] = useState<ScreenBackgrounds>({
    screen1: defaultBackground,
    screen2: defaultBackground,
    screen3: defaultBackground
  });
  
  useEffect(() => {
    screenBackgroundsRef.current = screenBackgrounds;
  }, [screenBackgrounds]);
  
  // Hydration flag to avoid overwriting DB with defaults before campaign data is applied
  const bgHydratedRef = useRef(false);
  
  // Background global (fallback pour compatibilité)
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>({ type: 'color', value: '' });
  const [canvasZoom, setCanvasZoom] = useState(getDefaultZoom(selectedDevice));
  
  useEffect(() => {
    canvasZoomRef.current = canvasZoom;
  }, [canvasZoom]);

  // 🧹 CRITICAL: Save complete state before unmount to prevent data loss
  // Placed here AFTER all state declarations to avoid TDZ errors
  useEditorUnmountSave('swiper', {
    canvasElements,
    modularPage,
    screenBackgrounds,
    extractedColors,
    selectedDevice,
    canvasZoom,
    gameConfig: (campaignState as any)?.swiperConfig
  }, saveCampaign);

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

  // --- Save Design: floating action + throttled autosave --- (defined later to avoid TDZ)

// Synchronise l'état de l'appareil réel et sélectionné après le montage (corrige les différences entre Lovable et Safari)
useEffect(() => {
  const device = detectDevice();
  setActualDevice(device);
  setSelectedDevice(device);
  setCanvasZoom(getDefaultZoom(device));
}, []);

// ✅ Hydrater les éléments/modularPage/backgrounds depuis la DB à l'ouverture
useEffect(() => {
  const cfg = (campaignState as any)?.config?.canvasConfig || (campaignState as any)?.canvasConfig;
  // Prioritize design.swiperModules as it's the primary save location
  const mp = (campaignState as any)?.design?.swiperModules || (campaignState as any)?.config?.modularPage || (campaignState as any)?.modularPage;
  const topLevelElements = (campaignState as any)?.config?.elements;

  // N'hydrate que si on a des données utiles ET que le local est vide
  if (Array.isArray(cfg?.elements) && cfg.elements.length > 0 && canvasElements.length === 0) {
    console.log('🧩 [SwiperEditor] Hydration: applying canvas elements (canvasConfig)', cfg.elements.length);
    setCanvasElements(cfg.elements);
  } else if (Array.isArray(topLevelElements) && topLevelElements.length > 0 && canvasElements.length === 0) {
    console.log('🧩 [SwiperEditor] Hydration: applying canvas elements (config.elements)', topLevelElements.length);
    setCanvasElements(topLevelElements);
  }

  if (cfg?.screenBackgrounds) {
    setScreenBackgrounds(cfg.screenBackgrounds);
    bgHydratedRef.current = true;
  } else {
    const designBg = (campaignState as any)?.design || {};
    const globalDesktop = designBg.backgroundImage as string | undefined;
    const globalMobile = designBg.mobileBackgroundImage as string | undefined;
    if (globalDesktop || globalMobile) {
      const imgDesktop = globalDesktop ? { type: 'image' as const, value: globalDesktop } : { type: 'color' as const, value: '' };
      const derived: ScreenBackgrounds = {
        screen1: imgDesktop,
        screen2: imgDesktop,
        screen3: imgDesktop
      };
      setScreenBackgrounds(derived);
      bgHydratedRef.current = true;
    } else {
      // No background in DB, use empty background
      setScreenBackgrounds({
        screen1: { type: 'color', value: '' },
        screen2: { type: 'color', value: '' },
        screen3: { type: 'color', value: '' }
      });
    }
  }
  if (cfg?.device) setSelectedDevice(cfg.device as any);

  // (projection top-level retirée pour éviter des boucles de mise à jour)

  if (mp && mp.screens) {
    const total = Object.values(mp.screens || {}).reduce((n: number, arr: any) => n + (Array.isArray(arr) ? arr.length : 0), 0);
    if (total > 0) {
      console.log('🧩 [SwiperEditor] Hydration: applying modularPage from', {
        fromDesignSwiperModules: !!(campaignState as any)?.design?.swiperModules,
        fromConfigModularPage: !!(campaignState as any)?.config?.modularPage,
        fromTopLevelModularPage: !!(campaignState as any)?.modularPage,
        modulesCount: total
      });
      setModularPage(mp);
    }
  }
  // Mark data hydrated for autosave guards
  dataHydratedRef.current = true;
}, [campaignState]);

// Mémo de ce qui a été appliqué pour éviter les boucles (device+screen -> url)
const bgAppliedRef = useRef<Record<string, string>>({});

// Hydratation basée campagne → localStorage + Preview (tous devices), avec garde anti-boucle
useEffect(() => {
  try {
    const campaignId = (campaignState as any)?.id;
    if (!campaignId) return;
    
    const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
    const screens: Array<'screen1' | 'screen2' | 'screen3'> = ['screen1', 'screen2', 'screen3'];
    const designBg = (campaignState as any)?.design || {};
    const globalDesktop = designBg.backgroundImage as string | undefined;
    const globalMobile = designBg.mobileBackgroundImage as string | undefined;

    devices.forEach((device) => {
      screens.forEach((s) => {
        const bg = screenBackgrounds[s] as any;
        let value: string | undefined = undefined;
        if (bg?.type === 'image' && typeof bg.value === 'string') value = bg.value;
        if (!value && bg?.devices?.[device]?.type === 'image' && typeof bg?.devices?.[device]?.value === 'string') value = bg.devices[device].value;
        if (!value) value = device === 'mobile' ? globalMobile : globalDesktop;

        const key = `${device}:${s}`;
        // Use CampaignStorage namespace format
        const storageKey = `campaign_${campaignId}:bg-${device}-${s}`;
        if (value && bgAppliedRef.current[key] !== value) {
          bgAppliedRef.current[key] = value;
          try { localStorage.setItem(storageKey, value); } catch {}
          try { window.dispatchEvent(new CustomEvent('applyBackgroundCurrentScreen', { detail: { url: value, device, screenId: s } })); } catch {}
        }
      });
    });
  } catch {}
}, [campaignState?.design?.backgroundImage, campaignState?.design?.mobileBackgroundImage, screenBackgrounds]);

  // Réflection après édition locale (screenBackgrounds modifiés) → garde anti-boucle
  useEffect(() => {
    try {
      const campaignId = (campaignState as any)?.id;
      if (!campaignId) return;
      
      const device = selectedDevice;
      const screens: Array<'screen1' | 'screen2' | 'screen3'> = ['screen1', 'screen2', 'screen3'];
      screens.forEach((s) => {
        const bg = screenBackgrounds[s];
        if (bg?.type === 'image' && typeof bg.value === 'string') {
          const key = `${device}:${s}`;
          if (bgAppliedRef.current[key] !== bg.value) {
            bgAppliedRef.current[key] = bg.value;
            // Use CampaignStorage namespace format
            const storageKey = `campaign_${campaignId}:bg-${device}-${s}`;
            try { localStorage.setItem(storageKey, bg.value); } catch {}
            try { window.dispatchEvent(new CustomEvent('applyBackgroundCurrentScreen', { detail: { url: bg.value, device, screenId: s } })); } catch {}
          }
        }
      });
    } catch {}
  }, [screenBackgrounds, selectedDevice, campaignState?.id]);

  // Hydratation initiale depuis config.canvasConfig.screenBackgrounds si présent → garde anti-boucle
  useEffect(() => {
    try {
      const campaignId = (campaignState as any)?.id;
      if (!campaignId) return;
      
      const cfg = (campaignState as any)?.config?.canvasConfig;
      const sb = cfg?.screenBackgrounds as ScreenBackgrounds | undefined;
      if (!sb) return;
      const device = selectedDevice;
      (['screen1','screen2','screen3'] as const).forEach((s) => {
        const bg: any = (sb as any)[s];
        if (bg?.type === 'image' && typeof bg.value === 'string') {
          const key = `${device}:${s}`;
          if (bgAppliedRef.current[key] !== bg.value) {
            bgAppliedRef.current[key] = bg.value;
            // Use CampaignStorage namespace format
            const storageKey = `campaign_${campaignId}:bg-${device}-${s}`;
            try { localStorage.setItem(storageKey, bg.value); } catch {}
            try { window.dispatchEvent(new CustomEvent('applyBackgroundCurrentScreen', { detail: { url: bg.value, device, screenId: s } })); } catch {}
          }
        }
      });
    } catch {}
  }, [campaignState?.id, screenBackgrounds, selectedDevice]);

// 🔗 Miroir local → store: conserve les éléments dans campaign.config.canvasConfig
useEffect(() => {
  // Skip initial mirror until backgrounds were hydrated from campaign or user edited
  if (!bgHydratedRef.current) return;
  setCampaign((prev: any) => {
    if (!prev) return prev;
    const next = {
      ...prev,
      // Top-level projection for PreviewRenderer
      canvasConfig: {
        ...(prev.canvasConfig || {}),
        elements: canvasElements,
        screenBackgrounds,
        device: selectedDevice,
        zoom: canvasZoom,
      },
      config: {
        ...(prev.config || {}),
        canvasConfig: {
          ...(prev.config?.canvasConfig || {}),
          elements: canvasElements,
          screenBackgrounds,
          device: selectedDevice,
          zoom: canvasZoom
        },
        elements: canvasElements
      }
    };
    return next as any;
  });
}, [canvasElements, screenBackgrounds, selectedDevice, canvasZoom, setCampaign]);

  // Détection de la taille de fenêtre
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Ne pas réinitialiser l'image de fond lors des changements de route (préserve l'image après Preview)
  const prevPathRef = useRef<string>('');
  useEffect(() => {
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  // Forcer la ré-application des backgrounds au retour (focus/pageshow) depuis le Preview
  useEffect(() => {
    const forceReapply = () => {
      try {
        const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
        const screens: Array<'screen1' | 'screen2' | 'screen3'> = ['screen1', 'screen2', 'screen3'];
        const designBg = (campaignState as any)?.design || {};
        const globalDesktop = designBg.backgroundImage as string | undefined;
        const globalMobile = designBg.mobileBackgroundImage as string | undefined;
        devices.forEach((device) => {
          screens.forEach((s) => {
            const bg = screenBackgrounds[s] as any;
            let value: string | undefined = undefined;
            if (bg?.type === 'image' && typeof bg.value === 'string') value = bg.value;
            if (!value && bg?.devices?.[device]?.type === 'image' && typeof bg?.devices?.[device]?.value === 'string') value = bg.devices[device].value;
            if (!value) value = device === 'mobile' ? globalMobile : globalDesktop;
            const key = `swiper-bg-${(campaignState as any)?.id || 'global'}-${device}-${s}`;
            if (value) {
              try { localStorage.setItem(key, value); } catch {}
              try { window.dispatchEvent(new CustomEvent('applyBackgroundCurrentScreen', { detail: { url: value, device, screenId: s } })); } catch {}
            }
          });
        });
      } catch {}
    };
    window.addEventListener('focus', forceReapply);
    window.addEventListener('pageshow', forceReapply);
    return () => {
      window.removeEventListener('focus', forceReapply);
      window.removeEventListener('pageshow', forceReapply);
    };
  }, [campaignState?.design?.backgroundImage, campaignState?.design?.mobileBackgroundImage, screenBackgrounds]);

  // Ajuste automatiquement le zoom lors du redimensionnement sur mobile
  useEffect(() => {
    if (actualDevice === 'mobile') {
      const updateZoom = () => setCanvasZoom(getDefaultZoom('mobile'));
      window.addEventListener('resize', updateZoom);
      return () => window.removeEventListener('resize', updateZoom);
    }
  }, [actualDevice]);

  // Synchronisation des champs du formulaire entre campaignState et campaignConfig
  useEffect(() => {
    if ((campaignState as any)?.formFields) {
      setCampaignConfig((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          formFields: (campaignState as any).formFields
        };
      });
    }
  }, [(campaignState as any)?.formFields]);

  // État pour forcer le re-render du preview quand l'image de fond change
  const [backgroundUpdateTrigger, setBackgroundUpdateTrigger] = useState(0);

  

  // Fonction commune pour mettre à jour l'image de fond
  const updateBackgroundImage = useCallback((url: string, targetDevice: string) => {
    console.log('🎨 [SwiperEditor] Updating background image:', { url: url.substring(0, 50), targetDevice, selectedDevice });
    
    // Ne pas définir canvasBackground global ici: les fonds sont gérés par écran.
    
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
    
    // Forcer le re-render du preview
    setBackgroundUpdateTrigger(prev => prev + 1);
  }, [selectedDevice, setCampaign]);

  // Écoute l'évènement global pour appliquer l'image de fond à tous les écrans par device
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { url?: string; device?: string } | undefined;
      const url = detail?.url;
      const targetDevice = detail?.device || 'desktop';
      if (!url) return;
      
      console.log('🎨 [SwiperEditor] Received applyBackgroundAllScreens:', { url: url.substring(0, 50), targetDevice, selectedDevice });
      updateBackgroundImage(url, targetDevice);
    };
    window.addEventListener('applyBackgroundAllScreens', handler as EventListener);
    return () => window.removeEventListener('applyBackgroundAllScreens', handler as EventListener);
  }, [updateBackgroundImage, selectedDevice]);

  // Écoute l'évènement pour appliquer l'image uniquement à l'écran courant
  useEffect(() => {
    const handler = (e: Event) => {
      // DesignCanvas applique visuellement par écran; ici on synchronise UNIQUEMENT le background de preview
      // dans campaign.canvasConfig.background (preview-only), sans toucher campaign.design.*
      const detail = (e as CustomEvent<any>)?.detail as { url?: string; device?: string; screenId?: string } | undefined;
      const url = detail?.url;
      if (!url) return;
      const targetDevice = (detail?.device as 'desktop' | 'tablet' | 'mobile' | undefined) || selectedDevice;
      console.log('🎨 [SwiperEditor] applyBackgroundCurrentScreen → preview-only sync:', {
        url: url.substring(0, 50),
        targetDevice,
        selectedDevice,
        screenId: detail?.screenId
      });

      // Synchroniser via le hook dédié pour que le store Zustand soit mis à jour
      try {
        console.log('🔔 [SwiperEditor] Syncing background via useEditorPreviewSync:', {
          url: url.substring(0, 50) + '...',
          device: targetDevice,
          screenId: detail?.screenId
        });
        syncBackground({ type: 'image', value: url }, targetDevice as 'desktop' | 'tablet' | 'mobile');
      } catch (err) {
        console.error('❌ [SwiperEditor] Failed to sync background:', err);
      }

      // Légère impulsion locale quand l'appareil correspond
      if (targetDevice === selectedDevice) {
        try { setBackgroundUpdateTrigger((p) => p + 1); } catch {}
      }
    };
    window.addEventListener('applyBackgroundCurrentScreen', handler as EventListener);
    return () => window.removeEventListener('applyBackgroundCurrentScreen', handler as EventListener);
  }, [selectedDevice, syncBackground]);
  
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
  // Inline SwiperConfigPanel visibility (controlled at layout level)
  const [showSwiperPanel, setShowSwiperPanel] = useState(false);
  const [campaignConfig, setCampaignConfig] = useState<any>({
    design: {
      swiperConfig: {
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

  // Open name modal only for new campaigns or when explicitly requested
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlCampaignId = searchParams.get('campaign');
    const id = (campaignState as any)?.id as string | undefined;
    const name = (campaignState as any)?.name as string | undefined;
    
    const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
    
    // CRITICAL: Don't show modal until campaign is fully loaded from DB
    // If URL has a campaign ID but state doesn't match yet, campaign is still loading
    if (urlCampaignId && urlCampaignId !== id) {
      console.log('⏳ [SwiperEditor] Campaign still loading, waiting...', { urlCampaignId, stateId: id });
      return;
    }
    
    // Guards: when editing an existing campaign (from id in state or URL),
    // wait until the campaign name has been loaded to avoid false prompts
    if ((isUuid(id) || !!urlCampaignId) && (!name || !name.trim())) {
      return;
    }
    
    const promptedKey = id ? `campaign:name:prompted:${id}` : `campaign:name:prompted:new:swiper`;
    const alreadyPrompted = typeof window !== 'undefined' ? localStorage.getItem(promptedKey) === '1' : true;
    const forceOpen = searchParams.get('forceNameModal') === '1';
    
    setNewCampaignName((name || '').trim());
    
    if (forceOpen) {
      try { requestAnimationFrame(() => setIsNameModalOpen(true)); } catch { setIsNameModalOpen(true); }
      return;
    }

    // If we're explicitly editing an existing campaign via URL, never prompt for name
    if (urlCampaignId) {
      setIsNameModalOpen(false);
      return;
    }
    
    // Only open for new campaigns or campaigns without proper names that haven't been prompted yet
    const defaultNames = new Set([
      'Nouvelle campagne',
      'Nouvelle Roue de la Fortune',
      '',
      undefined as unknown as string
    ]);
    const needsName = !name || defaultNames.has((name || '').trim());
    
    if (needsName && !alreadyPrompted) {
      console.log('📝 [SwiperEditor] Campaign needs name, opening modal', { id, name });
      try { requestAnimationFrame(() => setIsNameModalOpen(true)); } catch { setIsNameModalOpen(true); }
    }
  }, [campaignState?.id, campaignState?.name, location.search]);

const { upsertSettings } = useCampaignSettings();

const handleSaveCampaignName = useCallback(async () => {
  const currentId = (campaignState as any)?.id as string | undefined;
  const name = (newCampaignName || '').trim();
  if (!name) return;

  // 🔄 CRITICAL: Synchroniser TOUS les états locaux avant la sauvegarde
  syncAllStates({
    canvasElements: canvasElementsRef.current,
    modularPage: modularPageRef.current || undefined,
    screenBackgrounds: screenBackgroundsRef.current || undefined,
    selectedDevice,
    canvasZoom: canvasZoomRef.current
  });

  // Récupérer le campaign mis à jour après synchronisation
  const updatedCampaign = useEditorStore.getState().campaign;

  const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  
  // Créer le payload complet avec le nom ET toutes les configurations
  const payload: any = {
    ...(updatedCampaign || {}),
    editorMode, // Ajouter le mode éditeur (article ou fullscreen)
    editor_mode: editorMode, // Champ DB normalisé
    // Inclure explicitement la config Article (depuis l'état global ou local)
    articleConfig: (updatedCampaign as any)?.articleConfig || (campaignConfig as any)?.articleConfig,
    id: isUuid(currentId) ? currentId : undefined,
    _allowFirstInsert: !isUuid(currentId), // Autoriser la première insertion lors de la saisie du nom
    name,
    type: 'swiper'
  };

  let saved: any = null;
  try { 
    saved = await saveCampaignToDB(payload, saveCampaign);
  } catch (e) { 
    console.warn('saveCampaignToDB failed', e); 
  }
  
  if (saved) {
    setCampaign({
      ...campaignState,
      ...saved
    } as any);

    // Ensure URL contains the real campaign UUID so next saves work
    try {
      const cid = (saved as any)?.id || currentId;
      if (cid && !isUuid(currentId)) {
        const sp = new URLSearchParams(location.search);
        const modeParam = sp.get('mode');
        const newUrl = modeParam ? `${location.pathname}?campaign=${cid}&mode=${modeParam}` : `${location.pathname}?campaign=${cid}`;
        navigate(newUrl, { replace: true });
      }
    } catch {}

    // Notify settings modal and persist to campaign_settings
    try {
      const cid = (saved as any)?.id || currentId;
      window.dispatchEvent(new CustomEvent('campaign:name:update', { detail: { campaignId: cid, name } }));
      if (cid) await upsertSettings(cid, { publication: { name } });
    } catch {}

    try { localStorage.setItem(`campaign:name:prompted:${(saved as any)?.id || currentId || 'new:swiper'}`, '1'); } catch {}
    setIsNameModalOpen(false);
    setIsModified(false);
  }
}, [campaignState, newCampaignName, saveCampaign, setCampaign, upsertSettings, location.pathname, location.search, navigate, syncAllStates, selectedDevice, setIsModified]);
  // Swiper config state
  const [swiperConfig, setSwiperConfig] = useState({
    questionCount: 5,
    timeLimit: 30,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    templateId: 'image-swiper',
    borderRadius: 12, // Valeur par défaut pour le border radius
    // Taille par défaut du swiper
    width: initialTemplateWidths.desktop,
    mobileWidth: initialTemplateWidths.mobile,
    height: 'auto',
    // Couleurs par défaut des boutons
    buttonBackgroundColor: '#f3f4f6',
    buttonTextColor: '#000000',
    buttonHoverBackgroundColor: '#9fa4a4',
    buttonActiveBackgroundColor: '#a7acb5'
  });

  // Swiper modal config - synchronisé avec swiperConfig
  const [swiperModalConfig, setSwiperModalConfig] = useState<any>({
    templateId: swiperConfig.templateId,
    borderRadius: swiperConfig.borderRadius
  });

  // Synchroniser swiperModalConfig avec swiperConfig
  React.useEffect(() => {
    setSwiperModalConfig((prev: any) => ({
      ...prev,
      templateId: swiperConfig.templateId,
      borderRadius: swiperConfig.borderRadius
    }));
  }, [swiperConfig.templateId, swiperConfig.borderRadius]);

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

  // Ensure a Google Font stylesheet is loaded for a given family (idempotent)
  const ensureGoogleFontLoaded = useCallback((family: string) => {
    try {
      const slug = (family || '').trim().replace(/\s+/g, '+');
      if (!slug) return;
      const linkId = `gf-${slug.toLowerCase()}`;
      if (document.getElementById(linkId)) return; // already loaded
      const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}&display=swap`;
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    } catch {}
  }, []);
  
  // État pour tracker la position de scroll (quel écran est visible)
  const [currentScreen, setCurrentScreen] = useState<'screen1' | 'screen2' | 'screen3'>('screen1');
  
  // État pour le funnel article
  const [currentStep, setCurrentStep] = useState<'article' | 'form' | 'game' | 'result'>('article');
  const [currentGameResult, setCurrentGameResult] = useState<'winner' | 'loser'>('winner');
  const [showFunnel, setShowFunnel] = useState(false);
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const [fullScreenPreviewDevice, setFullScreenPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // 🧹 CRITICAL: Clean temporary campaigns - keep only Participer and Rejouer buttons
  // Guard: do NOT run while in Preview (showFunnel), otherwise it wipes screen2 just after we navigate
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('campaign');
    if (!id || !isTempCampaignId(id)) return;
    if (showFunnel) return; // skip cleanup during preview to avoid flicker/back-to-screen1

    console.log('🧹 [SwiperEditor] Cleaning temp campaign:', id);

    // Clear localStorage
    clearTempCampaignData(id);

    // Reset background images
    setCampaign((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        design: {
          ...(prev.design || {}),
          backgroundImage: undefined,
          mobileBackgroundImage: undefined
        }
      };
    });

    // Reset backgrounds to color only
    const defaultBg = { type: 'color' as const, value: '' };
    setCanvasBackground(defaultBg);
    setScreenBackgrounds({
      screen1: defaultBg,
      screen2: defaultBg,
      screen3: defaultBg
    });

    // Filter modularPage to keep only Participer and Rejouer
    setModularPage((prev: ModularPage) => {
      const participerButton = prev.screens.screen1?.find((m: Module) =>
        m.type === 'BlocBouton' && m.label?.toLowerCase().includes('participer')
      );
      const rejouerButton = prev.screens.screen3?.find((m: Module) =>
        m.type === 'BlocBouton' && m.label?.toLowerCase().includes('rejouer')
      );

      return {
        ...prev,
        screens: {
          screen1: participerButton ? [participerButton] : [],
          screen2: [],
          screen3: rejouerButton ? [rejouerButton] : []
        }
      };
    });
  }, [location.search, showFunnel]);

  // Handlers pour le funnel article
  const handleCTAClick = useCallback(() => {
    console.log('🎯 [SwiperEditor] CTA clicked, starting swiper (game step)');
    console.log('🎯 [SwiperEditor] Current state before:', { currentStep, showFunnel, editorMode });
    setCurrentStep('game'); // Swiper IS the game
    console.log('🎯 [SwiperEditor] setCurrentStep called with "game"');
  }, [currentStep, showFunnel, editorMode]);

  const handleFormSubmit = useCallback((data: Record<string, string>) => {
    console.log('📝 [SwiperEditor] Form submitted:', data);
    setCurrentStep('result'); // After form, go to result
  }, []);

  const handleGameComplete = useCallback(() => {
    console.log('🎮 [SwiperEditor] Swiper completed, moving to form');
    setCurrentStep('form'); // After swiper, show form
  }, []);
  
  // Debug: Logger les changements de currentStep
  useEffect(() => {
    console.log('🔄 [SwiperEditor] currentStep changed to:', currentStep);
    console.trace('Stack trace for currentStep change');
  }, [currentStep]);
  
  useEffect(() => {
    modularPageRef.current = modularPage;
  }, [modularPage]);
  
  const selectedModule: Module | null = useMemo(() => {
    if (!selectedModuleId) return null;
    const allModules = (Object.values(modularPage.screens) as Module[][]).flat();
    return allModules.find((module) => module.id === selectedModuleId) || null;
  }, [selectedModuleId, modularPage.screens]);
  
  // 🔄 Auto-save to Supabase every 30 seconds
  // Placed here after all state declarations to avoid TDZ issues
  useAutoSaveToSupabase(
    {
      campaign: campaignState,
      canvasElements,
      modularPage,
      screenBackgrounds,
      canvasZoom
    },
    {
      enabled: true,
      interval: 30000, // 30 seconds
      onSave: () => {
        console.log('✅ [AutoSave] Campaign auto-saved to Supabase');
      },
      onError: (error) => {
        console.error('❌ [AutoSave] Auto-save failed:', error);
      }
    }
  );
  
  // Détecter la position de scroll pour changer l'écran courant
  useEffect(() => {
    const canvasScrollArea = document.querySelector('.canvas-scroll-area') as HTMLElement | null;
    if (!canvasScrollArea) return;

    const anchors = Array.from(canvasScrollArea.querySelectorAll('[data-screen-anchor]')) as HTMLElement[];
    if (anchors.length === 0) return;

    const computeNearestScreen = () => {
      const areaRect = canvasScrollArea.getBoundingClientRect();
      const areaCenter = areaRect.top + areaRect.height / 2;

      let closestId: 'screen1' | 'screen2' | 'screen3' = 'screen1';
      let closestDistance = Infinity;

      anchors.forEach((anchor) => {
        const screenId = (anchor.dataset.screenAnchor as 'screen1' | 'screen2' | 'screen3' | undefined) ?? 'screen1';
        const rect = anchor.getBoundingClientRect();
        const anchorCenter = rect.top + rect.height / 2;
        const distance = Math.abs(anchorCenter - areaCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = screenId;
        }
      });

      setCurrentScreen((prev) => (prev === closestId ? prev : closestId));
    };

    // Calcule initial après montage
    requestAnimationFrame(computeNearestScreen);

    const handleScroll = () => {
      requestAnimationFrame(computeNearestScreen);
    };

    const handleResize = () => {
      requestAnimationFrame(computeNearestScreen);
    };

    canvasScrollArea.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      canvasScrollArea.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Initialize modular page from campaignConfig if present
  useEffect(() => {
    const mp = (campaignConfig as any)?.design?.swiperModules as ModularPage | undefined;
    if (mp && mp.screens) {
      setModularPage(mp);
    }
  }, [campaignConfig]);

  // 💾 Autosave with complete state including modules
  useEffect(() => {
    const id = (campaignState as any)?.id as string | undefined;
    if (!id) return;
    
    // Guard: only autosave if campaign has valid UUID
    const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
    if (!isUuid(id)) {
      console.log('🚫 [SwiperEditor] Autosave skipped: not a valid UUID', id);
      return;
    }

    // CRITICAL: avoid wiping modules during initial hydration after a refresh
    if (!dataHydratedRef.current) {
      console.log('⏭️ [SwiperEditor] Autosave skipped: hydration not completed yet');
      return;
    }
    
    const t = window.setTimeout(async () => {
      try {
        console.log('💾 [SwiperEditor] Autosave START for campaign:', id);
        const payload: any = {
          ...(campaignState || {}),
          editorMode, // Ajouter le mode éditeur (article ou fullscreen)
          editor_mode: editorMode, // Champ DB
          // Inclure explicitement la config Article (depuis l'état global ou local)
          articleConfig: (campaignState as any)?.articleConfig || (campaignConfig as any)?.articleConfig,
          // Save modules in multiple locations for compatibility
          modularPage,
          design: {
            ...(campaignState as any)?.design,
            swiperModules: modularPage
          },
          config: {
            ...(campaignState as any)?.config,
            modularPage,
            canvasConfig: {
              ...(campaignState as any)?.config?.canvasConfig,
              elements: canvasElements,
              screenBackgrounds,
              device: selectedDevice
            }
          },
          canvasConfig: {
            ...(campaignState as any)?.canvasConfig,
            elements: canvasElements,
            screenBackgrounds,
            device: selectedDevice
          }
        };
        console.log('💾 [SwiperEditor] Autosave payload:', {
          id,
          name: payload.name,
          canvasElements: canvasElements.length,
          modulesCount: Object.values(modularPage?.screens || {}).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
          screenBackgroundsKeys: Object.keys(screenBackgrounds || {})
        });
        
        // Skip autosave for temporary campaigns - they should only be saved manually
        if (isTempCampaignId(id)) {
          console.log('⏭️ [SwiperEditor] Skipping autosave for temporary campaign:', id);
          return;
        }
        
        const savedResult = await saveCampaignToDB(payload, saveCampaign);
        
        console.log('✅ [SwiperEditor] Autosave SUCCESS:', {
          savedId: savedResult?.id,
          savedName: savedResult?.name
        });
        setIsModified(false);
      } catch (e) {
        console.error('❌ [SwiperEditor] Autosave FAILED:', e);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [campaignState?.id, canvasElements, screenBackgrounds, selectedDevice, modularPage]);

  // Handler utilisé par HybridSidebar → BackgroundPanel (placé après currentScreen pour éviter TDZ)
  const handleBackgroundChange = useCallback((
    background: { type: 'color' | 'image'; value: string },
    options?: { screenId?: 'screen1' | 'screen2' | 'screen3'; applyToAllScreens?: boolean; device?: 'desktop' | 'tablet' | 'mobile' }
  ) => {
    const targetScreen = options?.screenId || currentScreen;
    const applyAll = !!options?.applyToAllScreens;
    const targetDevice = options?.device || selectedDevice;

    const nextScreens: ScreenBackgrounds = applyAll
      ? { screen1: background, screen2: background, screen3: background }
      : ({ ...screenBackgrounds, [targetScreen]: background } as ScreenBackgrounds);

    setScreenBackgrounds(nextScreens);
    bgHydratedRef.current = true;

    if (background.type === 'image') {
      try {
        if (applyAll) {
          window.dispatchEvent(new CustomEvent('applyBackgroundAllScreens', { detail: { url: background.value, device: targetDevice } }));
        } else {
          window.dispatchEvent(new CustomEvent('applyBackgroundCurrentScreen', { detail: { url: background.value, device: targetDevice, screenId: targetScreen } }));
          // Propre: retirer les fonds des autres écrans pour ce device pour éviter toute propagation visuelle
          try { window.dispatchEvent(new CustomEvent('clearBackgroundOtherScreens', { detail: { device: targetDevice, keepScreenId: targetScreen } })); } catch {}
          // Important: ne pas laisser un fond global affecter les autres écrans visuellement
          try { setCanvasBackground({ type: 'color', value: '' }); } catch {}
        }
      } catch {}
    }
    // ✅ Persistance locale et sync pour les COULEURS afin que le Preview reflète immédiatement
    if (background.type === 'color') {
      try {
        const campaignId = (useEditorStore.getState().campaign as any)?.id;
        if (campaignId) {
          const deviceKey = targetDevice;
          const colorKey = `campaign_${campaignId}:bgcolor-${deviceKey}-${targetScreen}`;
          const imageKey = `campaign_${campaignId}:bg-${deviceKey}-${targetScreen}`;
          // Sauvegarder la couleur choisie
          localStorage.setItem(colorKey, background.value || '');
          // Nettoyer une éventuelle image précédente pour éviter de la réutiliser en preview
          try { localStorage.removeItem(imageKey); } catch {}
        }
      } catch {}
      // Notifier le preview
      try { window.dispatchEvent(new CustomEvent('editor-background-sync', { detail: { screenId: targetScreen, device: targetDevice, type: 'color' } })); } catch {}
    }

    setCampaign((prev: any) => {
      if (!prev) return prev;
      const design = { ...(prev.design || {}) } as any;
      // IMPORTANT: n'écrire sur design.backgroundImage / mobileBackgroundImage que si on applique à TOUS les écrans.
      if (applyAll) {
        if (background.type === 'image') {
          if (targetDevice === 'mobile') design.mobileBackgroundImage = background.value;
          else design.backgroundImage = background.value;
        } else {
          design.background = background;
        }
      } else {
        // Pour un upload écran unique: purger les images globales afin d'éviter toute propagation visuelle
        if (background.type === 'image') {
          delete design.backgroundImage;
          delete design.mobileBackgroundImage;
        }
      }
      return {
        ...prev,
        design,
        // Toujours stocker le background par écran dans la config (source de vérité par écran)
        config: { ...(prev.config || {}), canvasConfig: { ...(prev.config?.canvasConfig || {}), screenBackgrounds: nextScreens } }
      };
    });

    try { setIsModified(true); } catch {}
    setBackgroundUpdateTrigger((p) => p + 1);
  }, [currentScreen, selectedDevice, screenBackgrounds, setCampaign, setIsModified]);

  // Helper to persist modularPage into campaignConfig (and mark modified)
  const persistModular = useCallback((next: ModularPage) => {
    setModularPage(next);
    setCampaignConfig((prev: any) => {
      const updated = {
        ...(prev || {}),
        design: {
          ...(prev?.design || {}),
          swiperModules: { ...next, _updatedAt: Date.now() }
        }
      };
      return updated;
    });
    
    // ✅ CRITICAL: Synchroniser avec le store Zustand pour que le preview puisse voir les modules
    syncModularPage(next);
    
    try { setIsModified(true); } catch {}
  }, [setIsModified, syncModularPage]);

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

  // Assurer la présence d'un bouton "Rejouer" sur l'écran 3 en mode édition
  // - Conserve l'option B: screen3 = fin avec "Rejouer"
  // - Rend l'ajout plus robuste (évite doublons, tient compte des cartes avec boutons)
  React.useEffect(() => {
    // Ne s'exécute que lorsque l'écran 3 est affiché pour éviter des insertions inutiles
    if (currentScreen !== 'screen3') return;

    const screen3Modules = Array.isArray(modularPage.screens.screen3)
      ? modularPage.screens.screen3
      : [];

    const hasStandaloneReplay = screen3Modules.some(
      (m) => m.type === 'BlocBouton' && typeof (m as any).label === 'string'
    );
    const hasCardReplay = screenHasCardButton(screen3Modules);

    if (hasStandaloneReplay || hasCardReplay) return; // déjà présent

    const replayButton: BlocBouton = {
      id: generateUniqueId('BlocBouton'),
      type: 'BlocBouton',
      label: getDefaultButtonLabel('screen3'),
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
    nextScreens.screen3 = [...screen3Modules, replayButton];
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [currentScreen, modularPage.screens, persistModular, screenHasCardButton, getDefaultButtonLabel]);

  // Modular handlers
  const handleAddModule = useCallback((screen: ScreenId, module: Module) => {
    if (module.type === 'BlocLogo') {
      const logoId = module.id || generateUniqueId('BlocLogo');
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

    if (module.type === 'BlocPiedDePage') {
      const footerId = module.id || generateUniqueId('BlocPiedDePage');
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
        ...modularPage.screens,
        [screen]: updatedModules
      },
      _updatedAt: Date.now()
    };

    persistModular(next);
  }, [modularPage, persistModular, getDefaultButtonLabel]);

  const handleUpdateModule = useCallback((id: string, patch: Partial<Module>) => {
    const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as ScreenId[]).forEach((s) => {
      nextScreens[s] = (nextScreens[s] || []).map((m) => (m.id === id ? { ...m, ...patch } as Module : m));
    });
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular]);

  // Compteur global pour garantir l'unicité des IDs
  const idCounterRef = useRef(0);
  
  // Fonction utilitaire pour générer des IDs vraiment uniques
  const generateUniqueId = useCallback((prefix: string = 'element') => {
    const timestamp = Date.now();
    const perfTime = Math.floor(performance.now() * 1000);
    const counter = idCounterRef.current++;
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${timestamp}-${perfTime}-${counter}-${random}`;
  }, []);

  const ensuredBlocBoutonRef = useRef(false);
  const createDefaultBlocBouton = useCallback((screen: ScreenId = 'screen1'): BlocBouton => ({
    id: generateUniqueId('BlocBouton'),
    type: 'BlocBouton',
    label: getDefaultButtonLabel(screen),
    href: '#',
    align: 'center',
    borderRadius: 9999,
    background: LAUNCH_BUTTON_FALLBACK_GRADIENT,
    textColor: LAUNCH_BUTTON_DEFAULT_TEXT_COLOR,
    padding: LAUNCH_BUTTON_DEFAULT_PADDING,
    boxShadow: LAUNCH_BUTTON_DEFAULT_SHADOW
  }), [getDefaultButtonLabel, generateUniqueId]);

  useEffect(() => {
    if (ensuredBlocBoutonRef.current) return;
    
    // Ne pas ajouter de boutons si la campagne a déjà été chargée depuis la DB
    const hasCampaignFromDB = !!campaignState?.id;
    if (hasCampaignFromDB) {
      ensuredBlocBoutonRef.current = true;
      return;
    }
    
    const hasStandaloneButton = (Object.values(modularPage.screens) as Module[][]).some((modules) => modules?.some((m) => m.type === 'BlocBouton'));
    if (!hasStandaloneButton && !editorHasCardButton()) {
      const targetScreen = currentScreen || 'screen1';
      const defaultModule = createDefaultBlocBouton(targetScreen);
      const nextScreens: ModularPage['screens'] = { ...modularPage.screens };
      nextScreens[targetScreen] = [...(nextScreens[targetScreen] || []), defaultModule];
      persistModular({ screens: nextScreens, _updatedAt: Date.now() });
    }
    ensuredBlocBoutonRef.current = true;
  }, [modularPage.screens, currentScreen, persistModular, createDefaultBlocBouton, editorHasCardButton, campaignState?.id]);

  useEffect(() => {
    const legacyButton = canvasElements.find((el) => typeof el?.role === 'string' && el.role.toLowerCase().includes('button'));
    if (!legacyButton) return;

    // Ne pas traiter les legacy buttons si la campagne a déjà été chargée depuis la DB
    const hasCampaignFromDB = !!campaignState?.id;
    if (hasCampaignFromDB) return;

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
  }, [canvasElements, modularPage.screens, currentScreen, persistModular, createDefaultBlocBouton, campaignState?.id]);

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

    const newId = generateUniqueId('module');
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
  
  // const isArticlePreview = editorMode === 'article' && showFunnel;
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

  // Chargement d'une campagne existante depuis l'URL (?campaign=id)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const campaignId = searchParams.get('campaign');
    
    if (campaignId) {
      // Skip DB loading for temporary campaign IDs to avoid invalid UUID errors
      if (isTempCampaignId(campaignId)) {
        console.log('⏭️ [SwiperEditor] Skipping DB load for temp campaign id:', campaignId);
        dataHydratedRef.current = true;
        setIsLoading(false);
        return;
      }
      // Skip DB loading for non-UUID ids to avoid Postgres 22P02
      if (!isPersistedCampaignId(campaignId)) {
        console.log('⏭️ [SwiperEditor] Skipping DB load for non-UUID id:', campaignId);
        dataHydratedRef.current = true;
        setIsLoading(false);
        return;
      }
      console.log('📂 [SwiperEditor] Loading existing campaign:', campaignId);
      setIsLoading(true);
      dataHydratedRef.current = false; // Mark that we're starting to load data
      
      (async () => {
        try {
          const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .maybeSingle();
          
          if (error) throw error;
          if (!data) {
            console.warn('⚠️ Campaign not found:', campaignId);
            dataHydratedRef.current = true; // Mark as complete even if not found
            return;
          }
          
          console.log('✅ Campaign loaded:', data);
          
          // Ownership check: duplicate under current user if not owner to allow edits (RLS-safe)
          try {
            const { data: authData } = await supabase.auth.getUser();
            const currentUserId = authData?.user?.id;
            if (currentUserId && data.created_by && data.created_by !== currentUserId) {
              console.log('🛡️ Not owner of campaign. Duplicating for current user...', { currentUserId, owner: data.created_by });
              const duplicated = await duplicateCampaign(campaignId);
              if (duplicated?.id) {
                const sp = new URLSearchParams(location.search);
                const modeParam = sp.get('mode');
                const newUrl = modeParam ? `${location.pathname}?campaign=${duplicated.id}&mode=${modeParam}` : `${location.pathname}?campaign=${duplicated.id}`;
                setCampaign(duplicated as any);
                navigate(newUrl, { replace: true });
                dataHydratedRef.current = true; // Mark as complete
                return; // Stop processing original campaign
              } else {
                console.warn('⚠️ Failed to duplicate campaign, proceeding read-only');
              }
            }
          } catch (e) {
            console.warn('⚠️ Ownership check failed:', e);
          }
          
          // Restore canvas elements
          const mergedCanvasConfig = (data?.config as any)?.canvasConfig ?? (data as any)?.canvasConfig ?? {};
          if (Array.isArray(mergedCanvasConfig.elements)) {
            setCanvasElements(mergedCanvasConfig.elements);
          }
          
          // Restore background - check multiple sources
          const bg = mergedCanvasConfig.background 
            || (data?.design as any)?.backgroundImage 
            || (data?.design as any)?.background 
            || { type: 'color', value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' };
          
          // If we have a background image URL in design, use it
          if ((data?.design as any)?.backgroundImage && typeof (data.design as any).backgroundImage === 'string') {
            setCanvasBackground({ type: 'image', value: (data.design as any).backgroundImage });
          } else {
            setCanvasBackground(typeof bg === 'string' ? { type: 'color', value: bg } : bg);
          }
          
          // Extract colors if background is an image
          const initialBg = (mergedCanvasConfig as any)?.background?.value || (data?.design as any)?.backgroundImage;
          if (initialBg && typeof initialBg === 'string' && initialBg.startsWith('http')) {
            const loadedColors = (data?.config as any)?.extractedColors ?? (data?.design as any)?.extractedColors ?? (data as any)?.extractedColors;
            const colorArray = (Array.isArray(loadedColors) ? loadedColors : (loadedColors as any)?.colors ?? [])
              .filter((c: string) => /^#[0-9A-Fa-f]{6}$/.test(c));
            setExtractedColors(colorArray);
          }
          
          // Restore screen backgrounds if available
          if (mergedCanvasConfig.screenBackgrounds) {
            setScreenBackgrounds(mergedCanvasConfig.screenBackgrounds);
          }
          
          // Initialize config
          const swiperFromConfig = {
            ...(data?.config || {} as any),
            swiperConfig: (data?.config as any)?.swiperConfig ?? (data as any)?.modularPage,
            swiperModules: (data?.config as any)?.swiperModules || (data?.design as any)?.swiperModules || [],
            modularPage: (data as any)?.modularPage || (data?.design as any)?.swiperModules || [],
          };
          if ((data?.config as any)?.swiperModules) {
            swiperFromConfig.swiperModules = (data.config as any).swiperModules;
          } else if ((data?.design as any)?.swiperModules) {
            swiperFromConfig.swiperModules = (data.design as any).swiperModules;
          } else if ((data as any)?.modularPage) {
            swiperFromConfig.modularPage = (data as any).modularPage;
          }
          if (!swiperFromConfig.swiperConfig) {
            const qC = (
              (data?.design as any)?.swiperConfig ||
              (swiperFromConfig as any)?.swiperConfig ||
              {}
            );
            swiperFromConfig.swiperConfig = qC;
          }

          console.log('📦 [SwiperEditor] Modules to restore:', {
            fromConfigSwiperModules: (data?.config as any)?.swiperModules,
            fromDesignSwiperModules: (data?.design as any)?.swiperModules,
            fromModularPage: (data as any)?.modularPage,
            finalSwiperModules: swiperFromConfig.swiperModules,
            finalModularPage: swiperFromConfig.modularPage
          });

          // Restore campaign config
          setCampaignConfig({
            ...data,
            design: {
              ...(data?.design || {} as any),
              swiperConfig: swiperFromConfig.swiperConfig || {},
              swiperModules: swiperFromConfig.swiperModules || swiperFromConfig.modularPage || modularPage
            }
          });
          
          // Restore modular page (modules) - check all possible sources
          const modulesToRestore = swiperFromConfig.swiperModules || swiperFromConfig.modularPage || (data as any)?.modularPage || (data?.design as any)?.swiperModules;
          
          console.log('📦 [SwiperEditor] Final modules to restore:', {
            modulesToRestore,
            isArray: Array.isArray(modulesToRestore),
            hasScreens: modulesToRestore?.screens,
            screensKeys: modulesToRestore?.screens ? Object.keys(modulesToRestore.screens) : [],
            screen1Count: modulesToRestore?.screens?.screen1?.length || 0,
            screen2Count: modulesToRestore?.screens?.screen2?.length || 0,
            screen3Count: modulesToRestore?.screens?.screen3?.length || 0
          });
          
          if (modulesToRestore) {
            if (modulesToRestore.screens) {
              console.log('✅ [SwiperEditor] Restoring modules with screens structure');
              setModularPage(modulesToRestore);
              dataHydratedRef.current = true;
            } else if (Array.isArray(modulesToRestore) && modulesToRestore.length > 0) {
              console.log('✅ [SwiperEditor] Converting array modules to screens structure');
              setModularPage({
                screens: {
                  screen1: modulesToRestore,
                  screen2: [],
                  screen3: []
                },
                _updatedAt: Date.now()
              });
              dataHydratedRef.current = true;
            } else {
              console.warn('⚠️ [SwiperEditor] Modules format not recognized:', modulesToRestore);
            }
          } else {
            console.warn('⚠️ [SwiperEditor] No modules found to restore');
          }
          
          // Restore swiper config
          if (swiperFromConfig.swiperConfig) {
            setSwiperConfig((prev: any) => ({
              ...prev,
              ...swiperFromConfig.swiperConfig
            }));
          }
          
          // Restore device if saved
          if (mergedCanvasConfig.device && ['desktop', 'tablet', 'mobile'].includes(mergedCanvasConfig.device)) {
            setSelectedDevice(mergedCanvasConfig.device);
            setCanvasZoom(getDefaultZoom(mergedCanvasConfig.device));
          }
          
          // Update editor store
          setCampaign(data as any);
          
          console.log('✅ [SwiperEditor] Campaign hydration complete, dataHydratedRef=true');
          dataHydratedRef.current = true; // CRITICAL: Mark hydration as complete
          
        } catch (err) {
          console.error('❌ Failed to load campaign:', err);
          dataHydratedRef.current = true; // Mark as complete even on error
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [location.search]);
          

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

  // (duplicate handleBackgroundChange removed, using the useCallback version above)

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

    // Auto-load Google Font when a new fontFamily is applied
    if (updates && typeof updates.fontFamily === 'string') {
      ensureGoogleFontLoaded(updates.fontFamily);
    }

    const isModuleText = (selectedElement as any)?.role === 'module-text' && (selectedElement as any)?.moduleId;
    if (isModuleText) {
      const moduleId = (selectedElement as any).moduleId as string;

      // Route ALL updates to the module (including rotation)
      const modulePatch: Partial<Module> & Record<string, any> = {};
      if (updates.fontFamily) {
        modulePatch.bodyFontFamily = updates.fontFamily;
        ensureGoogleFontLoaded(updates.fontFamily);
      }
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
      updatedConfig.design.swiperConfig = updatedConfig.design.swiperConfig || {};
      // Ne pas écraser les couleurs; ne mettre à jour que borderRadius
      updatedConfig.design.swiperConfig.style = {
        ...(updatedConfig.design.swiperConfig.style || {}),
        borderRadius: `${borderRadius}px`
      };
      console.log('🎯 CampaignConfig mise à jour (borderRadius uniquement):', updatedConfig.design.swiperConfig.style);
      return updatedConfig;
    });
    
    // Émettre un événement pour forcer le re-render du TemplatedSwiper
    const event = new CustomEvent('swiperStyleUpdate', { 
      detail: { 
        borderRadius: `${borderRadius}px`
      } 
    });
    window.dispatchEvent(event);
    
    // Mettre à jour les éléments du canvas (pour compatibilité)
    setCanvasElements(currentElements => 
      currentElements.map(element => {
        if (element?.type === 'swiper' || element?.id === 'swiper-template') {
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

  // Swiper Editor doesn't need wheel config sync - using swiper config instead
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
  
  const swiperStyleOverrides = useMemo<Record<string, any>>(() => {
    return (campaignConfig?.design?.swiperConfig?.style || {}) as Record<string, any>;
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
      role === 'module-footer';

    if (!moduleId || !isModularRole) {
      lastModuleSelectionRef.current = null;
      setSelectedModuleId(null);
      if (!isModularRole) {
        setActiveSidebarTab(previousSidebarTab || 'elements');
      }
      return;
    }

    const isNewSelection = moduleId !== lastModuleSelectionRef.current;

    if (isNewSelection) {
      lastModuleSelectionRef.current = moduleId;
      setSelectedModuleId(moduleId);
      setPreviousSidebarTab(activeSidebarTab);
      // Si c'est un BlocTexte, ouvrir l'onglet Design (background) pour éditer le texte
      // Sinon, ouvrir l'onglet Elements pour les autres modules
      // En mode article, ne pas forcer l'onglet background car il n'existe pas
      if (selectedModule?.type === 'BlocTexte' && editorMode !== 'article') {
        setActiveSidebarTab('background');
      } else {
        setActiveSidebarTab('elements');
      }
      return;
    }

    if (activeSidebarTab === 'elements' && selectedModuleId !== moduleId) {
      setSelectedModuleId(moduleId);
    }
  }, [selectedElement, activeSidebarTab, previousSidebarTab, selectedModuleId]);

  const exitMessageElement = useMemo(() => {
    return canvasElements.find(
      (el) => el.type === 'text' && typeof el?.role === 'string' && el.role.toLowerCase() === 'exit-message'
    );
  }, [canvasElements]);

  const campaignSwiperStyle = (campaignConfig?.design?.swiperConfig?.style ?? {}) as Record<string, any>;

  const launchButtonStyles = useMemo(() => {
    const base = buildLaunchButtonStyles(buttonModule, swiperStyleOverrides, {
      buttonBackgroundColor:
        typeof swiperStyleOverrides.buttonBackgroundColor === 'string' && swiperStyleOverrides.buttonBackgroundColor.length > 0
          ? swiperStyleOverrides.buttonBackgroundColor
          : ((campaignSwiperStyle as any)?.buttonBackgroundColor as string | undefined) || LAUNCH_BUTTON_FALLBACK_GRADIENT,
      buttonTextColor:
        typeof swiperStyleOverrides.buttonTextColor === 'string' && swiperStyleOverrides.buttonTextColor.length > 0
          ? swiperStyleOverrides.buttonTextColor
          : (swiperConfig.buttonTextColor || LAUNCH_BUTTON_DEFAULT_TEXT_COLOR),
      buttonHoverBackgroundColor: swiperConfig.buttonHoverBackgroundColor,
      buttonActiveBackgroundColor: swiperConfig.buttonActiveBackgroundColor,
      borderRadius: swiperConfig.borderRadius
    });
    if (exitMessageElement) {
      return {
        ...base,
        display: 'none'
      } satisfies React.CSSProperties;
    }
    return base;
  }, [buttonModule, swiperStyleOverrides, campaignSwiperStyle, swiperConfig.buttonHoverBackgroundColor, swiperConfig.buttonActiveBackgroundColor, swiperConfig.borderRadius, exitMessageElement]);

  const launchButtonText = useMemo(() => {
    return buttonModule?.label || (swiperStyleOverrides.buttonLabel as string | undefined) || 'Participer';
  }, [buttonModule, swiperStyleOverrides.buttonLabel]);

  const emitSwiperStyleUpdate = useCallback((detail: Record<string, any>) => {
    if (!detail || Object.keys(detail).length === 0) return;
    try {
      const target = document.getElementById('swiper-preview-container') || window;
      const event = new CustomEvent('swiperStyleUpdate', { detail });
      const dispatched = target.dispatchEvent(event);
      if (!dispatched) {
        const fallback = new CustomEvent('swiperStyleUpdateFallback', { detail });
        target.dispatchEvent(fallback);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'émission de swiperStyleUpdate pour le bouton:', error);
    }
  }, []);

  const updateCampaignSwiperStyle = useCallback((changes: Record<string, any>) => {
    setCampaignConfig((prev: any) => {
      const next = { ...(prev || {}) };
      const design = { ...(next.design || {}) };
      const swiperDesign = { ...(design.swiperConfig || {}) };
      const style = { ...(swiperDesign.style || {}) };

      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          delete style[key];
        } else {
          (style as any)[key] = value;
        }
      });

      next.design = {
        ...design,
        swiperConfig: {
          ...swiperDesign,
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
    const swiperStyleDetail: Record<string, any> = {};

    if (styles.background !== undefined) {
      const backgroundValue: string =
        typeof styles.background === 'string' && styles.background.length > 0
          ? styles.background
          : LAUNCH_BUTTON_FALLBACK_GRADIENT;
      patch.background = backgroundValue;
      setSwiperConfig(prev => ({ ...prev, buttonBackgroundColor: backgroundValue }));
      updateCampaignSwiperStyle({ buttonBackgroundColor: backgroundValue });
      swiperStyleDetail.buttonBackgroundColor = backgroundValue;
    }

    if (styles.color !== undefined) {
      const textColorValue: string =
        typeof styles.color === 'string' && styles.color.length > 0
          ? styles.color
          : LAUNCH_BUTTON_DEFAULT_TEXT_COLOR;
      patch.textColor = textColorValue;
      setSwiperConfig(prev => ({ ...prev, buttonTextColor: textColorValue }));
      updateCampaignSwiperStyle({ buttonTextColor: textColorValue });
      swiperStyleDetail.buttonTextColor = textColorValue;
    }

    if (styles.borderRadius !== undefined) {
      const radiusValue = typeof styles.borderRadius === 'number'
        ? styles.borderRadius
        : parseFloat(String(styles.borderRadius).replace('px', ''));
      const normalizedRadius = Number.isNaN(radiusValue) ? 9999 : radiusValue;
      patch.borderRadius = normalizedRadius;
      setSwiperConfig(prev => ({ ...prev, borderRadius: normalizedRadius }));
      updateCampaignSwiperStyle({ borderRadius: `${normalizedRadius}px` });
      swiperStyleDetail.borderRadius = `${normalizedRadius}px`;
    }

    if (styles.padding !== undefined) {
      const paddingValue = typeof styles.padding === 'number' ? `${styles.padding}px` : styles.padding || LAUNCH_BUTTON_DEFAULT_PADDING;
      patch.padding = paddingValue;
      updateCampaignSwiperStyle({ buttonPadding: paddingValue });
      swiperStyleDetail.buttonPadding = paddingValue;
    }

    if (styles.boxShadow !== undefined) {
      const shadowValue = styles.boxShadow || LAUNCH_BUTTON_DEFAULT_SHADOW;
      patch.boxShadow = shadowValue;
      updateCampaignSwiperStyle({ buttonBoxShadow: shadowValue });
      swiperStyleDetail.buttonBoxShadow = shadowValue;
    }

    if (styles.textTransform !== undefined) {
      const transformValue = styles.textTransform || undefined;
      updateCampaignSwiperStyle({ buttonTextTransform: transformValue });
      swiperStyleDetail.buttonTextTransform = transformValue;
    }

    if (styles.fontWeight !== undefined) {
      const fontWeightValue = styles.fontWeight || undefined;
      updateCampaignSwiperStyle({ buttonFontWeight: fontWeightValue });
      swiperStyleDetail.buttonFontWeight = fontWeightValue;
    }

    handleUpdateModule(targetModule.id, patch);
    emitSwiperStyleUpdate(swiperStyleDetail);
  }, [buttonModule, handleUpdateModule, updateCampaignSwiperStyle, emitSwiperStyleUpdate, setSwiperConfig]);

  const handleLaunchButtonTextChange = useCallback((text: string) => {
    const targetModule = buttonModule;
    if (!targetModule) return;
    handleUpdateModule(targetModule.id, { label: text });
    updateCampaignSwiperStyle({ buttonLabel: text });
  }, [buttonModule, handleUpdateModule, updateCampaignSwiperStyle]);

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

    // Primary color used by swiper buttons and participation form
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
      return '#44444d';
    })();
    const secondaryColor = '#ffffff';

    // Build dynamic swiper questions for preview:
    let configuredQuestions = (
      (campaignState as any)?.swiperConfig?.questions ||
      (campaignConfig as any)?.swiperConfig?.questions ||
      (campaignState as any)?.gameConfig?.swiper?.questions ||
      (campaignConfig as any)?.gameConfig?.swiper?.questions ||
      []
    );
    // If none are defined (e.g., user hasn't opened the "Jeu" tab yet), seed a default question
    if (!Array.isArray(configuredQuestions) || configuredQuestions.length === 0) {
      configuredQuestions = [
        {
          id: `q_${Date.now()}`,
          question: 'Nouvelle question',
          image: undefined,
          answers: [
            { id: `a_${Date.now()}_1`, text: 'Réponse 1', isCorrect: true },
            { id: `a_${Date.now()}_2`, text: 'Réponse 2', isCorrect: false }
          ],
          correctAnswerId: `a_${Date.now()}_1`
        }
      ];
    }
    
    console.log('🧭 [SwiperEditorLayout] campaignData questions:', {
      count: Array.isArray(configuredQuestions) ? configuredQuestions.length : 0,
      device: selectedDevice
    });

    const buttonCustomStyles = launchButtonStyles;

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

    const normalizedScreens = defaultScreens.map((defaults, index) => {
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

    console.log('🎨 [SwiperEditorLayout] Creating campaignData with background:', {
      canvasBackground,
      backgroundImage: campaignConfig?.design?.backgroundImage,
      mobileBackgroundImage: campaignConfig?.design?.mobileBackgroundImage
    });
    
    return {
      id: (campaignState as any)?.id || (campaignConfig as any)?.id || (useEditorStore.getState().campaign as any)?.id,
      type: 'swiper',
      // Fournir la configuration Article pour le mode article
      articleConfig: (campaignConfig as any)?.articleConfig,
      design: {
        background: canvasBackground,
        screenBackgrounds: screenBackgrounds, // Backgrounds par écran pour le preview
        // Ajouter les propriétés backgroundImage pour le preview
        backgroundImage: campaignConfig?.design?.backgroundImage || (canvasBackground?.type === 'image' ? canvasBackground.value : undefined),
        mobileBackgroundImage: campaignConfig?.design?.mobileBackgroundImage || (canvasBackground?.type === 'image' ? canvasBackground.value : undefined),
        customTexts: customTexts,
        customImages: customImages,
        extractedColors: extractedColors,
        customColors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: extractedColors[2] || '#45b7d1'
        },
        swiperConfig: {
          questionCount: campaignConfig?.design?.swiperConfig?.questionCount || swiperConfig.questionCount || 5,
          timeLimit: campaignConfig?.design?.swiperConfig?.timeLimit || swiperConfig.timeLimit || 30,
          templateId: swiperConfig.templateId,
          style: {
            ...campaignConfig?.design?.swiperConfig?.style,
            buttonBackgroundColor: campaignConfig?.design?.swiperConfig?.style?.buttonBackgroundColor || swiperConfig.buttonBackgroundColor,
            buttonTextColor: campaignConfig?.design?.swiperConfig?.style?.buttonTextColor || swiperConfig.buttonTextColor,
            buttonHoverBackgroundColor: campaignConfig?.design?.swiperConfig?.style?.buttonHoverBackgroundColor || swiperConfig.buttonHoverBackgroundColor,
            buttonActiveBackgroundColor: campaignConfig?.design?.swiperConfig?.style?.buttonActiveBackgroundColor || swiperConfig.buttonActiveBackgroundColor,
            borderRadius: campaignConfig?.design?.swiperConfig?.style?.borderRadius || `${swiperConfig.borderRadius}px` || '8px',
            // Styles pour le texte
            textColor: campaignConfig?.design?.swiperConfig?.style?.textColor || '#000000',
            questionTextWrap: 'break-word',
            answerTextWrap: 'break-word',
            // Zoom/largeur - respecter les valeurs ajustées par le panel
            width: campaignConfig?.design?.swiperConfig?.style?.width || (swiperConfig.width || initialTemplateWidths.desktop),
            mobileWidth: campaignConfig?.design?.swiperConfig?.style?.mobileWidth || (swiperConfig.mobileWidth || initialTemplateWidths.mobile),
            // Opacité de fond si définie
            backgroundOpacity: campaignConfig?.design?.swiperConfig?.style?.backgroundOpacity ?? 100,
            // Mise en page responsive
            questionPadding: '12px',
            answerPadding: '12px 16px',
            answerMargin: '8px 0',
            answerMinHeight: 'auto'
          }
        }
      },
      gameConfig: {
        swiper: {
          questions: configuredQuestions,
          timeLimit: campaignConfig?.design?.swiperConfig?.timeLimit || swiperConfig.timeLimit || 30,
          templateId: swiperConfig.templateId,
          buttonLabel: fallbackButtonText,
          buttonStyles: buttonCustomStyles
        }
      },
      buttonConfig: {
        text: fallbackButtonText,
        color: primaryColor,
        textColor:
          buttonCustomStyles?.color ||
          swiperStyleOverrides.buttonTextColor ||
          swiperConfig.buttonTextColor ||
          '#ffffff',
        borderRadius:
          buttonCustomStyles?.borderRadius as any ||
          swiperStyleOverrides.borderRadius ||
          (typeof swiperConfig.borderRadius === 'number' ? `${swiperConfig.borderRadius}px` : swiperConfig.borderRadius) ||
          '8px',
        styles: buttonCustomStyles
      },
      screens: normalizedScreens,
      resultScreen: normalizedScreens[3],
      // Champs de contact dynamiques depuis le store (fallback uniquement si indéfini)
      formFields: ((campaignState as any)?.formFields !== undefined)
        ? ((campaignState as any)?.formFields as any)
        : campaignConfig?.formFields || [
            { id: 'prenom', label: 'Prénom', type: 'text', required: true },
            { id: 'nom', label: 'Nom', type: 'text', required: true },
            { id: 'email', label: 'Email', type: 'email', required: true }
          ],
      // Fournir aussi la version snake_case attendue par certains composants de preview
      form_fields: ((campaignState as any)?.formFields !== undefined)
        ? ((campaignState as any)?.formFields as any)
        : (campaignConfig?.formFields || [
            { id: 'prenom', label: 'Prénom', type: 'text', required: true },
            { id: 'nom', label: 'Nom', type: 'text', required: true },
            { id: 'email', label: 'Email', type: 'email', required: true }
          ]),
      // Garder la configuration canvas pour compatibilité - INCLURE LES MODULES
      canvasConfig: {
        elements: [...canvasElements, ...allModules],
        background: canvasBackground,
        screenBackgrounds: screenBackgrounds, // Backgrounds par écran
        device: selectedDevice
      },
      // Ajouter modularPage pour compatibilité
      modularPage: modularPage
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
    launchButtonStyles,
    swiperStyleOverrides,
    swiperConfig,
    modularPage,
    backgroundUpdateTrigger
  ]);
  
  // Log pour vérifier que campaignData contient bien les éléments
  console.log('📊 [DesignEditorLayout] campaignData construit:', {
    canvasElementsCount: canvasElements.length,
    campaignDataCanvasConfigElements: campaignData?.canvasConfig?.elements?.length || 0,
    customTextsCount: campaignData?.design?.customTexts?.length || 0,
    customImagesCount: campaignData?.design?.customImages?.length || 0,
    backgroundType: canvasBackground?.type,
    backgroundValue: canvasBackground?.value?.substring(0, 50),
    designBackgroundImage: campaignData?.design?.backgroundImage?.substring(0, 50),
    designMobileBackgroundImage: campaignData?.design?.mobileBackgroundImage?.substring(0, 50),
    campaignConfigBackgroundImage: campaignConfig?.design?.backgroundImage?.substring(0, 50),
    showFunnel
  });

  // Synchronisation avec le store (éviter les boucles d'updates)
  const lastTransformedSigRef = useRef<string>('');
  useEffect(() => {
    if (!campaignData) return;

    const transformedCampaign = {
      ...campaignData,
      name: 'Ma Campagne',
      type: (campaignData.type || 'wheel') as 'wheel' | 'scratch' | 'jackpot' | 'swiper' | 'dice' | 'form' | 'memory' | 'puzzle',
      // Important: preserve background as an object for preview so FunnelSwiperParticipate
      // can detect image backgrounds (type === 'image'). Do not flatten to string.
      design: {
        ...campaignData.design,
        background: campaignData.design?.background ?? { type: 'color', value: '#ffffff' }
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
          // Préserver design.swiperModules et les images de fond si présentes
          design: {
            ...(transformedCampaign as any).design,
            swiperModules: (transformedCampaign as any).modularPage || prev.design?.swiperModules,
            // Préserver les images de fond qui ont pu être définies par applyBackgroundAllScreens
            backgroundImage: (transformedCampaign as any).design?.backgroundImage || prev.design?.backgroundImage,
            mobileBackgroundImage: (transformedCampaign as any).design?.mobileBackgroundImage || prev.design?.mobileBackgroundImage
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
      // 🔄 Synchroniser tous les états locaux avec le campaign avant la sauvegarde
      syncAllStates({
        canvasElements,
        modularPage,
        screenBackgrounds,
        extractedColors,
        selectedDevice,
        canvasZoom
      });
      
      // Récupérer le campaign mis à jour après synchronisation
      const updatedCampaign = useEditorStore.getState().campaign;
      
      // Déterminer un nom valide pour la première insertion
      const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      const currentId = (updatedCampaign as any)?.id as string | undefined;
      const rawName = (updatedCampaign as any)?.name || '';
      const isDefaultName = !rawName || /^(nouvelle campagne|ma campagne|new campaign|untitled)/i.test(String(rawName).trim());
      const finalName = !isUuid(currentId) && isDefaultName
        ? `Campagne Article ${new Date().toISOString().slice(0,19).replace('T',' ')}`
        : rawName;
      
      // Build complete payload with modules in all required locations
      const payload = {
        ...updatedCampaign,
        editorMode, // Ajouter le mode éditeur (article ou fullscreen)
        editor_mode: editorMode, // Champ DB normalisé
        // Save modules at multiple locations for compatibility
        modularPage,
        // Inclure explicitement la config Article (depuis l'état global ou local)
        articleConfig: (updatedCampaign as any)?.articleConfig || (campaignConfig as any)?.articleConfig,
        name: finalName,
        // Autoriser la première insertion si id temporaire ou manquant
        _allowFirstInsert: !isUuid(currentId),
        design: {
          ...((updatedCampaign as any)?.design || {}),
          swiperModules: modularPage
        },
        config: {
          ...((updatedCampaign as any)?.config || {}),
          modularPage,
          canvasConfig: {
            elements: canvasElements,
            background: canvasBackground,
            screenBackgrounds,
            device: selectedDevice
          }
        },
        canvasConfig: {
          elements: canvasElements,
          background: canvasBackground,
          screenBackgrounds,
          device: selectedDevice
        }
      };
      console.log('💾 [SwiperEditor] handleSave complete payload', {
        id: payload.id,
        modules: Object.values(modularPage?.screens || {}).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
      });
      
      const wasTempId = isTempCampaignId(payload.id);
      const tempId = wasTempId ? payload.id : undefined;
      
      const saved = await saveCampaignToDB(payload, saveCampaign);
      
      if (saved?.id) {
        // Update campaign with saved ID
        setCampaign((prev: any) => ({ ...prev, id: saved.id }));
        
        // If we just saved a temporary campaign, replace temp ID with real ID
        if (wasTempId && tempId) {
          console.log('🔄 [SwiperEditor] Replacing temp ID with persisted ID:', { tempId, persistedId: saved.id });
          
          replaceTempWithPersistedId(tempId, saved.id, (newId) => {
            // Update URL with real campaign ID
            const currentMode = searchParams.get('mode');
            const newUrl = `${location.pathname}?campaign=${newId}${currentMode ? `&mode=${currentMode}` : ''}`;
            navigate(newUrl, { replace: true });
            
            // Update store
            selectCampaign(newId, 'swiper');
          });
        }
      }
      
      setIsModified(false);
    } catch (e) {
      console.error('[DesignEditorLayout] Save failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // Forcer la synchronisation du store vers le preview
    console.log('🔄 [DesignEditorLayout] Preview toggled, syncing store to preview');
    
    // Mettre à jour le store avec les dernières données
    setCampaign(campaignState);
    
    // Dispatcher un événement pour forcer le re-render du preview
    window.dispatchEvent(new CustomEvent('editor-force-sync', {
      detail: {
        timestamp: Date.now(),
        modularPage: (campaignState as any)?.modularPage
      }
    }));
    
    const nextShowFunnel = !showFunnel;
    setShowFunnel(nextShowFunnel);

    if (nextShowFunnel) {
      // Reset to article step when entering preview
      setCurrentStep('article');
    } else if (editorMode === 'article') {
      setCurrentStep('article');
    } else {
      setCurrentScreen('screen1');
    }
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
    
    // ✅ CRITICAL: Vérifier si le nom est valide AVANT de sauvegarder
    const currentName = (campaignState as any)?.name || '';
    const isValidName = currentName && currentName.trim() && 
                       !currentName.includes('Nouvelle campagne') && 
                       !currentName.includes('New Campaign');
    
    if (!isValidName) {
      console.log('❌ [SwiperEditor] Invalid campaign name, opening name modal before save');
      setIsNameModalOpen(true);
      return;
    }
    
    // 🔄 Synchroniser tous les états locaux avec le campaign avant la sauvegarde
    syncAllStates({
      canvasElements,
      modularPage,
      screenBackgrounds,
      extractedColors,
      selectedDevice,
      canvasZoom
    });
    
    await handleSave();
    navigate('/dashboard');
  }, [validateCampaign, handleSave, navigate, syncAllStates, canvasElements, modularPage, screenBackgrounds, extractedColors, selectedDevice, canvasZoom, campaignState]);

  // Navigate to settings without saving (same destination as Save & Continue)
  // @ts-expect-error - Fonction de navigation, peut être ignorée
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
        (!currentWheelConfig?.borderColor || currentWheelConfig.borderColor === '#44444d');
      
      // Couleurs principales à utiliser
      const primaryColor = colors[0] || currentConfig?.design?.brandColors?.primary || '#44444d';
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

      const primaryRgb = toRgb(primaryColor) || { r: 132, g: 27, b: 96 }; // fallback #44444d
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
          // Appliquer aussi aux styles du swiper
          swiperConfig: {
            ...(currentConfig.design?.swiperConfig || {}),
            style: {
              ...(currentConfig.design?.swiperConfig?.style || {}),
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
        padding: showFunnel ? '0' : (isWindowMobile ? '9px' : '0 9px 9px 9px'),
        boxSizing: 'border-box'
      }}
    >
      {!showFunnel && <EditorHeader />}
      {!showFunnel && (
        <div
          className="fixed z-20"
          style={{
            borderRadius: '18px',
            margin: '0',
            top: '1.16cm',
            bottom: '9px',
            left: '9px',
            right: '9px',
            boxSizing: 'border-box',
            backgroundColor: '#f9fafb',
            pointerEvents: 'none'
          }}
        />
      )}
      <MobileStableEditor
        className={
          showFunnel
            ? 'relative z-30 h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden'
            : isWindowMobile
              ? 'relative z-30 h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pb-[6px] rounded-tl-[18px] rounded-tr-[18px] rounded-br-[18px] transform -translate-y-[0.4vh]'
              : 'relative z-30 h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pt-[1.25cm] pb-[6px] rounded-tl-[18px] rounded-tr-[18px] rounded-br-[18px] transform -translate-y-[0.4vh]'
        }
      >
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
          <div className="group fixed inset-0 z-40 w-full h-[100dvh] min-h-[100dvh] overflow-visible flex items-center justify-center" style={{ backgroundColor: '#3a3a42' }}>
            {/* Floating Edit Mode Button */}
            <button
              onClick={() => setShowFunnel(false)}
              className={`absolute top-4 ${previewButtonSide === 'left' ? 'left-4' : 'right-4'} z-50 px-4 py-2 bg-[#44444d] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#44444d] shadow-none focus:shadow-none ring-0 focus:ring-0 drop-shadow-none filter-none backdrop-blur-0`}
            >
              Mode édition
            </button>
            {(selectedDevice === 'mobile' && actualDevice !== 'mobile') ? (
              /* Mobile Preview sur Desktop: Plein écran sans cadre */
              <div className="w-full h-full overflow-auto">
                  {editorMode === 'article' ? (
                    <PreviewRenderer
                      articleConfig={getArticleConfigWithDefaults(campaignState, campaignData)}
                      campaignType={(campaignState as any)?.type || 'swiper'}
                      campaign={campaignData}
                      wheelModalConfig={wheelModalConfig}
                      gameModalConfig={swiperModalConfig}
                      currentStep={currentStep}
                      editable={false}
                      formFields={(campaignState as any)?.formFields}
                      onCTAClick={handleCTAClick}
                      onFormSubmit={handleFormSubmit}
                      onGameComplete={handleGameComplete}
                      onStepChange={setCurrentStep}
                      containerClassName="p-0"
                      containerStyle={{ backgroundColor: 'transparent' }}
                    />
                  ) : (
                    <PreviewRenderer
                      campaign={campaignData}
                      previewMode="mobile"
                      wheelModalConfig={wheelModalConfig}
                      constrainedHeight={true}
                    />
                  )}
              </div>
            ) : (
              /* Desktop/Tablet Preview OU Mobile physique: Fullscreen sans cadre */
              editorMode === 'article' ? (
                <PreviewRenderer
                  articleConfig={getArticleConfigWithDefaults(campaignState, campaignData)}
                  campaignType={(campaignState as any)?.type || 'swiper'}
                  campaign={campaignData}
                  wheelModalConfig={wheelModalConfig}
                  gameModalConfig={swiperModalConfig}
                  currentStep={currentStep}
                  editable={false}
                  formFields={(campaignState as any)?.formFields}
                  onCTAClick={handleCTAClick}
                  onFormSubmit={handleFormSubmit}
                  onGameComplete={handleGameComplete}
                  onStepChange={setCurrentStep}
                  containerClassName="py-8"
                  containerStyle={{ backgroundColor: '#3a3a42' }}
                />
              ) : (
                <PreviewRenderer
                  campaign={campaignData}
                  previewMode={actualDevice === 'desktop' && selectedDevice === 'desktop' ? 'desktop' : selectedDevice}
                  constrainedHeight={selectedDevice === 'mobile'}
                  wheelModalConfig={wheelModalConfig}
                />
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
                onAddModule={handleAddModule}
                // Article mode result props
                currentGameResult={currentGameResult}
                onGameResultChange={setCurrentGameResult}
                onArticleStepChange={setCurrentStep}
                showAnimationsPanel={showAnimationsInSidebar}
                onAnimationsPanelChange={setShowAnimationsInSidebar}
                showPositionPanel={showPositionInSidebar}
                onPositionPanelChange={setShowPositionInSidebar}
                showSwiperPanel={showSwiperPanel}
                onSwiperPanelChange={setShowSwiperPanel}
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
                // Swiper config props for HybridSidebar
                swiperQuestionCount={swiperConfig.questionCount}
                swiperTimeLimit={swiperConfig.timeLimit}
                swiperDifficulty={swiperConfig.difficulty}
                swiperBorderRadius={swiperConfig.borderRadius}
                selectedSwiperTemplate={swiperConfig.templateId}
                onSwiperQuestionCountChange={(count) => setSwiperConfig(prev => ({ ...prev, questionCount: count }))}
                onSwiperTimeLimitChange={(time) => setSwiperConfig(prev => ({ ...prev, timeLimit: time }))}
                onSwiperDifficultyChange={(difficulty) => setSwiperConfig(prev => ({ ...prev, difficulty }))}
                onSwiperBorderRadiusChange={(borderRadius) => {
                  setSwiperConfig(prev => ({ ...prev, borderRadius }));
                  updateCanvasElementsBorderRadius(borderRadius);
                }}
                onSwiperTemplateChange={(templateId) => {
                  console.log('🎯 Changement de template swiper:', templateId);
                  const { desktop, mobile } = getTemplateBaseWidths(templateId);

                  setSwiperConfig(prev => ({
                    ...prev,
                    templateId
                  }));

                  try {
                    const event = new CustomEvent('swiperStyleUpdate', {
                      detail: { width: desktop, mobileWidth: mobile }
                    });
                    (document.getElementById('swiper-preview-container') || window).dispatchEvent(event);
                  } catch (error) {
                    console.error('❌ Erreur lors de la diffusion de swiperStyleUpdate après changement de template:', error);
                  }
                }}
                // Gestion de la largeur du swiper
                swiperWidth={typeof swiperConfig.width === 'string' ? swiperConfig.width : initialTemplateWidths.desktop}
                onSwiperWidthChange={(width) => {
                  // S'assurer que width est une chaîne avec 'px' à la fin
                  const normalizedWidth = width.endsWith('px') ? width : `${width}px`;
                  console.log('🔄 Mise à jour de la largeur du swiper:', normalizedWidth);
                  
                  setSwiperConfig(prev => ({ ...prev, width: normalizedWidth }));
                  
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => {
                    const updated = {
                      ...current,
                      design: {
                        ...current.design,
                        swiperConfig: {
                          ...current.design.swiperConfig,
                          style: {
                            ...(current.design.swiperConfig?.style || {}),
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
                    const event = new CustomEvent('swiperStyleUpdate', {
                      detail: { width }
                    });
                    
                    const logData = {
                      type: 'swiperStyleUpdate',
                      detail: { width },
                      timestamp: new Date().toISOString(),
                      target: 'window',
                      bubbles: true,
                      cancelable: true,
                      composed: true
                    };
                    
                    console.log('📤 [DesignEditorLayout] Émission de l\'événement swiperStyleUpdate (width):', logData);
                    
                    // Émettre l'événement de manière synchrone
                    const target = document.getElementById('swiper-preview-container') || window;
                    const eventDispatched = target.dispatchEvent(event);
                    
                    console.log('📤 [DesignEditorLayout] Événement émis avec succès:', {
                      eventDispatched,
                      target: target === window ? 'window' : 'swiper-preview-container'
                    });
                    
                    // Si l'événement n'a pas été traité, émettre un événement de secours
                    if (!eventDispatched) {
                      console.warn('⚠️ [DesignEditorLayout] L\'événement n\'a pas été traité, tentative avec un événement de secours');
                      const fallbackEvent = new CustomEvent('swiperStyleUpdateFallback', {
                        detail: { width },
                        bubbles: true,
                        cancelable: true
                      });
                      target.dispatchEvent(fallbackEvent);
                    }
                  } catch (error) {
                    console.error('❌ Erreur lors de l\'émission de l\'événement swiperStyleUpdate:', error);
                  }
                }}
                // Gestion de la largeur mobile du swiper
                swiperMobileWidth={typeof swiperConfig.mobileWidth === 'string' ? swiperConfig.mobileWidth : initialTemplateWidths.mobile}
                onSwiperMobileWidthChange={(width: string) => {
                  // S'assurer que width est une chaîne avec 'px' à la fin
                  const normalizedWidth = width.endsWith('px') ? width : `${width}px`;
                  console.log('🔄 Mise à jour de la largeur mobile du swiper:', normalizedWidth);
                  
                  setSwiperConfig(prev => ({ ...prev, mobileWidth: normalizedWidth }));
                  
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => {
                    const updated = {
                      ...current,
                      design: {
                        ...current.design,
                        swiperConfig: {
                          ...current.design.swiperConfig,
                          style: {
                            ...(current.design.swiperConfig?.style || {}),
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
                    const event = new CustomEvent('swiperStyleUpdate', {
                      detail: { mobileWidth: width }
                    });
                    
                    const logData = {
                      type: 'swiperStyleUpdate',
                      detail: { mobileWidth: width },
                      timestamp: new Date().toISOString(),
                      target: 'window',
                      bubbles: true,
                      cancelable: true,
                      composed: true
                    };
                    
                    console.log('📤 [DesignEditorLayout] Émission de l\'événement swiperStyleUpdate (mobileWidth):', logData);
                    
                    // Émettre l'événement de manière synchrone
                    const target = document.getElementById('swiper-preview-container') || window;
                    const eventDispatched = target.dispatchEvent(event);
                    
                    console.log('✅ [DesignEditorLayout] Événement swiperStyleUpdate (mobileWidth) émis avec succès:', eventDispatched);
                  } catch (error) {
                    console.error('❌ Erreur lors de l\'émission de l\'événement swiperStyleUpdate (mobileWidth):', error);
                  }
                }}
                // Gestion des couleurs des boutons
                onButtonBackgroundColorChange={(color) => {
                  setSwiperConfig(prev => ({
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
                      swiperConfig: {
                        ...current.design.swiperConfig,
                        style: {
                          ...(current.design.swiperConfig?.style || {}),
                          buttonBackgroundColor: color
                        }
                      }
                    }
                  }));
                }}
                onButtonTextColorChange={(color) => {
                  setSwiperConfig(prev => ({ ...prev, buttonTextColor: color }));
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      swiperConfig: {
                        ...current.design.swiperConfig,
                        style: {
                          ...(current.design.swiperConfig?.style || {}),
                          buttonTextColor: color
                        }
                      }
                    }
                  }));
                }}
                onButtonHoverBackgroundColorChange={(color) => {
                  setSwiperConfig(prev => ({
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
                      swiperConfig: {
                        ...current.design.swiperConfig,
                        style: {
                          ...(current.design.swiperConfig?.style || {}),
                          buttonHoverBackgroundColor: color
                        }
                      }
                    }
                  }));
                }}
                onButtonActiveBackgroundColorChange={(color) => {
                  setSwiperConfig(prev => ({ ...prev, buttonActiveBackgroundColor: color }));
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      swiperConfig: {
                        ...current.design.swiperConfig,
                        style: {
                          ...(current.design.swiperConfig?.style || {}),
                          buttonActiveBackgroundColor: color
                        }
                      }
                    }
                  }));
                }}
                // Passer les couleurs actuelles
                buttonBackgroundColor={swiperConfig.buttonBackgroundColor}
                buttonTextColor={swiperConfig.buttonTextColor}
                buttonHoverBackgroundColor={swiperConfig.buttonHoverBackgroundColor}
                buttonActiveBackgroundColor={swiperConfig.buttonActiveBackgroundColor}
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
            <div
              className="flex-1 canvas-scroll-area relative z-20 rounded-br-[18px] rounded-bl-none"
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
                {/* Premier Canvas */}
                <div data-screen-anchor="screen1" className="relative">
                  <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative">
                    {editorMode === 'article' && (
                      <PreviewRenderer
                        articleConfig={getArticleConfigWithDefaults(campaignState, campaignData)}
                        campaignType={(campaignState as any)?.type || 'swiper'}
                        campaign={campaignData}
                        wheelModalConfig={swiperModalConfig}
                        gameModalConfig={swiperModalConfig}
                        currentStep={currentStep}
                        editable={true}
                        formFields={(campaignState as any)?.formFields}
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
                        onStepChange={setCurrentStep}
                        currentGameResult={currentGameResult}
                        onGameResultChange={setCurrentGameResult}
                        onWinnerContentChange={(content) => {
                          if (campaignState) {
                            setCampaign({
                              ...campaignState,
                              articleConfig: {
                                ...(campaignState as any).articleConfig,
                                winnerContent: content,
                              },
                            });
                          }
                        }}
                        onLoserContentChange={(content) => {
                          if (campaignState) {
                            setCampaign({
                              ...campaignState,
                              articleConfig: {
                                ...(campaignState as any).articleConfig,
                                loserContent: content,
                              },
                            });
                          }
                        }}
                      />
                    )}
                  </div>
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
                    // Swiper sync props
                    extractedColors={extractedColors}
                    swiperModalConfig={swiperModalConfig}
                    containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                    hideInlineSwiperPreview
                    elementFilter={(element: any) => {
                      const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                      return !role.includes('exit-message');
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
                      // Toujours ouvrir l'onglet Éléments, même en mode mobile/portrait
                      if (sidebarRef.current) {
                        sidebarRef.current.setActiveTab('elements');
                      }
                      // Fermer les autres panneaux
                      setShowAnimationsInSidebar(false);
                      setShowPositionInSidebar(false);
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
                    // Swiper panels
                    showSwiperPanel={showSwiperPanel}
                    onSwiperPanelChange={setShowSwiperPanel}
                    // Modular page (screen1)
                    modularModules={modularPage.screens.screen1}
                    onModuleUpdate={handleUpdateModule}
                    onModuleDelete={handleDeleteModule}
                    onModuleMove={handleMoveModule}
                    onModuleDuplicate={handleDuplicateModule}
                  />
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
                      // Swiper sync props
                      extractedColors={extractedColors}
                      swiperModalConfig={swiperModalConfig}
                      containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                      elementFilter={(element: any) => {
                        const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                        return !role.includes('exit-message');
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
                        // Utiliser la même logique que onForceElementsTab
                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('elements');
                        }
                        // Fermer les autres panneaux
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);
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
                      // Swiper panels
                      showSwiperPanel={showSwiperPanel}
                      onSwiperPanelChange={setShowSwiperPanel}
                      // Modular page (screen2)
                      modularModules={modularPage.screens.screen2}
                      onModuleUpdate={handleUpdateModule}
                      onModuleDelete={handleDeleteModule}
                      onModuleMove={handleMoveModule}
                      onModuleDuplicate={handleDuplicateModule}
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
                      // Swiper sync props
                      extractedColors={extractedColors}
                      swiperModalConfig={swiperModalConfig}
                      containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                      elementFilter={(element: any) => {
                        const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                        return role.includes('exit-message');
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
                        // Utiliser la même logique que onForceElementsTab
                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('elements');
                        }
                        // Fermer les autres panneaux
                        setShowEffectsInSidebar(false);
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);
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
                      // Swiper panels
                      showSwiperPanel={showSwiperPanel}
                      onSwiperPanelChange={setShowSwiperPanel}
                      // Modular page (screen3)
                      modularModules={modularPage.screens.screen3}
                      onModuleUpdate={handleUpdateModule}
                      onModuleDelete={handleDeleteModule}
                      onModuleMove={handleMoveModule}
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
            onClick={() => navigate('/campaigns')}
            className="flex items-center px-3 py-2 text-xs sm:text-sm border border-gray-300 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors shadow-sm"
            title="Fermer"
          >
            <X className="w-4 h-4 mr-1" />
            Fermer
          </button>
          <button
            onClick={handleSaveAndQuit}
            className="flex items-center px-3 py-2 text-xs sm:text-sm rounded-lg text-white bg-[#44444d] hover:opacity-95 transition-colors shadow-sm"
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
                placeholder="Ex: Swiper Black Friday"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#44444d]"
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
                className="inline-flex items-center px-4 py-2 text-sm rounded-xl bg-gradient-to-br from-[#44444d] to-[#44444d] backdrop-blur-sm text-white font-medium border border-white/20 shadow-lg shadow-[#44444d]/20 hover:from-[#44444d] hover:to-[#6d164f] hover:shadow-xl hover:shadow-[#44444d]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Preview Modal */}
      <FullScreenPreviewModal
        isOpen={showFullScreenPreview}
        onClose={() => setShowFullScreenPreview(false)}
        device={fullScreenPreviewDevice}
        onDeviceChange={setFullScreenPreviewDevice}
      >
        <div className="w-full h-full overflow-hidden bg-white">
          <GameCanvasPreview
            campaign={campaignData}
            previewDevice={fullScreenPreviewDevice}
            key={`canvas-preview-${fullScreenPreviewDevice}-${(campaignData as any)?.type}`}
          />
        </div>
      </FullScreenPreviewModal>
    </MobileStableEditor>
  </div>
);
};
/* ... */
export default SwiperEditorLayout;
