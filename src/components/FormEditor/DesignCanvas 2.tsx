// @ts-nocheck
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from '../DesignEditor/CanvasElement';
import CanvasToolbar from './CanvasToolbar';
import TemplatedQuiz from '../shared/TemplatedQuiz';
import DynamicContactForm from '../forms/DynamicContactForm';
import { DEFAULT_FIELDS } from '../../utils/wheelConfig';
import SmartAlignmentGuides from '../DesignEditor/components/SmartAlignmentGuides';
import AlignmentToolbar from '../DesignEditor/components/AlignmentToolbar';
import GridOverlay from '../DesignEditor/components/GridOverlay';
import QuizSettingsButton from './components/QuizSettingsButton';
import GroupSelectionFrame from '../DesignEditor/components/GroupSelectionFrame';
import { useAutoResponsive } from '../../hooks/useAutoResponsive';
import { useSmartSnapping } from '../ModernEditor/hooks/useSmartSnapping';
import { useAlignmentSystem } from '../DesignEditor/hooks/useAlignmentSystem';
import { useAdvancedCache } from '../ModernEditor/hooks/useAdvancedCache';
import { useAdaptiveAutoSave } from '../ModernEditor/hooks/useAdaptiveAutoSave';
import { useVirtualizedCanvas } from '../ModernEditor/hooks/useVirtualizedCanvas';
import { useEditorStore } from '../../stores/editorStore';
import CanvasContextMenu from '../DesignEditor/components/CanvasContextMenu';
import { ScreenLayoutWrapper, useLayoutFromCampaign } from '../Layout/ScreenLayoutWrapper';

import AnimationSettingsPopup from '../DesignEditor/panels/AnimationSettingsPopup';

import MobileResponsiveLayout from '../DesignEditor/components/MobileResponsiveLayout';
import type { DeviceType } from '../../utils/deviceDimensions';
import { isRealMobile } from '../../utils/isRealMobile';
import ModularCanvas from './modules/ModularCanvas';
import { QuizModuleRenderer } from './QuizRenderer';
import type { Module } from '@/types/modularEditor';

// Import pour le mode Article
import ArticleCanvas from '../ArticleEditor/ArticleCanvas';
import { DEFAULT_ARTICLE_CONFIG } from '../ArticleEditor/types/ArticleTypes';

type CanvasScreenId = 'screen1' | 'screen2' | 'screen3' | 'all';

const SAFE_ZONE_PADDING: Record<DeviceType, number> = {
  desktop: 56,
  tablet: 40,
  mobile: 28
};

const SAFE_ZONE_RADIUS: Record<DeviceType, number> = {
  desktop: 32,
  tablet: 28,
  mobile: 24
};

export interface DesignCanvasProps {
  editorMode?: 'fullscreen' | 'article'; // Mode Article ou Fullscreen
  screenId?: CanvasScreenId;
  selectedDevice: DeviceType;
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  background?: {
    type: 'color' | 'image';
    value: string;
  };
  overlayElements?: Array<{
    id: string;
    type: 'text' | 'image';
    content?: string;
    text?: string;
    src?: string;
    alt?: string;
    style: React.CSSProperties;
  }>;
  campaign?: any;
  onCampaignChange?: (campaign: any) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  selectedElement?: any;
  onSelectedElementChange?: (element: any) => void;
  selectedElements?: any[];
  onSelectedElementsChange?: (elements: any[]) => void;
  onElementUpdate?: (updates: any) => void;
  onFormSubmit?: () => void;
  // Report union of DOM-measured element bounds (canvas-space) to parent for auto-fit
  onContentBoundsChange?: (bounds: { x: number; y: number; width: number; height: number } | null) => void;
  // Props pour la gestion des groupes
  selectedGroupId?: string;
  onSelectedGroupChange?: (groupId: string | null) => void;
  groups?: any[];
  onGroupMove?: (groupId: string, deltaX: number, deltaY: number) => void;
  onGroupResize?: (groupId: string, bounds: any) => void;
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
  onShowPositionPanel?: () => void;
  onShowDesignPanel?: () => void;
  onOpenElementsTab?: () => void;
  // Props pour la sidebar mobile
  onAddElement?: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  // Props pour la toolbar mobile
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Optionally enable internal one-time auto-fit (disabled by default; parent should manage auto-fit)
  enableInternalAutoFit?: boolean;
  // Quiz configuration sync props
  quizModalConfig?: any;
  extractedColors?: string[];
  updateQuizConfig?: (updates: any) => void;
  getCanonicalConfig?: (options?: { device?: string; shouldCropQuiz?: boolean }) => any;
  // Inline quiz panel controls
  showQuizPanel?: boolean;
  onQuizPanelChange?: (show: boolean) => void;
  // Read-only mode to disable interactions
  readOnly?: boolean;
  // Optional classes for the outer container (e.g., to override background color)
  containerClassName?: string;
  hideInlineQuizPreview?: boolean;
  elementFilter?: (element: any) => boolean;
  // Modular editor props
  modularModules?: Module[];
  onModuleUpdate?: (id: string, patch: Partial<Module>) => void;
  onModuleDelete?: (id: string) => void;
  onModuleMove?: (id: string, dir: 'up' | 'down') => void;
  onModuleDuplicate?: (id: string) => void;
  // Preview mode flag to disable rounded corners
  isPreviewMode?: boolean;
}

