// @ts-nocheck
'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback, lazy } from 'react';
import CampaignValidationModal from '@/components/shared/CampaignValidationModal';
import { useCampaignValidation } from '@/hooks/useCampaignValidation';
import { useLocation, useNavigate } from '@/lib/router-adapter';
import { Save, X } from 'lucide-react';

const HybridSidebar = lazy(() => import('./HybridSidebar'));
const DesignToolbar = lazy(() => import('./DesignToolbar'));
import GameCanvasPreview from '@/components/ModernEditor/components/GameCanvasPreview';
import PreviewRenderer from '@/components/preview/PreviewRenderer';
import ArticleFunnelView from '@/components/ArticleEditor/ArticleFunnelView';
import { getArticleConfigWithDefaults } from '@/utils/articleConfigHelpers';
import type { ModularPage, ScreenId, BlocBouton, Module } from '@/types/modularEditor';
import { createEmptyModularPage } from '@/types/modularEditor';

import ZoomSlider from './components/ZoomSlider';
const DesignCanvas = lazy(() => import('./DesignCanvas'));
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
// Quiz Editor doesn't need wheel config sync
// import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
import { useGroupManager } from '../../hooks/useGroupManager';
import { getDeviceDimensions } from '../../utils/deviceDimensions';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';
import { useEditorPreviewSync } from '@/hooks/useEditorPreviewSync';
import { useCampaignSettings } from '@/hooks/useCampaignSettings';
import { useEditorUnmountSave } from '@/hooks/useEditorUnmountSave';
// FormEditor types removed - using inline types for 2-screen layout


import { useCampaigns } from '@/hooks/useCampaigns';
import { saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';
import { useCampaignStateSync } from '@/hooks/useCampaignStateSync';
import { quizTemplates } from '../../types/quizTemplates';
import { supabase } from '@/integrations/supabase/client';
import { generateTempCampaignId, isTempCampaignId, clearTempCampaignData } from '@/utils/tempCampaignId';

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

interface FormEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}

const FormEditorLayout: React.FC<FormEditorLayoutProps> = ({ mode = 'campaign', hiddenTabs }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Détection du mode Article via URL (?mode=article)
  const searchParams = new URLSearchParams(location.search);
  const editorMode: 'article' | 'fullscreen' = searchParams.get('mode') === 'article' ? 'article' : 'fullscreen';
  
  console.log('🎨 [FormEditorLayout] Editor Mode:', editorMode);

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

    return () => {
      document.body.style.background = previousBackground;
      document.body.style.backgroundAttachment = previousBackgroundAttachment;
      document.body.style.backgroundSize = previousBackgroundSize;
      document.body.style.minHeight = previousMinHeight;
      document.body.style.margin = previousMargin;
    };
  }, []);

  const getTemplateBaseWidths = useCallback((templateId?: string) => {
    const template = quizTemplates.find((tpl) => tpl.id === templateId) || quizTemplates[0];
    const width = template?.style?.containerWidth ?? 450;
    // Zoom mobile par défaut à 70%
    const mobileWidth = Math.round(width * 0.7);
    return { desktop: `${width}px`, mobile: `${mobileWidth}px` };
  }, []);

  // Réinitialiser les backgrounds temporaires UNIQUEMENT au premier montage après un rafraîchissement
  useEffect(() => {
    try {
      const w = window as any;
      if (!w.__formBgSessionInitialized) {
        const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
        const screens: Array<'screen1' | 'screen2'> = ['screen1', 'screen2'];
        devices.forEach((d) => {
          screens.forEach((s) => {
            try { localStorage.removeItem(`form-bg-${d}-${s}`); } catch {}
          });
        });
        w.__formBgSessionInitialized = true;
      }
    } catch {}
  }, []);

  // Effet de montage: ne plus nettoyer les images de fond pour préserver l'édition après un aperçu
  useEffect(() => {
    // Laisser intacts les overrides en localStorage et l'état en mémoire
    // Optionnel: notifier les canvases pour re-synchroniser visuellement
    try {
      window.dispatchEvent(new CustomEvent('form-bg-sync', { detail: { screenId: 'screen1' } }));
      window.dispatchEvent(new CustomEvent('form-bg-sync', { detail: { screenId: 'screen2' } }));
    } catch {}
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
    resetCampaign,
    initializeNewCampaignWithId,
    saveToCampaignCache,
    loadFromCampaignCache
  } = useEditorStore();
  const isNewCampaignGlobal = useEditorStore((s) => s.isNewCampaignGlobal);
  const beginNewCampaign = useEditorStore((s) => s.beginNewCampaign);
  const clearNewCampaignFlag = useEditorStore((s) => s.clearNewCampaignFlag);
  const selectCampaign = useEditorStore((s) => s.selectCampaign);
  
  // Hook de synchronisation preview
  const { syncBackground } = useEditorPreviewSync();
  // Campagne centralisée (source de vérité pour les champs de contact)
  const campaignState = useEditorStore((s) => s.campaign);
  // Selected campaign ID from store (used by guards below)
  const selectedCampaignId = useEditorStore((s) => s.selectedCampaignId);

  // Utilitaire: vérifier si un modularPage contient au moins un module
  const isNonEmptyModularPage = useCallback((mp: any) => {
    try {
      if (!mp || !mp.screens) return false;
      const s1 = Array.isArray(mp.screens?.screen1) ? mp.screens.screen1.length : 0;
      const s2 = Array.isArray(mp.screens?.screen2) ? mp.screens.screen2.length : 0;
      const s3 = Array.isArray(mp.screens?.screen3) ? mp.screens.screen3.length : 0;
      return (s1 + s2 + s3) > 0;
    } catch { return false; }
  }, []);

  // Fusion non-destructive par écran (préserver l'existant quand l'entrant est vide)
  const deepMergeModularPage = useCallback((prev: any, next: any) => {
    const ensure = (v: any) => v && v.screens ? v : { screens: { screen1: [], screen2: [], screen3: [] } };
    const p = ensure(prev);
    const n = ensure(next);
    const merged = {
      screens: {
        screen1: Array.isArray(n.screens.screen1) && n.screens.screen1.length > 0 ? n.screens.screen1 : (p.screens.screen1 || []),
        screen2: Array.isArray(n.screens.screen2) && n.screens.screen2.length > 0 ? n.screens.screen2 : (p.screens.screen2 || []),
        screen3: Array.isArray(n.screens.screen3) && n.screens.screen3.length > 0 ? n.screens.screen3 : (p.screens.screen3 || [])
      },
      _updatedAt: Date.now()
    };
    return merged;
  }, []);

  // Supabase campaigns API
  const { saveCampaign } = useCampaigns();

// Campaign state synchronization hook
const { syncAllStates } = useCampaignStateSync();

// 🔄 Load campaign data from Supabase when campaign ID is in URL
const dataHydratedRef = useRef(false);
const isLoadingCampaignRef = useRef(false);
useEffect(() => {
  const sp = new URLSearchParams(location.search);
  const campaignId = sp.get('campaign');
  const isUuid = (v?: string | null) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  
  // CRITICAL: Skip loading for temporary campaign IDs - they should remain blank
  if (isTempCampaignId(campaignId)) {
    console.log('⏭️ [FormEditor] Skipping load for temporary campaign:', campaignId);
    dataHydratedRef.current = true;
    return;
  }
  
  if (!campaignId || !isUuid(campaignId)) return;
  
  // Check if we're switching campaigns
  const currentCampaignId = (campaignState as any)?.id;
  if (currentCampaignId && currentCampaignId !== campaignId) {
    console.log('🔄 [FormEditor] Switching campaigns, saving current state');
  }
  
  // Skip if this campaign is already loaded
  if (currentCampaignId === campaignId) {
    const hasPayload = campaignState && Object.keys(campaignState).length > 0;
    if (hasPayload) {
      console.log('✅ [FormEditor] Campaign already loaded:', campaignId);
      return;
    }
    console.log('⚠️ [FormEditor] Campaign id matches but store empty, forcing reload');
  }
  
  console.log('🔄 [FormEditor] Loading campaign:', campaignId);
  
  // Try to load from cache first
  if (!isTempCampaignId(campaignId)) {
    const cachedData = loadFromCampaignCache(campaignId);
    if (cachedData && cachedData.campaign) {
      console.log('📦 [FormEditor] Restoring from cache');
      setCampaign(cachedData.campaign);
      if (cachedData.canvasElements) setCanvasElements(cachedData.canvasElements);
      if (cachedData.modularPage) setModularPage(cachedData.modularPage);
      if (cachedData.screenBackgrounds) setScreenBackgrounds(cachedData.screenBackgrounds);
      if (cachedData.canvasZoom) setCanvasZoom(cachedData.canvasZoom);
      dataHydratedRef.current = true;
      return;
    }
  }
  
  // Otherwise, load from Supabase
  const loadCampaignData = async () => {
    try {
      isLoadingCampaignRef.current = true;
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        console.log('✅ [FormEditor] Campaign loaded from DB:', {
          id: data.id,
          name: data.name,
          hasConfig: !!data.config,
          hasDesign: !!data.design,
          hasModules: !!((data.design as any)?.quizModules || (data.config as any)?.modularPage)
        });
        
        // Transform database row to campaign format
        const campaignData: any = {
          ...data,
          id: data.id,
          name: data.name || 'Campaign',
          type: data.type || 'form',
          // Map DB fields to editor-friendly shape
          editorMode: (data as any).editor_mode || (data as any).editorMode || editorMode,
          articleConfig: (data as any).article_config || (data as any).articleConfig || {},
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
        
        // Restore canvasElements, backgrounds, modularPage, and zoom
        const cfg = campaignData.config?.canvasConfig || campaignData.canvasConfig;
        // Restaure aussi depuis design.quizModules (champ utilisé par persistModular)
        const mp = campaignData.config?.modularPage || campaignData.design?.modularPage || (campaignData.design as any)?.quizModules;
        
        if (cfg?.elements && Array.isArray(cfg.elements) && cfg.elements.length > 0) {
          setCanvasElements(cfg.elements);
        }
        if (cfg?.screenBackgrounds) {
          setScreenBackgrounds(cfg.screenBackgrounds);
        }
        if (cfg?.device) {
          setSelectedDevice(cfg.device);
        }
        if (cfg?.zoom) {
          setCanvasZoom(cfg.zoom);
        }
        if (mp && mp.screens) {
          // Ne pas écraser un état non vide par un mp vide + fusionner par écran
          setModularPage((prev: any) => {
            const incomingNonEmpty = isNonEmptyModularPage(mp);
            const prevNonEmpty = isNonEmptyModularPage(prev);
            const merged = deepMergeModularPage(prev, mp);
            console.debug('[FormEditor][Load] setModularPage', {
              prevS1: Array.isArray(prev?.screens?.screen1) ? prev.screens.screen1.length : 0,
              nextS1: Array.isArray(mp?.screens?.screen1) ? mp.screens.screen1.length : 0,
              mergedS1: merged.screens.screen1.length,
              prevNonEmpty,
              incomingNonEmpty
            });
            if (prevNonEmpty && !incomingNonEmpty) return prev;
            return merged;
          });
        }
        
        dataHydratedRef.current = true;
      }
    } catch (error) {
      console.error('❌ [FormEditor] Failed to load campaign:', error);
    }
    finally {
      isLoadingCampaignRef.current = false;
    }
  };
  
  loadCampaignData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.search, campaignState, setCampaign, saveToCampaignCache, loadFromCampaignCache]);

// Nouvelle campagne via header: si aucun id dans l'URL, créer une campagne vierge
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const cid = params.get('campaign');
  if (!cid) {
    console.log('🆕 [FormEditor] Creating new blank campaign');
    beginNewCampaign('form');
    const tempId = generateTempCampaignId('form');
    
    clearTempCampaignData(tempId);
    
    // Purge legacy keys
    try {
      const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
      const screens: Array<'screen1' | 'screen2'> = ['screen1', 'screen2'];
      devices.forEach((d) => screens.forEach((s) => {
        try { localStorage.removeItem(`form-modules-${d}-${s}`); } catch {}
        try { localStorage.removeItem(`form-bg-${d}-${s}`); } catch {}
      }));
    } catch {}
    
    initializeNewCampaignWithId('form', tempId);
    navigate(`${location.pathname}?campaign=${tempId}${searchParams.get('mode') ? `&mode=${searchParams.get('mode')}` : ''}`, { replace: true });
    requestAnimationFrame(() => clearNewCampaignFlag());
  } else {
    if (isNewCampaignGlobal) clearNewCampaignFlag();
  }
}, [location.pathname]);

