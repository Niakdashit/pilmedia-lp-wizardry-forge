import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from '../DesignEditor/CanvasElement';
import CanvasToolbar from './CanvasToolbar';
import SmartAlignmentGuides from '../DesignEditor/components/SmartAlignmentGuides';
import AlignmentToolbar from '../DesignEditor/components/AlignmentToolbar';
import GridOverlay from '../DesignEditor/components/GridOverlay';
import ZoomSlider from '../DesignEditor/components/ZoomSlider';
import GroupSelectionFrame from '../DesignEditor/components/GroupSelectionFrame';
import { useAutoResponsive } from '../../hooks/useAutoResponsive';
import { useSmartSnapping } from '../ModernEditor/hooks/useSmartSnapping';
import { useAlignmentSystem } from '../DesignEditor/hooks/useAlignmentSystem';
import { useAdvancedCache } from '../ModernEditor/hooks/useAdvancedCache';
import { useAdaptiveAutoSave } from '../ModernEditor/hooks/useAdaptiveAutoSave';
import { useUltraFluidDragDrop } from '../ModernEditor/hooks/useUltraFluidDragDrop';
import { useVirtualizedCanvas } from '../ModernEditor/hooks/useVirtualizedCanvas';
import { useEditorStore } from '../../stores/editorStore';
import CanvasContextMenu from '../DesignEditor/components/CanvasContextMenu';

import AnimationSettingsPopup from '../DesignEditor/panels/AnimationSettingsPopup';

import MobileResponsiveLayout from '../DesignEditor/components/MobileResponsiveLayout';
import type { DeviceType } from '../../utils/deviceDimensions';
import { isRealMobile } from '../../utils/isRealMobile';
import SlotJackpot from '../SlotJackpot';
import { isFeatureEnabled } from '../../utils/features';

export interface DesignCanvasProps {
  selectedDevice: DeviceType;
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  background?: {
    type: 'color' | 'image';
    value: string;
  };
  campaign?: any;
  onCampaignChange?: (campaign: any) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  selectedElement?: any;
  onSelectedElementChange?: (element: any) => void;
  selectedElements?: any[];
  onSelectedElementsChange?: (elements: any[]) => void;
  onElementUpdate?: (updates: any) => void;
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
  // Inline jackpot panel controls
  showJackpotPanel?: boolean;
  onJackpotPanelChange?: (show: boolean) => void;
  // Read-only mode to disable interactions
  readOnly?: boolean;
  // Optional classes for the outer container (e.g., to override background color)
  containerClassName?: string;
}