const DesignCanvas = React.forwardRef<HTMLDivElement, DesignCanvasProps>(({ 
  editorMode = 'fullscreen',
  screenId = 'screen1',
  selectedDevice,
  elements = [],
  onElementsChange = () => {},
  background,
  campaign,
  overlayElements,
  onCampaignChange,
  zoom = 1,
  onZoomChange,
  selectedElement: externalSelectedElement,
  onSelectedElementChange,
  selectedElements = [],
  onSelectedElementsChange = () => {},
  onElementUpdate: externalOnElementUpdate,
  // Props pour la gestion des groupes
  selectedGroupId,
  onSelectedGroupChange,
  groups,
  onGroupMove,
  onGroupResize,
  onShowEffectsPanel,
  onShowAnimationsPanel,
  onShowPositionPanel,
  onShowDesignPanel,
  onOpenElementsTab,
  // Props pour la sidebar mobile
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  // Props pour la toolbar mobile
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  enableInternalAutoFit = false,
  onContentBoundsChange,
  onQuizPanelChange,
  readOnly = false,
  containerClassName,
  updateQuizConfig,
  getCanonicalConfig,
  quizModalConfig,
  extractedColors,
  hideInlineQuizPreview = false,
  elementFilter,
  // Modular editor props
  modularModules,
  onModuleUpdate,
  onModuleDelete,
  onModuleMove,
  onModuleDuplicate,
  onFormSubmit
}, ref) => {

  // MODE ARTICLE
  if (editorMode === 'article') {
    const articleConfig = campaign?.articleConfig || DEFAULT_ARTICLE_CONFIG;
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <ArticleCanvas
          articleConfig={articleConfig}
          onBannerChange={(imageUrl) => {
            if (onCampaignChange && campaign) {
              onCampaignChange({ ...campaign, articleConfig: { ...articleConfig, banner: { ...articleConfig.banner, imageUrl } } });
            }
          }}
          onBannerRemove={() => {
            if (onCampaignChange && campaign) {
              onCampaignChange({ ...campaign, articleConfig: { ...articleConfig, banner: { ...articleConfig.banner, imageUrl: undefined } } });
            }
          }}
          onTitleChange={(title) => {
            if (onCampaignChange && campaign) {
              onCampaignChange({ ...campaign, articleConfig: { ...articleConfig, content: { ...articleConfig.content, title } } });
            }
          }}
          onDescriptionChange={(description) => {
            if (onCampaignChange && campaign) {
              onCampaignChange({ ...campaign, articleConfig: { ...articleConfig, content: { ...articleConfig.content, description } } });
            }
          }}
          onCTAClick={() => console.log('🎯 Article CTA clicked')}
          currentStep="article"
          editable={!readOnly}
          maxWidth={810}
          campaignType={campaign?.type || 'form'}
        />
      </div>
    );
  }

  // MODE FULLSCREEN
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoFitEnabledRef = useRef(true);
  
  // Utiliser la référence externe si fournie, sinon utiliser la référence interne
  const activeCanvasRef = ref || canvasRef;
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  // Always start with a valid numeric zoom (fallback 1). Clamp to [0.1, 1].
  const [localZoom, setLocalZoom] = useState<number>(
    typeof zoom === 'number' && !Number.isNaN(zoom)
      ? Math.max(0.1, Math.min(1, zoom))
      : 1
  );
  
  // Synchroniser le zoom depuis la prop externe (ZoomSlider)
  useEffect(() => {
    // Synchroniser depuis le prop uniquement s'il est valide
    if (typeof zoom === 'number' && !Number.isNaN(zoom)) {
      const clamped = Math.max(0.1, Math.min(1, zoom));
      // Éviter les mises à jour inutiles
      if (Math.abs(clamped - localZoom) > 0.0001) {
        setLocalZoom(clamped);
      }
    }
  }, [zoom, localZoom]);
  
  // Pan offset in screen pixels, applied before scale with origin at center for stable centering
  const [panOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  // Local override for per-screen background images (stored per device to maintain distinct images)
  const [deviceBackgrounds, setDeviceBackgrounds] = useState<Record<string, string | null>>({
    desktop: null,
    tablet: null,
    mobile: null
  });
  
  const [showAnimationPopup, setShowAnimationPopup] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<any>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0});
  // Marquee selection state
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // Détection de la taille de fenêtre pour la responsivité
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const isWindowMobile = windowSize.height > windowSize.width && windowSize.width < 768;
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);

  // Suppress the next click-clear after a marquee drag completes
  const suppressNextClickClearRef = useRef(false);

  // Precise DOM-measured bounds per element (canvas-space units)
  const [measuredBounds, setMeasuredBounds] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});

  // Intégration du système auto-responsive (doit être défini avant effectiveCanvasSize)
  const { applyAutoResponsive, getPropertiesForDevice, DEVICE_DIMENSIONS } = useAutoResponsive();

  // Taille du canvas mémoïsée avec fallback robuste
  const canvasSize = useMemo(() => {
    const fallback = { width: 810, height: 1440 };
    try {
      const map = DEVICE_DIMENSIONS || {} as any;
      const val = map[selectedDevice as any];
      if (val && typeof val.width === 'number' && typeof val.height === 'number') return val;
    } catch {}
    return fallback;
  }, [selectedDevice, DEVICE_DIMENSIONS]);

  // Forcer un format mobile selon les dimensions de l'iPhone 14 Pro Max
  const effectiveCanvasSize = useMemo(() => {
    const mobileFallback = { width: 430, height: 932 };
    const defaultFallback = { width: 810, height: 1440 };
    if (selectedDevice === 'mobile') {
      return mobileFallback;
    }
    // Sécuriser quand canvasSize est indéfini
    if (!canvasSize || typeof canvasSize.width !== 'number' || typeof canvasSize.height !== 'number') {
      return defaultFallback;
    }
    return canvasSize;
  }, [selectedDevice, canvasSize]);

  const safeZonePadding = useMemo(() => SAFE_ZONE_PADDING[selectedDevice] ?? SAFE_ZONE_PADDING.desktop, [selectedDevice]);
  const safeZoneRadius = useMemo(() => SAFE_ZONE_RADIUS[selectedDevice] ?? SAFE_ZONE_RADIUS.desktop, [selectedDevice]);

  // Collect measured bounds from children (CanvasElement)
  const handleMeasureBounds = useCallback((id: string, rect: { x: number; y: number; width: number; height: number }) => {
    setMeasuredBounds(prev => {
      const prevRect = prev[id];
      // Avoid unnecessary state updates if unchanged
      if (prevRect && prevRect.x === rect.x && prevRect.y === rect.y && prevRect.width === rect.width && prevRect.height === rect.height) {
        return prev;
      }
      return { ...prev, [id]: rect };
    });
  }, []);

  useEffect(() => {
    if (!onElementsChange) return;
    if (!elements || elements.length === 0) return;

    let changed = false;
    const updated = elements.map((el: any) => {
      if (el?.type === 'text' && el.autoCenter && measuredBounds[el.id]) {
        const bounds = measuredBounds[el.id];
        const autoCenter = el.autoCenter;
        const wantsBoth = autoCenter === true || autoCenter === 'both';
        const wantsHorizontal = wantsBoth || autoCenter === 'horizontal';
        const wantsVertical = wantsBoth || autoCenter === 'vertical';

        if (!wantsHorizontal && !wantsVertical) {
          return { ...el, autoCenter: undefined };
        }

        const nextX = wantsHorizontal ? Math.max(0, (effectiveCanvasSize.width - bounds.width) / 2) : (el.x ?? 0);
        const nextY = wantsVertical ? Math.max(0, (effectiveCanvasSize.height - bounds.height) / 2) : (el.y ?? 0);
        const deviceKey = selectedDevice as 'desktop' | 'tablet' | 'mobile';
        const deviceProps = (el?.[deviceKey] || {}) as Record<string, unknown>;
        changed = true;
        return {
          ...el,
          x: nextX,
          y: nextY,
          autoCenter: undefined,
          [deviceKey]: {
            ...deviceProps,
            ...(wantsHorizontal ? { x: nextX } : {}),
            ...(wantsVertical ? { y: nextY } : {})
          }
        };
      }
      return el;
    });

    if (changed) {
      onElementsChange(updated);
    }
  }, [elements, measuredBounds, effectiveCanvasSize.width, effectiveCanvasSize.height, onElementsChange, selectedDevice]);

  // Export a lightweight overlay snapshot for preview consumption (positions, sizes, text)
  useEffect(() => {
    try {
      const visible = elements.filter((el: any) => {
        const targetScreen = (el?.screenId ?? 'screen1') as CanvasScreenId;
        return screenId === 'all' || targetScreen === 'all' || targetScreen === screenId;
      });
      const snapshot = {
        baseSize: { width: effectiveCanvasSize.width, height: effectiveCanvasSize.height },
        device: selectedDevice,
        screenId,
        items: visible.map((el: any) => {
          const devProps = getPropertiesForDevice(el, selectedDevice);
          return {
            id: String(el.id),
            type: el.type,
            text: el.text || el.content || '',
            src: el.src || '',
            x: Number(devProps?.x ?? el.x ?? 0),
            y: Number(devProps?.y ?? el.y ?? 0),
            width: Number(devProps?.width ?? el.width ?? 100),
            height: Number(devProps?.height ?? el.height ?? 30),
            fontSize: Number(devProps?.fontSize ?? el.fontSize ?? 16),
            color: el.color || (el.style && (el.style.color as any)) || undefined,
            textAlign: devProps?.textAlign || el.textAlign || undefined
          };
        })
      };

      const json = JSON.stringify(snapshot);
      const devicesToPersist: Array<'desktop' | 'tablet' | 'mobile'> = selectedDevice === 'mobile' ? ['mobile'] : ['desktop', 'tablet'];
      devicesToPersist.forEach((d) => {
        try { localStorage.setItem(`quiz-layer-${d}-${screenId}`, json); } catch {}
      });
      // notify preview to refresh
      try { window.dispatchEvent(new CustomEvent('quiz-layer-sync', { detail: { device: selectedDevice, screenId } })); } catch {}
    } catch {}
  }, [elements, selectedDevice, screenId, effectiveCanvasSize.width, effectiveCanvasSize.height, getPropertiesForDevice]);

  // Derive simplified alignment bounds preferring measured layout when available
  const alignmentElements = useMemo(() => {
    const visibleElements = elements.filter((el: any) => {
      const targetScreen = (el?.screenId ?? 'screen1') as CanvasScreenId;
      const screenMatches = screenId === 'all' || targetScreen === 'all' || targetScreen === screenId;
      if (!screenMatches) return false;
      if (typeof elementFilter === 'function' && !elementFilter(el)) return false;
      return true;
    });

    return visibleElements.map((el: any) => {
      const mb = measuredBounds[el.id];
      const x = (mb?.x != null) ? mb.x : Number(el.x) || 0;
      const y = (mb?.y != null) ? mb.y : Number(el.y) || 0;
      const width = (mb?.width != null) ? mb.width : Math.max(20, Number(el.width) || 100);
      const height = (mb?.height != null) ? mb.height : Math.max(20, Number(el.height) || 30);
      return { id: String(el.id), x, y, width, height, screenId: el?.screenId ?? null };
    });
  }, [elements, measuredBounds, elementFilter, screenId]);

  // Persist modular modules for this screen/device to localStorage so preview can read live changes
  useEffect(() => {
    try {
      const mods = Array.isArray(modularModules) ? modularModules : [];
      const json = JSON.stringify(mods);
      const devicesToPersist: Array<'desktop' | 'tablet' | 'mobile'> = selectedDevice === 'mobile' ? ['mobile'] : ['desktop', 'tablet'];
      const selectedCampaignId = useEditorStore.getState().selectedCampaignId;
      const campaignId = campaign?.id || selectedCampaignId;
      devicesToPersist.forEach((d) => {
        // CRITICAL: Always namespace with campaign ID to prevent cross-campaign contamination
        const key = campaignId ? `quiz-modules-${campaignId}-${d}-${screenId}` : `quiz-modules-${d}-${screenId}`;
        try { localStorage.setItem(key, json); } catch {}
      });
      try { window.dispatchEvent(new CustomEvent('quiz-modules-sync', { detail: { device: selectedDevice, screenId } })); } catch {}
    } catch {}
  }, [modularModules, selectedDevice, screenId, campaign?.id]);

  // Stable origin bounds for resize interactions to prevent drift
  const multiResizeOriginRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  // Per-element snapshot at resize start to avoid cumulative errors and apply per-element rules
  const multiResizeElementsSnapshotRef = useRef<Record<string, { absX: number; absY: number; width: number; height: number; fontSize?: number; parentAbsX: number; parentAbsY: number }>>({});
  const groupResizeOriginRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const groupResizeElementsSnapshotRef = useRef<Record<string, { absX: number; absY: number; width: number; height: number; fontSize?: number; parentAbsX: number; parentAbsY: number }>>({});

  // Compute union of bounds from selected elements if any, otherwise all measured elements
  const computeContentBounds = useCallback((): { x: number; y: number; width: number; height: number } | null => {
    // Prefer selected elements when available
    const source = (selectedElements && selectedElements.length > 0) ? selectedElements : elements;
    if (!source || source.length === 0) return null;
    const boxes = source
      .map((el: any) => measuredBounds[el.id])
      .filter(Boolean) as Array<{ x: number; y: number; width: number; height: number }>;
    if (boxes.length === 0) return null;
    const minX = Math.min(...boxes.map(b => b.x));
    const minY = Math.min(...boxes.map(b => b.y));
    const maxX = Math.max(...boxes.map(b => b.x + b.width));
    const maxY = Math.max(...boxes.map(b => b.y + b.height));
    return { x: minX, y: minY, width: Math.max(0, maxX - minX), height: Math.max(0, maxY - minY) };
  }, [selectedElements, elements, measuredBounds]);

  // Emit content bounds changes upstream when they change
  const lastEmittedBoundsRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  useEffect(() => {
    if (!onContentBoundsChange) return;
    const bounds = computeContentBounds();
    const last = lastEmittedBoundsRef.current;
    const changed =
      !last ||
      !bounds ||
      Math.abs((bounds?.x || 0) - (last?.x || 0)) > 0.5 ||
      Math.abs((bounds?.y || 0) - (last?.y || 0)) > 0.5 ||
      Math.abs((bounds?.width || 0) - (last?.width || 0)) > 0.5 ||
      Math.abs((bounds?.height || 0) - (last?.height || 0)) > 0.5;
    if (changed) {
      lastEmittedBoundsRef.current = bounds;
      onContentBoundsChange(bounds);
    }
  }, [computeContentBounds, onContentBoundsChange]);

  // Références pour lisser les mises à jour de zoom
  const rafRef = useRef<number | null>(null);
  const pendingZoomRef = useRef<number | null>(null);
  
  // État pour le menu contextuel global du canvas
  
  // Use global clipboard from Zustand
  const clipboard = useEditorStore(state => state.clipboard);

  // Mesure dynamique de la hauteur de la toolbar mobile
  useEffect(() => {
    if (!isRealMobile()) return;
    const updateHeight = () => {
      const toolbar = document.getElementById('mobile-toolbar');
      const height = toolbar?.getBoundingClientRect().height || 0;
      // Using the height value to prevent unused warning
      console.debug('Mobile toolbar height:', height);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
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

  // Gestion du pinch-to-zoom fluide sur mobile
  useEffect(() => {
    if (!isRealMobile()) return;
    
    const canvas = (typeof activeCanvasRef === 'object' ? (activeCanvasRef as React.RefObject<HTMLDivElement | null>).current : null);
    if (!canvas) return;

    let initialDistance = 0;
    let initialZoom = 1;
    let isPinching = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinching = true;
        initialZoom = localZoom;
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isPinching && e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (initialDistance > 0) {
          const scale = currentDistance / initialDistance;
          const newZoom = Math.max(0.1, Math.min(2, initialZoom * scale));
          
          // Appliquer le zoom avec une transition fluide
          requestAnimationFrame(() => {
            onZoomChange?.(newZoom);
          });
        }
        e.preventDefault();
      }
    };

    const handleTouchEnd = (_e: TouchEvent) => {
      if (isPinching) {
        isPinching = false;
      }
    };

    // Ajouter les event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [localZoom, onZoomChange, activeCanvasRef]);

  // Listen for per-screen background apply and store a local override for this canvas screen & device
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { url?: string; screenId?: 'screen1' | 'screen2' | 'screen3'; device?: 'desktop' | 'tablet' | 'mobile' } | undefined;
      if (!detail || typeof detail.url !== 'string') return;
      if (detail.screenId === (screenId as any)) {
        const targetDevice = detail.device || selectedDevice;
        // Upload background for device
        // Mettre à jour l'état pour l'appareil spécifique
        setDeviceBackgrounds(prev => ({
          ...prev,
          [targetDevice]: detail.url || null
        }));
        // Persister pour le preview (clé par device + screen)
        try {
          const devicesToPersist: Array<'desktop' | 'tablet' | 'mobile'> =
            targetDevice === 'mobile' ? ['mobile'] : ['desktop', 'tablet'];
          const selectedCampaignId = useEditorStore.getState().selectedCampaignId;
          const campaignId = campaign?.id || selectedCampaignId;
          devicesToPersist.forEach((d) => {
            // CRITICAL: Always namespace with campaign ID, never use 'global'
            const key = campaignId ? `quiz-bg-${campaignId}-${d}-${screenId}` : `quiz-bg-temp-${d}-${screenId}`;
            try { localStorage.setItem(key as string, detail.url || ''); } catch {}
          });
        } catch {}
        // Synchroniser les autres canvas du même écran
        try {
          // Background set in-memory
          window.dispatchEvent(new CustomEvent('quiz-bg-sync', { detail: { screenId: detail.screenId } }));
        } catch {}
      }
    };
    window.addEventListener('applyBackgroundCurrentScreen', handler as EventListener);
    return () => window.removeEventListener('applyBackgroundCurrentScreen', handler as EventListener);
  }, [screenId, selectedDevice]);

  // Listen for device-scoped apply to all screens; apply to ALL screens for the specified device
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { url?: string; device?: 'desktop' | 'tablet' | 'mobile' } | undefined;
      if (!detail || typeof detail.url !== 'string') return;
      const targetDevice = detail.device || selectedDevice;
      // Apply background to all screens
      // Appliquer à TOUS les écrans (pas de vérification de screenId)
      // Mettre à jour l'état pour l'appareil spécifique
      setDeviceBackgrounds(prev => ({
        ...prev,
        [targetDevice]: detail.url || null
      }));
      // Persister pour tous les écrans afin que le preview puisse lire la valeur
      try {
        const screens: Array<'screen1' | 'screen2' | 'screen3'> = ['screen1', 'screen2', 'screen3'];
        const devicesToPersist: Array<'desktop' | 'tablet' | 'mobile'> =
          targetDevice === 'mobile' ? ['mobile'] : ['desktop', 'tablet'];
        const selectedCampaignId = useEditorStore.getState().selectedCampaignId;
        const campaignId = campaign?.id || selectedCampaignId;
        devicesToPersist.forEach((d) => {
          screens.forEach((s) => {
            // CRITICAL: Always namespace with campaign ID, never use 'global'
            const key = campaignId ? `quiz-bg-${campaignId}-${d}-${s}` : `quiz-bg-temp-${d}-${s}`;
            try { localStorage.setItem(key, detail.url || ''); } catch {}
          });
        });
        // Store campaign ID as owner for validation
        try { if (campaignId) localStorage.setItem(`quiz-bg-owner-${campaignId}`, String(campaignId)); } catch {}
      } catch {}
      try {
        // Applied background to device
      } catch {}
    };
    window.addEventListener('applyBackgroundAllScreens', handler as EventListener);
    return () => window.removeEventListener('applyBackgroundAllScreens', handler as EventListener);
  }, [screenId, selectedDevice]);

  // Listen for clear backgrounds on other screens (when unchecking "apply to all")
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { device?: 'desktop' | 'tablet' | 'mobile'; keepScreenId?: string } | undefined;
      if (!detail) return;
      const targetDevice = detail.device || selectedDevice;
      // Si ce n'est pas l'écran à conserver, supprimer le background pour ce device
      if (detail.keepScreenId !== screenId) {
        // Clearing background
        setDeviceBackgrounds(prev => ({
          ...prev,
          [targetDevice]: null
        }));
        try {
          const selectedCampaignId = useEditorStore.getState().selectedCampaignId;
          const campaignId = campaign?.id || selectedCampaignId;
          const key = campaignId ? `quiz-bg-${campaignId}-${targetDevice}-${screenId}` : `quiz-bg-temp-${targetDevice}-${screenId}`;
          localStorage.removeItem(key);
        } catch {}
      }
    };
    window.addEventListener('clearBackgroundOtherScreens', handler as EventListener);
    return () => window.removeEventListener('clearBackgroundOtherScreens', handler as EventListener);
  }, [screenId, selectedDevice]);

  // Hydrater localStorage depuis l'état de campagne au montage/changement d'écran (ne pas effacer)
  useEffect(() => {
    try {
      const scrBG = (campaign?.canvasConfig?.screenBackgrounds || campaign?.design?.screenBackgrounds || {}) as Record<string, any>;
      const screenBg = scrBG?.[screenId];
      if (screenBg?.type === 'image' && screenBg.value) {
        const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
        const selectedCampaignId = useEditorStore.getState().selectedCampaignId;
        const campaignId = campaign?.id || selectedCampaignId;
        devices.forEach((d) => {
          const key = campaignId ? `quiz-bg-${campaignId}-${d}-${screenId}` : `quiz-bg-temp-${d}-${screenId}`;
          try { localStorage.setItem(key, screenBg.value); } catch {}
        });
        try { if (campaignId) localStorage.setItem(`quiz-bg-owner-${campaignId}`, String(campaignId)); } catch {}
        setDeviceBackgrounds((prev) => ({ ...prev, desktop: screenBg.value, tablet: screenBg.value, mobile: screenBg.value }));
      }
    } catch {}
  }, [screenId, campaign]);

  // Relecture résiliente depuis localStorage (au montage/retour focus) pour restaurer les fonds en mode édition
  useEffect(() => {
    const applyFromLocalStorage = () => {
      try {
        const selectedCampaignId = useEditorStore.getState().selectedCampaignId;
        const campaignId = campaign?.id || selectedCampaignId;
        if (!campaignId) return;
        
        const owner = (() => { try { return localStorage.getItem(`quiz-bg-owner-${campaignId}`); } catch { return null; } })();
        const currentId = String(campaignId);
        if (!owner || owner !== currentId) return;
        
        const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
        const vals: Partial<Record<'desktop' | 'tablet' | 'mobile', string | null>> = {};
        devices.forEach((d) => {
          const key = `quiz-bg-${campaignId}-${d}-${screenId}`;
          try { vals[d] = localStorage.getItem(key); } catch { vals[d] = null; }
        });
        const anyVal = vals.desktop || vals.tablet || vals.mobile;
        if (anyVal) {
          setDeviceBackgrounds(prev => ({
            ...prev,
            desktop: vals.desktop || prev.desktop,
            tablet: vals.tablet || prev.tablet,
            mobile: vals.mobile || prev.mobile
          }));
        }
      } catch {}
    };
    // Initial apply on mount
    applyFromLocalStorage();
    // Re-apply when window regains focus or page is shown (return from preview)
    window.addEventListener('focus', applyFromLocalStorage);
    window.addEventListener('pageshow', applyFromLocalStorage);
    return () => {
      window.removeEventListener('focus', applyFromLocalStorage);
      window.removeEventListener('pageshow', applyFromLocalStorage);
    };
  }, [screenId]);

  // Écouter la synchronisation globale de fond envoyée par le layout
  useEffect(() => {
    const onEditorBackgroundSync = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail || {};
      if (detail?.reason === 'mount-clear') {
        try {
          const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
          const selectedCampaignId = useEditorStore.getState().selectedCampaignId;
          const campaignId = campaign?.id || selectedCampaignId;
          // Nettoyer toutes les clés persistées pour CE screenId
          devices.forEach((d) => {
            const key = campaignId ? `quiz-bg-${campaignId}-${d}-${screenId}` : `quiz-bg-temp-${d}-${screenId}`;
            try { localStorage.removeItem(key); } catch {}
          });
          // Réinitialiser les overrides en mémoire pour ne pas afficher d'image
          setDeviceBackgrounds({ desktop: null, tablet: null, mobile: null });
          // Cleared device backgrounds
        } catch {}
      }
    };
    window.addEventListener('editor-background-sync', onEditorBackgroundSync as EventListener);
    return () => window.removeEventListener('editor-background-sync', onEditorBackgroundSync as EventListener);
  }, [screenId]);

  // Synchroniser avec les autres canvas du même écran
  useEffect(() => {
    const handleStorageSync = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { screenId?: string } | undefined;
      if (detail?.screenId === screenId) {
        // Synchronisation inter-canvas: garder l'état en mémoire uniquement
        setDeviceBackgrounds(prev => ({ ...prev }));
      }
    };
    window.addEventListener('quiz-bg-sync', handleStorageSync as EventListener);
    return () => window.removeEventListener('quiz-bg-sync', handleStorageSync as EventListener);
  }, [screenId]);

  // Optimisation mobile pour une expérience tactile parfaite

  // Memoized maps for fast lookups during interactions
  const elementById = useMemo(() => {
    const m = new Map<string, any>();
    for (const el of elements) m.set(el.id, el);
    return m;
  }, [elements]);

  const devicePropsById = useMemo(() => {
    const m = new Map<string, any>();
    for (const el of elements) m.set(el.id, getPropertiesForDevice(el, selectedDevice));
    return m;
  }, [elements, selectedDevice, getPropertiesForDevice]);

  // 🚀 Cache intelligent pour optimiser les performances (moved earlier to avoid TDZ)
  const elementCache = useAdvancedCache({
    maxSize: 5 * 1024 * 1024, // 5MB pour commencer
    maxEntries: 200,
    ttl: 10 * 60 * 1000, // 10 minutes
    enableCompression: true,
    storageKey: 'design-canvas-cache'
  });

  // 🚀 Auto-save adaptatif pour une sauvegarde intelligente (moved earlier)
  const { updateData: updateAutoSaveData, recordActivity } = useAdaptiveAutoSave({
    onSave: async (data) => {
      if (onCampaignChange) {
        onCampaignChange(data);
      }
    },
    baseDelay: 2000, // 2 secondes de base
    minDelay: 500,   // Minimum 500ms
    maxDelay: 8000,  // Maximum 8 secondes
    onSaveSuccess: () => {
      console.log('✓ Sauvegarde automatique réussie');
    },
    onError: (error) => {
      console.warn('⚠️ Erreur de sauvegarde automatique:', error);
    }
  });

  // Hooks optimisés pour snapping (moved earlier)
  const { applySnapping } = useSmartSnapping({
    containerRef: activeCanvasRef,
    gridSize: 20,
    snapTolerance: 3, // Réduit pour plus de précision
    elements: alignmentElements
  });

  // Store centralisé pour la grille
  const { showGridLines, setShowGridLines } = useEditorStore();

  // Nouveau système d'alignement simple et efficace
  const {
    currentGuides,
    isDragging,
    snapElement,
    startDragging,
    stopDragging
  } = useAlignmentSystem({
    elements: alignmentElements,
    canvasSize: effectiveCanvasSize,
    zoom: localZoom,
    snapTolerance: 8,
    gridSize: 20,
    showGrid: showGridLines
  });


  // Handlers optimisés avec snapping et cache intelligent (moved earlier)
  const handleElementUpdate = useCallback((id: string, updates: any) => {
    const targetElement = elementById.get(id);

    // Utiliser la fonction externe si disponible
    if (externalOnElementUpdate && selectedElement === id) {
      try {
        externalOnElementUpdate({
          ...updates,
          _previousColor: targetElement?.color
        });
      } catch {}
    }

    // 🎯 Gérer les mises à jour de style pour les templates de quiz
    if (updates.borderRadius !== undefined && id === 'quiz-template') {
      console.log('🔄 Mise à jour du borderRadius du template quiz:', updates.borderRadius);
      
      // Mettre à jour la campagne
      if (onCampaignChange && campaign) {
        const updatedCampaign = { ...campaign };
        updatedCampaign.design = updatedCampaign.design || {};
        updatedCampaign.design.quizConfig = updatedCampaign.design.quizConfig || {};
        updatedCampaign.design.quizConfig.style = {
          ...(updatedCampaign.design.quizConfig.style || {}),
          borderRadius: updates.borderRadius
        };
        onCampaignChange(updatedCampaign);
      }
      
      // Forcer le re-render du TemplatedQuiz
      const event = new CustomEvent('quizStyleUpdate', { 
        detail: { borderRadius: updates.borderRadius } 
      });
      window.dispatchEvent(event);
    }

    // 🔒 Blocage des déplacements des enfants quand leur groupe parent est sélectionné
    // Si l'élément a un parentGroupId, et que ce groupe est actuellement sélectionné,
    // on ignore toute mise à jour de position (x/y) pour empêcher le déplacement indépendant.
    try {
      const el = elementById.get(id);
      const isChildOfActiveGroup = !!(el && (el as any).parentGroupId && selectedGroupId && (el as any).parentGroupId === selectedGroupId);
      const isPositionalUpdate = updates && ("x" in updates || "y" in updates);
      if (isChildOfActiveGroup && isPositionalUpdate) {
        // Ne rien faire: le déplacement des enfants est verrouillé quand le groupe est actif
        return;
      }
    } catch (e) {
      // Safe guard: en cas d'erreur, on laisse le flux normal
    }

    // Préparer les updates selon l'appareil courant (desktop = racine, mobile/tablet = scope par device)
    const deviceScopedKeys = ['x', 'y', 'width', 'height', 'fontSize', 'textAlign'];
    const isDeviceScoped = selectedDevice !== 'desktop';

    // Copier pour ne pas muter l'argument
    const workingUpdates: Record<string, any> = { ...updates };

    // Merge nested style objects instead of overwriting wholesale so effects accumulate correctly
    if (workingUpdates.style && targetElement?.style) {
      workingUpdates.style = {
        ...targetElement.style,
        ...workingUpdates.style
      };
    }

    if (workingUpdates.customCSS && targetElement?.customCSS) {
      workingUpdates.customCSS = {
        ...targetElement.customCSS,
        ...workingUpdates.customCSS
      };
    }

    if (workingUpdates.advancedStyle) {
      const previousAdvanced = targetElement?.advancedStyle || {};
      const nextAdvanced = workingUpdates.advancedStyle || {};
      workingUpdates.advancedStyle = {
        ...previousAdvanced,
        ...nextAdvanced,
        css: {
          ...(previousAdvanced as any).css,
          ...(nextAdvanced as any).css
        },
        params: nextAdvanced.params ?? (previousAdvanced as any).params
      };
    }
    const devicePatch: Record<string, any> = {};

    // Appliquer le nouveau système d'alignement si c'est un déplacement
    if (workingUpdates.x !== undefined && workingUpdates.y !== undefined) {
      const element = elementById.get(id);
      if (element) {
        const snapResult = snapElement({
          x: workingUpdates.x,
          y: workingUpdates.y,
          width: element.width || 100,
          height: element.height || 100,
          id
        });
        
        workingUpdates.x = snapResult.x;
        workingUpdates.y = snapResult.y;

        // Mettre en cache la position snappée pour optimiser les mouvements répétitifs
        const positionCacheKey = `snap-${id}-${Math.floor(workingUpdates.x/5)}-${Math.floor(workingUpdates.y/5)}`;
        elementCache.set(positionCacheKey, { x: workingUpdates.x, y: workingUpdates.y, timestamp: Date.now() });

        // Si l'élément est enfant d'un groupe, convertir en positions RELATIVES avant sauvegarde
        if ((element as any).parentGroupId) {
          const parentId = (element as any).parentGroupId as string;
          const parentProps = devicePropsById.get(parentId);
          if (parentProps) {
            const parentX = Number(parentProps.x) || 0;
            const parentY = Number(parentProps.y) || 0;
            workingUpdates.x = (Number(workingUpdates.x) || 0) - parentX;
            workingUpdates.y = (Number(workingUpdates.y) || 0) - parentY;
          }
        }

        // 🚧 Clamp aux limites du canvas (en coordonnées absolues)
        // NB: Pour les enfants de groupe, workingUpdates.x/y sont devenus relatifs après soustraction ci-dessus.
        // On doit donc clore en ABSOLU avant soustraction. Recalculons l'absolu pour clamping fiable.
        const elDeviceProps = getPropertiesForDevice(element, selectedDevice);
        const widthForClamp = Number(elDeviceProps.width ?? element.width ?? 100) || 100;
        const heightForClamp = Number(elDeviceProps.height ?? element.height ?? 100) || 100;

        // Reconstituer position ABSOLUE proposée
        const parentId = (element as any).parentGroupId;
        let absX = Number(workingUpdates.x) || 0;
        let absY = Number(workingUpdates.y) || 0;
        if (parentId) {
          const parentProps2 = devicePropsById.get(parentId);
          if (parentProps2) {
            absX = (Number(workingUpdates.x) || 0) + (Number(parentProps2.x) || 0);
            absY = (Number(workingUpdates.y) || 0) + (Number(parentProps2.y) || 0);
          }
        }

        const maxX = Math.max(0, (effectiveCanvasSize.width || 0) - widthForClamp);
        const maxY = Math.max(0, (effectiveCanvasSize.height || 0) - heightForClamp);
        const clampedAbsX = Math.min(Math.max(absX, 0), maxX);
        const clampedAbsY = Math.min(Math.max(absY, 0), maxY);

        // Convertir en relatif si nécessaire après clamping
        if (parentId) {
          const parentProps2 = devicePropsById.get(parentId);
          if (parentProps2) {
            const pX = Number(parentProps2.x) || 0;
            const pY = Number(parentProps2.y) || 0;
            workingUpdates.x = clampedAbsX - pX;
            workingUpdates.y = clampedAbsY - pY;
          } else {
            workingUpdates.x = clampedAbsX;
            workingUpdates.y = clampedAbsY;
          }
        } else {
          workingUpdates.x = clampedAbsX;
          workingUpdates.y = clampedAbsY;
        }
      }
    }

    if (isDeviceScoped) {
      // Extraire les props dépendantes de l'appareil
      for (const key of deviceScopedKeys) {
        if (workingUpdates[key] !== undefined) {
          devicePatch[key] = workingUpdates[key];
          delete workingUpdates[key];
        }
      }
    }

    // Vérifier le cache pour éviter les recalculs
    const cacheKey = `element-update-${id}-${JSON.stringify({ workingUpdates, devicePatch }).slice(0, 50)}`;
    const cachedResult = elementCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < 1000) {
      onElementsChange(cachedResult.elements);
      return;
    }

    const updatedElements = elements.map(el => {
      if (el.id !== id) return el;

      const base = { ...el, ...workingUpdates };
      if (isDeviceScoped) {
        const currentDeviceData = (el as any)[selectedDevice] || {};
        return {
          ...base,
          [selectedDevice]: {
            ...currentDeviceData,
            ...devicePatch
          }
        };
      }
      
      // Debug logging for zIndex updates
      if (workingUpdates.zIndex !== undefined) {
        console.log('🔄 handleElementUpdate - zIndex change:', {
          elementId: id,
          oldZIndex: el.zIndex,
          newZIndex: workingUpdates.zIndex,
          elementType: el.type
        });
      }
      
      // Propagate controls to modular modules when applicable
      if (el.id.startsWith('modular-text-')) {
        const moduleId = el.id.replace('modular-text-', '');
        const module = modularModules?.find((m) => m.id === moduleId && m.type === 'BlocTexte');
        if (module) {
          const patch: Partial<Module> & Record<string, any> = {};
          if (workingUpdates.fontFamily) patch.bodyFontFamily = workingUpdates.fontFamily;
          if (workingUpdates.color) patch.bodyColor = workingUpdates.color;
          if (workingUpdates.fontSize) patch.bodyFontSize = workingUpdates.fontSize;
          if (workingUpdates.fontWeight) patch.bodyBold = workingUpdates.fontWeight === 'bold';
          if (workingUpdates.fontStyle) patch.bodyItalic = workingUpdates.fontStyle === 'italic';
          if (workingUpdates.textDecoration) patch.bodyUnderline = workingUpdates.textDecoration?.includes('underline');
          if (Object.keys(patch).length > 0) onModuleUpdate?.(moduleId, patch);
        }
      }

      return base;
    });

    // Mettre en cache le résultat
    elementCache.set(cacheKey, { elements: updatedElements, timestamp: Date.now() });

    onElementsChange(updatedElements);

    // 🚀 Déclencher l'auto-save adaptatif avec activité intelligente
    const activityType = (updates.x !== undefined || updates.y !== undefined) ? 'drag' : 'click';
    const intensity = activityType === 'drag' ? 0.8 : 0.5;
    try {
      recordActivity(activityType, intensity);
    } catch {}
    updateAutoSaveData(campaign, activityType, intensity);
  }, [elements, onElementsChange, elementCache, updateAutoSaveData, campaign, externalOnElementUpdate, selectedElement, selectedDevice, selectedGroupId]);

  // Listen for text effects coming from BackgroundPanel and apply them to the current selection
  useEffect(() => {
    const onApplyTextEffect = (ev: Event) => {
      const e = ev as CustomEvent<any>;
      const detail = e.detail || {};
      if (selectedElement) {
        try {
          handleElementUpdate(selectedElement, detail);
        } catch (err) {
          console.warn('applyTextEffect handler failed', err);
        }
      }
    };
    window.addEventListener('applyTextEffect', onApplyTextEffect as EventListener);
    return () => window.removeEventListener('applyTextEffect', onApplyTextEffect as EventListener);
  }, [selectedElement, handleElementUpdate]);

  // Synchroniser la sélection avec l'état externe
  useEffect(() => {
    if (externalSelectedElement && externalSelectedElement.id !== selectedElement) {
      setSelectedElement(externalSelectedElement.id);
    }
  }, [externalSelectedElement]);

  // Synchroniser le zoom local avec le prop
  useEffect(() => {
    // Synchroniser depuis le prop uniquement s'il est valide
    if (typeof zoom === 'number' && !Number.isNaN(zoom)) {
      const clamped = Math.max(0.1, Math.min(1, zoom));
      // Éviter les mises à jour inutiles et considérer ceci comme un zoom manuel externe
      if (Math.abs(clamped - localZoom) > 0.0001) {
        // Un changement de zoom manuel doit désactiver l'auto-fit jusqu'au prochain resize/device
        autoFitEnabledRef.current = false;
        setLocalZoom(clamped);
      }
    }
  }, [zoom, localZoom]);

  // Définir le zoom par défaut selon l'appareil
  // - Mobile: 85%
  // - Tablette: 60%
  // - Desktop: 70%

  // Calculer le zoom par défaut selon l'appareil (pour le bouton reset)
  const deviceDefaultZoom = useMemo(() => {
    return selectedDevice === 'mobile' ? 0.85 :
           selectedDevice === 'tablet' ? 0.6 : 0.7;
  }, [selectedDevice]);

  // Unified Auto-Fit: observe container size and fit the canvas on any device
  const updateAutoFit = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    // Respect the auto-fit lock: skip recalculation if disabled by manual zoom
    if (!autoFitEnabledRef.current) return;

    const style = getComputedStyle(container);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;

    const availableWidth = Math.max(0, container.clientWidth - paddingLeft - paddingRight);
    const availableHeight = Math.max(0, container.clientHeight - paddingTop - paddingBottom);

    const targetW = effectiveCanvasSize.width;
    const targetH = effectiveCanvasSize.height;

    if (targetW > 0 && targetH > 0 && availableWidth > 0 && availableHeight > 0) {
      const scaleX = availableWidth / targetW;
      const scaleY = availableHeight / targetH;
      const fitted = Math.min(scaleX, scaleY, 1);
      const clamped = Math.max(0.1, Math.min(1, fitted));
      // Avoid thrashing state for tiny differences
      if (Math.abs(clamped - localZoom) > 0.001) {
        setLocalZoom(clamped);
        onZoomChange?.(clamped);
      }
    }
  }, [effectiveCanvasSize, localZoom, onZoomChange]);


  // One-time auto-fit on mount (only if explicitly enabled), then keep it disabled
  useEffect(() => {
    if (enableInternalAutoFit) {
      // Apply auto-fit exactly once when the page loads
      updateAutoFit();
    }
    // Then disable auto-fit so user zoom persists across interactions/resizes/device changes
    autoFitEnabledRef.current = false;
  }, [enableInternalAutoFit, updateAutoFit]);

  // Re-fit when switching device (e.g., desktop ↔ mobile) so the full canvas is visible
  useEffect(() => {
    if (!enableInternalAutoFit) return;
    autoFitEnabledRef.current = true;
    updateAutoFit();
    autoFitEnabledRef.current = false;
  }, [selectedDevice, enableInternalAutoFit, updateAutoFit]);

  // Do not auto-fit on resizes anymore; keep user's zoom unchanged
  useEffect(() => {
    // intentionally left blank
  }, []);

  // Handler centralisé pour changer le zoom depuis la barre d'échelle
  const handleZoomChange = useCallback((value: number) => {
    // Clamp le zoom entre 0.1 et 1.0 (100%)
    const clamped = Math.max(0.1, Math.min(1, value));
    // Manual slider zoom disables auto-fit temporarily
    autoFitEnabledRef.current = false;
    setLocalZoom(clamped);
    if (onZoomChange) {
      onZoomChange(clamped);
    }
  }, [onZoomChange]);

  // Keep references to avoid TS6133 when externally wired
  useEffect(() => { void deviceDefaultZoom; void handleZoomChange; }, [deviceDefaultZoom, handleZoomChange]);


  // Compute canvas-space coordinates from a pointer event
  const getCanvasPointFromClient = useCallback((clientX: number, clientY: number) => {
    const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement | null>).current;
    if (!canvasEl) return { x: 0, y: 0 };
    const rect = canvasEl.getBoundingClientRect();
    // rect is in CSS pixels and includes the scale; divide by zoom to get canvas-space
    const x = (clientX - rect.left) / localZoom;
    const y = (clientY - rect.top) / localZoom;
    return { x, y };
  }, [activeCanvasRef, localZoom]);

  // Begin marquee when clicking empty background
  const handleBackgroundPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (readOnly) return;
    // Allow marquee on all devices; treat touch specially
    // Only react to primary mouse button, but allow touch regardless of e.button
    if (e.pointerType === 'touch') {
      // Allow pinch-to-zoom; no marquee selection on touch
      return;
    }
    if (e.button !== 0) return;
    // Start suppression so the subsequent synthetic click won't clear selection
    suppressNextClickClearRef.current = true;
    console.debug('🟦 Marquee start (pointerdown)', { clientX: e.clientX, clientY: e.clientY });
    // Start marquee selection
    const pt = getCanvasPointFromClient(e.clientX, e.clientY);
    marqueeStartRef.current = pt;
    setMarqueeEnd(pt);
    setIsMarqueeActive(true);
    // Mark canvas as marquee-active so mobile canvas lock can bypass blocking
    const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement | null>).current;
    canvasEl?.setAttribute('data-marquee', 'active');

    // Clear single selection immediately; multi selection will be set on pointerup
    setSelectedElement(null);
    onSelectedElementChange?.(null);

    // Setup global listeners
    const onMove = (ev: PointerEvent) => {
      if (!marqueeStartRef.current) return;
      const p = getCanvasPointFromClient(ev.clientX, ev.clientY);
      setMarqueeEnd(p);
      // Lightweight debug to confirm moves are tracked
      // console.debug('🟦 Marquee move', { x: p.x, y: p.y });
    };
    const onCancel = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);
      // Reset marquee state without applying selection
      marqueeStartRef.current = null;
      setIsMarqueeActive(false);
      setMarqueeEnd(null);
      // Clear marquee-active flag on canvas
      const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement | null>).current;
      canvasEl?.removeAttribute('data-marquee');
      // Ensure suppression flag is cleared
      setTimeout(() => { suppressNextClickClearRef.current = false; }, 0);
      console.debug('🟦 Marquee canceled (pointercancel)');
    };
    const onUp = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);

      if (!marqueeStartRef.current) {
        setIsMarqueeActive(false);
        setMarqueeEnd(null);
        // Clear marquee-active flag on canvas
        const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement | null>).current;
        canvasEl?.removeAttribute('data-marquee');
        // Allow click-clear after event loop turn
        setTimeout(() => { suppressNextClickClearRef.current = false; }, 0);
        return;
      }
      const start = marqueeStartRef.current;
      const end = getCanvasPointFromClient(ev.clientX, ev.clientY);
      marqueeStartRef.current = null;

      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const maxX = Math.max(start.x, end.x);
      const maxY = Math.max(start.y, end.y);
      const width = maxX - minX;
      const height = maxY - minY;

      // If tiny drag (click), just clear multi-selection
      const isTouch = ev.pointerType === 'touch';
      const MIN_SIZE = isTouch ? 12 : 3; // larger threshold on touch
      if (width < MIN_SIZE && height < MIN_SIZE) {
        onSelectedElementsChange?.([]);
        setIsMarqueeActive(false);
        setMarqueeEnd(null);
        // Clear marquee-active flag on canvas
        const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement | null>).current;
        canvasEl?.removeAttribute('data-marquee');
        setTimeout(() => { suppressNextClickClearRef.current = false; }, 0);
        return;
      }

      // Determine which elements intersect the marquee using ONLY DOM-measured bounds
      const shouldUnion = ev.shiftKey || ev.ctrlKey || ev.metaKey;

      const intersecting: any[] = [];
      for (const el of elements) {
        const mb = measuredBounds[el.id];
        if (!mb) {
          // Defer selection for elements without measurements to maintain precision
          continue;
        }
        const elMinX = mb.x;
        const elMinY = mb.y;
        const elMaxX = mb.x + mb.width;
        const elMaxY = mb.y + mb.height;
        const intersects = !(elMaxX < minX || elMinX > maxX || elMaxY < minY || elMinY > maxY);
        if (intersects) intersecting.push(el);
      }

      const newSelection = shouldUnion
        ? Array.from(new Map([...(selectedElements || []), ...intersecting].map((e: any) => [e.id, e]))).map(([, v]) => v)
        : intersecting;

      onSelectedElementsChange?.(newSelection);
      setIsMarqueeActive(false);
      setMarqueeEnd(null);
      // Clear marquee-active flag on canvas
      const canvasEl2 = (activeCanvasRef as React.RefObject<HTMLDivElement | null>).current;
      canvasEl2?.removeAttribute('data-marquee');
      console.debug('🟦 Marquee end (pointerup)', { selected: newSelection.map((e: any) => e.id), rect: { minX, minY, maxX, maxY } });
      // Defer reset so the subsequent click doesn't clear the fresh selection
      setTimeout(() => { suppressNextClickClearRef.current = false; }, 0);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);
  }, [getCanvasPointFromClient, readOnly, onSelectedElementChange, onSelectedElementsChange, elements, selectedElements, measuredBounds]);

  // Compute marquee rect in canvas-space for rendering
  const marqueeRect = useMemo(() => {
    if (!isMarqueeActive || !marqueeStartRef.current || !marqueeEnd) return null;
    const sx = marqueeStartRef.current.x;
    const sy = marqueeStartRef.current.y;
    const ex = marqueeEnd.x;
    const ey = marqueeEnd.y;
    const x = Math.min(sx, ex);
    const y = Math.min(sy, ey);
    const w = Math.abs(ex - sx);
    const h = Math.abs(ey - sy);
    return { x, y, w, h };
  }, [isMarqueeActive, marqueeEnd]);

  // Clear any current selection (single and multi)
  const handleClearSelection = useCallback(() => {
    setSelectedElement(null);
    onSelectedElementChange?.(null);
    onSelectedElementsChange?.([]);
  }, [onSelectedElementChange, onSelectedElementsChange]);

  // Move multiple selected elements by delta (canvas-space)
  const moveSelectedElements = useCallback((deltaX: number, deltaY: number) => {
    if (!selectedElements || selectedElements.length < 1) return;
    const selectedIdSet = new Set(selectedElements.map((e: any) => e.id));
    const updated = elements.map(el => {
      if (!selectedIdSet.has(el.id)) return el;
      if (selectedDevice !== 'desktop') {
        const currentDeviceData = (el as any)[selectedDevice] || {};
        return {
          ...el,
          [selectedDevice]: {
            ...currentDeviceData,
            x: (Number(currentDeviceData.x) || 0) + deltaX,
            y: (Number(currentDeviceData.y) || 0) + deltaY
          }
        };
      }
      return {
        ...el,
        x: (Number(el.x) || 0) + deltaX,
        y: (Number(el.y) || 0) + deltaY
      };
    });
    onElementsChange(updated);
  }, [elements, onElementsChange, selectedElements, selectedDevice]);

  // Resize selection applying per-element, anchor-based logic using stable snapshots and handle direction
  const resizeSelectedElements = useCallback((oldBounds: { x: number; y: number; width: number; height: number }, newBounds: { x: number; y: number; width: number; height: number }, handle?: string, targetElements?: any[], stableSnapshots?: Record<string, { absX: number; absY: number; width: number; height: number; fontSize?: number; parentAbsX: number; parentAbsY: number }>) => {
    const targets = targetElements ?? selectedElements ?? [];
    if (targets.length < 1) return;
    const MIN_ELEMENT_SIZE = 20; // keep element min size aligned with CanvasElement
    const MIN_FRAME_SIZE = 10;   // selection frame min size

    const selectedIdSet = new Set(targets.map((e: any) => e.id));
    // Detect if we're resizing a group's children as a batch. If all targets share the same parentGroupId,
    // we should convert back to relative using the NEW group's x/y (nx, ny) instead of reading stale parent props.
    const firstParentId = (targets[0] as any)?.parentGroupId as string | undefined;
    const isGroupChildrenBatch = !!firstParentId && targets.every((t: any) => t.parentGroupId === firstParentId);
    const sx = oldBounds.x, sy = oldBounds.y, sw = oldBounds.width || 1, sh = oldBounds.height || 1;
    const nx = newBounds.x, ny = newBounds.y, nw = Math.max(MIN_FRAME_SIZE, newBounds.width), nh = Math.max(MIN_FRAME_SIZE, newBounds.height);

    // If handle not provided, fallback to legacy proportional mapping to avoid breakage
    const legacyFallback = !handle || !stableSnapshots;

    // Pre-compute scale per axis based on which handle is active
    const rawScaleX = nw / sw;
    const rawScaleY = nh / sh;
    const affectsX = ['w', 'e'].some((d) => handle?.includes(d)) || ['nw','ne','sw','se'].some((d) => handle === d);
    const affectsY = ['n', 's'].some((d) => handle?.includes(d)) || ['nw','ne','sw','se'].some((d) => handle === d);
    const scaleX = affectsX ? rawScaleX : 1;
    const scaleY = affectsY ? rawScaleY : 1;
    const uniformScale = Math.min(scaleX, scaleY);

    // Determine anchor (old and new) based on handle
    const getAnchors = () => {
      // default top-left anchor (se)
      let axOld = sx, ayOld = sy, axNew = nx, ayNew = ny;
      switch (handle) {
        case 'se': axOld = sx;       ayOld = sy;       axNew = nx;       ayNew = ny;       break; // anchor top-left
        case 'sw': axOld = sx + sw;  ayOld = sy;       axNew = nx + nw;  ayNew = ny;       break; // anchor top-right
        case 'ne': axOld = sx;       ayOld = sy + sh;  axNew = nx;       ayNew = ny + nh;  break; // anchor bottom-left
        case 'nw': axOld = sx + sw;  ayOld = sy + sh;  axNew = nx + nw;  ayNew = ny + nh;  break; // anchor bottom-right
        case 'e':  axOld = sx;       ayOld = sy;       axNew = nx;       ayNew = ny;       break; // anchor left edge
        case 'w':  axOld = sx + sw;  ayOld = sy;       axNew = nx + nw;  ayNew = ny;       break; // anchor right edge
        case 's':  axOld = sx;       ayOld = sy;       axNew = nx;       ayNew = ny;       break; // anchor top edge
        case 'n':  axOld = sx;       ayOld = sy + sh;  axNew = nx;       ayNew = ny + nh;  break; // anchor bottom edge
      }
      return { axOld, ayOld, axNew, ayNew };
    };

    const { axOld, ayOld, axNew, ayNew } = getAnchors();

    const updated = elements.map(el => {
      if (!selectedIdSet.has(el.id)) return el;

      // Snapshot at start of resize (absolute coordinates)
      const snap = stableSnapshots?.[el.id];

      if (legacyFallback || !snap) {
        // Legacy: proportional mapping of top-left and uniform font scaling
        const rp = getPropertiesForDevice(el, selectedDevice);
        const relX = Number(rp.x) || 0;
        const relY = Number(rp.y) || 0;
        const ew = Number(rp.width) || 0;
        const eh = Number(rp.height) || 0;
        const parseFont = (v: any, fb: number) => {
          if (v == null) return fb;
          if (typeof v === 'number') return v;
          const m = String(v).match(/([-+]?[0-9]*\.?[0-9]+)/);
          return m ? parseFloat(m[1]) : fb;
        };
        const isText = (el as any)?.type === 'text';
        const currentFontSize = isText
          ? parseFont((rp as any).fontSize ?? (el as any).fontSize ?? (el as any).style?.fontSize, 16)
          : undefined;

        const parentId = (el as any)?.parentGroupId as string | undefined;
        let parentAbsX = 0;
        let parentAbsY = 0;
        if (parentId) {
          const parentProps = devicePropsById.get(parentId);
          if (parentProps) {
            parentAbsX = Number(parentProps.x) || 0;
            parentAbsY = Number(parentProps.y) || 0;
          }
        }
        const absEx = relX + parentAbsX;
        const absEy = relY + parentAbsY;
        const rx = (absEx - sx) / sw;
        const ry = (absEy - sy) / sh;
        const newAbsX = nx + rx * nw;
        const newAbsY = ny + ry * nh;
        const newW = Math.max(MIN_ELEMENT_SIZE, ew * (nw / sw));
        const newH = Math.max(MIN_ELEMENT_SIZE, eh * (nh / sh));
        const newFontSize = isText ? Math.max(8, Math.round((currentFontSize as number) * Math.min(nw/sw, nh/sh))) : undefined;

        // Apply snapping and canvas clamp on absolute position
        const snapped = applySnapping(newAbsX, newAbsY, newW, newH, String(el.id), { screenId });
        let ax = snapped.x, ay = snapped.y;
        // Clamp
        const maxX = Math.max(0, (effectiveCanvasSize.width || 0) - newW);
        const maxY = Math.max(0, (effectiveCanvasSize.height || 0) - newH);
        ax = Math.min(Math.max(ax, 0), maxX);
        ay = Math.min(Math.max(ay, 0), maxY);

        const targetX = parentId ? (ax - parentAbsX) : ax;
        const targetY = parentId ? (ay - parentAbsY) : ay;

        if (selectedDevice !== 'desktop') {
          const currentDeviceData = (el as any)[selectedDevice] || {};
          return {
            ...el,
            [selectedDevice]: {
              ...currentDeviceData,
              x: targetX,
              y: targetY,
              width: newW,
              height: newH,
              ...(isText ? { fontSize: newFontSize } : {})
            }
          };
        }
        return {
          ...el,
          x: targetX,
          y: targetY,
          width: newW,
          height: newH,
          ...(isText ? { fontSize: newFontSize } : {})
        };
      }

      // --- Per-element anchor-based resize ---
      const startLeft = snap.absX;
      const startTop = snap.absY;
      const startRight = snap.absX + (Number(snap.width) || 0);
      const startBottom = snap.absY + (Number(snap.height) || 0);

      // Transform the two opposite corners relative to anchor
      const tPoint = (px: number, py: number) => ({
        x: axNew + scaleX * (px - axOld),
        y: ayNew + scaleY * (py - ayOld)
      });
      const p1 = tPoint(startLeft, startTop);
      const p2 = tPoint(startRight, startBottom);

      // Compute new rect from transformed points
      const rawLeft = Math.min(p1.x, p2.x);
      const rawTop = Math.min(p1.y, p2.y);
      const rawRight = Math.max(p1.x, p2.x);
      const rawBottom = Math.max(p1.y, p2.y);
      let newWidth = Math.max(MIN_ELEMENT_SIZE, Math.abs(p2.x - p1.x));
      let newHeight = Math.max(MIN_ELEMENT_SIZE, Math.abs(p2.y - p1.y));

      // Decide which edges are being dragged; keep opposite edge anchored
      const movingLeft = !!handle && handle.includes('w');
      const movingRight = !!handle && handle.includes('e');
      const movingTop = !!handle && handle.includes('n');
      const movingBottom = !!handle && handle.includes('s');

      let newLeft = movingLeft && !movingRight ? (rawRight - newWidth) : rawLeft;
      let newTop = movingTop && !movingBottom ? (rawBottom - newHeight) : rawTop;

      const isText = (el as any)?.type === 'text';

      // Font size scaling for text only when corner handles are used
      const isCornerHandle = ['nw','ne','sw','se'].includes(handle || '');
      let newFontSize: number | undefined = undefined;
      if (isText && isCornerHandle) {
        const startFS = typeof snap.fontSize === 'number' ? snap.fontSize : 16;
        newFontSize = Math.max(8, Math.round(startFS * uniformScale));
        // Estimation des dimensions visuelles du texte après mise à l'échelle uniforme
        const estW = Math.max(MIN_ELEMENT_SIZE, (Number(snap.width) || 0) * uniformScale);
        const estH = Math.max(MIN_ELEMENT_SIZE, (Number(snap.height) || 0) * uniformScale);
        // Recalcul ancré par poignée pour éviter les décalages côté Ouest/Nord
        switch (handle) {
          case 'se':
            // ancre: top-left
            newLeft = rawLeft;
            newTop = rawTop;
            break;
          case 'sw':
            // ancre: top-right
            newLeft = rawRight - estW;
            newTop = rawTop;
            break;
          case 'ne':
            // ancre: bottom-left
            newLeft = rawLeft;
            newTop = rawBottom - estH;
            break;
          case 'nw':
            // ancre: bottom-right
            newLeft = rawRight - estW;
            newTop = rawBottom - estH;
            break;
        }
        // On ne modifie pas width/height pour le texte (taille gérée via fontSize)
      }

      // If not corner-scaled text, keep computed width/height
      let outWidth = newWidth;
      let outHeight = newHeight;

      // Apply canvas clamp (no per-child snapping during group resize to avoid jitter)
      const widthForSnap = isText && isCornerHandle ? Math.max(MIN_ELEMENT_SIZE, (Number(snap.width) || 0) * uniformScale) : outWidth;
      const heightForSnap = isText && isCornerHandle ? Math.max(MIN_ELEMENT_SIZE, (Number(snap.height) || 0) * uniformScale) : outHeight;
      let ax = newLeft, ay = newTop;

      // Clamp to canvas bounds
      const maxX = Math.max(0, (effectiveCanvasSize.width || 0) - widthForSnap);
      const maxY = Math.max(0, (effectiveCanvasSize.height || 0) - heightForSnap);
      ax = Math.min(Math.max(ax, 0), maxX);
      ay = Math.min(Math.max(ay, 0), maxY);

      // Convert to relative if element is a child of a group
      const parentId = (el as any)?.parentGroupId as string | undefined;
      let parentAbsX = 0, parentAbsY = 0;
      if (parentId) {
        if (isGroupChildrenBatch && parentId === firstParentId) {
          // Use the NEW group bounds during this interaction
          parentAbsX = nx;
          parentAbsY = ny;
        } else {
          const parentProps = devicePropsById.get(parentId);
          if (parentProps) {
            parentAbsX = Number(parentProps.x) || 0;
            parentAbsY = Number(parentProps.y) || 0;
          }
        }
      }

      const targetX = parentId ? (ax - parentAbsX) : ax;
      const targetY = parentId ? (ay - parentAbsY) : ay;

      const basePatch: any = {};
      basePatch.x = targetX;
      basePatch.y = targetY;
      if (!(isText && isCornerHandle)) {
        basePatch.width = outWidth;
        basePatch.height = outHeight;
      }
      if (isText && newFontSize != null) {
        basePatch.fontSize = newFontSize;
      }

      if (selectedDevice !== 'desktop') {
        const currentDeviceData = (el as any)[selectedDevice] || {};
        return {
          ...el,
          [selectedDevice]: {
            ...currentDeviceData,
            ...basePatch
          }
        };
      }
      return {
        ...el,
        ...basePatch
      };
    });

    onElementsChange(updated);
  }, [elements, onElementsChange, selectedElements, selectedDevice, getPropertiesForDevice, effectiveCanvasSize, screenId]);


  // Zoom au pincement (pinch) sur écrans tactiles
  useEffect(() => {
    const el = (typeof activeCanvasRef === 'object' && (activeCanvasRef as React.RefObject<HTMLDivElement | null>)?.current) as HTMLElement | null;
    if (!el) return;

    let isPinching = false;
    let isPinchResizing = false;
    let isPinchZooming = false;
    let startDist = 0;
    let startZoom = 1;
    let startBounds: { x: number; y: number; width: number; height: number } | null = null;

    const getDist = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const pointInRect = (pt: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number } | null) => {
      if (!rect) return false;
      return pt.x >= rect.x && pt.x <= rect.x + rect.width && pt.y >= rect.y && pt.y <= rect.y + rect.height;
    };

    const getSelectionBounds = () => {
      const sels = selectedElements || [];
      if (!sels || sels.length === 0) return null;
      const mbs = sels.map((el: any) => measuredBounds[el.id]).filter(Boolean) as Array<{ x: number; y: number; width: number; height: number }>;
      if (mbs.length !== sels.length) return null; // wait until all are measured for precision
      const minX = Math.min(...mbs.map(b => b.x));
      const minY = Math.min(...mbs.map(b => b.y));
      const maxX = Math.max(...mbs.map(b => b.x + b.width));
      const maxY = Math.max(...mbs.map(b => b.y + b.height));
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    };

    const flushZoom = () => {
      if (pendingZoomRef.current != null) {
        setLocalZoom(pendingZoomRef.current);
        onZoomChange?.(pendingZoomRef.current);
        pendingZoomRef.current = null;
      }
      rafRef.current = null;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (readOnly) return;
      if (e.touches.length === 2) {
        isPinching = true;
        startDist = getDist(e.touches);
        startZoom = localZoom;
        startBounds = getSelectionBounds();

        // Determine if pinch starts over the current selection
        if (startBounds) {
          const p0 = getCanvasPointFromClient(e.touches[0].clientX, e.touches[0].clientY);
          const p1 = getCanvasPointFromClient(e.touches[1].clientX, e.touches[1].clientY);
          const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
          const within = pointInRect(mid, startBounds) || pointInRect(p0, startBounds) || pointInRect(p1, startBounds);
          isPinchResizing = within;
          isPinchZooming = !within;
          // If this interaction is a canvas zoom, disable auto-fit until next resize/device change
          if (isPinchZooming) {
            autoFitEnabledRef.current = false;
          }
        } else {
          isPinchResizing = false;
          isPinchZooming = true;
          // Canvas pinch-zoom: disable auto-fit
          autoFitEnabledRef.current = false;
        }
        e.preventDefault();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (readOnly) return;
      if (isPinching && e.touches.length === 2) {
        const newDist = getDist(e.touches);
        const ratio = newDist / (startDist || 1);

        if (isPinchResizing && startBounds) {
          // Uniform resize around the center of the selection bounds
          const cx = startBounds.x + startBounds.width / 2;
          const cy = startBounds.y + startBounds.height / 2;
          const newW = Math.max(10, startBounds.width * ratio);
          const newH = Math.max(10, startBounds.height * ratio);
          const newBounds = {
            x: cx - newW / 2,
            y: cy - newH / 2,
            width: newW,
            height: newH
          };
          // Use legacy proportional mapping by omitting handle and snapshots
          resizeSelectedElements(startBounds, newBounds);
          e.preventDefault();
          return;
        }

        if (isPinchZooming) {
          const accelerated = Math.pow(ratio, 1.35);
          const newZoom = Math.max(0.1, Math.min(1.0, startZoom * accelerated));
          pendingZoomRef.current = newZoom;
          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(flushZoom);
          }
          e.preventDefault();
        }
      }
    };

    const onTouchEnd = () => {
      if (isPinching) {
        isPinching = false;
        isPinchResizing = false;
        isPinchZooming = false;
        startBounds = null;
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart as EventListener);
      el.removeEventListener('touchmove', onTouchMove as EventListener);
      el.removeEventListener('touchend', onTouchEnd as EventListener);
      el.removeEventListener('touchcancel', onTouchEnd as EventListener);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [activeCanvasRef, localZoom, onZoomChange, selectedElements, measuredBounds, getCanvasPointFromClient, resizeSelectedElements, readOnly]);


  // Support du zoom via trackpad et molette souris + Ctrl/Cmd
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Vérifier si Ctrl (Windows/Linux) ou Cmd (Mac) est pressé
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        
        // Calculer le facteur de zoom basé sur le delta (plus lent)
        const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
        const newZoom = Math.max(0.1, Math.min(1, localZoom * zoomFactor));
        // Manual trackpad zoom disables auto-fit temporarily
        autoFitEnabledRef.current = false;
        
        setLocalZoom(newZoom);
        
        // Synchroniser avec la barre de zoom externe si disponible
        if (onZoomChange) {
          onZoomChange(newZoom);
        }
      }
    };

    const canvasElement = typeof activeCanvasRef === 'object' && activeCanvasRef?.current;
    if (canvasElement) {
      canvasElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvasElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [localZoom, activeCanvasRef, onZoomChange]);

  // Recenter existing quiz-template once per device to fix legacy top-centered items
  const hasAutoCenteredRef = useRef<string | null>(null);
  useEffect(() => {
    const hasQuiz = elements.some(el => el.id === 'quiz-template');
    if (!hasQuiz) return;
    const key = `${selectedDevice}`;
    if (hasAutoCenteredRef.current === key) return;
    // Delay to ensure DOM is ready
    requestAnimationFrame(() => {
      const el = document.querySelector('[data-element-id="quiz-template"]') as HTMLElement | null;
      const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement | null>)?.current;
      if (!el || !canvasEl) return;
      const elRect = el.getBoundingClientRect();
      const canvasRect = canvasEl.getBoundingClientRect();
      const zoom = localZoom || 1;
      const elCenterX = elRect.left - canvasRect.left + elRect.width / 2;
      const elCenterY = elRect.top - canvasRect.top + elRect.height / 2;
      const canvasCenterX = canvasRect.width / 2;
      const canvasCenterY = canvasRect.height / 2;
      const dx = (canvasCenterX - elCenterX) / zoom;
      const dy = (canvasCenterY - elCenterY) / zoom;
      const measuredW = Math.max(10, Math.round(elRect.width / zoom));
      const measuredH = Math.max(10, Math.round(elRect.height / zoom));
      const existing = elements.find(e => e.id === 'quiz-template');
      if (!existing) return;
      handleElementUpdate('quiz-template', {
        x: Math.round((existing.x || 0) + dx),
        y: Math.round((existing.y || 0) + dy),
        width: measuredW,
        height: measuredH
      });
      hasAutoCenteredRef.current = key;
    });
  }, [elements, selectedDevice, localZoom, activeCanvasRef]);

  // Fonction de sélection qui notifie l'état externe
  const handleElementSelect = useCallback((elementId: string | null, isMultiSelect?: boolean) => {
    console.log('🔥 handleElementSelect called with:', {
      elementId,
      isMultiSelect,
      currentSelectedElements: selectedElements?.length || 0,
      hasOnSelectedElementsChange: !!onSelectedElementsChange
    });
    
    if (isMultiSelect && elementId) {
      // Sélection multiple avec Ctrl/Cmd + clic
      const currentSelectedElements = selectedElements || [];
      const isAlreadySelected = currentSelectedElements.some((el: any) => el.id === elementId);
      
      console.log('🔥 Multi-select logic:', {
        currentCount: currentSelectedElements.length,
        isAlreadySelected,
        targetElementId: elementId
      });
      
      if (isAlreadySelected) {
        // Désélectionner l'élément s'il est déjà sélectionné
        const newSelectedElements = currentSelectedElements.filter((el: any) => el.id !== elementId);
        console.log('🔥 Removing element from selection:', {
          removed: elementId,
          newCount: newSelectedElements.length,
          newSelection: newSelectedElements.map(el => el.id)
        });
        onSelectedElementsChange?.(newSelectedElements);
      } else {
        // Ajouter l'élément à la sélection
        const elementToAdd = elementById.get(elementId);
        if (elementToAdd) {
          const newSelectedElements = [...currentSelectedElements, elementToAdd];
          console.log('🔥 Adding element to selection:', {
            added: elementId,
            newCount: newSelectedElements.length,
            newSelection: newSelectedElements.map(el => el.id)
          });
          onSelectedElementsChange?.(newSelectedElements);
        } else {
          console.error('🔥 Element not found in elements array:', elementId);
        }
      }
      // En mode multi-sélection, on ne change pas l'élément unique sélectionné
      setSelectedElement(null);
      if (onSelectedElementChange) {
        onSelectedElementChange(null);
      }
    } else {
      // Sélection simple (comportement normal)
      console.log('🔥 Single select mode:', { elementId, clearingMultiSelection: true });
      setSelectedElement(elementId);
      if (onSelectedElementChange) {
        const element = elementId ? elementById.get(elementId) : null;
        onSelectedElementChange(element);
      }
      // Réinitialiser la sélection multiple
      onSelectedElementsChange?.([]);
    }
  }, [elementById, onSelectedElementChange, selectedElements, onSelectedElementsChange]);

  // (removed) calculateAbsolutePosition was unused after adopting DOM-measured bounds exclusively for group frames

  // Les fonctions de configuration de la roue sont maintenant fournies par le composant parent

  // Écouteur d'événement pour l'application des effets de texte depuis le panneau latéral
  useEffect(() => {
    const handleApplyTextEffect = (event: CustomEvent) => {
      const currentSelected = selectedElement || externalSelectedElement?.id;
      console.log('🎯 applyTextEffect reçu (QuizEditor)', {
        currentSelected,
        detail: event.detail
      });
      
      if (currentSelected) {
        // Check if this is a module (starts with 'modular-text-')
        if (currentSelected.startsWith('modular-text-') && onModuleUpdate) {
          const moduleId = currentSelected.replace('modular-text-', '');
          const module = modularModules?.find((m) => m.id === moduleId && m.type === 'BlocTexte');
          
          console.log('🧩 applyTextEffect route=module?', { isModule: !!module, moduleId });
          if (module) {
            // Update module with advanced CSS styles
            onModuleUpdate(module.id, {
              customCSS: event.detail.customCSS,
              advancedStyle: event.detail.advancedStyle
            });
          }
        } else {
          // Regular element update
          const element = elementById.get(currentSelected) || externalSelectedElement || null;
          const updates = {
            ...event.detail,
            style: {
              ...(element?.style || {}),
              ...(event.detail.style || {})
            },
            customCSS: event.detail.customCSS,
            advancedStyle: event.detail.advancedStyle,
            textEffect: event.detail.textEffect,
            textShape: event.detail.textShape
          };
          console.log('🧱 applyTextEffect route=element', { elementId: currentSelected, updates });
          
          handleElementUpdate(currentSelected, updates);
        }
      }
    };

    window.addEventListener('applyTextEffect', handleApplyTextEffect as EventListener);
    return () => {
      window.removeEventListener('applyTextEffect', handleApplyTextEffect as EventListener);
    };
  }, [selectedElement, externalSelectedElement, handleElementUpdate, elementById, modularModules, onModuleUpdate]);

  // Keep local selection id in sync when parent changes selected element instance
  useEffect(() => {
    if (externalSelectedElement?.id && externalSelectedElement.id !== selectedElement) {
      setSelectedElement(externalSelectedElement.id);
    }
    if (!externalSelectedElement && selectedElement) {
      setSelectedElement(null);
    }
  }, [externalSelectedElement, selectedElement]);

  // Écouteur d'événement pour afficher le popup d'animation
  useEffect(() => {
    const handleShowAnimationPopup = (event: CustomEvent) => {
      const { animation, selectedElementId } = event.detail;
      
      // Calculer la position du popup sous l'élément sélectionné
      const elementInDOM = document.querySelector(`[data-element-id="${selectedElementId}"]`);
      let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      
      if (elementInDOM) {
        const rect = elementInDOM.getBoundingClientRect();
        const canvasRect = (activeCanvasRef as React.RefObject<HTMLDivElement | null>).current?.getBoundingClientRect();
        
        if (canvasRect) {
          // Position relative au canvas
          position = {
            x: rect.left + rect.width / 2,
            y: rect.bottom + 10
          };
        }
      }
      
      setSelectedAnimation(animation);
      setPopupPosition(position);
      setShowAnimationPopup(true);
    };

    window.addEventListener('showAnimationPopup', handleShowAnimationPopup as EventListener);
    return () => {
      window.removeEventListener('showAnimationPopup', handleShowAnimationPopup as EventListener);
    };
  }, []);

  // (moved) auto-responsive, canvasSize, and effectiveCanvasSize are defined earlier to avoid TDZ issues

  // 🚀 Canvas virtualisé pour un rendu ultra-optimisé
  const { markRegionsDirty, isElementVisible } = useVirtualizedCanvas({
    containerRef: activeCanvasRef,
    regionSize: 200,
    maxRegions: 50,
    updateThreshold: 16 // 60fps
  });
  void markRegionsDirty;

  // Convertir les éléments en format compatible avec useAutoResponsive
  const responsiveElements = useMemo(() => {
    return elements.map(element => ({
      id: element.id,
      x: element.x || 0,
      y: element.y || 0,
      width: element.width,
      height: element.height,
      fontSize: element.fontSize || 16,
      type: element.type,
      content: element.content,
      // Préserver les autres propriétés
      ...element
    }));
  }, [elements]);

  // Appliquer les calculs responsives
  const elementsWithResponsive = useMemo(() => {
    return applyAutoResponsive(responsiveElements);
  }, [responsiveElements, applyAutoResponsive]);

  // Note: elementsWithAbsolute computed but not used in render to prevent unused warning  
  React.useMemo(() => {
    const result = elementsWithResponsive.map((el: any) => {
      const parentId = (el as any).parentGroupId;
      if (!parentId) return el;
      const parentProps = devicePropsById.get(parentId);
      if (!parentProps) return el;
      const childProps = getPropertiesForDevice(el, selectedDevice);
      return {
        ...el,
        x: (Number(childProps.x) || 0) + (Number(parentProps.x) || 0),
        y: (Number(childProps.y) || 0) + (Number(parentProps.y) || 0)
      };
    });
    console.debug('Elements with absolute positioning:', result.length);
    return result;
  }, [elementsWithResponsive, devicePropsById, selectedDevice, getPropertiesForDevice]);

  // Tri mémoïsé par zIndex pour le rendu du canvas
  const elementsSortedByZIndex = useMemo(() => {
    return elementsWithResponsive.slice().sort((a: any, b: any) => {
      const za = typeof a.zIndex === 'number' ? a.zIndex : 0;
      const zb = typeof b.zIndex === 'number' ? b.zIndex : 0;
      if (za !== zb) {
        return za - zb; // plus petit d'abord, plus grand rendu en dernier (au-dessus)
      }
      if (a?.id === 'quiz-template' && b?.id !== 'quiz-template') return -1;
      if (b?.id === 'quiz-template' && a?.id !== 'quiz-template') return 1;
      return 0;
    });
  }, [elementsWithResponsive]);

  const renderableElements = useMemo(() => {
    const screenedElements = typeof elementFilter === 'function'
      ? elementsSortedByZIndex.filter(elementFilter)
      : elementsSortedByZIndex;

    if (screenId === 'all') {
      return screenedElements;
    }

    return screenedElements.filter((element: any) => {
      const targetScreen: CanvasScreenId = (element?.screenId as CanvasScreenId) || 'screen1';
      if (targetScreen === 'all') return true;
      return targetScreen === screenId;
    });
  }, [elementsSortedByZIndex, elementFilter, screenId]);

  const resolvedQuizTemplateId = useMemo(() => {
    return (
      quizModalConfig?.templateId ||
      (campaign as any)?.gameConfig?.quiz?.templateId ||
      (campaign as any)?.design?.quizConfig?.templateId ||
      'image-quiz'
    );
  }, [quizModalConfig?.templateId, campaign]);

  const quizCampaignForRenderer = useMemo(() => {
    if (campaign) return campaign;
    return {
      gameConfig: {
        quiz: {
          templateId: resolvedQuizTemplateId,
          questions: []
        }
      },
      design: {
        quizConfig: {
          templateId: resolvedQuizTemplateId
        }
      }
    };
  }, [campaign, resolvedQuizTemplateId]);

  // 🎯 Récupérer le layout dynamique pour le positionnement du quiz
  const quizLayout = useMemo(() => {
    const baseLayout = useLayoutFromCampaign(campaign);
    // FormEditor: Vérifier si le formulaire est en mode intégré
    const isIntegratedMode = campaign?.design?.formConfig?.displayMode === 'integrated';
    // En mode intégré, pas de padding à droite pour remplir tout l'espace
    const safeZonePadding = isIntegratedMode ? 0 : (SAFE_ZONE_PADDING[selectedDevice] || 56);
    
    return {
      align: baseLayout.align,
      padding: isIntegratedMode ? 0 : baseLayout.padding,
      paddingTop: isIntegratedMode ? 0 : baseLayout.paddingTop,
      paddingBottom: isIntegratedMode ? 0 : baseLayout.paddingBottom,
      paddingLeft: isIntegratedMode ? 0 : baseLayout.paddingLeft,
      justify: 'right' as 'right' | 'left' | 'center',
      paddingRight: safeZonePadding
    };
  }, [campaign, selectedDevice]);

  const customElementRenderers = useMemo(() => ({
    'quiz-template': ({ elementStyle }: any) => (
      <div className="relative w-full h-full" style={elementStyle} data-canvas-ui="quiz-template">
        <ScreenLayoutWrapper layout={quizLayout} className="absolute inset-0 pointer-events-none">
          <TemplatedQuiz
            campaign={quizCampaignForRenderer}
            device={selectedDevice}
            disabled={readOnly}
            templateId={resolvedQuizTemplateId}
          />
        </ScreenLayoutWrapper>
      </div>
    )
  }), [quizCampaignForRenderer, resolvedQuizTemplateId, selectedDevice, readOnly, quizLayout]);

  const handleElementTap = useCallback((element: any) => {
    if (!element || readOnly) return;
    if (element.id === 'quiz-template') {
      // Quiz panel disabled in FormEditor
      return;
    }
  }, [onQuizPanelChange, readOnly]);
  void handleElementTap; // Reserved for future touch interaction features

  // (moved) handleElementUpdate is declared earlier to avoid TDZ issues

  const handleElementDelete = useCallback((id: string) => {
    const updatedElements = elements.filter(el => el.id !== id);
    onElementsChange(updatedElements);
    
    // 🚀 Auto-save après suppression avec activité élevée
    updateAutoSaveData(campaign, 'click', 0.9);
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [elements, onElementsChange, updateAutoSaveData, campaign, selectedElement]);

  // Handlers pour le menu contextuel global du canvas
  const handleCanvasCopyStyle = useCallback(() => {
    if (selectedElement) {
      const element = elementById.get(selectedElement);
      if (element) {
        const style = {
          fontFamily: element.fontFamily,
          fontSize: element.fontSize,
          color: element.color,
          fontWeight: element.fontWeight,
          textAlign: element.textAlign,
          backgroundColor: element.backgroundColor,
          borderRadius: element.borderRadius
        };
        // Style copié depuis le canvas
        console.log('Style copié depuis le canvas:', style);
      }
    }
  }, [selectedElement, elementById]);

  const handleCanvasPaste = useCallback(() => {
    if (clipboard && clipboard.type === 'element') {
      const elementToPaste = clipboard.payload;
      const deviceProps = getPropertiesForDevice(elementToPaste, selectedDevice);
      const newElement = {
        ...elementToPaste,
        id: `text-${Date.now()}`,
        x: (deviceProps.x || 0) + 30,
        y: (deviceProps.y || 0) + 30
      };
      const updatedElements = [...elements, newElement];
      onElementsChange(updatedElements);
      handleElementSelect(newElement.id);
      console.log('Élément collé depuis le canvas (global clipboard):', newElement);
    }
  }, [clipboard, elements, onElementsChange, getPropertiesForDevice, selectedDevice, handleElementSelect]);

  const handleRemoveBackground = useCallback(() => {
    if (background && background.type !== 'color') {
      // Remettre le background par défaut et notifier le parent (source de vérité)
      const defaultBackground = {
        type: 'color' as const,
        value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
      };
      onBackgroundChange?.(defaultBackground);
      // Optionnel: réinitialiser les couleurs extraites car il n'y a plus d'image
      onExtractedColorsChange?.([]);
      console.log("🧹 Arrière-plan supprimé -> retour au dégradé par défaut");
    }
  }, [background, onBackgroundChange, onExtractedColorsChange]);
  const selectedElementData = selectedElement ? elementById.get(selectedElement) ?? null : null;

  // Les questions et réponses sont maintenant gérées par StandardizedQuiz
  return (
    <DndProvider backend={HTML5Backend}>
      <MobileResponsiveLayout
        selectedElement={selectedElementData || undefined}
        selectedDevice={selectedDevice}
        onElementUpdate={(updates) => {
          if (selectedElement) {
            handleElementUpdate(selectedElement, updates);
          }
        }}
        onShowEffectsPanel={onShowEffectsPanel}
        onShowAnimationsPanel={onShowAnimationsPanel}
        onShowPositionPanel={onShowPositionPanel}
        canvasRef={activeCanvasRef as React.RefObject<HTMLDivElement | null>}
        zoom={localZoom}
        forceDeviceType={selectedDevice}
        className={`design-canvas-container flex-1 h-full flex flex-col items-center ${isWindowMobile ? 'justify-start pt-0' : 'justify-center pt-40'} pb-4 px-4 ${containerClassName ? containerClassName : 'bg-gray-100'} relative`}
        onAddElement={onAddElement}
        onBackgroundChange={onBackgroundChange}
        onExtractedColorsChange={onExtractedColorsChange}
        currentBackground={background}
        campaignConfig={campaign}
        onCampaignConfigChange={onCampaignChange}
        elements={elements}
        onElementsChange={onElementsChange}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClearSelection={handleClearSelection}
      >
        {/* Canvas Toolbar - Show for text/shape elements OR modular text selection */}
        {(() => {
          if (readOnly) return false;
          const isModuleText = (externalSelectedElement as any)?.role === 'module-text' && (externalSelectedElement as any)?.moduleId;
          // Vérifier si le module sélectionné appartient à cet écran
          const isModuleOnThisScreen = (externalSelectedElement as any)?.screenId === screenId;
          const shouldShow = ((selectedElementData && (selectedElementData.type === 'text' || selectedElementData.type === 'shape')) && selectedDevice !== 'mobile') || (isModuleText && isModuleOnThisScreen);
          if (!shouldShow) return false;

          // Build a synthetic selected element for module text to drive the toolbar UI
          let toolbarSelected: any = selectedElementData;
          let onToolbarElementUpdate = (updates: any) => {
            // Default: apply to the single selected canvas element
            if (selectedElement) {
              handleElementUpdate(selectedElement, updates);
              return;
            }
          };

          if (isModuleText) {
            const modId = (externalSelectedElement as any).moduleId as string;
            const currentMod = Array.isArray(modularModules) ? modularModules.find((m: any) => m.id === modId) : undefined;
            const align = (currentMod as any)?.align || 'left';
            const bodyFontSize = (currentMod as any)?.bodyFontSize ?? 14;
            const bodyBold = !!(currentMod as any)?.bodyBold;
            const bodyItalic = !!(currentMod as any)?.bodyItalic;
            const bodyUnderline = !!(currentMod as any)?.bodyUnderline;

            toolbarSelected = {
              id: `modular-text-${modId}`,
              type: 'text',
              textAlign: align,
              fontSize: bodyFontSize,
              fontWeight: bodyBold ? 'bold' : 'normal',
              fontStyle: bodyItalic ? 'italic' : 'normal',
              textDecoration: bodyUnderline ? 'underline' : 'none',
              style: { fontSize: `${bodyFontSize}px` }
            };

            onToolbarElementUpdate = (updates: any) => {
              if (!currentMod) return;
              const patch: any = {};
              if (typeof updates.textAlign !== 'undefined') patch.align = updates.textAlign;
              if (typeof updates.fontSize !== 'undefined') patch.bodyFontSize = updates.fontSize;
              if (typeof updates.fontWeight !== 'undefined') patch.bodyBold = updates.fontWeight === 'bold';
              if (typeof updates.fontStyle !== 'undefined') patch.bodyItalic = updates.fontStyle === 'italic';
              if (typeof updates.textDecoration !== 'undefined') patch.bodyUnderline = updates.textDecoration === 'underline';
              // Inline rich-text coming from toolbar (apply to body by default)
              if (typeof updates.richHtml !== 'undefined') {
                patch.bodyRichHtml = updates.richHtml;
                // Remove global flags so they don't override inline spans
                patch.bodyBold = false;
                patch.bodyItalic = false;
                patch.bodyUnderline = false;
              }
              if (typeof updates.content !== 'undefined') patch.body = updates.content;
              onModuleUpdate?.(modId, patch);
            };
          } else if (selectedElementData) {
            toolbarSelected = {
              ...selectedElementData,
              ...getPropertiesForDevice(selectedElementData, selectedDevice)
            };
            // If multiple selection is active, apply updates to all selected text elements
            onToolbarElementUpdate = (updates: any) => {
              const list = Array.isArray(selectedElements) ? selectedElements : [];
              const textIds = list.filter((el: any) => el?.type === 'text').map((el: any) => el.id);
              if (textIds.length > 1) {
                for (const id of textIds) {
                  handleElementUpdate(id, updates);
                }
              } else if (selectedElement) {
                handleElementUpdate(selectedElement, updates);
              }
            };
          }

          return (
            <div className="z-10 absolute top-4 left-1/2 transform -translate-x-1/2">
              <CanvasToolbar 
                selectedElement={toolbarSelected}
                onElementUpdate={onToolbarElementUpdate}
                onShowEffectsPanel={onShowEffectsPanel}
                onShowAnimationsPanel={onShowAnimationsPanel}
                onShowPositionPanel={onShowPositionPanel}
                onShowDesignPanel={onShowDesignPanel}
                onOpenElementsTab={onOpenElementsTab}
                canvasRef={activeCanvasRef as React.RefObject<HTMLDivElement | null>}
              />
            </div>
          );
        })()}
        
        <div 
          ref={containerRef} 
          className="flex justify-center items-center h-full w-full"
          onPointerDownCapture={(e) => {
            // Enable selecting elements even when they visually overflow outside the clipped canvas
            // Only handle when clicking outside the actual canvas element to avoid interfering
            const canvasEl = typeof activeCanvasRef === 'object' ? (activeCanvasRef as React.RefObject<HTMLDivElement | null>).current : null;
            if (!canvasEl || readOnly) return;
            if (canvasEl.contains(e.target as Node)) return;
            // Convert pointer to canvas-space coordinates using canvas bounding rect and current pan/zoom
            const rect = canvasEl.getBoundingClientRect();
            const px = (e.clientX - rect.left - panOffset.x) / localZoom;
            const py = (e.clientY - rect.top - panOffset.y) / localZoom;

            // Hit test topmost first: iterate elements in reverse paint order
            for (let i = elements.length - 1; i >= 0; i--) {
              const el: any = elements[i];
              const mb = measuredBounds[el.id];
              if (!mb) continue;
              if (px >= mb.x && px <= mb.x + mb.width && py >= mb.y && py <= mb.y + mb.height) {
                // Select this element
                setSelectedElement?.(el.id);
                onSelectedElementsChange?.([el.id]);
                onSelectedElementChange?.(el.id);
                e.preventDefault();
                e.stopPropagation();
                break;
              }
            }
          }}
        >
          {/* Canvas wrapper pour maintenir le centrage avec zoom */}
          <div 
          ref={containerRef} 
          className="canvas-scroll-area flex justify-center w-full"
          style={{
            width: 'fit-content',
            minHeight: '100vh',
            overflowY: 'auto',
            alignItems: 'flex-start'
          }}
          >
            <div 
              ref={activeCanvasRef}
              data-canvas-root="true"
              className={`relative bg-transparent overflow-hidden ${!readOnly ? 'rounded-3xl' : ''}`} 
              style={{
                width: `${effectiveCanvasSize.width}px`,
                height: `${effectiveCanvasSize.height}px`,
                minWidth: `${effectiveCanvasSize.width}px`,
                minHeight: `${effectiveCanvasSize.height}px`,
                flexShrink: 0,
                // Shift content down on mobile so toolbar does not overlap the top of the canvas
                marginTop: selectedDevice === 'mobile' ? (isWindowMobile ? 0 : 96) : 0,
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${localZoom})`,
                transformOrigin: 'center top',
                touchAction: 'none',
                userSelect: 'none',
                willChange: 'transform',
                // Improve perceived sharpness for sans-serif like Open Sans
                WebkitFontSmoothing: 'subpixel-antialiased' as any,
                textRendering: 'optimizeLegibility',
                fontSynthesis: 'none'
              }}
              onClickCapture={(e) => {
                // Clear selection only when clicking on empty canvas, not on elements
                if (readOnly) return;
                // If we just performed a marquee, ignore this synthetic click
                if (suppressNextClickClearRef.current || isMarqueeActive) return;
                const me = e as unknown as React.MouseEvent<HTMLDivElement>;
                if (me.ctrlKey || me.metaKey) return;
                const target = e.target as HTMLElement | null;
                // If the click originated from an interactive element inside the canvas, skip clearing
                if (target && (target.closest('[data-element-id]') || target.closest('[data-canvas-ui]'))) return;
                const hasAnySelection = (selectedElement != null) || (selectedElements && selectedElements.length > 0);
                if (hasAnySelection) {
                  if (typeof handleClearSelection === 'function') {
                    handleClearSelection();
                  } else {
                    // Fallback (should not happen): clear via local state notifiers
                    setSelectedElement(null);
                    onSelectedElementsChange?.([]);
                    onSelectedElementChange?.(null);
                  }
                }
              }}
            >
            {/* Canvas Background */}
            <div 
              className="absolute inset-0" 
              style={{
                background: deviceBackgrounds[selectedDevice]
                  ? `url(${deviceBackgrounds[selectedDevice]}) center/cover no-repeat`
                  : (background?.type === 'image'
                      ? `url(${background.value}) center/cover no-repeat`
                      : background?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)')
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                handleBackgroundPointerDown(e);
              }}
            >
              {/* Menu contextuel global du canvas */}
              {!readOnly && (
                <CanvasContextMenu
                  onCopyStyle={handleCanvasCopyStyle}
                  onPaste={handleCanvasPaste}
                  onRemoveBackground={handleRemoveBackground}
                  canPaste={!!clipboard && clipboard.type === 'element'}
                  hasStyleToCopy={selectedElement !== null}
                />
              )}
              {/* Safe zone overlay to keep modules away from hard edges */}
              <div
                className="pointer-events-none absolute inset-0 z-[6]"
                aria-hidden="true"
              >
                <div
                  className="absolute border border-dashed border-white/60"
                  style={{
                    inset: `${safeZonePadding}px`,
                    borderRadius: `${safeZoneRadius}px`,
                    boxShadow: '0 0 0 1px rgba(12, 18, 31, 0.08) inset'
                  }}
                />
              </div>

              <GridOverlay 
                canvasSize={effectiveCanvasSize}
                showGrid={selectedDevice !== 'mobile' && showGridLines}
                gridSize={20}
                opacity={0.15}
                zoom={localZoom}
              />
              
              {/* Smart Alignment Guides - Système refactorisé uniquement */}
              <SmartAlignmentGuides
                guides={currentGuides}
                canvasSize={effectiveCanvasSize}
                zoom={localZoom}
                isDragging={isDragging}
              />
              
              {/* Alignment Toolbar */}
              {selectedElements && selectedElements.length > 0 && !readOnly && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
                  <AlignmentToolbar
                    selectedElements={selectedElements.map(el => el.id)}
                    onElementUpdate={handleElementUpdate}
                    elements={elements}
                    canvasSize={effectiveCanvasSize}
                    zoom={localZoom}
                  />
                </div>
              )}
              
              {overlayElements && overlayElements.length > 0 && (
                <div className="absolute inset-0 pointer-events-none" data-canvas-ui="static-overlay">
                  {overlayElements.map((element) => {
                    if (element.type === 'image' && element.src) {
                      return (
                        <img
                          key={element.id}
                          src={element.src}
                          alt={element.alt || ''}
                          style={{ ...element.style, pointerEvents: 'none' }}
                          className="select-none"
                        />
                      );
                    }
                    return (
                      <div
                        key={element.id}
                        style={{ ...element.style, pointerEvents: 'none' }}
                        className="select-text"
                      >
                        {element.content || element.text || ''}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Clouds */}
              
              
              
              
              
              {(() => {
                // Debug: log just before the quiz renders to trace questions source and canonical config
                try {
                  const questions = (campaign as any)?.gameConfig?.quiz?.questions 
                    || [];
                  const campaignQuestionIds = Array.isArray(questions) ? questions.map((q: any) => q?.id ?? '?') : [];
                  const canonical = typeof getCanonicalConfig === 'function' 
                    ? getCanonicalConfig({ device: selectedDevice, shouldCropQuiz: true }) 
                    : null;
                  const canonicalQuestions = (canonical as any)?.questions || [];
                  const canonicalQuestionIds = Array.isArray(canonicalQuestions) ? canonicalQuestions.map((q: any) => q?.id ?? '?') : [];
                  console.log('🧭 [DesignCanvas] Pre-render quiz debug:', {
                    device: selectedDevice,
                    campaignQuestionCount: Array.isArray(questions) ? questions.length : 0,
                    campaignQuestionIds,
                    hasGetCanonicalConfig: typeof getCanonicalConfig === 'function',
                    canonicalQuestionCount: Array.isArray(canonicalQuestions) ? canonicalQuestions.length : 0,
                    canonicalQuestionIds
                  });
                } catch (e) {
                  console.warn('🧭 [DesignCanvas] pre-render log error', e);
                }
                return null;
              })()}

              {/* Quiz avec template sélectionné */}
              {(() => {
                if (screenId === 'screen3') {
                  return null;
                }
                // Créer un objet campaign temporaire avec le templateId depuis l'état local
                const tempCampaign = campaign || {
                  gameConfig: {
                    quiz: {
                      templateId: quizModalConfig?.templateId || 'image-quiz',
                      questions: []
                    }
                  },
                  design: {
                    quizConfig: {
                      templateId: quizModalConfig?.templateId || 'image-quiz'
                    }
                  }
                };
                
                // Utiliser la vraie campagne si disponible pour avoir les styles mis à jour
                const campaignToUse = campaign || tempCampaign;
                
                console.log('🎯 Campaign object for TemplatedQuiz:', campaignToUse);
                
                const shouldRenderInlinePreview = !hideInlineQuizPreview && (!elements.some(el => el.id === 'quiz-template'));

                // Vérifier si le formulaire est en mode intégré
                const formConfig = campaignToUse?.design?.formConfig || {};
                const isIntegratedMode = formConfig.displayMode === 'integrated';
                
                return (
                  <ScreenLayoutWrapper layout={quizLayout} className="w-full h-full" style={{ minHeight: '100%' }}>
                    {shouldRenderInlinePreview && (
                      <div
                        style={{
                          display: isIntegratedMode || selectedDevice === 'mobile' ? 'flex' : 'block',
                          flexDirection: selectedDevice === 'mobile' ? 'column' : 'row',
                          justifyContent: formConfig.position === 'center' ? 'center' : 'flex-start',
                          width: '100%',
                          height: '100%',
                          minHeight: '100%',
                          position: 'relative',
                          gap: 0,
                          margin: 0,
                          padding: 0
                        }}
                      >
                        {/* FORMEDITOR: Afficher le formulaire au lieu du quiz */}
                        {(() => {
                          const formConfig = campaignToUse?.design?.formConfig || {
                            title: 'Vos informations',
                            description: 'Remplissez le formulaire pour participer',
                            submitLabel: 'SPIN',
                            panelBg: '#ffffff',
                            borderColor: '#e5e7eb',
                            textColor: '#000000',
                            buttonColor: '#44444d',
                            buttonTextColor: '#ffffff',
                            fontFamily: 'inherit',
                            displayMode: 'overlay',
                            position: 'right',
                            borderRadius: 12,
                            fieldBorderRadius: 2,
                            width: 500,
                            height: 500
                          };
                          
                          // État pour gérer l'expansion du formulaire mobile
                          const [isMobileFormExpanded, setIsMobileFormExpanded] = React.useState(false);
                          const mobileFormRef = React.useRef<HTMLDivElement>(null);

                          // Calculer les styles de positionnement
                          const isIntegrated = formConfig.displayMode === 'integrated';
                          
                          const getPositionStyles = () => {
                            // Mode mobile : formulaire en bas, pleine largeur, position absolue
                            if (selectedDevice === 'mobile') {
                              return {
                                position: 'fixed' as const,
                                bottom: isMobileFormExpanded ? 0 : '-100%',
                                left: 0,
                                right: 0,
                                width: '100%',
                                maxWidth: '100%',
                                height: 'auto',
                                minHeight: '350px',
                                maxHeight: '85vh',
                                overflowX: 'hidden',
                                overflowY: 'auto',
                                borderRadius: '24px 24px 0 0',
                                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
                                zIndex: 10,
                                margin: 0,
                                padding: '24px 20px 80px',
                                boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
                                transition: 'bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                              };
                            }
                            
                            if (isIntegrated) {
                              // Mode intégré : le formulaire partage l'espace avec l'arrière-plan
                              const baseStyles: React.CSSProperties = {
                                width: '37%',
                                minWidth: '340px',
                                maxWidth: '450px',
                                height: '100%',
                                overflow: 'auto',
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                              };
                              
                              return baseStyles;
                            } else {
                              // Mode overlay : formulaire flottant avec hauteur automatique
                              const baseStyles: React.CSSProperties = {
                                position: 'absolute' as const,
                                width: `${formConfig.width}px`,
                                maxWidth: '90%',
                                height: 'auto',
                                minHeight: '200px',
                                maxHeight: '90vh',
                                overflow: 'auto'
                              };
                              
                              // Position horizontale
                              switch (formConfig.position) {
                                case 'left':
                                  baseStyles.left = '20px';
                                  break;
                                case 'center':
                                  baseStyles.left = '50%';
                                  baseStyles.transform = 'translateX(-50%)';
                                  break;
                                case 'right':
                                default:
                                  baseStyles.right = '20px';
                                  break;
                              }
                              
                              // Position verticale (centré avec hauteur auto)
                              baseStyles.top = '50%';
                              baseStyles.transform = baseStyles.transform 
                                ? `${baseStyles.transform} translateY(-50%)`
                                : 'translateY(-50%)';
                              
                              // Assurer que le formulaire ne dépasse pas en haut
                              baseStyles.maxHeight = 'calc(100vh - 40px)';
                              
                              return baseStyles;
                            }
                          };
                          
                          // Déterminer l'ordre du formulaire
                          const formOrder = formConfig.position === 'right' ? 2 : 1;
                          
                          return (
                            <>
                              {/* Overlay noir semi-transparent pour mobile */}
                              {selectedDevice === 'mobile' && isMobileFormExpanded && (
                                <div
                                  style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    zIndex: 9,
                                    transition: 'opacity 0.3s ease',
                                    opacity: isMobileFormExpanded ? 1 : 0,
                                    pointerEvents: isMobileFormExpanded ? 'auto' : 'none'
                                  }}
                                  onClick={() => setIsMobileFormExpanded(false)}
                                />
                              )}

                              <div 
                                ref={mobileFormRef}
                                className="flex flex-col"
                                style={{ 
                                  ...getPositionStyles(),
                                  backgroundColor: formConfig.panelBg,
                                  color: formConfig.textColor,
                                  fontFamily: formConfig.fontFamily,
                                  borderRadius: isIntegrated ? 0 : `${formConfig.borderRadius}px`,
                                  boxShadow: isIntegrated ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.15)',
                                  zIndex: isIntegrated ? 1 : 10,
                                  order: isIntegrated ? formOrder : 0,
                                  padding: isIntegrated ? '48px 40px' : '24px'
                                }}
                              >
                                <div className="mb-4">
                                  <h3 className="text-lg font-semibold mb-2">{formConfig.title}</h3>
                                  <p className="text-sm opacity-75">{formConfig.description}</p>
                                </div>
                                
                                <DynamicContactForm
                                  fields={campaignToUse?.formFields || DEFAULT_FIELDS}
                                  submitLabel={formConfig.submitLabel}
                                  onSubmit={() => {
                                    onFormSubmit?.();
                                  }}
                                  inputBorderColor={formConfig.borderColor}
                                  inputBorderRadius={`${formConfig.fieldBorderRadius}px`}
                                  inputFocusColor={formConfig.buttonColor}
                                  textStyles={{
                                    label: {
                                      color: formConfig.textColor,
                                      fontFamily: formConfig.fontFamily,
                                      fontSize: '14px',
                                      fontWeight: '500'
                                    },
                                    button: {
                                      backgroundColor: formConfig.buttonColor,
                                      color: formConfig.buttonTextColor,
                                      borderRadius: `${formConfig.borderRadius}px`,
                                      fontFamily: formConfig.fontFamily
                                    }
                                  }}
                                />
                              </div>

                              {/* Bouton "Remplir le formulaire" pour mobile */}
                              {selectedDevice === 'mobile' && !isMobileFormExpanded && (
                                <button
                                  onClick={() => setIsMobileFormExpanded(true)}
                                  style={{
                                    position: 'fixed',
                                    bottom: '20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: formConfig.buttonColor || '#44444d',
                                    color: formConfig.buttonTextColor || '#ffffff',
                                    padding: '16px 32px',
                                    borderRadius: '50px',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    fontFamily: formConfig.fontFamily || 'inherit',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                                    cursor: 'pointer',
                                    zIndex: 20,
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  📝 Remplir le formulaire
                                </button>
                              )}
                            </>
                          );
                        })()}
                        
                        {/* Zone d'arrière-plan en mode intégré (70% de l'espace) */}
                        {isIntegratedMode && (
                          <div 
                            style={{
                              flex: 1,
                              minWidth: 0,
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              order: formConfig.position === 'right' ? 1 : 2
                            }}
                          >
                            {/* Espace pour l'arrière-plan visible */}
                          </div>
                        )}
                      </div>
                    )}
                  </ScreenLayoutWrapper>
                );
              })()}

              {/* Logo band - rendered INSIDE canvas background to avoid padding */}
              {Array.isArray(modularModules) && modularModules.length > 0 && (() => {
                const logoModules = modularModules.filter((m: any) => m?.type === 'BlocLogo');
                if (logoModules.length === 0) return null;
                return (
                  <div
                    className="absolute left-0 top-0 z-[1000]"
                    style={{
                      width: '100%',
                      pointerEvents: 'none'
                    }}
                  >
                    <div className="w-full" style={{ pointerEvents: 'auto' }}>
                      <QuizModuleRenderer
                        modules={logoModules.map((lm: any) => ({
                          ...lm,
                          bandPadding: 0,
                          spacingTop: 0
                        }))}
                        previewMode={false}
                        device={selectedDevice}
                        onModuleUpdate={(_id, patch) => onModuleUpdate?.(_id, patch)}
                        onModuleClick={(moduleId) => {
                          try {
                            const mod = (logoModules as any).find((mm: any) => mm.id === moduleId);
                            const evt = new CustomEvent('modularModuleSelected', { detail: { module: mod } });
                            window.dispatchEvent(evt);
                          } catch {}
                          onSelectedElementChange?.({
                            id: `modular-logo-${moduleId}`,
                            type: 'logo',
                            role: 'module-logo',
                            moduleId,
                            screenId
                          } as any);
                          onOpenElementsTab?.();
                        }}
                        selectedModuleId={((externalSelectedElement as any)?.role === 'module-logo')
                          ? (externalSelectedElement as any)?.moduleId
                          : undefined}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* FormEditor n'utilise pas de bouton de configuration flottant */}
            </div>

            {/* Modular stacked content (HubSpot-like) */}
            {Array.isArray(modularModules) && modularModules.length > 0 && (() => {
              const logoModules = modularModules.filter((m: any) => m?.type === 'BlocLogo');
              const footerModules = modularModules.filter((m: any) => m?.type === 'BlocPiedDePage');
              const regularModules = modularModules.filter((m: any) => m?.type !== 'BlocLogo' && m?.type !== 'BlocPiedDePage');
              const logoVisualHeight = logoModules.reduce((acc: number, m: any) => {
                const h = (m?.bandHeight ?? 60);
                const p = (m?.bandPadding ?? 16) * 2;
                const extra = ((m as any)?.spacingTop ?? 0) + ((m as any)?.spacingBottom ?? 0);
                return Math.max(acc, h + p + extra);
              }, 0);
              const footerVisualHeight = footerModules.reduce((acc: number, m: any) => {
                const h = (m?.bandHeight ?? 60);
                const p = (m?.bandPadding ?? 16) * 2;
                const extra = ((m as any)?.spacingTop ?? 0) + ((m as any)?.spacingBottom ?? 0);
                return Math.max(acc, h + p + extra);
              }, 0);
              return (
                <>
                  {/* Regular modules container; padding adjusted when logo/footer exist */}
                  <div
                    className="w-full flex justify-center mb-6"
                    style={{
                      paddingLeft: safeZonePadding,
                      paddingRight: safeZonePadding,
                      paddingTop: safeZonePadding + (logoVisualHeight * 0.7),
                      paddingBottom: safeZonePadding + (footerVisualHeight * 0.7),
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Spacer to prevent overlap with the absolute logo band */}
                    {logoModules.length > 0 && (
                      <div style={{ height: logoVisualHeight }} />
                    )}
                    <div 
                      className="max-w-[1500px] flex" 
                      style={{ 
                        minHeight: selectedDevice === 'mobile' ? '100%' : (effectiveCanvasSize?.height || 640),
                        height: selectedDevice === 'mobile' ? '100%' : 'auto',
                        width: screenId === 'screen1' 
                          ? (selectedDevice === 'mobile' ? '100%' : '63%')
                          : '100%',
                        marginLeft: screenId === 'screen1' 
                          ? (selectedDevice === 'mobile' ? '0' : (campaign?.design?.formConfig?.position === 'left' ? 'auto' : '0'))
                          : 'auto',
                        marginRight: screenId === 'screen1' 
                          ? (selectedDevice === 'mobile' ? '0' : (campaign?.design?.formConfig?.position === 'left' ? '0' : 'auto'))
                          : 'auto',
                        overflow: selectedDevice === 'mobile' ? 'hidden' : 'visible',
                        paddingBottom: selectedDevice === 'mobile' ? '60vh' : '0'
                      }}
                    >
                      <ModularCanvas
                        screen={screenId as any}
                        modules={regularModules}
                        device={selectedDevice}
                        onUpdate={(id, patch) => onModuleUpdate?.(id, patch)}
                        onDelete={(id) => onModuleDelete?.(id)}
                        onMove={(id, dir) => onModuleMove?.(id, dir)}
                        onDuplicate={(id) => onModuleDuplicate?.(id)}
                        onSelect={(m) => {
                      try {
                        const evt = new CustomEvent('modularModuleSelected', { detail: { module: m } });
                        window.dispatchEvent(evt);
                      } catch {}
                      if (m.type === 'BlocBouton') {
                        onSelectedElementChange?.({
                          id: `modular-button-${m.id}`,
                          type: 'button',
                          role: 'module-button',
                          moduleId: m.id,
                          screenId
                        } as any);
                        onOpenElementsTab?.();
                        return;
                      }
                      if (m.type === 'BlocImage') {
                        onSelectedElementChange?.({
                          id: `modular-image-${m.id}`,
                          type: 'image',
                          role: 'module-image',
                          moduleId: m.id,
                          screenId
                        } as any);
                        onOpenElementsTab?.();
                        return;
                      }
                      if (m.type === 'BlocReseauxSociaux') {
                        onSelectedElementChange?.({
                          id: `modular-social-${m.id}`,
                          type: 'social',
                          role: 'module-social',
                          moduleId: m.id,
                          screenId
                        } as any);
                        onOpenElementsTab?.();
                        return;
                      }
                      if (m.type === 'BlocVideo') {
                        onSelectedElementChange?.({
                          id: `modular-video-${m.id}`,
                          type: 'video',
                          role: 'module-video',
                          moduleId: m.id,
                          screenId
                        } as any);
                        onOpenElementsTab?.();
                        return;
                      }
                      if (m.type === 'BlocHtml') {
                        onSelectedElementChange?.({
                          id: `modular-html-${m.id}`,
                          type: 'html',
                          role: 'module-html',
                          moduleId: m.id,
                          screenId
                        } as any);
                        onOpenElementsTab?.();
                        return;
                      }
                      if (m.type === 'BlocCarte') {
                        onSelectedElementChange?.({
                          id: `modular-carte-${m.id}`,
                          type: 'carte',
                          role: 'module-carte',
                          moduleId: m.id,
                          screenId
                        } as any);
                        onOpenElementsTab?.();
                        return;
                      }
                      if (m.type === 'BlocLogo') {
                        onSelectedElementChange?.({
                          id: `modular-logo-${m.id}`,
                          type: 'logo',
                          role: 'module-logo',
                          moduleId: m.id,
                          screenId
                        } as any);
                        onOpenElementsTab?.();
                        return;
                      }
                      onSelectedElementChange?.({
                        id: `modular-text-${m.id}`,
                        type: 'text',
                        role: 'module-text',
                        moduleId: m.id,
                        screenId
                      } as any);
                      onShowDesignPanel?.();
                    }}
                    selectedModuleId={((externalSelectedElement as any)?.role === 'module-text'
                      || (externalSelectedElement as any)?.role === 'module-image'
                      || (externalSelectedElement as any)?.role === 'module-video'
                      || (externalSelectedElement as any)?.role === 'module-social'
                      || (externalSelectedElement as any)?.role === 'module-html'
                      || (externalSelectedElement as any)?.role === 'module-carte'
                      || (externalSelectedElement as any)?.role === 'module-logo')
                      ? (externalSelectedElement as any)?.moduleId
                      : undefined}
                  />
                  {footerModules.length > 0 && (
                    <div style={{ height: footerVisualHeight }} />
                  )}
                </div>
              </div>

              {/* Footer band at the bottom (non-movable) */}
              {footerModules.length > 0 && (
                <div className="absolute left-0 bottom-0 w-full z-[1000]" style={{ pointerEvents: 'none' }}>
                  <div className="w-full" style={{ pointerEvents: 'auto' }}>
                    <QuizModuleRenderer
                      modules={footerModules}
                      previewMode={false}
                      device={selectedDevice}
                      onModuleUpdate={(_id, patch) => onModuleUpdate?.(_id, patch)}
                      onModuleClick={(moduleId) => {
                        try {
                          const mod = (footerModules as any).find((mm: any) => mm.id === moduleId);
                          const evt = new CustomEvent('modularModuleSelected', { detail: { module: mod } });
                          window.dispatchEvent(evt);
                        } catch {}
                        onSelectedElementChange?.({
                          id: `modular-footer-${moduleId}`,
                          type: 'footer',
                          role: 'module-footer',
                          moduleId,
                          screenId
                        } as any);
                        onOpenElementsTab?.();
                      }}
                      selectedModuleId={((externalSelectedElement as any)?.role === 'module-footer')
                        ? (externalSelectedElement as any)?.moduleId
                        : undefined}
                    />
                  </div>
                </div>
              )}
            </>
              );
            })()}

            {/* Canvas Elements - Rendu optimisé avec virtualisation */}
            {renderableElements
              .filter((element: any) => {
                // 🚀 S'assurer que l'élément a des dimensions numériques pour la virtualisation
                const elementWithProps = {
                  ...element,
                  ...getPropertiesForDevice(element, selectedDevice)
                };
                
                // Ajouter des dimensions par défaut pour les éléments de texte si manquantes
                if (element.type === 'text') {
                  elementWithProps.width = elementWithProps.width || 200;
                  elementWithProps.height = elementWithProps.height || 40;
                }
                
                // S'assurer que x, y, width, height sont des nombres
                elementWithProps.x = Number(elementWithProps.x) || 0;
                elementWithProps.y = Number(elementWithProps.y) || 0;
                elementWithProps.width = Number(elementWithProps.width) || 100;
                elementWithProps.height = Number(elementWithProps.height) || 100;

                // Si l'élément est enfant d'un groupe, ajouter l'offset du groupe pour la visibilité
                if (element.parentGroupId) {
                  const parentProps = devicePropsById.get(element.parentGroupId);
                  if (parentProps) {
                    elementWithProps.x += Number(parentProps.x) || 0;
                    elementWithProps.y += Number(parentProps.y) || 0;
                  }
                }
                
                return isElementVisible(elementWithProps);
              })
              .map((element: any) => {
              // Obtenir les propriétés pour l'appareil actuel
              const responsiveProps = getPropertiesForDevice(element, selectedDevice);
              
              // (plus de calcul absolu ici pour éviter les décalages en mobile)
              
              // Fusionner les propriétés responsive avec l'élément original (utiliser directement les props responsive pour éviter les décalages)
              let elementWithResponsive: any;
              if (element.type === 'quiz-template') {
                // Ne pas écraser les coordonnées/tailles calculées pour le template quiz
                elementWithResponsive = {
                  ...element,
                  x: element.x,
                  y: element.y,
                  width: element.width,
                  height: element.height,
                  fontSize: element.fontSize,
                  textAlign: element.textAlign
                };
              } else {
                elementWithResponsive = {
                  ...element,
                  x: (responsiveProps.x ?? element.x),
                  y: (responsiveProps.y ?? element.y),
                  width: (responsiveProps.width ?? element.width),
                  height: (responsiveProps.height ?? element.height),
                  fontSize: (responsiveProps.fontSize ?? element.fontSize),
                  // Appliquer l'alignement de texte responsive si disponible
                  textAlign: responsiveProps.textAlign || element.textAlign
                };
              }

              // Ajuster la largeur des éléments pour laisser de la place au formulaire (uniquement écran 1 desktop/tablet)
              const isScreen1 = screenId === 'screen1';
              const isMobile = selectedDevice === 'mobile';
              const formWidthPercentage = 0.37; // 37% pour le formulaire
              const availableWidthFactor = (isScreen1 && !isMobile) ? (1 - formWidthPercentage) : 1; // 63% pour écran 1 desktop/tablet, 100% pour mobile et autres écrans
              
              // Appliquer le facteur de largeur disponible
              let elementWithAdjustedWidth = {
                ...elementWithResponsive,
                width: (elementWithResponsive.width || 0) * availableWidthFactor,
                x: (elementWithResponsive.x || 0) * availableWidthFactor
              };
              
              // Ajouter l'offset du groupe pour fournir des coordonnées ABSOLUES au composant CanvasElement
              let elementForCanvas = elementWithAdjustedWidth;
              if ((element as any).parentGroupId) {
                const parentProps = devicePropsById.get((element as any).parentGroupId);
                if (parentProps) {
                  elementForCanvas = {
                    ...elementWithAdjustedWidth,
                    x: (Number(elementWithAdjustedWidth.x) || 0) + (Number(parentProps.x) || 0),
                    y: (Number(elementWithAdjustedWidth.y) || 0) + (Number(parentProps.y) || 0)
                  };
                }
              }

              return (
                <CanvasElement 
                  key={element.id} 
                  element={elementForCanvas} 
                  selectedDevice={selectedDevice}
                  isSelected={
                    selectedElement === element.id || 
                    Boolean(selectedElements && selectedElements.some((sel: any) => sel.id === element.id))
                  } 
                  onSelect={handleElementSelect} 
                  onUpdate={handleElementUpdate} 
                  onDelete={handleElementDelete}
                  containerRef={activeCanvasRef as React.RefObject<HTMLDivElement | null>}
                  readOnly={readOnly}
                  onMeasureBounds={handleMeasureBounds}
                  onAddElement={(newElement) => {
                    const elementScreen: CanvasScreenId = (newElement?.screenId as CanvasScreenId) || (screenId === 'all' ? 'screen1' : screenId);
                    const enrichedElement = {
                      ...newElement,
                      screenId: elementScreen
                    };
                    const updatedElements = [...elements, enrichedElement];
                    onElementsChange(updatedElements);
                    handleElementSelect(enrichedElement.id);
                  }}
                  elements={elements}
                  // New: pass selection context flags
                  isMultiSelecting={Boolean(selectedElements && selectedElements.length > 1)}
                  isGroupSelecting={Boolean(selectedGroupId)}
                  activeGroupId={selectedGroupId || null}
                  // Pass campaign data for quiz elements
                  campaign={campaign}
                  // Pass extracted colors for quiz customization
                  extractedColors={extractedColors}
                  // Pass alignment system for new snapping logic
                  alignmentSystem={{
                    snapElement,
                    startDragging,
                    stopDragging
                  }}
                  customRenderers={customElementRenderers}
                />
              );
            })}

            {/* Marquee selection overlay */}
            {marqueeRect && (
              <div
                className="absolute border-2 border-blue-500/70 bg-blue-400/10 pointer-events-none"
                style={{
                  left: marqueeRect.x,
                  top: marqueeRect.y,
                  width: marqueeRect.w,
                  height: marqueeRect.h,
                  zIndex: 2000,
                  boxShadow: '0 0 0 1px rgba(59,130,246,0.4) inset'
                }}
              />
            )}

            {/* Grid and Guides Toggle - desktop only */}
            {selectedDevice === 'desktop' && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => setShowGridLines(!showGridLines)}
                  className={`p-2 rounded-lg shadow-sm text-xs z-40 transition-colors ${
                    showGridLines 
                      ? 'bg-[hsl(var(--primary))] text-white hover:bg-[#44444d]' 
                      : 'bg-white/80 hover:bg-white text-gray-700'
                  }`}
                  title="Afficher/masquer la grille (G)"
                >
                  📐
                </button>
              </div>
            )}

            {/* Group frame for arbitrary multi-selection (not pre-defined groups) */}
            {selectedElements && selectedElements.length > 1 && !readOnly && (() => {
              // Use only DOM-measured bounds for pixel-perfect union; defer if missing
              const measuredSelected = selectedElements.filter((el: any) => !!measuredBounds[el.id]);
              if (measuredSelected.length < selectedElements.length) return null;
              const elementsForBounds = measuredSelected.map((el: any) => measuredBounds[el.id]);
              const minX = Math.min(...elementsForBounds.map(e => e.x));
              const minY = Math.min(...elementsForBounds.map(e => e.y));
              const maxX = Math.max(...elementsForBounds.map(e => e.x + e.width));
              const maxY = Math.max(...elementsForBounds.map(e => e.y + e.height));
              const bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };

              return (
                <GroupSelectionFrame
                  key="multi-selection-frame"
                  groupId="multi-selection"
                  bounds={bounds}
                  zoom={localZoom}
                  onMove={(dx, dy) => {
                    // Snap the frame move and convert back to adjusted delta
                    const snapped = applySnapping(
                      bounds.x + dx,
                      bounds.y + dy,
                      bounds.width,
                      bounds.height,
                      (selectedElements || []).map((e: any) => e.id),
                      { screenId }
                    );
                    const adjDx = snapped.x - bounds.x;
                    const adjDy = snapped.y - bounds.y;
                    moveSelectedElements(adjDx, adjDy);
                  }}
                  onResizeStart={(origin, _handle) => {
                    // Capture stable origin bounds at resize start
                    multiResizeOriginRef.current = origin;
                    // Capture stable per-element snapshots (absolute coords, sizes, font sizes, parent offsets)
                    const snapshot: Record<string, { absX: number; absY: number; width: number; height: number; fontSize?: number; parentAbsX: number; parentAbsY: number }> = {};
                    for (const el of selectedElements) {
                      const rp = getPropertiesForDevice(el, selectedDevice);
                      const relX = Number(rp.x) || 0;
                      const relY = Number(rp.y) || 0;
                      const ew = Number(rp.width) || 0;
                      const eh = Number(rp.height) || 0;
                      const isText = (el as any)?.type === 'text';
                      const parseFont = (v: any, fb: number) => {
                        if (v == null) return fb;
                        if (typeof v === 'number') return v;
                        const m = String(v).match(/([-+]?[0-9]*\.?[0-9]+)/);
                        return m ? parseFloat(m[1]) : fb;
                      };
                      const fontSize = isText ? parseFont((rp as any).fontSize ?? (el as any).fontSize ?? (el as any).style?.fontSize, 16) : undefined;
                      const parentId = (el as any)?.parentGroupId as string | undefined;
                      let parentAbsX = 0, parentAbsY = 0;
                      if (parentId) {
                        const pp = devicePropsById.get(parentId);
                        if (pp) {
                          parentAbsX = Number(pp.x) || 0;
                          parentAbsY = Number(pp.y) || 0;
                        }
                      }
                      const absX = relX + parentAbsX;
                      const absY = relY + parentAbsY;
                      snapshot[el.id] = { absX, absY, width: ew, height: eh, fontSize, parentAbsX, parentAbsY };
                    }
                    multiResizeElementsSnapshotRef.current = snapshot;
                  }}
                  onResize={(nb, handle) => {
                    const ob = multiResizeOriginRef.current || bounds;
                    resizeSelectedElements(ob, nb, handle, selectedElements, multiResizeElementsSnapshotRef.current);
                  }}
                  onResizeEnd={() => {
                    multiResizeOriginRef.current = null;
                    multiResizeElementsSnapshotRef.current = {};
                  }}
                  onDoubleClick={() => {
                    // Collapse multi-selection on double-click
                    onSelectedElementsChange?.([]);
                  }}
                />
              );
            })()}

            </div>

            {/* Selection overlay (visual layer, not interactive yet) */}
            <div 
              className="pointer-events-none absolute"
              style={{
                left: 0,
                top: 0,
                width: `${effectiveCanvasSize.width}px`,
                height: `${effectiveCanvasSize.height}px`,
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${localZoom})`,
                transformOrigin: 'center top',
                zIndex: 100
              }}
            />
          </div>
        </div>


        {/* Multi-Selection Debug Display */}
        {selectedElements && selectedElements.length > 0 && (
          <div className="absolute top-2 left-2 z-50 bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold">
            🎯 Multi-Selection: {selectedElements.length} elements
            <div className="text-xs mt-1">
              {selectedElements.map((el: any, i: number) => (
                <div key={el.id}>{i + 1}. {el.id}</div>
              ))}
            </div>
          </div>
        )}
        
        {/* Cadre de sélection pour les groupes */}
        {selectedGroupId && groups && !readOnly && (
          (() => {
            const selectedGroup = groups.find(g => g.id === selectedGroupId);
            if (selectedGroup && selectedGroup.groupChildren) {
              // Calculer les bounds du groupe à partir des positions absolues de ses éléments
              const groupElements = elements.filter(el => selectedGroup.groupChildren?.includes(el.id));
              if (groupElements.length > 0) {
                // Utiliser uniquement les mesures DOM pour une délimitation exacte; différer si manquantes
                const measuredGroup = groupElements.filter(el => !!measuredBounds[el.id]);
                if (measuredGroup.length < groupElements.length) return null;
                const elementsForBounds = measuredGroup.map(el => measuredBounds[el.id]);

                const minX = Math.min(...elementsForBounds.map(el => el.x));
                const minY = Math.min(...elementsForBounds.map(el => el.y));
                const maxX = Math.max(...elementsForBounds.map(el => el.x + el.width));
                const maxY = Math.max(...elementsForBounds.map(el => el.y + el.height));
                
                const groupBounds = {
                  x: minX,
                  y: minY,
                  width: maxX - minX,
                  height: maxY - minY
                };
                
                console.log('🎯 Group bounds calculated:', {
                  groupId: selectedGroup.id,
                  groupElements: groupElements.length,
                  bounds: groupBounds
                });
                
                return (
                  <GroupSelectionFrame
                    key={selectedGroup.id}
                    groupId={selectedGroup.id}
                    bounds={groupBounds}
                    zoom={localZoom}
                    onMove={(deltaX, deltaY) => {
                      // Snap the group frame move and convert back to adjusted delta
                      const snapped = applySnapping(
                        groupBounds.x + deltaX,
                        groupBounds.y + deltaY,
                        groupBounds.width,
                        groupBounds.height,
                        groupElements.map(el => el.id),
                        { screenId }
                      );
                      const adjDx = snapped.x - groupBounds.x;
                      const adjDy = snapped.y - groupBounds.y;
                      onGroupMove?.(selectedGroup.id, adjDx, adjDy);
                    }}
                    onResizeStart={(origin) => {
                      // Keep stable group origin during the whole interaction
                      groupResizeOriginRef.current = origin;
                      // Snapshot current group children
                      const snapshot: Record<string, { absX: number; absY: number; width: number; height: number; fontSize?: number; parentAbsX: number; parentAbsY: number }>= {};
                      for (const el of groupElements) {
                        const rp = getPropertiesForDevice(el, selectedDevice);
                        const relX = Number(rp.x) || 0;
                        const relY = Number(rp.y) || 0;
                        const ew = Number(rp.width) || 0;
                        const eh = Number(rp.height) || 0;
                        const isText = (el as any)?.type === 'text';
                        const parseFont = (v: any, fb: number) => {
                          if (v == null) return fb;
                          if (typeof v === 'number') return v;
                          const m = String(v).match(/([-+]?[0-9]*\.?[0-9]+)/);
                          return m ? parseFloat(m[1]) : fb;
                        };
                        const fontSize = isText ? parseFont((rp as any).fontSize ?? (el as any).fontSize ?? (el as any).style?.fontSize, 16) : undefined;
                        const parentId = (el as any)?.parentGroupId as string | undefined;
                        let parentAbsX = 0, parentAbsY = 0;
                        if (parentId) {
                          const pp = devicePropsById.get(parentId);
                          if (pp) {
                            parentAbsX = Number(pp.x) || 0;
                            parentAbsY = Number(pp.y) || 0;
                          }
                        }
                        const absX = relX + parentAbsX;
                        const absY = relY + parentAbsY;
                        snapshot[el.id] = { absX, absY, width: ew, height: eh, fontSize, parentAbsX, parentAbsY };
                      }
                      groupResizeElementsSnapshotRef.current = snapshot;
                    }}
                    onResize={(newBounds, handle) => {
                      // Apply per-element anchor-based resize using snapshots
                      const ob = groupResizeOriginRef.current || groupBounds;
                      resizeSelectedElements(ob, newBounds, handle, groupElements, groupResizeElementsSnapshotRef.current);
                      // External sync callback
                      onGroupResize?.(selectedGroup.id, newBounds);
                    }}
                    onResizeEnd={() => {
                      groupResizeOriginRef.current = null;
                      groupResizeElementsSnapshotRef.current = {};
                    }}
                    onDoubleClick={() => {
                      onSelectedGroupChange?.(null);
                    }}
                  />
                );
              }
            }
            return null;
          })()
        )}
        
        

        
        
        

        
        {/* Popup contextuel d'animation */}
        {showAnimationPopup && selectedAnimation && (
          <AnimationSettingsPopup
            animation={selectedAnimation}
            position={popupPosition}
            onApply={(settings) => {
              if (selectedElement) {
                handleElementUpdate(selectedElement, settings);
                setShowAnimationPopup(false);
              }
            }}
            onClose={() => setShowAnimationPopup(false)}
            visible={showAnimationPopup}
          />
        )}
      </MobileResponsiveLayout>
    </DndProvider>
  );
});

DesignCanvas.displayName = 'DesignCanvas';

export default DesignCanvas;
