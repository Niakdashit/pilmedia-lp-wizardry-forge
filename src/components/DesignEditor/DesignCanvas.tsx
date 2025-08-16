import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from './CanvasElement';
import CanvasToolbar from './CanvasToolbar';
import StandardizedWheel from '../shared/StandardizedWheel';
import WheelConfigModal from './WheelConfigModal';
import AlignmentGuides from './components/AlignmentGuides';
import GridOverlay from './components/GridOverlay';
import WheelSettingsButton from './components/WheelSettingsButton';
import ZoomSlider from './components/ZoomSlider';
import GroupSelectionFrame from './components/GroupSelectionFrame';
import { useAutoResponsive } from '../../hooks/useAutoResponsive';
import { useSmartSnapping } from '../ModernEditor/hooks/useSmartSnapping';
import { useAdvancedCache } from '../ModernEditor/hooks/useAdvancedCache';
import { useAdaptiveAutoSave } from '../ModernEditor/hooks/useAdaptiveAutoSave';
import { useUltraFluidDragDrop } from '../ModernEditor/hooks/useUltraFluidDragDrop';
import { useVirtualizedCanvas } from '../ModernEditor/hooks/useVirtualizedCanvas';
import { useEditorStore } from '../../stores/editorStore';
import CanvasContextMenu from './components/CanvasContextMenu';

import AnimationSettingsPopup from './panels/AnimationSettingsPopup';