const DesignCanvas = React.forwardRef<HTMLDivElement, DesignCanvasProps>(({ 
  selectedDevice,
  elements,
  onElementsChange,
  background,
  campaign,
  onCampaignChange,
  zoom = 1,
  onZoomChange,
  selectedElement: externalSelectedElement,
  onSelectedElementChange,
  selectedElements,
  onSelectedElementsChange,
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
  showJackpotPanel,
  onJackpotPanelChange,
  readOnly = false,
  containerClassName,
  updateQuizConfig,
  getCanonicalConfig,
  quizModalConfig,
  extractedColors
}, ref) => {

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoFitEnabledRef = useRef(true);
  
  // Utiliser la référence externe si fournie, sinon utiliser la référence interne
  const activeCanvasRef = ref || canvasRef;
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [mobileToolbarHeight, setMobileToolbarHeight] = useState<number>(0);
  // Always start with a valid numeric zoom (fallback 1). Clamp to [0.1, 1].
  const [localZoom, setLocalZoom] = useState<number>(
    typeof zoom === 'number' && !Number.isNaN(zoom)
      ? Math.max(0.1, Math.min(1, zoom))
      : 1
  );
  // Pan offset in screen pixels, applied before scale with origin at center for stable centering
  const [panOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const [showAnimationPopup, setShowAnimationPopup] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<any>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  // Marquee selection state
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);

  // Suppress the next click-clear after a marquee drag completes
  const suppressNextClickClearRef = useRef(false);

  // Precise DOM-measured bounds per element (canvas-space units)
  const [measuredBounds, setMeasuredBounds] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});

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

  // Derive simplified alignment bounds preferring measured layout when available
  const alignmentElements = useMemo(() => {
    return elements.map((el: any) => {
      const mb = measuredBounds[el.id];
      const x = (mb?.x != null) ? mb.x : Number(el.x) || 0;
      const y = (mb?.y != null) ? mb.y : Number(el.y) || 0;
      const width = (mb?.width != null) ? mb.width : Math.max(20, Number(el.width) || 100);
      const height = (mb?.height != null) ? mb.height : Math.max(20, Number(el.height) || 30);
      return { id: String(el.id), x, y, width, height };
    });
  }, [elements, measuredBounds]);

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
      setMobileToolbarHeight(toolbar?.getBoundingClientRect().height || 0);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // reference mobileToolbarHeight to satisfy TS when unused
  useEffect(() => {}, [mobileToolbarHeight]);
  // Optimisation mobile pour une expérience tactile parfaite

  // Intégration du système auto-responsive (doit être défini avant canvasSize)
  const { applyAutoResponsive, getPropertiesForDevice, DEVICE_DIMENSIONS } = useAutoResponsive();

  // Taille du canvas memoized
  const canvasSize = useMemo(() => {
    return DEVICE_DIMENSIONS[selectedDevice];
  }, [selectedDevice, DEVICE_DIMENSIONS]);

  // Forcer un format mobile 9:16 sans bordures ni encoches
  const effectiveCanvasSize = useMemo(() => {
    if (selectedDevice === 'mobile') {
      // 9:16 exact ratio
      return { width: 360, height: 640 };
    }
    return canvasSize;
  }, [selectedDevice, canvasSize]);

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
    snapTolerance: 3 // Réduit pour plus de précision
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
    // Utiliser la fonction externe si disponible
    if (externalOnElementUpdate && selectedElement === id) {
      // Appeler le handler externe pour la synchronisation/side-effects,
      // mais continuer la mise à jour locale pour garantir le re-render (ex: zIndex)
      try { externalOnElementUpdate(updates); } catch {}
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
      
      return base;
    });

    // Mettre en cache le résultat
    elementCache.set(cacheKey, { elements: updatedElements, timestamp: Date.now() });

    onElementsChange(updatedElements);

    // 🚀 Déclencher l'auto-save adaptatif avec activité intelligente
    const activityType = (updates.x !== undefined || updates.y !== undefined) ? 'drag' : 'click';
    const intensity = activityType === 'drag' ? 0.8 : 0.5;
    updateAutoSaveData(campaign, activityType, intensity);
  }, [elements, onElementsChange, applySnapping, elementCache, updateAutoSaveData, campaign, externalOnElementUpdate, selectedElement, selectedDevice, selectedGroupId]);

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


  // Compute canvas-space coordinates from a pointer event
  const getCanvasPointFromClient = useCallback((clientX: number, clientY: number) => {
    const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement>).current;
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
    if (e.pointerType !== 'touch' && e.button !== 0) return;
    if (e.pointerType === 'touch') {
      // Prevent native gestures from interfering with marquee start
      e.preventDefault();
    }
    // Start suppression so the subsequent synthetic click won't clear selection
    suppressNextClickClearRef.current = true;
    console.debug('🟦 Marquee start (pointerdown)', { clientX: e.clientX, clientY: e.clientY });
    // Start marquee selection
    const pt = getCanvasPointFromClient(e.clientX, e.clientY);
    marqueeStartRef.current = pt;
    setMarqueeEnd(pt);
    setIsMarqueeActive(true);
    // Mark canvas as marquee-active so mobile canvas lock can bypass blocking
    const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement>).current;
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
      const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement>).current;
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
        const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement>).current;
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
        const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement>).current;
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
      const canvasEl2 = (activeCanvasRef as React.RefObject<HTMLDivElement>).current;
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
        const snapped = applySnapping(newAbsX, newAbsY, newW, newH, String(el.id));
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
  }, [elements, onElementsChange, selectedElements, selectedDevice, getPropertiesForDevice, applySnapping, effectiveCanvasSize]);


  // Zoom au pincement (pinch) sur écrans tactiles
  useEffect(() => {
    const el = (typeof activeCanvasRef === 'object' && (activeCanvasRef as React.RefObject<HTMLDivElement>)?.current) as HTMLElement | null;
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
      const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement>)?.current;
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
      console.log('🎯 Événement applyTextEffect reçu:', event.detail);
      if (selectedElement) {
        console.log('✅ Application de l\'effet au texte sélectionné:', selectedElement);
        handleElementUpdate(selectedElement, event.detail);
      } else {
        console.log('❌ Aucun élément sélectionné pour appliquer l\'effet');
      }
    };

    window.addEventListener('applyTextEffect', handleApplyTextEffect as EventListener);
    return () => {
      window.removeEventListener('applyTextEffect', handleApplyTextEffect as EventListener);
    };
  }, [selectedElement]);

  // Écouteur d'événement pour afficher le popup d'animation
  useEffect(() => {
    const handleShowAnimationPopup = (event: CustomEvent) => {
      const { animation, selectedElementId } = event.detail;
      
      // Calculer la position du popup sous l'élément sélectionné
      const elementInDOM = document.querySelector(`[data-element-id="${selectedElementId}"]`);
      let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      
      if (elementInDOM) {
        const rect = elementInDOM.getBoundingClientRect();
        const canvasRect = (activeCanvasRef as React.RefObject<HTMLDivElement>).current?.getBoundingClientRect();
        
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

  // Hooks optimisés pour snapping (gardé pour compatibilité)
  // 🚀 Drag & drop ultra-fluide pour une expérience premium
  useUltraFluidDragDrop({
    containerRef: activeCanvasRef,
    snapToGrid: showGridLines,
    gridSize: 20,
    enableInertia: true,
    enabled: !readOnly,
    onDragStart: (elementId, position) => {
      // Enregistrer l'activité de début de drag
      recordActivity('drag', 0.9);
      // Marquer les éléments affectés pour le rendu optimisé
      const element = elementById.get(elementId);
      if (element) {
        markRegionsDirty([{ ...element, x: position.x, y: position.y }]);
      }
      elementCache.set(`drag-start-${elementId}`, { position, timestamp: Date.now() });
    },
    onDragMove: (elementId, position, velocity) => {
      // Optimiser le rendu en marquant seulement les éléments nécessaires
      const element = elementById.get(elementId);
      if (element) {
        markRegionsDirty([{ ...element, x: position.x, y: position.y }]);
      }
      const moveKey = `drag-move-${elementId}-${Math.floor(position.x/2)}-${Math.floor(position.y/2)}`;
      elementCache.set(moveKey, { position, velocity, timestamp: Date.now() });
    },
    onDragEnd: (elementId, position) => {
      // Finaliser le drag avec mise à jour des données
      const element = elementById.get(elementId);
      if (element) {
        markRegionsDirty([{ ...element, x: position.x, y: position.y }]);
      }
      handleElementUpdate(elementId, { x: position.x, y: position.y });
    }
  });

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

  // Tri mémoïsé par zIndex pour le rendu du canvas
  const elementsSortedByZIndex = useMemo(() => {
    return elementsWithResponsive.slice().sort((a: any, b: any) => {
      const za = typeof a.zIndex === 'number' ? a.zIndex : 0;
      const zb = typeof b.zIndex === 'number' ? b.zIndex : 0;
      return za - zb; // plus petit d'abord, plus grand rendu en dernier (au-dessus)
    });
  }, [elementsWithResponsive]);

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
        canvasRef={activeCanvasRef as React.RefObject<HTMLDivElement>}
        zoom={localZoom}
        forceDeviceType={selectedDevice}
        className={`design-canvas-container flex-1 h-full flex flex-col items-center justify-center p-4 ${containerClassName ? containerClassName : 'bg-gray-100'} relative`}
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
        {/* Canvas Toolbar - Show for text and shape elements */}
        {(!readOnly) && selectedElementData && (selectedElementData.type === 'text' || selectedElementData.type === 'shape') && (
          <div className="z-10 absolute top-4 left-1/2 transform -translate-x-1/2">
            <CanvasToolbar 
              selectedElement={{
                ...selectedElementData,
                ...getPropertiesForDevice(selectedElementData, selectedDevice)
              }} 
              onElementUpdate={updates => selectedElement && handleElementUpdate(selectedElement, updates)}
              onShowEffectsPanel={onShowEffectsPanel}
              onShowAnimationsPanel={onShowAnimationsPanel}
              onShowPositionPanel={onShowPositionPanel}
              onShowDesignPanel={onShowDesignPanel}
              onOpenElementsTab={onOpenElementsTab}
              canvasRef={activeCanvasRef as React.RefObject<HTMLDivElement>}
            />
          </div>
        )}
        
        <div 
          ref={containerRef} 
          className="flex justify-center items-center h-full w-full"
          onPointerDownCapture={(e) => {
            // Enable selecting elements even when they visually overflow outside the clipped canvas
            // Only handle when clicking outside the actual canvas element to avoid interfering
            const canvasEl = (activeCanvasRef as React.RefObject<HTMLDivElement>).current;
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
            className="flex justify-center items-center"
            style={{
              width: 'fit-content',
              height: 'fit-content',
              minHeight: 'auto'
            }}
          >
            <div 
              ref={activeCanvasRef}
              className="relative bg-transparent rounded-3xl overflow-hidden" 
              style={{
                width: `${effectiveCanvasSize.width}px`,
                height: `${effectiveCanvasSize.height}px`,
                minWidth: `${effectiveCanvasSize.width}px`,
                minHeight: `${effectiveCanvasSize.height}px`,
                flexShrink: 0,
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${localZoom})`,
                transformOrigin: 'center center',
                touchAction: 'none',
                userSelect: 'none',
                willChange: 'transform'
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
                background: background?.type === 'image' ? `url(${background.value}) center/cover no-repeat` : background?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
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

              {/* Fixed Form Overlay: configurable side/size/design */}
              {showFormOverlay && (() => {
                // Utiliser les données du store en temps réel pour la synchronisation
                const storeCampaign = useEditorStore.getState().campaign;
                const activeCampaign = storeCampaign || liveCampaign || campaign;
                
                const campaignDesign = (activeCampaign as any)?.design || {};
                // Position (left | right). Default: right
                const formPosition = (campaignDesign.formPosition as 'left' | 'right') || 'right';
                // Largeur du panneau configurée par l'utilisateur
                const formWidth = campaignDesign.formWidth || campaignDesign.formConfig?.widthPx ? `${campaignDesign.formConfig.widthPx}px` : 'min(640px, max(320px, calc(100% - 8%)))';
                const fields = (Array.isArray((activeCampaign as any)?.formFields) && (activeCampaign as any)?.formFields.length > 0)
                  ? (activeCampaign as any).formFields
                  : DEFAULT_FIELDS;
                const buttonColor = campaignDesign.buttonColor || '#841b60';
                const buttonTextColor = campaignDesign.buttonTextColor || '#ffffff';
                const borderColor = campaignDesign.borderColor || '#E5E7EB';
                const focusColor = buttonColor;
                const borderRadius = typeof campaignDesign.borderRadius === 'number' ? `${campaignDesign.borderRadius}px` : (campaignDesign.borderRadius || '12px');
                const inputBorderRadius = typeof campaignDesign.inputBorderRadius === 'number' ? campaignDesign.inputBorderRadius : (typeof campaignDesign.borderRadius === 'number' ? campaignDesign.borderRadius : 2);
                const panelBg = campaignDesign.blockColor || '#ffffff';
                const textColor = campaignDesign?.textStyles?.label?.color || '#111827';
                const title = (activeCampaign as any)?.screens?.[1]?.title || 'Vos informations';
                const description = (activeCampaign as any)?.screens?.[1]?.description || 'Remplissez le formulaire pour poursuivre';
                const submitLabel = (activeCampaign as any)?.screens?.[1]?.buttonText || 'Participer';

                // Aperçu mobile : layout scindé (bannière + formulaire)
                if (selectedDevice === 'mobile') {
                  const backgroundImage = campaignDesign.background?.value || campaignDesign.background;
                  
                  const content = (
                    <div className="flex flex-col w-full h-full" data-canvas-ui>
                      {/* Bannière image en haut */}
                      <div 
                        className="flex-shrink-0 bg-no-repeat flex items-center justify-center"
                        style={{
                          backgroundColor: backgroundImage ? 'transparent' : (campaignDesign.backgroundColor || '#f3f4f6')
                        }}
                      >
                        {backgroundImage && (
                          <img 
                            src={backgroundImage}
                            alt="Background"
                            className="w-full h-auto object-contain"
                            style={{
                              maxHeight: '60vh',
                              display: 'block'
                            }}
                          />
                        )}
                      </div>
                      
                      {/* Formulaire en bas */}
                      <div 
                        className="flex-1 p-6 overflow-y-auto"
                        style={{ 
                          backgroundColor: panelBg
                        }}
                      >
                        <div className="flex flex-col" style={{ color: textColor, fontFamily: campaignDesign.fontFamily }}>
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>{title}</h3>
                            <p className="text-sm opacity-75" style={{ color: textColor }}>{description}</p>
                          </div>
                          
                          <DynamicContactForm
                            fields={fields}
                            submitLabel={submitLabel}
                            onSubmit={() => {}}
                            textStyles={{
                              label: {
                                color: textColor,
                                fontFamily: campaignDesign.fontFamily,
                                fontSize: '14px',
                                fontWeight: '500'
                              },
                              button: {
                                backgroundColor: buttonColor,
                                color: buttonTextColor,
                                borderRadius: borderRadius,
                                fontFamily: campaignDesign.fontFamily,
                                fontWeight: '600',
                                fontSize: '16px'
                              }
                            }}
                            inputBorderColor={borderColor}
                            inputFocusColor={focusColor}
                            inputBorderRadius={inputBorderRadius}
                          />
                        </div>
                      </div>
                    </div>
                  );
                  // En mode preview (readOnly), on sort du canvas via portal plein écran.
                  if (readOnly) {
                    const node = (
                      <div className="fixed inset-0 z-[9998] flex flex-col">{content}</div>
                    );
                    return typeof document !== 'undefined' ? (createPortal(node, document.body) as any) : (node as any);
                  }
                  // En mode édition, on reste dans le cadre de l'appareil (canvas), sans portal.
                  return (
                    <div className="absolute inset-0 z-[60]">{content}</div>
                  );
                }

                // Aperçu desktop/tablet : modale classique
                return (
                  <div
                    className={`absolute z-[60] opacity-100 pointer-events-auto flex`}
                    style={{
                      // Centrage vertical et ancrage horizontal selon la position choisie
                      top: '50%',
                      transform: 'translateY(-50%)',
                      ...(formPosition === 'left' ? { left: '4%' } : { right: '4%' }),
                      // Largeur configurée par l'utilisateur
                      width: formWidth,
                      height: 'auto',
                      maxHeight: 'calc(100% - 32px)'
                    }}
                    data-canvas-ui
                  >
                    <div
                      className={`w-full shadow-2xl rounded-xl p-6 overflow-y-auto`}
                      style={{ backgroundColor: panelBg, maxHeight: 'calc(100% - 0px)' }}
                    >
                      <div className="flex flex-col" style={{ color: textColor, fontFamily: campaignDesign.fontFamily }}>
                        <div className="mb-4">
                          <h3 className="text-base font-semibold" style={{ color: textColor }}>{title}</h3>
                          <p className="text-xs opacity-80" style={{ color: textColor }}>{description}</p>
                        </div>
                        <div
                          className="rounded-md border"
                          style={{ borderColor, borderWidth: 2, borderRadius, backgroundColor: panelBg }}
                        >
                          <div className="p-3">
                            <DynamicContactForm
                              fields={fields}
                              onSubmit={() => {}}
                              submitLabel={submitLabel}
                              textStyles={{
                                label: { ...(campaignDesign.textStyles?.label || {}), color: textColor, fontFamily: campaignDesign.fontFamily },
                                button: {
                                  backgroundColor: buttonColor,
                                  color: buttonTextColor,
                                  borderRadius,
                                  fontFamily: campaignDesign.fontFamily,
                                  fontWeight: campaignDesign.textStyles?.button?.fontWeight,
                                  fontSize: campaignDesign.textStyles?.button?.fontSize,
                                },
                              }}
                              inputBorderColor={borderColor}
                              inputFocusColor={focusColor}
                              inputBorderRadius={inputBorderRadius}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
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
                
                return (
                  <div
                    role={showFormOverlay ? undefined : "button"}
                    tabIndex={showFormOverlay ? -1 : 0}
                    onPointerDown={(e) => {
                      // Empêcher toute interaction de déplacement/redimensionnement depuis la preview
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // Désactiver le panel quiz sur la page form-editor
                        if (showFormOverlay) return;
                        onQuizPanelChange?.(true);
                      }
                    }}
                    onClick={(e) => {
                      if (readOnly) return;
                      // Désactiver le panel quiz sur la page form-editor
                      if (showFormOverlay) return;
                      e.stopPropagation();
                      console.log('🔘 Clic sur le quiz: ouverture du panneau Configuration (sans déplacement/redimensionnement)');
                      onQuizPanelChange?.(true);
                    }}
                    className={`w-full h-full flex items-center justify-center ${showFormOverlay ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {/* Quiz supprimé du canvas */}
                  </div>
                );
              })()}

              {/* Bouton configuration quiz supprimé */}
            </div>

            {/* Canvas Elements - Rendu optimisé avec virtualisation */}
            {elementsSortedByZIndex
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

              // Ajouter l'offset du groupe pour fournir des coordonnées ABSOLUES au composant CanvasElement
              let elementForCanvas = elementWithResponsive;
              if ((element as any).parentGroupId) {
                const parentProps = devicePropsById.get((element as any).parentGroupId);
                if (parentProps) {
                  elementForCanvas = {
                    ...elementWithResponsive,
                    x: (Number(elementWithResponsive.x) || 0) + (Number(parentProps.x) || 0),
                    y: (Number(elementWithResponsive.y) || 0) + (Number(parentProps.y) || 0)
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
                  containerRef={activeCanvasRef as React.RefObject<HTMLDivElement>}
                  readOnly={readOnly}
                  onMeasureBounds={handleMeasureBounds}
                  onAddElement={(newElement) => {
                    const updatedElements = [...elements, newElement];
                    onElementsChange(updatedElements);
                    handleElementSelect(newElement.id);
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
                      ? 'bg-[hsl(var(--primary))] text-white hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)]' 
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
                      (selectedElements || []).map((e: any) => e.id)
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

            {/* Slot Jackpot Game - Feature Flag Controlled */}
            {isFeatureEnabled('slotJackpot') && (
              <SlotJackpot
                onWin={(result) => {
                  alert(`🎉 JACKPOT! ${result.join(' ')}`);
                }}
                onLose={() => {
                  // Handle loss case if needed
                }}
                disabled={readOnly}
                onOpenConfig={() => {
                  onJackpotPanelChange?.(true);
                }}
              />
            )}

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
                transformOrigin: 'center center',
                zIndex: 100
              }}
            />
          </div>
        </div>

        {/* Canvas Info - desktop only */}
        {selectedDevice === 'desktop' && (
          <div className="text-center mt-4 text-sm text-gray-500">
            {selectedDevice} • {effectiveCanvasSize.width} × {effectiveCanvasSize.height}px • Cliquez sur la roue pour changer le style de bordure
          </div>
        )}

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
                        groupElements.map(el => el.id)
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
        
        

        
        
        {/* Barre d'échelle de zoom (overlay bas-centre) */}
        {selectedDevice !== 'mobile' && (
          <ZoomSlider
            zoom={localZoom}
            onZoomChange={handleZoomChange}
            minZoom={0.1}
            maxZoom={1}
            step={0.05}
            defaultZoom={deviceDefaultZoom}
          />
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