// 🧹 CRITICAL: Clean temporary campaigns - keep only Participer and Rejouer buttons
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const id = params.get('campaign');
  if (!id || !isTempCampaignId(id)) return;
  
  console.log('🧹 [FormEditor] Cleaning temp campaign:', id);
  
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
    screen2: defaultBg
  });
}, [location.search]);

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
  
  const [screenBackgrounds, setScreenBackgrounds] = useState<Record<'screen1' | 'screen2', any>>({
    screen1: defaultBackground,
    screen2: defaultBackground
  });
  
  // Background global (fallback pour compatibilité)
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>(defaultBackground);
  const [canvasZoom, setCanvasZoom] = useState(getDefaultZoom(selectedDevice));

  // Modular editor JSON state - DOIT être déclaré AVANT les callbacks qui l'utilisent
  const [modularPage, setModularPage] = useState<ModularPage>(createEmptyModularPage());
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  // 🧹 CRITICAL: Save complete state before unmount to prevent data loss
  // Placed here AFTER all state declarations to avoid TDZ errors
  useEditorUnmountSave('form', {
    canvasElements,
    modularPage,
    screenBackgrounds,
    extractedColors,
    selectedDevice,
    canvasZoom,
    gameConfig: (campaignState as any)?.formConfig
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
        // FormEditor has 2 screens: screen1 = game + form, screen2 = exit message only
        if (
          role.includes('exit-message') ||
          role.includes('exit') ||
          role.includes('thank') ||
          role.includes('merci')
        ) {
          return { ...element, screenId: 'screen2' as const };
        }
        // Form, contact, lead elements stay on screen1 with the game
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

// ✅ Hydrater les éléments/modularPage/backgrounds depuis la DB à l'ouverture
useEffect(() => {
  console.log('🧩 [FormEditor] DB loading effect triggered', {
    cid: (campaignState as any)?.id,
    selectedCampaignId,
    isTemp: (campaignState as any)?.id?.startsWith('temp-') || isTempCampaignId((campaignState as any)?.id),
    campaignStateKeys: campaignState ? Object.keys(campaignState) : []
  });

  const cid = (campaignState as any)?.id as string | undefined;
  
  // 🛡️ GUARD: Ne pas hydrater si :
  // - Pas de campagne chargée
  // - C'est une nouvelle campagne (temp ID ou pas d'ID)
  // - L'ID ne correspond pas à celui sélectionné
  if (!cid) {
    console.log('🧩 [FormEditor] No campaign ID, skipping hydration');
    return;
  }
  if (cid.startsWith('temp-') || isTempCampaignId(cid)) {
    console.log('🧩 [FormEditor] Temp campaign, skipping hydration');
    return;
  }
  if (selectedCampaignId && cid !== selectedCampaignId) {
    console.log('🧩 [FormEditor] Wrong campaign ID, skipping hydration');
    return;
  }
  
  const cfg = (campaignState as any)?.config?.canvasConfig || (campaignState as any)?.canvasConfig;
  const mp = (campaignState as any)?.config?.modularPage || (campaignState as any)?.design?.quizModules;
  const topLevelElements = (campaignState as any)?.config?.elements;

  console.log('🧩 [FormEditor] Hydration data check', {
    hasCanvasConfig: !!cfg,
    hasModularPage: !!mp,
    mpScreens: mp?.screens ? Object.keys(mp.screens) : [],
    mpTotalModules: mp?.screens ? Object.values(mp.screens || {}).reduce((total: number, arr: any) => total + (Array.isArray(arr) ? arr.length : 0), 0) : 0,
    hasTopLevelElements: !!topLevelElements,
    canvasElementsLength: canvasElements.length
  });

  // N'hydrate que si on a des données utiles ET que le local est vide pour éviter l'écrasement
  if (Array.isArray(cfg?.elements) && cfg.elements.length > 0 && canvasElements.length === 0) {
    console.log('🧩 [FormEditor] Hydration: applying canvas elements (canvasConfig)', cfg.elements.length);
    setCanvasElements(cfg.elements);
  } else if (Array.isArray(topLevelElements) && topLevelElements.length > 0 && canvasElements.length === 0) {
    console.log('🧩 [FormEditor] Hydration: applying canvas elements (config.elements)', topLevelElements.length);
    setCanvasElements(topLevelElements);
  }

  if (cfg?.screenBackgrounds) setScreenBackgrounds(cfg.screenBackgrounds);
  if (cfg?.device) setSelectedDevice(cfg.device as any);

  if (mp && mp.screens) {
    const dbTotal = Object.values(mp.screens || {}).reduce((n: number, arr: any) => n + (Array.isArray(arr) ? arr.length : 0), 0);
    const localTotal = Object.values(modularPage.screens || {}).reduce((n: number, arr: any) => n + (Array.isArray(arr) ? arr.length : 0), 0);
    if (dbTotal > 0) {
      // Only hydrate from DB if local is empty or DB has more modules
      if (localTotal === 0 || dbTotal > localTotal) {
        console.log('🧩 [FormEditor] Hydration: applying modularPage from DB', { dbTotal, localTotal });
        setModularPage(mp);
      } else {
        console.log('🛡️ [FormEditor] Hydration skipped: local modularPage richer than DB', { dbTotal, localTotal });
      }
    } else {
      console.log('🧩 [FormEditor] ModularPage has screens but no modules');
    }
  } else {
    console.log('🧩 [FormEditor] No modularPage in campaign data');
  }
}, [campaignState?.id, campaignState?.config?.canvasConfig, campaignState?.config?.elements, campaignState?.modularPage, campaignState?.design?.quizModules, selectedCampaignId]);

// 🔗 Miroir local → store: conserve les éléments dans campaign.config.canvasConfig
// ✅ FIX: Éviter les cascades lors des changements de background
useEffect(() => {
  // Ne pas écrire dans le store tant que la campagne n'est pas sélectionnée
  const id = (campaignState as any)?.id as string | undefined;
  if (!id) return;
  if (selectedCampaignId && id !== selectedCampaignId) return;

  // ✅ GUARD: Ne pas mettre à jour si les éléments n'ont pas changé depuis le dernier update
  const currentElements = (campaignState as any)?.config?.canvasConfig?.elements;
  const elementsChanged = JSON.stringify(currentElements) !== JSON.stringify(canvasElements);
  const backgroundsChanged = JSON.stringify((campaignState as any)?.config?.canvasConfig?.screenBackgrounds) !== JSON.stringify(screenBackgrounds);
  const deviceChanged = (campaignState as any)?.config?.canvasConfig?.device !== selectedDevice;
  const zoomChanged = (campaignState as any)?.config?.canvasConfig?.zoom !== canvasZoom;

  // Ne mettre à jour que si quelque chose a réellement changé
  if (!elementsChanged && !backgroundsChanged && !deviceChanged && !zoomChanged) {
    return;
  }

  setCampaign((prev: any) => {
    if (!prev) return prev;
    const next = {
      ...prev,
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
}, [selectedCampaignId, campaignState?.id, canvasElements, screenBackgrounds, selectedDevice, canvasZoom, setCampaign]);

// 💾 Autosave léger des éléments du canvas
// ✅ FIX: Éviter l'autosave lors des simples changements de background
useEffect(() => {
  const id = (campaignState as any)?.id as string | undefined;
  const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  // Only autosave once campaign is persisted (UUID)
  if (!isUuid(id)) return;
  // Guard: ensure we only persist for the selected campaign slice
  if (selectedCampaignId && id !== selectedCampaignId) return;
  // Ne pas autosaver pendant le chargement initial
  if (!dataHydratedRef.current || isLoadingCampaignRef.current) return;

  // ✅ GUARD: Ne pas autosaver si seul le background a changé
  const lastSavedElements = (campaignState as any)?.config?.canvasConfig?.elements;
  const elementsActuallyChanged = JSON.stringify(lastSavedElements) !== JSON.stringify(canvasElements);

  // Si seuls les backgrounds ont changé, ne pas autosaver immédiatement
  if (!elementsActuallyChanged && canvasElements.length > 0) {
    return;
  }

  const t = window.setTimeout(async () => {
    try {
      // ✅ FIX: Toujours inclure le modularPage actuel pour éviter l'écrasement
      // Ne jamais sauvegarder un modularPage vide si on en a un rempli en mémoire
      const currentModularPage = modularPage && Object.keys(modularPage.screens || {}).length > 0 
        ? modularPage 
        : (campaignState as any)?.config?.modularPage || (campaignState as any)?.design?.modularPage;

      const payload: any = {
        ...(campaignState || {}),
        editorMode, // Ajouter le mode éditeur (article ou fullscreen)
        editor_mode: editorMode, // Champ DB normalisé
        articleConfig: (campaignState as any)?.articleConfig || {},
        type: 'form',
        extractedColors, // ✅ Include extracted colors
        modularPage: currentModularPage, // ✅ Préserver les modules existants
        canvasElements,
        screenBackgrounds,
        selectedDevice,
        canvasConfig: {
          ...(campaignState as any)?.canvasConfig,
          elements: canvasElements,
          screenBackgrounds,
          device: selectedDevice,
          zoom: canvasZoom
        }
      };
      console.log('💾 [FormEditor] Autosave complete state → DB', {
        elements: canvasElements.length,
        modules: currentModularPage ? Object.values(currentModularPage.screens || {}).flat().length : 0
      });
      await saveCampaignToDB(payload, saveCampaign);
      setIsModified(false);
    } catch (e) {
      console.warn('⚠️ [FormEditor] Autosave failed', e);
    }
  }, 1000);
  return () => clearTimeout(t);
}, [campaignState?.id, selectedCampaignId, canvasElements, screenBackgrounds, selectedDevice, modularPage, campaignState?.config?.modularPage, campaignState?.design?.modularPage]); // ✅ Retiré canvasZoom pour éviter les sauvegardes à chaque zoom

// 💾 Autosave des modules séparément pour éviter les conflits
useEffect(() => {
  console.log('🧩 [FormEditor] Modules autosave effect triggered', {
    hasId: !!(campaignState as any)?.id,
    selectedCampaignId,
    dataHydrated: dataHydratedRef.current,
    isLoadingCampaign: isLoadingCampaignRef.current,
    hasModules: !!modularPage && Object.keys(modularPage.screens || {}).length > 0,
    totalModules: modularPage ? Object.values(modularPage.screens || {}).flat().length : 0
  });

  const id = (campaignState as any)?.id as string | undefined;
  const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  if (!id || !isUuid(id)) {
    console.log('🧩 [FormEditor] No campaign ID, skipping autosave');
    return;
  }
  if (selectedCampaignId && id !== selectedCampaignId) {
    console.log('🧩 [FormEditor] Wrong campaign ID, skipping autosave');
    return;
  }
  if (!dataHydratedRef.current || isLoadingCampaignRef.current) {
    console.log('🧩 [FormEditor] Data not hydrated or loading, skipping autosave');
    return;
  }

  // Ne sauvegarder que si on a des modules
  const hasModules = modularPage && Object.keys(modularPage.screens || {}).length > 0;
  if (!hasModules) {
    console.log('🧩 [FormEditor] No modules to save, skipping autosave');
    return;
  }

  const totalModules = Object.values(modularPage.screens || {}).flat().length;
  if (totalModules === 0) {
    console.log('🧩 [FormEditor] No modules in screens, skipping autosave');
    return;
  }

  console.log('🧩 [FormEditor] Starting modules autosave in 1.5s...');

  const t = window.setTimeout(async () => {
    console.log('🧩 [FormEditor] Executing modules autosave now');
    try {
      const payload: any = {
        ...(campaignState || {}),
        editorMode, // Ajouter le mode éditeur (article ou fullscreen)
        editor_mode: editorMode, // Champ DB normalisé
        articleConfig: (campaignState as any)?.articleConfig || {},
        type: 'form',
        modularPage,
        config: {
          ...(campaignState as any)?.config,
          modularPage
        },
        design: {
          ...(campaignState as any)?.design,
          modularPage,
          quizModules: modularPage
        }
      };
      console.log('🧩 [FormEditor] Autosave modules → DB', totalModules, 'modules');
      await saveCampaignToDB(payload, saveCampaign);
      console.log('🧩 [FormEditor] Modules autosave completed successfully');
    } catch (e) {
      console.warn('⚠️ [FormEditor] Module autosave failed', e);
    }
  }, 1500);
  return () => {
    console.log('🧩 [FormEditor] Clearing modules autosave timeout');
    clearTimeout(t);
  };
}, [campaignState?.id, selectedCampaignId, modularPage, campaignState?.config, campaignState?.design]);

  // Détection de la taille de fenêtre
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Réinitialiser l'image de fond quand on change de route (uniquement si on vient d'une autre page)
  const prevPathRef = useRef<string>('');
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;
    
    // Réinitialiser uniquement si on vient d'une autre page ET qu'il y a une image
    if (prevPath && prevPath !== currentPath && canvasBackground.type === 'image') {
      console.log('🧹 [QuizEditor] Navigation détectée - réinitialisation du fond');
      setCanvasBackground(
        mode === 'template'
          ? { type: 'color', value: '#4ECDC4' }
          : { type: 'color', value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' }
      );
    }
    
    prevPathRef.current = currentPath;
  }, [location.pathname, mode, canvasBackground.type]); // Se déclenche au changement de route

  // Ajuste automatiquement le zoom lors du redimensionnement sur mobile (désactivé pour permettre le contrôle manuel)
  // useEffect(() => {
  //   if (actualDevice === 'mobile') {
  //     const updateZoom = () => setCanvasZoom(getDefaultZoom('mobile'));
  //     window.addEventListener('resize', updateZoom);
  //     return () => window.removeEventListener('resize', updateZoom);
  //   }
  // }, [actualDevice]);

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
    console.log('🎨 [QuizEditor] Updating background image:', { url: url.substring(0, 50), targetDevice, selectedDevice });
    
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
      
      console.log('🎨 [QuizEditor] Received applyBackgroundAllScreens:', { url: url.substring(0, 50), targetDevice, selectedDevice });
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
      console.log('🎨 [QuizEditor] applyBackgroundCurrentScreen → preview-only sync:', {
        url: url.substring(0, 50),
        targetDevice,
        selectedDevice,
        screenId: detail?.screenId
      });

      // Synchroniser via le hook dédié pour que le store Zustand soit mis à jour
      try {
        console.log('🔔 [QuizEditor] Syncing background via useEditorPreviewSync:', {
          url: url.substring(0, 50) + '...',
          device: targetDevice,
          screenId: detail?.screenId
        });
        syncBackground({ type: 'image', value: url }, targetDevice as 'desktop' | 'tablet' | 'mobile');
      } catch (err) {
        console.error('❌ [QuizEditor] Failed to sync background:', err);
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
  // Inline QuizConfigPanel visibility (controlled at layout level)
  const [showQuizPanel, setShowQuizPanel] = useState(false);
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

  // Open name modal if campaign has default/empty name and hasn't been prompted yet
  useEffect(() => {
    const id = (campaignState as any)?.id as string | undefined;
    const name = (campaignState as any)?.name as string | undefined;
    
    const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

    // Detect an explicit campaign id in URL (e.g. ?campaign= or ?id=)
    let urlId: string | null = null;
    try {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const sp = new URLSearchParams(search);
      urlId = sp.get('campaign') || sp.get('id');
    } catch {}
    
    // Guards: when editing an existing campaign (from id in state or URL),
    // wait until the campaign name has been loaded to avoid false prompts
    if ((isUuid(id) || !!urlId) && (!name || !name.trim())) {
      return;
    }
    
    const promptedKey = id ? `campaign:name:prompted:${id}` : `campaign:name:prompted:new:form`;
    const alreadyPrompted = typeof window !== 'undefined' ? localStorage.getItem(promptedKey) === '1' : true;
    const defaultNames = new Set([
      'Nouvelle campagne',
      'Nouvelle Roue de la Fortune',
      '',
      undefined as unknown as string
    ]);
    const needsName = !name || defaultNames.has((name || '').trim());
    if (needsName && !alreadyPrompted) {
      setNewCampaignName(name || '');
      setIsNameModalOpen(true);
    }
  }, [campaignState?.id, campaignState?.name]);

  const { upsertSettings } = useCampaignSettings();
  
  // 🔒 Guard against concurrent saves
  const isSavingRef = useRef(false);

  const handleSaveCampaignName = useCallback(async () => {
    const currentId = (campaignState as any)?.id as string | undefined;
    const name = (newCampaignName || '').trim();
    if (!name) return;
    
    // 🔒 Prevent concurrent saves
    if (isSavingRef.current) {
      console.warn('⚠️ [FormEditor] Save already in progress, skipping duplicate call');
      return;
    }
    isSavingRef.current = true;

    try {
      // 🔄 CRITICAL: Synchroniser TOUS les états locaux avant la sauvegarde
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

      const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      
      // Créer le payload complet avec le nom ET toutes les configurations
      const payload: any = {
        ...(updatedCampaign || {}),
        editorMode, // Ajouter le mode éditeur (article ou fullscreen)
        editor_mode: editorMode, // Champ DB normalisé
        articleConfig: (updatedCampaign as any)?.articleConfig || {},
        id: isUuid(currentId) ? currentId : undefined,
        name,
        type: 'form'
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
          ...saved,
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

        try { localStorage.setItem(`campaign:name:prompted:${(saved as any)?.id || currentId || 'new:form'}`, '1'); } catch {}
        setIsNameModalOpen(false);
        setIsModified(false);
      }
    } finally {
      // 🔓 Always release save lock
      isSavingRef.current = false;
    }
  }, [campaignState, newCampaignName, saveCampaign, setCampaign, upsertSettings, location.pathname, location.search, navigate, syncAllStates, canvasElements, modularPage, screenBackgrounds, extractedColors, selectedDevice, canvasZoom, setIsModified]);

  // 🔄 Listen for sync request from CampaignSettingsModal before saving
  useEffect(() => {
    console.log('🎧 [FormEditor] Setting up sync event listener');
    
    const handler = () => {
      console.log('🎯 [FormEditor] SYNC EVENT RECEIVED: campaign:sync:before-save');
      
      console.log('🔄 [FormEditor] Received sync request, syncing all states...', {
        canvasElements: canvasElements.length,
        modularPageModules: modularPage ? Object.values(modularPage.screens || {}).flat().length : 0,
        screenBackgrounds: Object.keys(screenBackgrounds).length
      });
      
      // Sync all states to campaign object
      syncAllStates({
        canvasElements,
        modularPage,
        screenBackgrounds,
        extractedColors,
        selectedDevice,
        canvasZoom
      });
      
      // Force immediate update to Zustand store to prevent race conditions
      // Wait a tick to ensure the setState has propagated
      setTimeout(() => {
        const updatedCampaign = useEditorStore.getState().campaign as any;
        console.log('✅ [FormEditor] All states synced to campaign object', {
          modulesInStore: updatedCampaign?.modularPage?.screens ? 
            Object.values(updatedCampaign.modularPage.screens).flat().length : 0
        });
        
        // Emit confirmation event
        console.log('📡 [FormEditor] Emitting campaign:sync:completed event');
        window.dispatchEvent(new CustomEvent('campaign:sync:completed'));
      }, 50);
    };
    
    console.log('➕ [FormEditor] Adding event listener for campaign:sync:before-save');
    window.addEventListener('campaign:sync:before-save', handler);
    return () => {
      console.log('➖ [FormEditor] Removing event listener for campaign:sync:before-save');
      window.removeEventListener('campaign:sync:before-save', handler);
    };
  }, [syncAllStates, canvasElements, modularPage, screenBackgrounds, extractedColors, selectedDevice, canvasZoom]);

  // Quiz config state
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
  // Fullscreen mode: supports screen1 (main) and screen2 (exit)
  const [currentScreen, setCurrentScreen] = useState<'screen1' | 'screen2'>('screen1');

  // Garder l'overlay aligné avec le background par écran (persistance après aperçu)
  useEffect(() => {
    const devBg = (screenBackgrounds as any)?.[currentScreen]?.devices?.[selectedDevice];
    const cur = devBg || (screenBackgrounds as any)?.[currentScreen];
    if (cur && typeof cur === 'object' && cur.type && cur.value !== undefined) {
      setCanvasBackground(cur as any);
    }
  }, [currentScreen, selectedDevice, screenBackgrounds]);
  const selectedModule: Module | null = useMemo(() => {
    if (!selectedModuleId) return null;
    const allModules = (Object.values(modularPage.screens) as Module[][]).flat();
    return allModules.find((module) => module.id === selectedModuleId) || null;
  }, [selectedModuleId, modularPage.screens]);
  
// Aperçu plein écran / mode article
const [showFunnel, setShowFunnel] = useState(false);
const isArticlePreview = editorMode === 'article' && showFunnel;

// Détecter la position de scroll pour changer l'écran courant (désactivé pendant l'aperçu plein écran)
useEffect(() => {
    if (showFunnel) return;

    const canvasScrollArea = document.querySelector('.canvas-scroll-area') as HTMLElement | null;
    if (!canvasScrollArea) return;

    const anchors = Array.from(canvasScrollArea.querySelectorAll('[data-screen-anchor]')) as HTMLElement[];
    if (anchors.length === 0) return;

    const computeNearestScreen = () => {
      const areaRect = canvasScrollArea.getBoundingClientRect();
      const areaCenter = areaRect.top + areaRect.height / 2;

      let closestId: 'screen1' | 'screen2' = 'screen1';
      let closestDistance = Infinity;

      anchors.forEach((anchor) => {
        const screenId = (anchor.dataset.screenAnchor as 'screen1' | 'screen2' | undefined) ?? 'screen1';
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
  }, [showFunnel]);

  // Helper to persist modularPage into campaignConfig (and mark modified)
  // ✅ FIX: Éviter les re-rendus inutiles avec des guards et optimisations
  const persistModular = useCallback((next: ModularPage) => {
    // ✅ GUARD: Éviter les appels inutiles si modularPage n'a pas changé
    if (JSON.stringify(next) === JSON.stringify(modularPage)) {
      return;
    }

    console.log('🧩 [FormEditor] persistModular: saving modules', {
      screen1: next.screens.screen1?.length || 0,
      screen2: next.screens.screen2?.length || 0
    });

    setModularPage(next);
    setCampaignConfig((prev: any) => {
      const updated = {
        ...(prev || {}),
        design: {
          ...(prev?.design || {}),
          quizModules: { ...next, _updatedAt: Date.now() }
        },
        config: {
          ...(prev?.config || {}),
          modularPage: { ...next, _updatedAt: Date.now() }
        }
      };

      // ✅ GUARD: Ne pas mettre à jour si campaignConfig n'a pas réellement changé
      if (JSON.stringify(updated) === JSON.stringify(prev)) {
        return prev;
      }

      return updated;
    });

    // ✅ DELAY: Marquer modifié seulement après un délai pour éviter les appels répétés
    setTimeout(() => {
      try { setIsModified(true); } catch {}
    }, 100);
  }, [modularPage, setIsModified]);

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

  const getDefaultButtonLabel = useCallback((screen: 'screen1' | 'screen2'): string => {
    return screen === 'screen2' ? 'Rejouer' : 'Participer';
  }, []);

  // DÉSACTIVÉ: Pas d'ajout automatique de boutons
  // L'utilisateur ajoutera manuellement les boutons via les modules
  // React.useEffect(() => {
  //   if (currentScreen !== 'screen2') return;
  //   // ... code désactivé
  // }, [currentScreen, modularPage.screens, persistModular, screenHasCardButton, getDefaultButtonLabel]);

  // Modular handlers
  const handleAddModule = useCallback((screen: ScreenId, module: Module) => {
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
    // DÉSACTIVÉ: Pas de traitement spécial pour le bouton "Participer"
    // Tous les modules sont traités de la même manière
    const updatedModules: Module[] = [module, ...prevScreenModules];

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

  const ensuredBlocBoutonRef = useRef(false);
  const createDefaultBlocBouton = useCallback((screen: ScreenId = 'screen1'): BlocBouton => ({
    id: `BlocBouton-${Date.now()}-${performance.now().toFixed(3).replace('.', '')}-${Math.random().toString(36).slice(2, 8)}`,
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

    const newId = `module-${Date.now()}-${performance.now().toFixed(3).replace('.', '')}-${Math.random().toString(36).slice(2, 8)}`;
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
  
  // ✅ OPTIMISATION: Mémoiser les modules par écran pour éviter re-rendus constants
  const screen1Modules = useMemo(() => modularPage.screens.screen1 || [], [modularPage.screens.screen1]);
  const screen2Modules = useMemo(() => modularPage.screens.screen2 || [], [modularPage.screens.screen2]);
  
  // ✅ OPTIMISATION: Mémoiser les backgrounds pour éviter re-rendus constants
  const screen1Background = useMemo(() => 
    screenBackgrounds.screen1?.devices?.[selectedDevice] || screenBackgrounds.screen1,
    [screenBackgrounds.screen1, selectedDevice]
  );
  const screen2Background = useMemo(() => 
    screenBackgrounds.screen2?.devices?.[selectedDevice] || screenBackgrounds.screen2,
    [screenBackgrounds.screen2, selectedDevice]
  );
  
  // ✅ OPTIMISATION: Mémoiser une version légère du campaign pour les props stables
  // Renommé en memoCampaignData pour éviter la collision avec la variable campaignData plus bas
  const memoCampaignData = useMemo(() => ({
    ...campaignState,
    type: 'form',
    formConfig: (campaignState as any)?.formConfig
  }), [campaignState]);

  // ✅ Restauré: Sélectionner tous les éléments visibles sur le canvas
  const handleSelectAll = useCallback(() => {
    const selectableElements = canvasElements.filter(element => 
      element && element.id && (element.type === 'text' || element.type === 'image' || element.type === 'shape' || element.type)
    );

    if (selectableElements.length > 0) {
      setSelectedElements([...selectableElements]);
      setSelectedElement(null);
    }
  }, [canvasElements]);
  const navigateToScreen = useCallback(
    (screen: 'screen1' | 'screen2') => {
      setCurrentScreen(screen);
      if (!showFunnel) {
        scrollToScreen(screen);
      }
    },
    [scrollToScreen, showFunnel]
  );

  const getElementFilterForScreen = useCallback(
    (screen: 'screen1' | 'screen2') => {
      return (element: any) => {
        if (screen === 'screen1') {
          return element?.screenId === 'screen1' || !element?.screenId;
        }
        return element?.screenId === 'screen2';
      };
    },
    []
  );

  const activePreviewBackground =
    currentScreen === 'screen1'
      ? (screen1Background || canvasBackground)
      : (screen2Background || screen1Background || canvasBackground);
  const activePreviewModules = currentScreen === 'screen1' ? screen1Modules : screen2Modules;
  const previewElementFilter = useMemo(
    () => getElementFilterForScreen(currentScreen),
    [currentScreen, getElementFilterForScreen]
  );
  // For form campaigns, start directly with the form (no article step)
  const [currentStep, setCurrentStep] = useState<'article' | 'form' | 'game' | 'result'>(editorMode === 'article' ? 'form' : 'article');
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
    const snapshotMP = state?.modularPageSnapshot as any | undefined;
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

    // 💾 Priorité au snapshot de modules (après redirection des paramètres)
    if (snapshotMP && snapshotMP.screens) {
      const snapshotCount = Object.values(snapshotMP.screens || {}).flat().length;
      const localCount = Object.values(modularPage.screens || {}).flat().length;
      if (snapshotCount > 0 && snapshotCount >= localCount) {
        console.log('🧷 [FormEditor] Applying modularPage snapshot from navigation state', { snapshotCount, localCount });
        setModularPage(snapshotMP);
      }
    }
  }, [location]);

  // Ajoute à l'historique lors de l'ajout d'un nouvel élément (granulaire)
  const handleAddElement = (element: any) => {
    const resolvedScreenId = element?.screenId
      || (currentScreen === 'screen2' ? 'screen2' : 'screen1');
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
  const handleBackgroundChange = (bg: any, options?: { screenId?: 'screen1' | 'screen2'; applyToAllScreens?: boolean; device?: 'desktop' | 'tablet' | 'mobile' }) => {
    console.log('🎨 [FormEditor] handleBackgroundChange:', { bg, options });
    
    if (options?.applyToAllScreens) {
      // Appliquer à tous les écrans
      console.log('✅ Applying background to ALL screens');
      setScreenBackgrounds({
        screen1: bg,
        screen2: bg
      });
      try { if (bg?.type === 'image') window.dispatchEvent(new CustomEvent('applyBackgroundAllScreens', { detail: { url: bg.value, device: options?.device || selectedDevice, applyAll: true, fromEditor: true } })); } catch {}
      setCanvasBackground(bg); // Fallback global utile en mode édition
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
      // Émettre les évènements pour mise à jour preview et autres canvases
      try {
        if (bg?.type === 'image') {
          window.dispatchEvent(new CustomEvent('applyBackgroundCurrentScreen', { detail: { url: bg.value, device: options.device, screenId: options.screenId, applyAll: false, fromEditor: true } }));
          window.dispatchEvent(new CustomEvent('clearBackgroundOtherScreens', { detail: { device: options.device, keepScreenId: options.screenId } }));
        }
      } catch {}
      // Ne PAS toucher à canvasBackground global ici pour éviter héritage
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
        screen2: bg
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
      return '#44444d';
    })();
    const secondaryColor = '#ffffff';

    // Build dynamic quiz questions for preview:
    let configuredQuestions = (
      (campaignState as any)?.quizConfig?.questions ||
      (campaignConfig as any)?.quizConfig?.questions ||
      (campaignState as any)?.gameConfig?.quiz?.questions ||
      (campaignConfig as any)?.gameConfig?.quiz?.questions ||
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
    
    console.log('🧭 [QuizEditorLayout] campaignData questions:', {
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

    console.log('🎨 [QuizEditorLayout] Creating campaignData with background:', {
      canvasBackground,
      backgroundImage: campaignConfig?.design?.backgroundImage,
      mobileBackgroundImage: campaignConfig?.design?.mobileBackgroundImage
    });
    
    return {
      // Ne jamais injecter un faux ID dans le store; garder l'ID actuel si présent
      id: (campaignState as any)?.id || (campaignConfig as any)?.id || (useEditorStore.getState().campaign as any)?.id,
      type: 'form',
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
          accent: extractedColors[2] || '#45b7d1',
          // Ajouter les couleurs du formulaire depuis formConfig
          panelBg: campaignConfig?.design?.formConfig?.panelBg || campaignState?.design?.formConfig?.panelBg,
          textColor: campaignConfig?.design?.formConfig?.textColor || campaignState?.design?.formConfig?.textColor,
          buttonColor: campaignConfig?.design?.formConfig?.buttonColor || campaignState?.design?.formConfig?.buttonColor,
          buttonTextColor: campaignConfig?.design?.formConfig?.buttonTextColor || campaignState?.design?.formConfig?.buttonTextColor
        },
        // Ajouter formConfig pour le FormEditor
        formConfig: campaignConfig?.design?.formConfig || campaignState?.design?.formConfig || {
          title: 'Vos informations',
          description: 'Remplissez le formulaire pour participer',
          submitLabel: 'Participer',
          panelBg: '#ffffff',
          borderColor: '#e5e7eb',
          textColor: '#000000',
          buttonColor: '#44444d',
          buttonTextColor: '#ffffff',
          fontFamily: 'inherit',
          displayMode: 'overlay',
          position: 'right',
          borderRadius: 5,
          fieldBorderRadius: 2,
          width: 500,
          height: 500
        },
        quizConfig: {
          questionCount: campaignConfig?.design?.quizConfig?.questionCount || quizConfig.questionCount || 5,
          timeLimit: campaignConfig?.design?.quizConfig?.timeLimit || quizConfig.timeLimit || 30,
          templateId: quizConfig.templateId,
          style: {
            ...campaignConfig?.design?.quizConfig?.style,
            buttonBackgroundColor: campaignConfig?.design?.quizConfig?.style?.buttonBackgroundColor || quizConfig.buttonBackgroundColor,
            buttonTextColor: campaignConfig?.design?.quizConfig?.style?.buttonTextColor || quizConfig.buttonTextColor,
            buttonHoverBackgroundColor: campaignConfig?.design?.quizConfig?.style?.buttonHoverBackgroundColor || quizConfig.buttonHoverBackgroundColor,
            buttonActiveBackgroundColor: campaignConfig?.design?.quizConfig?.style?.buttonActiveBackgroundColor || quizConfig.buttonActiveBackgroundColor,
            borderRadius: campaignConfig?.design?.quizConfig?.style?.borderRadius || `${quizConfig.borderRadius}px` || '8px',
            // Styles pour le texte
            textColor: campaignConfig?.design?.quizConfig?.style?.textColor || '#000000',
            questionTextWrap: 'break-word',
            answerTextWrap: 'break-word',
            // Zoom/largeur - respecter les valeurs ajustées par le panel
            width: campaignConfig?.design?.quizConfig?.style?.width || (quizConfig.width || initialTemplateWidths.desktop),
            mobileWidth: campaignConfig?.design?.quizConfig?.style?.mobileWidth || (quizConfig.mobileWidth || initialTemplateWidths.mobile),
            // Opacité de fond si définie
            backgroundOpacity: campaignConfig?.design?.quizConfig?.style?.backgroundOpacity ?? 100,
            // Mise en page responsive
            questionPadding: '12px',
            answerPadding: '12px 16px',
            answerMargin: '8px 0',
            answerMinHeight: 'auto'
          }
        }
      },
      gameConfig: {
        quiz: {
          questions: configuredQuestions,
          timeLimit: campaignConfig?.design?.quizConfig?.timeLimit || quizConfig.timeLimit || 30,
          templateId: quizConfig.templateId,
          buttonLabel: fallbackButtonText,
          buttonStyles: buttonCustomStyles
        }
      },
      buttonConfig: {
        text: fallbackButtonText,
        color: primaryColor,
        textColor:
          buttonCustomStyles?.color ||
          quizStyleOverrides.buttonTextColor ||
          quizConfig.buttonTextColor ||
          '#ffffff',
        borderRadius:
          buttonCustomStyles?.borderRadius as any ||
          quizStyleOverrides.borderRadius ||
          (typeof quizConfig.borderRadius === 'number' ? `${quizConfig.borderRadius}px` : quizConfig.borderRadius) ||
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
    launchButtonStyles,
    quizStyleOverrides,
    quizConfig,
    modularPage,
    backgroundUpdateTrigger
  ]);
  
  // Référence pour mémoriser la dernière signature synchronisée avec le store
  const lastTransformedSigRef = useRef<string>('');

  useEffect(() => {
    // Guards: do not sync during initial load or when not in preview mode
    if (!campaignData) return;
    if (!dataHydratedRef.current) return;
    if (isLoadingCampaignRef.current) return;
    if (!showFunnel) return;

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
      campaignId: (campaignState as any)?.id,
      showFunnel
    });

    // Construire une version transformée pour le preview tout en préservant l'ID réel et le type form
    const transformedCampaign = {
      ...campaignData,
      id: (useEditorStore.getState().campaign as any)?.id || (campaignState as any)?.id,
      name: 'Ma Campagne',
      type: (campaignData.type || 'form') as 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'form' | 'memory' | 'puzzle',
      design: {
        ...campaignData.design,
        background: campaignData.design?.background ?? { type: 'color', value: '#ffffff' }
      }
    } as any;

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
          // Préserver design.quizModules et les images de fond si présentes
          design: {
            ...(transformedCampaign as any).design,
            quizModules: (transformedCampaign as any).modularPage || prev.design?.quizModules,
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
  }, [campaignData, setCampaign, showFunnel]);

  // Sauvegarde consolidée (modules, fonds, éléments, champs)
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
      const updatedCampaign = useEditorStore.getState().campaign || {};

      // Construire un objet consolidé pour garantir la persistance des données critiques
      const toSave: any = {
        ...updatedCampaign,
        type: (updatedCampaign as any)?.type || 'form',
        // Canvas elements et config
        canvasElements: [...canvasElements],
        canvasConfig: {
          ...(updatedCampaign as any)?.canvasConfig,
          elements: [...canvasElements],
          background: canvasBackground,
          screenBackgrounds: { ...screenBackgrounds },
          device: selectedDevice,
          zoom: canvasZoom
        },
        // Modules
        modularPage: { ...(modularPage || { screens: { screen1: [], screen2: [], screen3: [] } }) },
        // Design (fonds + couleurs extraites)
        design: {
          ...(updatedCampaign as any)?.design,
          screenBackgrounds: { ...screenBackgrounds },
          background: canvasBackground,
          backgroundImage: (updatedCampaign as any)?.design?.backgroundImage || (canvasBackground?.type === 'image' ? canvasBackground.value : (updatedCampaign as any)?.design?.backgroundImage),
          mobileBackgroundImage: (updatedCampaign as any)?.design?.mobileBackgroundImage || (canvasBackground?.type === 'image' ? canvasBackground.value : (updatedCampaign as any)?.design?.mobileBackgroundImage),
          extractedColors: [...extractedColors]
        },
        // Champs formulaire
        formFields: (campaignState as any)?.formFields || (updatedCampaign as any)?.formFields || []
      };

      // Sauvegarder via le mapper centralisé
      const saved = await saveCampaignToDB(toSave, saveCampaign);
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
    
    setShowFunnel(!showFunnel);
    // For form campaigns, keep the form step (don't reset to article)
    if (!showFunnel) {
      setCurrentStep('form');
    }
  };

  // Funnel progression handlers for Form
  // Form flow: Article → Form → Result (no game)
  const handleCTAClick = () => {
    console.log('🎯 [FormEditor] CTA clicked, moving to form step');
    setCurrentStep('form');
  };

  const handleFormSubmit = (data: Record<string, string> = {}) => {
    console.log('📝 [FormEditor] Form submitted:', data);
    setCurrentStep('result'); // Form campaigns skip game
    navigateToScreen('screen2');
  };

  const handleGameComplete = () => {
    console.log('🎮 [FormEditor] Game completed (should not happen for form)');
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
    
    // ✅ CRITICAL: Ne demander un nom que pour un brouillon SANS id et sans nom explicite
    const hasId = !!((campaignState as any)?.id);
    const currentName = (campaignState as any)?.name || '';
    const isNameProvided = typeof currentName === 'string' && currentName.trim().length > 0;
    const isDefaultName = /nouvelle campagne|new campaign/i.test(currentName || '');
    const mustPromptForName = !hasId && (!isNameProvided || isDefaultName);

    if (mustPromptForName) {
      console.log('❌ [FormEditor] Draft without proper name, opening name modal before save');
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
        padding: showFunnel ? '0' : (isWindowMobile ? '9px' : '0 9px 9px 9px'),
        boxSizing: 'border-box'
      }}
    >
    <MobileStableEditor className={showFunnel ? "h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden" : (isWindowMobile ? "h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pb-[6px] rounded-tl-[18px] rounded-tr-[18px] rounded-br-[18px] transform -translate-y-[0.4vh]" : "h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pt-[1.25cm] pb-[6px] rounded-tl-[18px] rounded-tr-[18px] rounded-br-[18px] transform -translate-y-[0.4vh]")}> 

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
        {showFunnel && selectedDevice === 'mobile' ? (
          /* Mode Preview Mobile - Fond gris foncé */
          <div 
            className="fixed inset-0 z-40 w-full h-[100dvh] min-h-[100dvh] flex items-center justify-center"
            style={{ backgroundColor: '#3a3a42' }}
          >
            <button
              onClick={() => setShowFunnel(false)}
              className="absolute top-4 right-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
              style={{ zIndex: 9999999 }}
            >
              Mode édition
            </button>
            
            {/* Contenu de l'écran - Rendu direct du canvas screen1 sans frame */}
            <div className="w-full h-full overflow-visible">
              <DesignCanvas
                editorMode={editorMode}
                screenId={currentScreen}
                selectedDevice="mobile"
                elements={canvasElements}
                onElementsChange={() => {}}
                background={activePreviewBackground}
                campaign={memoCampaignData}
                onCampaignChange={() => {}}
                zoom={1}
                enableInternalAutoFit={false}
                onZoomChange={() => {}}
                selectedElement={null}
                onSelectedElementChange={() => {}}
                selectedElements={[]}
                onSelectedElementsChange={() => {}}
                onElementUpdate={() => {}}
                extractedColors={extractedColors}
                quizModalConfig={undefined}
                containerClassName="!p-0 !m-0 !items-start !justify-start !pt-0 !rounded-none"
                elementFilter={previewElementFilter}
                onShowAnimationsPanel={() => {}}
                onShowPositionPanel={() => {}}
                onShowDesignPanel={() => {}}
                onShowEffectsPanel={() => {}}
                readOnly={true}
                isPreviewMode={true}
                modularModules={activePreviewModules}
                onModuleUpdate={() => {}}
                onModuleDelete={() => {}}
                onModuleMove={() => {}}
                onModuleDuplicate={() => {}}
                onFormSubmit={() => handleFormSubmit({})}
              />
            </div>
          </div>
        ) : showFunnel ? (
          /* Full Screen Preview Mode - Clone strict de l'écran 1 (DESKTOP) */
          <div 
            className="group fixed inset-0 z-40 w-full h-[100dvh] min-h-[100dvh] overflow-visible"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Floating Edit Mode Button */}
            <button
              onClick={() => setShowFunnel(false)}
              className={`absolute top-4 ${previewButtonSide === 'left' ? 'left-4' : 'right-4'} px-4 py-2 bg-[#44444d] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#44444d] shadow-none focus:shadow-none ring-0 focus:ring-0 drop-shadow-none filter-none backdrop-blur-0`}
              style={{ zIndex: 9999999 }}
            >
              Mode édition
            </button>
            
            {/* Clone strict du canvas preview 1 en plein écran - SANS MARGES */}
            <div className="w-full h-full" style={{ borderRadius: 0 }}>
              <style>{`
                /* Force suppression de tous les border-radius en mode preview */
                .design-canvas-container,
                [data-canvas-root],
                .canvas-viewport {
                  border-radius: 0 !important;
                }
                
                /* Force le conteneur principal à remplir tout l'écran */
                .design-canvas-container {
                  width: 100vw !important;
                  height: 100vh !important;
                  max-width: 100vw !important;
                  max-height: 100vh !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  right: 0 !important;
                  bottom: 0 !important;
                  display: flex !important;
                  align-items: flex-start !important;
                  justify-content: flex-start !important;
                }
                
                /* Force le canvas root à remplir l'écran */
                [data-canvas-root] {
                  width: 100vw !important;
                  height: 100vh !important;
                  max-width: 100vw !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                
                /* Force le viewport à remplir l'écran */
                .canvas-viewport {
                  width: 100vw !important;
                  height: 100vh !important;
                  max-width: 100vw !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                
                /* Masquer tous les éléments d'édition en mode preview */
                .safe-zone,
                [class*="safe-zone"],
                [class*="SafeZone"],
                [data-safe-zone],
                .grid-overlay,
                [class*="grid-overlay"],
                [class*="GridOverlay"],
                .canvas-toolbar,
                [class*="canvas-toolbar"],
                [class*="CanvasToolbar"],
                .quiz-settings-button,
                [class*="quiz-settings"],
                [class*="QuizSettings"],
                button[title*="grille"],
                button[title*="Grille"],
                button[aria-label*="grille"],
                button[aria-label*="Grille"],
                [data-grid-button],
                [data-template-settings],
                /* Masquer les bordures pointillées - SAUF les modules de contenu */
                *[style*="border"][style*="dashed"]:not([class*="module"]):not([data-module]):not([class*="text"]):not([class*="bloc"]),
                *[style*="border-style: dashed"]:not([class*="module"]):not([data-module]):not([class*="text"]):not([class*="bloc"]),
                *[style*="border: 2px dashed"]:not([class*="module"]):not([data-module]):not([class*="text"]):not([class*="bloc"]),
                *[style*="border: 1px dashed"]:not([class*="module"]):not([data-module]):not([class*="text"]):not([class*="bloc"]),
                *[class*="border-dashed"]:not([class*="module"]):not([data-module]):not([class*="text"]):not([class*="bloc"]),
                /* Masquer le bouton violet en bas à droite */
                .fixed.bottom-6.right-6,
                .fixed.bottom-4.right-4,
                button[style*="radial-gradient"],
                button[class*="bg-purple"],
                button[class*="bg-violet"] {
                  display: none !important;
                  visibility: hidden !important;
                  opacity: 0 !important;
                }
                
                /* Masquer uniquement les boutons d'action d'édition */
                .design-canvas-container button[class*="delete"],
                .design-canvas-container button[class*="duplicate"],
                .design-canvas-container button[class*="move"],
                .design-canvas-container button[class*="edit"],
                .design-canvas-container button[class*="resize"],
                .design-canvas-container button[class*="drag"],
                .design-canvas-container button[title*="Supprimer"],
                .design-canvas-container button[title*="Dupliquer"],
                .design-canvas-container button[title*="Déplacer"],
                .design-canvas-container button[aria-label*="Supprimer"],
                .design-canvas-container button[aria-label*="Dupliquer"],
                .design-canvas-container button[aria-label*="Déplacer"],
                .design-canvas-container [class*="module-actions"],
                .design-canvas-container [class*="element-actions"],
                .design-canvas-container [class*="resize-handle"],
                .design-canvas-container [class*="drag-handle"],
                .design-canvas-container [data-resize-handle],
                .design-canvas-container [data-drag-handle],
                .design-canvas-container .resize-handle,
                .design-canvas-container .drag-handle,
                /* Masquer l'icône de drag (6 points) au survol */
                .design-canvas-container button[style*="position: absolute"][style*="top"],
                .design-canvas-container button[style*="position: absolute"][style*="left"],
                .design-canvas-container div:hover > button[style*="position: absolute"],
                .design-canvas-container [class*="module"]:hover > button,
                .design-canvas-container [data-module]:hover > button,
                /* Masquer les poignées de redimensionnement par position */
                .design-canvas-container > div > button[style*="position: absolute"],
                .design-canvas-container [style*="cursor: nwse-resize"],
                .design-canvas-container [style*="cursor: nesw-resize"],
                .design-canvas-container [style*="cursor: ns-resize"],
                .design-canvas-container [style*="cursor: ew-resize"],
                /* Masquer les icônes de drag (6 points) - ULTRA AGRESSIF */
                .design-canvas-container button[style*="position: absolute"]:not(form button),
                .design-canvas-container button[style*="left"],
                .design-canvas-container button[style*="top"],
                .design-canvas-container > * > button,
                .design-canvas-container div > button:first-child,
                .design-canvas-container [class*="module"] > button,
                .design-canvas-container [data-module] > button,
                .design-canvas-container button[style*="width"][style*="height"][style*="position"],
                .design-canvas-container button:not(form button):not([type="submit"]):not([class*="Envoyer"]) {
                  display: none !important;
                  visibility: hidden !important;
                  opacity: 0 !important;
                  pointer-events: none !important;
                  z-index: -9999 !important;
                }
                
                /* Désactiver uniquement les effets visuels de survol */
                .design-canvas-container *:hover {
                  outline: none !important;
                  box-shadow: none !important;
                }
                
                /* Bloquer les interactions uniquement sur les modules texte */
                .design-canvas-container [class*="module"],
                .design-canvas-container [data-module],
                .design-canvas-container [class*="bloc"] {
                  pointer-events: none !important;
                  user-select: none !important;
                  -webkit-user-select: none !important;
                  -moz-user-select: none !important;
                  -ms-user-select: none !important;
                }
                
                /* Réactiver les interactions sur le formulaire */
                .design-canvas-container form,
                .design-canvas-container form *,
                .design-canvas-container input,
                .design-canvas-container textarea,
                .design-canvas-container button[type="submit"] {
                  pointer-events: auto !important;
                  user-select: auto !important;
                  -webkit-user-select: auto !important;
                  -moz-user-select: auto !important;
                  -ms-user-select: auto !important;
                }
              `}</style>
              {editorMode === 'article' && (
                <PreviewRenderer
                  articleConfig={getArticleConfigWithDefaults(campaignState, memoCampaignData)}
                  campaignType={(campaignState as any)?.type || 'form'}
                  campaign={memoCampaignData}
                  wheelModalConfig={undefined}
                  gameModalConfig={undefined}
                  currentStep={currentStep}
                  editable={false}
                  formFields={(campaignState as any)?.formFields}
                  onBannerChange={() => {}}
                  onBannerRemove={() => {}}
                  onTitleChange={() => {}}
                  onDescriptionChange={() => {}}
                  onCTAClick={handleCTAClick}
                  onFormSubmit={handleFormSubmit}
                  onGameComplete={handleGameComplete}
                  onStepChange={setCurrentStep}
                />
              )}
              <DesignCanvas
                editorMode={editorMode}
                screenId={currentScreen}
                selectedDevice={selectedDevice}
                elements={canvasElements}
                onElementsChange={() => {}}
                background={activePreviewBackground}
                campaign={memoCampaignData}
                onCampaignChange={() => {}}
                zoom={1}
                enableInternalAutoFit={false}
                onZoomChange={() => {}}
                selectedElement={null}
                onSelectedElementChange={() => {}}
                selectedElements={[]}
                onSelectedElementsChange={() => {}}
                onElementUpdate={() => {}}
                extractedColors={extractedColors}
                quizModalConfig={undefined}
                containerClassName="!p-0 !m-0 bg-white !items-start !justify-start !pt-0 !rounded-none"
                elementFilter={previewElementFilter}
                onShowAnimationsPanel={() => {}}
                onShowPositionPanel={() => {}}
                onShowDesignPanel={() => {}}
                onShowEffectsPanel={() => {}}
                readOnly={true}
                isPreviewMode={true}
                modularModules={activePreviewModules}
                onModuleUpdate={() => {}}
                onModuleDelete={() => {}}
                onModuleMove={() => {}}
                onModuleDuplicate={() => {}}
                onFormSubmit={() => handleFormSubmit({})}
              />
            </div>
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
                showAnimationsPanel={showAnimationsInSidebar}
                onAnimationsPanelChange={setShowAnimationsInSidebar}
                showPositionPanel={showPositionInSidebar}
                onPositionPanelChange={setShowPositionInSidebar}
                showQuizPanel={showQuizPanel}
                onQuizPanelChange={setShowQuizPanel}
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
            <div
              className="flex-1 canvas-scroll-area relative z-20 rounded-br-[18px] rounded-bl-none bg-white"
              style={{ borderBottomLeftRadius: '0 !important', backgroundColor: '#ffffff' }}
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
                      <ArticleFunnelView
                        articleConfig={getArticleConfigWithDefaults(campaignState, memoCampaignData)}
                        campaignType={(campaignState as any)?.type || 'form'}
                        campaign={memoCampaignData}
                        wheelModalConfig={undefined}
                        gameModalConfig={undefined}
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
                    background={screen1Background}
                    campaign={memoCampaignData}
                    onCampaignChange={handleCampaignConfigChange}
                    zoom={canvasZoom}
                    enableInternalAutoFit={true}
                    onZoomChange={setCanvasZoom}
                    selectedElement={selectedElement}
                    onSelectedElementChange={debugSetSelectedElement}
                    selectedElements={selectedElements}
                    onSelectedElementsChange={setSelectedElements}
                    onElementUpdate={handleElementUpdate}
                    onFormSubmit={() => handleFormSubmit({})}
                    // FORMEDITOR: Désactiver le quiz, afficher le formulaire à la place
                    extractedColors={extractedColors}
                    quizModalConfig={undefined}
                    containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                    elementFilter={getElementFilterForScreen('screen1')}
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
                    // Quiz panels
                    showQuizPanel={showQuizPanel}
                    onQuizPanelChange={setShowQuizPanel}
                    // Modular page (screen1)
                    modularModules={screen1Modules}
                    onModuleUpdate={handleUpdateModule}
                    onModuleDelete={handleDeleteModule}
                    onModuleMove={handleMoveModule}
                    onModuleDuplicate={handleDuplicateModule}
                  />
                </div>

                {/* Écran 2 (Sortie) - réintroduit uniquement en mode fullscreen */}
                {editorMode === 'fullscreen' && (
                  <div className="mt-4 relative" data-screen-anchor="screen2">
                    {/* Background pour éviter toute bande visible entre écrans */}
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        background:
                          canvasBackground.type === 'image'
                            ? `url(${canvasBackground.value}) center/cover no-repeat`
                            : canvasBackground.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
                      }}
                    />
                    {/* Espace blanc masquant la bande entre écrans */}
                    <div
                      className="absolute -top-4 left-0 right-0 h-4 z-0 bg-white"
                      style={{ background: '#ffffff' }}
                    />
                    <div className="relative z-10">
                      <DesignCanvas
                        editorMode={editorMode}
                        screenId="screen2"
                        ref={canvasRef}
                        selectedDevice={selectedDevice}
                        elements={canvasElements}
                        onElementsChange={setCanvasElements}
                        background={screenBackgrounds.screen2 || canvasBackground}
                        campaign={memoCampaignData}
                        onCampaignChange={handleCampaignConfigChange}
                        zoom={canvasZoom}
                        enableInternalAutoFit={true}
                        onZoomChange={setCanvasZoom}
                        selectedElement={selectedElement}
                        onSelectedElementChange={debugSetSelectedElement}
                        selectedElements={selectedElements}
                        onSelectedElementsChange={setSelectedElements}
                        onElementUpdate={handleElementUpdate}
                        extractedColors={extractedColors}
                        quizModalConfig={undefined}
                        hideInlineQuizPreview
                        containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                        elementFilter={getElementFilterForScreen('screen2')}
                        onShowEffectsPanel={() => {
                          if (!isWindowMobile) {
                            setShowEffectsInSidebar(true);
                            setShowAnimationsInSidebar(false);
                            setShowPositionInSidebar(false);
                          }
                        }}
                        modularModules={modularPage.screens.screen2}
                        onModuleUpdate={handleUpdateModule}
                        onModuleDelete={handleDeleteModule}
                        onModuleMove={handleMoveModule}
                        onModuleDuplicate={handleDuplicateModule}
                      />
                    </div>
                  </div>
                )}

                {/* close min-h-full flex container */}
              </div>
              {/* close canvas-scroll-area container */}
            </div>

              {/* Screen 2 removed in fullscreen mode */}
                {/* Zoom Slider with integrated Screen navigation button */}
            {!isWindowMobile && (
              <ZoomSlider 
                zoom={canvasZoom}
                onZoomChange={setCanvasZoom}
                minZoom={0.1}
                maxZoom={1}
                step={0.05}
                onNavigateToScreen2={() => {
                  const nextScreen = currentScreen === 'screen1' ? 'screen2' : 'screen1';
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
                placeholder="Ex: Collecte Leads Novembre"
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
    </MobileStableEditor>
  </div>
);
};

export default FormEditorLayout;