import MobileResponsiveLayout from './components/MobileResponsiveLayout';
import type { DeviceType } from '../../utils/deviceDimensions';
import { isRealMobile } from '../../utils/isRealMobile';

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
  // Props pour la gestion des groupes
  selectedGroupId?: string;
  onSelectedGroupChange?: (groupId: string | null) => void;
  groups?: any[];
  onGroupMove?: (groupId: string, deltaX: number, deltaY: number) => void;
  onGroupResize?: (groupId: string, bounds: any) => void;
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
  onShowPositionPanel?: () => void;
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
  updateWheelConfig?: (updates: any) => void;
  getCanonicalConfig?: (options?: { device?: string; shouldCropWheel?: boolean }) => any;
  // Read-only mode to disable interactions
  readOnly?: boolean;
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
  updateWheelConfig,
  getCanonicalConfig,
  readOnly = false
}, ref) => {

  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Utiliser la référence externe si fournie, sinon utiliser la référence interne
  const activeCanvasRef = ref || canvasRef;
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [localZoom, setLocalZoom] = useState(zoom);
  const [showBorderModal, setShowBorderModal] = useState(false);
  
  const [showAnimationPopup, setShowAnimationPopup] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<any>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [mobileToolbarHeight, setMobileToolbarHeight] = useState(0);
  // Prevent repeated auto-fit on mobile when viewing desktop canvas
  const didAutoFitRef = useRef(false);
  // Marquee selection state
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);

  // Precise DOM-measured bounds per element (canvas-space units)
  const [measuredBounds, setMeasuredBounds] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});

  // Stable origin bounds for resize interactions to prevent drift
  const multiResizeOriginRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  // Per-element snapshot at resize start to avoid cumulative errors and apply per-element rules
  const multiResizeElementsSnapshotRef = useRef<Record<string, { absX: number; absY: number; width: number; height: number; fontSize?: number; parentAbsX: number; parentAbsY: number }>>({});
  const groupResizeOriginRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const groupResizeElementsSnapshotRef = useRef<Record<string, { absX: number; absY: number; width: number; height: number; fontSize?: number; parentAbsX: number; parentAbsY: number }>>({});
  const handleMeasureBounds = useCallback((id: string, rect: { x: number; y: number; width: number; height: number }) => {
    setMeasuredBounds(prev => {
      const prevRect = prev[id];
      if (prevRect && prevRect.x === rect.x && prevRect.y === rect.y && prevRect.width === rect.width && prevRect.height === rect.height) {
        return prev;
      }
      return { ...prev, [id]: rect };
    });
  }, []);

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

  // Handlers optimisés avec snapping et cache intelligent (moved earlier)
  const handleElementUpdate = useCallback((id: string, updates: any) => {
    // Utiliser la fonction externe si disponible
    if (externalOnElementUpdate && selectedElement === id) {
      externalOnElementUpdate(updates);
      return;
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

    // Appliquer le snapping si c'est un déplacement (avant de répartir par device)
    if (workingUpdates.x !== undefined && workingUpdates.y !== undefined) {
      const element = elementById.get(id);
      if (element) {
        const snappedPosition = applySnapping(
          workingUpdates.x,
          workingUpdates.y,
          element.width || 100,
          element.height || 100,
          id
        );
        workingUpdates.x = snappedPosition.x;
        workingUpdates.y = snappedPosition.y;

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
    // Clamp le zoom entre 0.1 et 1.0 (100%)
    const clamped = Math.max(0.1, Math.min(1, zoom));
    setLocalZoom(clamped);
  }, [zoom]);

  // Définir le zoom par défaut selon l'appareil
  // - Mobile: 85%
  // - Tablette: 60%
  // - Desktop: 70%
  useEffect(() => {
    const defaultZoom =
      selectedDevice === 'mobile' ? 0.85 :
      selectedDevice === 'tablet' ? 0.6 : 0.7;

    setLocalZoom(defaultZoom);
    if (onZoomChange) {
      onZoomChange(defaultZoom);
    }
  }, [selectedDevice]);

  // Calculer le zoom par défaut selon l'appareil (pour le bouton reset)
  const deviceDefaultZoom = useMemo(() => {
    return selectedDevice === 'mobile' ? 0.85 :
           selectedDevice === 'tablet' ? 0.6 : 0.7;
  }, [selectedDevice]);

  // Auto-fit: if on a real mobile device but viewing the desktop canvas, fit the canvas to viewport
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isRealMobile() || selectedDevice !== 'desktop') return;

    const computeAndApplyFit = () => {
      // Only auto-fit once until orientation changes
      if (didAutoFitRef.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Match paddings used in the container around the canvas for desktop-on-mobile
      const paddingTop = 32;
      const paddingBottom = mobileToolbarHeight; // space reserved for MobileSidebarDrawer
      const paddingLeft = 20;
      const paddingRight = 20;

      const availableWidth = Math.max(0, viewportWidth - paddingLeft - paddingRight);
      const availableHeight = Math.max(0, viewportHeight - paddingTop - paddingBottom);

      const targetW = effectiveCanvasSize.width;
      const targetH = effectiveCanvasSize.height;

      if (targetW > 0 && targetH > 0 && availableWidth > 0 && availableHeight > 0) {
        const scaleX = availableWidth / targetW;
        const scaleY = availableHeight / targetH;
        const fitted = Math.min(scaleX, scaleY, 1);
        const clamped = Math.max(0.1, Math.min(1, fitted));

        setLocalZoom(clamped);
        onZoomChange?.(clamped);
        didAutoFitRef.current = true;
      }
    };

    // Initial fit
    computeAndApplyFit();

    // Re-fit on orientation changes
    const handleOrientation = () => {
      didAutoFitRef.current = false;
      // Allow the browser to update innerWidth/innerHeight first
      requestAnimationFrame(() => computeAndApplyFit());
    };
    window.addEventListener('orientationchange', handleOrientation);
    return () => window.removeEventListener('orientationchange', handleOrientation);
  }, [selectedDevice, effectiveCanvasSize, onZoomChange, mobileToolbarHeight]);

  // Handler centralisé pour changer le zoom depuis la barre d'échelle
  const handleZoomChange = useCallback((value: number) => {
    // Clamp le zoom entre 0.1 et 1.0 (100%)
    const clamped = Math.max(0.1, Math.min(1, value));
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
    // Only react to primary button
    if (e.button !== 0) return;
    // Start marquee selection
    const pt = getCanvasPointFromClient(e.clientX, e.clientY);
    marqueeStartRef.current = pt;
    setMarqueeEnd(pt);
    setIsMarqueeActive(true);

    // Clear single selection immediately; multi selection will be set on pointerup
    setSelectedElement(null);
    onSelectedElementChange?.(null);

    // Setup global listeners
    const onMove = (ev: PointerEvent) => {
      if (!marqueeStartRef.current) return;
      const p = getCanvasPointFromClient(ev.clientX, ev.clientY);
      setMarqueeEnd(p);
    };
    const onUp = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);

      if (!marqueeStartRef.current) {
        setIsMarqueeActive(false);
        setMarqueeEnd(null);
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
      const MIN_SIZE = 3; // canvas-space px
      if (width < MIN_SIZE && height < MIN_SIZE) {
        onSelectedElementsChange?.([]);
        setIsMarqueeActive(false);
        setMarqueeEnd(null);
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
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
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
    let startDist = 0;
    let startZoom = 1;

    const getDist = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
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
      if (e.touches.length === 2) {
        isPinching = true;
        startDist = getDist(e.touches);
        startZoom = localZoom;
        e.preventDefault();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isPinching && e.touches.length === 2) {
        const newDist = getDist(e.touches);
        const ratio = newDist / startDist;
        const accelerated = Math.pow(ratio, 1.35);
        const newZoom = Math.max(0.1, Math.min(1.0, startZoom * accelerated));
        pendingZoomRef.current = newZoom;
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(flushZoom);
        }
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      if (isPinching) {
        isPinching = false;
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
  }, [activeCanvasRef, localZoom, onZoomChange]);


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
  }, [localZoom, activeCanvasRef]);

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

  // Store centralisé pour la grille
  const { showGridLines, setShowGridLines } = useEditorStore();

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

  // Configuration canonique de la roue
  const wheelConfig = useMemo(() =>
    getCanonicalConfig
      ? getCanonicalConfig({ device: selectedDevice, shouldCropWheel: true })
      : { borderStyle: 'classic', borderColor: '#841b60', borderWidth: 12, scale: 1 },
    [getCanonicalConfig, selectedDevice]
  );



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

  // Calculer des positions ABSOLUES pour les éléments enfants de groupe
  // (x,y absolus = x,y relatifs à leur groupe + position absolue du groupe)
  const elementsWithAbsolute = useMemo(() => {
    return elementsWithResponsive.map((el: any) => {
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
  }, [elementsWithResponsive, devicePropsById, getPropertiesForDevice, selectedDevice]);

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
      // Remettre le background par défaut
      const defaultBackground = {
        type: 'color' as const,
        value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
      };
      // Déclencher un événement personnalisé pour notifier le changement de background
      const event = new CustomEvent('backgroundChange', { detail: defaultBackground });
      window.dispatchEvent(event);
      console.log('Arrière-plan supprimé');
    }
  }, [background]);
  const selectedElementData = selectedElement ? elementById.get(selectedElement) ?? null : null;

  // Les segments et tailles sont maintenant gérés par StandardizedWheel
  return (
    <DndProvider backend={HTML5Backend}>
      <MobileResponsiveLayout
        selectedElement={selectedElementData || undefined}
        onElementUpdate={(updates) => {
          if (selectedElement) {
            handleElementUpdate(selectedElement, updates);
          }
        }}
        onShowEffectsPanel={onShowEffectsPanel}
        onShowAnimationsPanel={onShowAnimationsPanel}
        onShowPositionPanel={onShowPositionPanel}
        canvasRef={activeCanvasRef as React.RefObject<HTMLDivElement>}
        zoom={zoom}
        forceDeviceType={selectedDevice}
        className="design-canvas-container flex-1 flex flex-col items-center justify-center p-4 bg-gray-100 relative overflow-hidden"
        // Props pour la sidebar mobile
        onAddElement={onAddElement}
        onBackgroundChange={onBackgroundChange}
        onExtractedColorsChange={onExtractedColorsChange}
        campaignConfig={campaign}
        onCampaignConfigChange={onCampaignChange}
        elements={elements}
        onElementsChange={onElementsChange}
        // Props pour la toolbar mobile
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      >
        {/* Canvas Toolbar - Only show when text element is selected */}
        {(!readOnly) && selectedElementData && selectedElementData.type === 'text' && (
          <div className="z-10 absolute top-4 left-1/2 transform -translate-x-1/2">
            <CanvasToolbar 
              selectedElement={selectedElementData} 
              onElementUpdate={updates => selectedElement && handleElementUpdate(selectedElement, updates)}
              onShowEffectsPanel={onShowEffectsPanel}
              onShowAnimationsPanel={onShowAnimationsPanel}
              onShowPositionPanel={onShowPositionPanel}
              onOpenElementsTab={onOpenElementsTab}
              canvasRef={activeCanvasRef as React.RefObject<HTMLDivElement>}
            />
          </div>
        )}
        
        <div className="flex justify-center items-center h-full w-full" style={{
          // Padding fixe (indépendant du zoom) pour garantir un centrage stable
          paddingTop: selectedDevice === 'tablet' ? 48 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 32),
          paddingLeft: selectedDevice === 'tablet' ? 32 : 20,
          paddingRight: selectedDevice === 'tablet' ? 32 : 20,
          paddingBottom: (isRealMobile() ? `calc(${mobileToolbarHeight}px + env(safe-area-inset-bottom))` : (selectedDevice === 'tablet' ? 48 : 32)),
          transition: 'padding 0.2s ease-in-out',
          minHeight: '100%'
        }}>
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
              className="relative bg-white rounded-3xl overflow-hidden" 
              style={{
                width: `${effectiveCanvasSize.width}px`,
                height: `${effectiveCanvasSize.height}px`,
                minWidth: `${effectiveCanvasSize.width}px`,
                minHeight: `${effectiveCanvasSize.height}px`,
                flexShrink: 0,
                transform: `scale(${localZoom})`,
                transformOrigin: 'center center',
                touchAction: 'none',
                transition: 'transform 0.15s ease-out',
                willChange: 'transform'
              }}
            onMouseDown={(e) => {
              if (readOnly) return; // Guard in read-only mode
              if (e.target === e.currentTarget) {
                setSelectedElement(null);
                // 🎯 CORRECTION: Notifier le changement de sélection vers l'extérieur
                if (onSelectedElementChange) {
                  console.log('🎯 Canvas container click - clearing selection via onSelectedElementChange');
                  onSelectedElementChange(null);
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
              
              {/* Alignment Guides */}
              <AlignmentGuides
                canvasSize={effectiveCanvasSize}
                elements={elementsWithAbsolute}
                zoom={localZoom}
              />
              
              {/* Clouds */}
              
              
              
              
              
              {/* Roue standardisée avec découpage cohérent */}
              <StandardizedWheel
                campaign={campaign}
                device={selectedDevice}
                shouldCropWheel={true}
                disabled={readOnly}
                onClick={() => {
                  if (readOnly) return;
                  console.log('🔘 Clic sur la roue détecté');
                  setShowBorderModal(true);
                }}
              />

              {/* Bouton roue fortune ABSOLU dans le canvas d'aperçu */}
              {!readOnly && (
                <div className="absolute bottom-2 right-2 z-50">
                  <WheelSettingsButton
                    onClick={() => {
                      console.log('🔘 Clic sur WheelSettingsButton détecté');
                      setShowBorderModal(true);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Canvas Elements - Rendu optimisé avec virtualisation */}
            {elementsWithResponsive
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
              const elementWithResponsive = {
                ...element,
                x: responsiveProps.x,
                y: responsiveProps.y,
                width: responsiveProps.width,
                height: responsiveProps.height,
                fontSize: responsiveProps.fontSize,
                // Appliquer l'alignement de texte responsive si disponible
                textAlign: responsiveProps.textAlign || element.textAlign
              };

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

            </div>
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
                    onResizeStart={(origin, _handle) => {
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
        
        

        {/* Modal pour la configuration de la roue */}
        <WheelConfigModal
          isOpen={showBorderModal}
          onClose={() => setShowBorderModal(false)}
          wheelBorderStyle={wheelConfig.borderStyle}
          wheelBorderColor={wheelConfig.borderColor}
          wheelBorderWidth={wheelConfig.borderWidth}
          wheelScale={wheelConfig.scale}
          wheelShowBulbs={!!wheelConfig.showBulbs}
          wheelPosition={(wheelConfig as any)?.position || 'center'}

          onBorderStyleChange={(style) => updateWheelConfig?.({ borderStyle: style })}
          onBorderColorChange={(color) => updateWheelConfig?.({ borderColor: color })}
          onBorderWidthChange={(width) => updateWheelConfig?.({ borderWidth: width })}
          onScaleChange={(scale) => updateWheelConfig?.({ scale })}
          onShowBulbsChange={(show) => updateWheelConfig?.({ showBulbs: show })}
          onPositionChange={(position) => updateWheelConfig?.({ position })}

          selectedDevice={selectedDevice}
        />
        
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