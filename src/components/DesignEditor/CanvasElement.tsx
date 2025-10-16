import React, { useCallback, useMemo, useRef } from 'react';
import { RotateCw } from 'lucide-react';
import ShapeRenderer from './components/ShapeRenderer';
import { SmartWheel } from '../SmartWheel';
import { useUniversalResponsive } from '../../hooks/useUniversalResponsive';
import { useTouchOptimization } from './hooks/useTouchOptimization';
import TextContextMenu from './components/TextContextMenu';
import { useEditorStore } from '../../stores/editorStore';
import type { DeviceType } from '../../utils/deviceDimensions';
import { getCanvasViewport } from './core/Transform';
import { createPreciseDrag } from './core/Drag';
import { useSmartSnapping } from '../ModernEditor/hooks/useSmartSnapping';
import { usePinchResize } from './hooks/usePinchResize';
import { usePrizeLogic } from '../../hooks/usePrizeLogic';
import type { CampaignConfig } from '../../types/PrizeSystem';

// Professional drag & drop implementation - Excalidraw/Canva precision

export interface CanvasElementProps {
  element: any;
  isSelected: boolean;
  onSelect: (id: string, isMultiSelect?: boolean) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  selectedDevice: DeviceType;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onAddElement?: (element: any) => void;
  elements?: any[];
  readOnly?: boolean;
  onMeasureBounds?: (id: string, rect: { x: number; y: number; width: number; height: number }) => void;
  // Additional selection context passed by DesignCanvas
  isMultiSelecting?: boolean;
  isGroupSelecting?: boolean;
  // Currently active group ID (if any). When set, children of this group are locked from direct manipulation
  activeGroupId?: string | null;
  // Campaign data for wheel elements
  campaign?: CampaignConfig;
  // Extracted colors from background image
  extractedColors?: string[];
  // New alignment system
  alignmentSystem?: {
    snapElement: (element: { x: number; y: number; width: number; height: number; id: string }) => { x: number; y: number; guides: any[] };
    startDragging: () => void;
    stopDragging: () => void;
  };
  // Optional map of custom renderers keyed by element.type
  customRenderers?: Record<string, (args: {
    element: any;
    selectedDevice: DeviceType;
    readOnly: boolean;
    elementStyle: React.CSSProperties;
    deviceProps: any;
  }) => React.ReactNode>;
}

const CanvasElement: React.FC<CanvasElementProps> = React.memo(({
  element,
  isSelected,
  selectedDevice,
  onSelect,
  onUpdate,
  onDelete,
  containerRef,
  onAddElement,
  elements,
  readOnly = false,
  onMeasureBounds,
  isMultiSelecting,
  isGroupSelecting,
  activeGroupId,
  campaign,
  extractedColors,
  alignmentSystem,
  customRenderers = {}
}) => {
  const { getPropertiesForDevice } = useUniversalResponsive('desktop');
  
  // Get wheel segments from campaign for wheel elements
  const { segments: campaignSegments } = usePrizeLogic({
    campaign: campaign as CampaignConfig,
    setCampaign: () => {} // Read-only
  });
  
  console.log('🎨 CanvasElement: Campaign segments for wheel', {
    elementType: element.type,
    campaignId: campaign?.id,
    campaignSegments,
    segmentCount: campaignSegments.length,
    campaignWheelConfig: (campaign as any)?.wheelConfig?.segments,
    lastUpdate: (campaign as any)?._lastUpdate,
    extractedColors: extractedColors
  });
  
  // 📱 Hook d'optimisation tactile pour mobile/tablette
  const touchOptimization = useTouchOptimization({
    selectedDevice,
    containerRef
  });

  // 🤏 Hook de pincement pour redimensionnement tactile
  const { attachListeners: attachPinchListeners } = usePinchResize({
    onResize: (scaleX, scaleY) => {
      if (!isSelected || readOnly) return;
      
      const currentWidth = Number(deviceProps.width) || 100;
      const currentHeight = Number(deviceProps.height) || 100;
      
      const newWidth = Math.max(20, currentWidth * scaleX);
      const newHeight = Math.max(20, currentHeight * scaleY);
      
      onUpdate(element.id, {
        width: newWidth,
        height: newHeight,
        fontSize: element.type === 'text' ? Math.max(8, (Number(element.fontSize) || 16) * scaleY) : element.fontSize
      });
    },
    onResizeStart: () => {
      setIsResizing(true);
      console.log('🤏 Pinch resize started for element:', element.id);
    },
    onResizeEnd: () => {
      setIsResizing(false);
      console.log('🤏 Pinch resize ended for element:', element.id);
    },
    minScale: 0.5,
    maxScale: 3,
    maintainAspectRatio: element.type === 'image'
  });

  // Get device-specific properties with proper typing - memoized
  const deviceProps = useMemo(
    () => getPropertiesForDevice(element, selectedDevice),
    [element, selectedDevice, getPropertiesForDevice]
  );

  const isLaunchButton = useMemo(() => {
    const role = (element as any)?.role;
    return typeof role === 'string' && role.toLowerCase() === 'button';
  }, [element]);

  // Report current bounds (canvas-space) to parent for accurate group/marquee calculations
  const reportBounds = useCallback((override?: { x?: number; y?: number; width?: number; height?: number }) => {
    if (!onMeasureBounds) return;
    const ref = elementRef.current;
    if (!ref) return;
    const width = override?.width ?? ref.offsetWidth;
    const height = override?.height ?? ref.offsetHeight;
    const x = override?.x ?? (Number(deviceProps.x) || 0);
    const y = override?.y ?? (Number(deviceProps.y) || 0);
    if (width && height) {
      onMeasureBounds(element.id, { x, y, width, height });
    }
  }, [onMeasureBounds, element.id, deviceProps.x, deviceProps.y]);

  // Schedule a post-commit DOM re-measure after React updates settle
  const schedulePostCommitMeasure = useCallback(() => {
    if (!onMeasureBounds) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        reportBounds();
      });
    });
  }, [onMeasureBounds, reportBounds]);

  React.useEffect(() => {
    // Initial and reactive measurement
    reportBounds();
    if (!elementRef.current) return;
    const ro = new ResizeObserver(() => reportBounds());
    ro.observe(elementRef.current);
    const onWinResize = () => reportBounds();
    window.addEventListener('resize', onWinResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
  // Re-measure when content/layout-affecting props change
  }, [reportBounds, element.content, element.width, element.height, element.fontSize, element.style, deviceProps.x, deviceProps.y]);

  // Attacher les listeners de pincement à l'élément
  React.useEffect(() => {
    if (!elementRef.current || readOnly) return;
    
    const cleanup = attachPinchListeners(elementRef.current);
    return cleanup;
  }, [attachPinchListeners, readOnly]);
  

  const [isEditing, setIsEditing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const textRef = React.useRef<HTMLDivElement>(null);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const liveRectRef = React.useRef<{ x: number; y: number; width?: number; height?: number; fontSize?: number } | null>(null);
  const editingTextRef = React.useRef<string>('');
  const dragSystemRef = useRef<ReturnType<typeof createPreciseDrag> | null>(null);
  const [isRotating, setIsRotating] = React.useState(false);
  const [tempRotation, setTempRotation] = React.useState<number | null>(null);
  // Temporary hide flag triggered by UI adjustments (e.g., border radius slider)
  const [tempHideControls, setTempHideControls] = React.useState(false);

  // Determine if the element is inside a designated zone/container (e.g., group)
  // We check common fields used for nesting/containerization.
  const isInZone = Boolean((element as any)?.parentGroupId || (element as any)?.containerId || (element as any)?.zoneId);

  // Centralized flag to hide controls based on context
  const shouldHideControls = Boolean(isInZone || isMultiSelecting || isGroupSelecting);
  const hideControls = shouldHideControls || tempHideControls;

  // Listen to toolbar events to hide/show selection while adjusting values
  React.useEffect(() => {
    const onAdjust = (e: Event) => {
      const anyEvt = e as CustomEvent<{ hide?: boolean; reason?: string }>;
      const reason = anyEvt.detail?.reason;
      if (reason === 'borderRadius' || reason === 'border' || reason === 'generic') {
        setTempHideControls(Boolean(anyEvt.detail?.hide));
      }
    };
    document.addEventListener('uiAdjustingSelection', onAdjust as EventListener);
    return () => {
      document.removeEventListener('uiAdjustingSelection', onAdjust as EventListener);
      // Ensure controls are restored on unmount
      setTempHideControls(false);
    };
  }, []);

  // Normalize angle to [-180, 180] inclusive (keep -180 and 180 as is)
  const normalize180 = useCallback((deg: number) => {
    return ((deg + 180) % 360 + 360) % 360 - 180;
  }, []);

  // Smart snapping integration for alignment guides and snapping during drag
  const { applySnapping } = useSmartSnapping({
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    gridSize: 20,
    snapTolerance: 3
  });

  // Global clipboard from store
  const clipboard = useEditorStore(state => state.clipboard);
  const setClipboard = useEditorStore(state => state.setClipboard);
  const canPaste = useEditorStore(state => state.canPaste);

  // Professional drag system (Excalidraw/Canva precision)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (readOnly) return; // Disable drag & selection in read-only mode
    // Do not initiate drag when interacting with editable controls or while text is in edit mode
    const targetEl = e.target as HTMLElement;
    if (
      targetEl.closest('input, textarea, [contenteditable="true"]') ||
      (element.type === 'text' && isEditing)
    ) {
      e.stopPropagation();
      return;
    }
    // If a group is selected and this element is a child of that group, lock interactions
    if (activeGroupId && (element as any)?.parentGroupId === activeGroupId) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (isLaunchButton) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelect(element.id, isMultiSelect);
    
    const el = elementRef.current;
    const canvasEl = containerRef?.current;
    if (!el || !canvasEl) return;

    // UTILISER LES COORDONNÉES MODÈLE: évite le drift avec rotation et zoom
    // Les paramètres de translation CSS utilisent x/y en unités canvas.
    const currentCanvasX = Number(deviceProps.x) || 0;
    const currentCanvasY = Number(deviceProps.y) || 0;

    // Créer le système de drag professionnel
    const getViewport = () => getCanvasViewport(canvasEl);
    const getItem = () => ({
      // Utiliser les coordonnées canvas (indépendantes du zoom)
      x: currentCanvasX,
      y: currentCanvasY,
      w: deviceProps.width || 100,
      h: deviceProps.height || 30
    });
    
    // Variable pour tracker la dernière position pendant le drag
    let lastDragPosition = { x: currentCanvasX, y: currentCanvasY };
    
    // Cache metrics at drag start to avoid repeated layout reads
    // Plus de clamp aux bords, on ne calcule plus les bornes du canevas
    const refEl = elementRef.current;
    const layoutW = refEl ? refEl.offsetWidth : undefined;
    const layoutH = refEl ? refEl.offsetHeight : undefined;
    const elW = (deviceProps.width != null) ? Number(deviceProps.width) : (layoutW ?? 100);
    const elH = (deviceProps.height != null) ? Number(deviceProps.height) : (layoutH ?? 30);

    // Throttle updates to once per frame
    let dragRafId: number | null = null;
    let pendingXY: { x: number; y: number } | null = null;

    const setItemPos = (x: number, y: number) => {
      pendingXY = { x, y };
      if (dragRafId != null) return;
      dragRafId = requestAnimationFrame(() => {
        dragRafId = null;
        if (!pendingXY) return;
        const { x, y } = pendingXY;
        pendingXY = null;

        // Utiliser le NOUVEAU système d'alignement pour calculer le snapping + guides
        // Fallback sur les coords brutes si le système n'est pas fourni
        let sx = x;
        let sy = y;
        if (alignmentSystem) {
          const snapResult = alignmentSystem.snapElement({
            x,
            y,
            width: elW,
            height: elH,
            id: String(element.id)
          });
          sx = snapResult.x;
          sy = snapResult.y;
        }

        // Autoriser le dépassement hors canevas: pas de clamp
        const cx = sx;
        const cy = sy;

        // Sauvegarder la position pour la fin du drag
        lastDragPosition = { x: cx, y: cy };

        // Mise à jour immédiate du transform avec la position clampée
        if (elementRef.current) {
          const angleRaw = typeof element.rotation === 'number' ? element.rotation : 0;
          const angle = normalize180(angleRaw);
          elementRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${angle}deg)`;
        }

        // Report live bounds during drag pour un cadre de groupe précis (throttled)
        reportBounds({ x: cx, y: cy, width: elW, height: elH });

        // Assurer l'état de drag actif pour le rendu des guides
        if (alignmentSystem) {
          alignmentSystem.startDragging();
        }

        // Marquer comme en cours de drag
        if (!isDragging) {
          setIsDragging(true);
        }
      });
    };

    // Initialiser le drag system avec seuil de 5px (converti en unités canvas dynamiquement)
    const initialViewportForThreshold = getCanvasViewport(canvasEl);
    const z = initialViewportForThreshold.zoom || 1;
    const thresholdCanvas = 5 / z;
    dragSystemRef.current = createPreciseDrag(
      getViewport,
      getItem,
      setItemPos,
      thresholdCanvas
    );

    // Gérer la fin du drag
    const originalOnPointerDown = dragSystemRef.current.onPointerDown;
    const enhancedOnPointerDown = (evt: PointerEvent, hostEl: HTMLElement) => {
      // Intercepter la fin du drag pour sauvegarder
      const originalUp = document.onpointerup;
      const enhancedUp = (upEvt: PointerEvent) => {
        if (originalUp) originalUp.call(document, upEvt);
        
        // Sauvegarder la position finale si on a bougé
        if (dragSystemRef.current?.isActive()) {
          const finalState = dragSystemRef.current.getState();
          if (finalState.started) {
            // SOLUTION MOBILE: Utiliser directement la dernière position trackée
            // au lieu de recalculer avec viewport (qui peut être incorrect sur mobile)
            onUpdate(element.id, { 
              x: Math.round(lastDragPosition.x * 100) / 100,
              y: Math.round(lastDragPosition.y * 100) / 100
            });
          }
        }
        
        // Stop dragging in new alignment system
        if (alignmentSystem) {
          alignmentSystem.stopDragging();
        }

        setIsDragging(false);
        // Ensure measured bounds are refreshed after drag commit
        schedulePostCommitMeasure();
        document.onpointerup = originalUp;
      };
      
      document.onpointerup = enhancedUp;
      originalOnPointerDown(evt, hostEl);
    };

    // Démarrer le drag professionnel
    enhancedOnPointerDown(e.nativeEvent, el);
  }, [element.id, onSelect, containerRef, onUpdate, deviceProps, isDragging, readOnly, applySnapping, activeGroupId, element, schedulePostCommitMeasure]);

  // Optimized text editing handlers with useCallback - MOVED BEFORE renderElement
  const handleDoubleClick = useCallback(() => {
    if (readOnly || isLaunchButton) return; // Disable entering edit mode for fixed button
    if (element.type === 'text' || element.type === 'shape') {
      setIsEditing(true);
    }
  }, [element.type, readOnly, isLaunchButton]);


  // Commit edits on blur/Enter without re-rendering per keystroke
  const commitEditingContent = useCallback(() => {
    const newText = (editingTextRef.current ?? '').replace(/\n/g, '');
    const current = element.content ?? '';
    if (newText !== current) {
      onUpdate(element.id, { content: newText });
    }
  }, [element.content, element.id, onUpdate]);

  const handleTextKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const isMod = isMac ? (e.metaKey as boolean) : (e.ctrlKey as boolean);

    if (isMod) {
      const key = e.key.toLowerCase();

      if (key === 'b') {
        e.preventDefault();
        onUpdate(element.id, {
          fontWeight: (element.fontWeight === 'bold' || element.style?.fontWeight === 'bold') ? 'normal' : 'bold'
        });
        return;
      }

      if (key === 'i') {
        e.preventDefault();
        onUpdate(element.id, {
          fontStyle: (element.fontStyle === 'italic' || element.style?.fontStyle === 'italic') ? 'normal' : 'italic'
        });
        return;
      }

      if (key === 'u') {
        e.preventDefault();
        const current = element.textDecoration || element.style?.textDecoration || 'none';
        const next = current.includes('underline')
          ? (current.replace('underline', '').replace(/\s+/g, ' ').trim() || 'none')
          : ((current === 'none' || !current) ? 'underline' : `${current} underline`);
        onUpdate(element.id, { textDecoration: next });
        return;
      }

      if (e.shiftKey && key === 'l') {
        e.preventDefault();
        onUpdate(element.id, { textAlign: 'left' });
        return;
      }
      if (e.shiftKey && key === 'c') {
        e.preventDefault();
        onUpdate(element.id, { textAlign: 'center' });
        return;
      }
      if (e.shiftKey && key === 'r') {
        e.preventDefault();
        onUpdate(element.id, { textAlign: 'right' });
        return;
      }

      if (e.shiftKey && (key === '.' || e.key === '.')) {
        e.preventDefault();
        const cur = typeof element.fontSize === 'number' ? element.fontSize : parseInt((element.style?.fontSize as any) || '16', 10);
        onUpdate(element.id, { fontSize: Math.min(200, (isNaN(cur) ? 16 : cur) + 1) });
        return;
      }
      if (e.shiftKey && (key === ',' || e.key === ',')) {
        e.preventDefault();
        const cur = typeof element.fontSize === 'number' ? element.fontSize : parseInt((element.style?.fontSize as any) || '16', 10);
        onUpdate(element.id, { fontSize: Math.max(8, (isNaN(cur) ? 16 : cur) - 1) });
        return;
      }

      // Laisser Cmd/Ctrl+A au comportement natif pour sélectionner tout le texte
      if (key === 'a') {
        return;
      }
    }

    if (e.key === 'Enter') {
      // Keep single-line behavior in contentEditable and commit edits
      e.preventDefault();
      commitEditingContent();
      setIsEditing(false);
    }
  }, [element, onUpdate, commitEditingContent]);

  const handleTextBlur = useCallback(() => {
    commitEditingContent();
    setIsEditing(false);
  }, [commitEditingContent]);

  // ContentEditable input handler to persist content changes
  const handleContentEditableInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const newText = (e.currentTarget.textContent ?? '').replace(/\n/g, '');
    editingTextRef.current = newText;
  }, []);

  // Autofocus editable div and place caret at end on entering edit mode
  React.useEffect(() => {
    if (isEditing && !readOnly) {
      const el = textRef.current;
      if (el) {
        // Initialize editing buffer with current content (no placeholder during edit)
        const initial = (element.content ?? '');
        editingTextRef.current = initial;
        if (el.textContent !== initial) {
          el.textContent = initial;
        }
        el.focus();
        try {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        } catch {}
      }
    }
  }, [isEditing, readOnly, element.content]);

  const handleAlign = useCallback((alignment: string) => {
    if (!containerRef?.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    let newX = deviceProps.x;
    
    switch (alignment) {
      case 'left':
        newX = 20;
        break;
      case 'center':
        newX = (containerWidth - (element.width || 200)) / 2;
        break;
      case 'right':
        newX = containerWidth - (element.width || 200) - 20;
        break;
    }
    
    onUpdate(element.id, { x: newX });
    console.log('Element aligned:', alignment, newX);
  }, [element, deviceProps, containerRef, onUpdate]);

  // Optimized resize handler with useCallback - Enhanced for mobile/tablet
  const handleResizePointerDown = useCallback((e: React.PointerEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Block resizing when this element belongs to the active (selected) group
    if (activeGroupId && (element as any)?.parentGroupId === activeGroupId) {
      return;
    }

    // 📱 Détection du type d'interaction pour le redimensionnement
    const isTouchResize = touchOptimization.isTouchInteraction(e);
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    // Mesurer les dimensions de layout pour une base fiable (surtout pour le texte)
    const refEl = elementRef.current;
    const layoutW = refEl ? refEl.offsetWidth : undefined;
    const layoutH = refEl ? refEl.offsetHeight : undefined;
    const startWidth = (element.width != null) ? Number(element.width) : (layoutW ?? 100);
    const startHeight = (element.height != null) ? Number(element.height) : (layoutH ?? 100);
    // Utiliser deviceProps.x/y si disponibles pour cohérence avec le rendu
    const startPosX = (deviceProps.x != null ? Number(deviceProps.x) : (element.x || 0));
    const startPosY = (deviceProps.y != null ? Number(deviceProps.y) : (element.y || 0));
    const startFontSize = element.fontSize || element.style?.fontSize || 16;
    // Initialize live rect tracking
    liveRectRef.current = {
      x: startPosX,
      y: startPosY,
      width: startWidth,
      height: startHeight,
      fontSize: Number(startFontSize)
    };
    
    // Detect if it's a corner handle (for proportional scaling with font size change)
    const isCornerHandle = ['nw', 'ne', 'sw', 'se'].includes(direction);
    
    // For uploaded images, corner handles should only allow proportional resizing
    const isImageElement = element.type === 'image';
    const shouldForceProportional = isImageElement && isCornerHandle;

    // Stage updates for text to avoid jittery re-renders during resize
    let pendingUpdate: any = null;

    const handleResizePointerMove = (e: PointerEvent) => {
      // 🚀 Performance optimization: Throttle resize updates to 60fps
      if (Date.now() - (handleResizePointerMove as any).lastUpdate < 16) return;
      (handleResizePointerMove as any).lastUpdate = Date.now();
      
      requestAnimationFrame(() => {
        // 🎯 Professional keyboard modifiers (Canva/Figma/Photoshop standard)
        const isShiftPressed = e.shiftKey;
        const isAltPressed = e.altKey;
        // Note: isCtrlPressed reserved for future snap-to-grid functionality
        
        // 📱 Appliquer la sensibilité tactile aux deltas (en viewport px)
        const rawDeltaX = e.clientX - startX;
        const rawDeltaY = e.clientY - startY;

        const adjustedDeltas = touchOptimization.applyTouchSensitivity(
          rawDeltaX,
          rawDeltaY,
          isTouchResize
        );

        // 🔍 Convertir les deltas viewport -> unités canvas en tenant compte du zoom actuel
        const canvasEl = containerRef?.current as HTMLElement | null;
        const z = canvasEl ? (getCanvasViewport(canvasEl).zoom || 1) : 1;
        const rectNow = canvasEl?.getBoundingClientRect();
        const canvasW = rectNow ? rectNow.width / z : Number.POSITIVE_INFINITY;
        const canvasH = rectNow ? rectNow.height / z : Number.POSITIVE_INFINITY;
        let deltaX = adjustedDeltas.deltaX / z;
        let deltaY = adjustedDeltas.deltaY / z;
        
        // 🎯 Shift modifier: Force proportional scaling for all handles
        if (isShiftPressed && isImageElement) {
          const maxDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          deltaX = deltaX >= 0 ? maxDelta : -maxDelta;
          deltaY = deltaY >= 0 ? maxDelta : -maxDelta;
        }

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startPosX;
        let newY = startPosY;
        let newFontSize = startFontSize;
        const startRight = startPosX + startWidth;

        if (isCornerHandle && element.type === 'text') {
          // Corner handles on text: uniform scale from width/height ratios, anchor opposite edges
          let targetW = startWidth;
          let targetH = startHeight;
          switch (direction) {
            case 'se': targetW = startWidth + deltaX; targetH = startHeight + deltaY; break;
            case 'sw': targetW = startWidth - deltaX; targetH = startHeight + deltaY; break;
            case 'ne': targetW = startWidth + deltaX; targetH = startHeight - deltaY; break;
            case 'nw': targetW = startWidth - deltaX; targetH = startHeight - deltaY; break;
          }
          targetW = Math.max(20, targetW);
          targetH = Math.max(20, targetH);
          // Use a single scale to keep proportions stable (reduce jitter)
          const scaleX = targetW / startWidth;
          const scaleY = targetH / startHeight;
          const scale = Math.max(0.2, Math.min(scaleX, scaleY));
          newFontSize = Math.max(8, startFontSize * scale);

          // Anchor opposite edge horizontally when dragging left corners; otherwise keep X
          let adjX = (direction === 'sw' || direction === 'nw')
            ? (startRight - Math.max(20, targetW))
            : startPosX;

          // Clamp X to canvas bounds based on target width
          const maxX = Math.max(0, canvasW - Math.max(20, targetW));
          adjX = Math.min(Math.max(adjX, 0), maxX);

          if (elementRef.current) {
            const angleRaw = typeof element.rotation === 'number' ? element.rotation : 0;
            const angle = normalize180(angleRaw);
            elementRef.current.style.transform = `translate3d(${adjX}px, ${startPosY}px, 0) rotate(${angle}deg)`;
            // Live font-size update on inner text element for proper specificity
            const textEl = (textRef.current as unknown as HTMLElement | null) || (elementRef.current.querySelector('[data-element-type="text"]') as HTMLElement | null);
            if (textEl) {
              textEl.style.fontSize = `${Math.round(Number(newFontSize))}px`;
            }
          }

          // Update live rect and report bounds
          liveRectRef.current = {
            x: Math.round(adjX * 100) / 100,
            y: Math.round(startPosY * 100) / 100,
            fontSize: Math.round(Number(newFontSize))
          };
          reportBounds({ x: liveRectRef.current.x, y: liveRectRef.current.y });

          // Stage update only (commit at pointerup)
          pendingUpdate = {
            fontSize: Math.round(newFontSize),
            width: undefined,
            height: undefined,
            x: Math.round(adjX * 100) / 100,
            y: Math.round(startPosY * 100) / 100,
            isCornerScaled: true,
          };
          return;
          }
          // For edge handles or non-text elements: change dimensions only
          if (shouldForceProportional) {
            // For uploaded images using corner handles, force proportional scaling
            let targetW, targetH;
            
            // Calculate the scale factor based on the diagonal movement
            // Use the delta that would result in the smaller scale to maintain proportions
            let scaleX, scaleY, scale;
            
            switch (direction) {
              case 'se': 
                scaleX = (startWidth + deltaX) / startWidth;
                scaleY = (startHeight + deltaY) / startHeight;
                scale = Math.max(0.1, Math.min(scaleX, scaleY)); // Use smaller scale for proportional
                targetW = Math.max(20, startWidth * scale);
                targetH = Math.max(20, startHeight * scale);
                break;
              case 'sw': 
                scaleX = (startWidth - deltaX) / startWidth;
                scaleY = (startHeight + deltaY) / startHeight;
                scale = Math.max(0.1, Math.min(scaleX, scaleY));
                targetW = Math.max(20, startWidth * scale);
                targetH = Math.max(20, startHeight * scale);
                newX = startPosX + (startWidth - targetW);
                break;
              case 'ne': 
                scaleX = (startWidth + deltaX) / startWidth;
                scaleY = (startHeight - deltaY) / startHeight;
                scale = Math.max(0.1, Math.min(scaleX, scaleY));
                targetW = Math.max(20, startWidth * scale);
                targetH = Math.max(20, startHeight * scale);
                newY = startPosY + (startHeight - targetH);
                break;
              case 'nw': 
                scaleX = (startWidth - deltaX) / startWidth;
                scaleY = (startHeight - deltaY) / startHeight;
                scale = Math.max(0.1, Math.min(scaleX, scaleY));
                targetW = Math.max(20, startWidth * scale);
                targetH = Math.max(20, startHeight * scale);
                newX = startPosX + (startWidth - targetW);
                newY = startPosY + (startHeight - targetH);
                break;
              default:
                targetW = startWidth;
                targetH = startHeight;
                break;
            }
            
            newWidth = targetW;
            newHeight = targetH;
          } else if (isImageElement && (!isCornerHandle || isShiftPressed)) {
            // For images: edge handles OR Shift+corner handles = cropping behavior
            // Alt modifier: resize from center (professional standard)
            const centerResize = isAltPressed;
            
            switch (direction) {
              case 'n': 
                newHeight = Math.max(20, startHeight - deltaY); 
                newY = centerResize ? startPosY + deltaY/2 : startPosY + (startHeight - newHeight); 
                break;
              case 's': 
                newHeight = Math.max(20, startHeight + deltaY); 
                newY = centerResize ? startPosY - deltaY/2 : startPosY; 
                break;
              case 'w': 
                newWidth = Math.max(20, startWidth - deltaX); 
                newX = centerResize ? startPosX + deltaX/2 : startPosX + (startWidth - newWidth); 
                break;
              case 'e': 
                newWidth = Math.max(20, startWidth + deltaX); 
                newX = centerResize ? startPosX - deltaX/2 : startPosX; 
                break;
            }
          } else {
            // Original behavior for non-image elements
            switch (direction) {
              case 'n': newHeight = Math.max(20, startHeight - deltaY); newY = startPosY + (startHeight - newHeight); break;
              case 's': newHeight = Math.max(20, startHeight + deltaY); break;
              case 'w': newWidth = Math.max(20, startWidth - deltaX); newX = startPosX + (startWidth - newWidth); break;
              case 'e': newWidth = Math.max(20, startWidth + deltaX); break;
              case 'se': newWidth = Math.max(20, startWidth + deltaX); newHeight = Math.max(20, startHeight + deltaY); break;
              case 'sw': newWidth = Math.max(20, startWidth - deltaX); newHeight = Math.max(20, startHeight + deltaY); newX = startPosX + (startWidth - newWidth); break;
              case 'ne': newWidth = Math.max(20, startWidth + deltaX); newHeight = Math.max(20, startHeight - deltaY); newY = startPosY + (startHeight - newHeight); break;
              case 'nw': newWidth = Math.max(20, startWidth - deltaX); newHeight = Math.max(20, startHeight - deltaY); newX = startPosX + (startWidth - newWidth); newY = startPosY + (startHeight - newHeight); break;
            }
          }

          // Clamp dimensions/position to stay within canvas bounds
          if (newX < 0) {
            newWidth = Math.max(20, newWidth + newX);
            newX = 0;
          }
          if (newY < 0) {
            newHeight = Math.max(20, newHeight + newY);
            newY = 0;
          }
          if (newX + newWidth > canvasW) {
            newWidth = Math.max(20, canvasW - newX);
          }
          if (newY + newHeight > canvasH) {
            newHeight = Math.max(20, canvasH - newY);
          }

          // Live DOM updates: transform and size
          if (elementRef.current) {
            const angleRaw = typeof element.rotation === 'number' ? element.rotation : 0;
            const angle = normalize180(angleRaw);
            elementRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0) rotate(${angle}deg)`;
            elementRef.current.style.width = `${Math.round(newWidth)}px`;
            elementRef.current.style.height = `${Math.round(newHeight)}px`;
            
            // Force immediate visual update with will-change for smoother rendering
            elementRef.current.style.willChange = 'transform, width, height';
            
            // Update inner content size as well to reflect visual change immediately
            const contentEl = elementRef.current.firstElementChild as HTMLElement | null;
            if (contentEl) {
              if (element.type === 'text') {
                // Edge-resize for text should affect width; height auto
                contentEl.style.width = `${Math.round(newWidth)}px`;
                contentEl.style.height = '';
              } else if (element.type === 'image') {
                // For images, ensure the img element scales properly
                contentEl.style.width = `${Math.round(newWidth)}px`;
                contentEl.style.height = `${Math.round(newHeight)}px`;
                contentEl.style.overflow = 'hidden';
                contentEl.style.position = 'relative';
                contentEl.style.willChange = 'width, height';
                
                // Also update any nested img elements directly
                const imgEl = contentEl.querySelector('img') as HTMLImageElement | null;
                if (imgEl) {
                  // For edge handles, implement professional directional cropping
                  if (!isCornerHandle) {
                    // Keep image at original size for true cropping behavior
                    imgEl.style.width = `${Math.round(startWidth)}px`;
                    imgEl.style.height = `${Math.round(startHeight)}px`;
                    imgEl.style.objectFit = 'none';
                    imgEl.style.position = 'absolute';
                    imgEl.style.transform = 'none';
                    imgEl.style.maxWidth = 'none';
                    imgEl.style.maxHeight = 'none';
                    imgEl.style.pointerEvents = 'none';
                    
                    // Professional directional anchoring like Canva/Figma
                    switch (direction) {
                      case 'n': // Top handle - anchor image to bottom of container
                        imgEl.style.top = `${Math.round(newHeight - startHeight)}px`;
                        imgEl.style.left = '0';
                        break;
                      case 's': // Bottom handle - anchor image to top (no movement)
                        imgEl.style.top = '0';
                        imgEl.style.left = '0';
                        break;
                      case 'w': // Left handle - anchor image to right of container
                        imgEl.style.top = '0';
                        imgEl.style.left = `${Math.round(newWidth - startWidth)}px`;
                        break;
                      case 'e': // Right handle - anchor image to left (no movement)
                        imgEl.style.top = '0';
                        imgEl.style.left = '0';
                        break;
                      default:
                        imgEl.style.top = '0';
                        imgEl.style.left = '0';
                        break;
                    }
                  } else {
                    // For corner handles, scale the image proportionally
                    imgEl.style.width = '100%';
                    imgEl.style.height = '100%';
                    imgEl.style.objectFit = 'cover';
                    imgEl.style.position = 'relative';
                    imgEl.style.top = '';
                    imgEl.style.left = '';
                    imgEl.style.transform = '';
                  }
                  imgEl.style.willChange = 'width, height';
                }
              } else {
                contentEl.style.width = `${Math.round(newWidth)}px`;
                contentEl.style.height = `${Math.round(newHeight)}px`;
              }
            }
          }

          // Update live rect and report bounds
          liveRectRef.current = {
            x: Math.round(newX * 100) / 100,
            y: Math.round(newY * 100) / 100,
            width: Math.round(newWidth),
            height: Math.round(newHeight)
          };
          reportBounds({ x: liveRectRef.current.x, y: liveRectRef.current.y, width: liveRectRef.current.width!, height: liveRectRef.current.height! });

          // Stage update (commit at pointerup)
          pendingUpdate = {
            width: Math.round(newWidth),
            height: Math.round(newHeight),
            x: Math.round(newX * 100) / 100,
            y: Math.round(newY * 100) / 100,
            isCornerScaled: false,
          };
        });
      };

      const handleResizePointerUp = () => {
        document.removeEventListener('pointermove', handleResizePointerMove);
        document.removeEventListener('pointerup', handleResizePointerUp);

        // Commit any pending text/element update
        if (pendingUpdate) {
          onUpdate(element.id, pendingUpdate);
        }

        // Cleanup live refs and inline overrides
        if (element.type === 'text') {
          const textEl = (textRef.current as unknown as HTMLElement | null) || (elementRef.current?.querySelector('[data-element-type="text"]') as HTMLElement | null);
          if (textEl) {
            textEl.style.fontSize = '';
            textEl.style.width = '';
          }
        }

        // Clear wrapper inline sizes; React props will take over after update
        if (elementRef.current) {
          elementRef.current.style.width = '';
          elementRef.current.style.height = '';
          elementRef.current.style.willChange = '';
          
          // Clear will-change on content elements too
          const contentEl = elementRef.current.firstElementChild as HTMLElement | null;
          if (contentEl) {
            contentEl.style.willChange = '';
            const imgEl = contentEl.querySelector('img') as HTMLImageElement | null;
            if (imgEl) {
              imgEl.style.willChange = '';
            }
          }
        }
        liveRectRef.current = null;
        setIsResizing(false);
        // Ensure measured bounds are refreshed after commit
        schedulePostCommitMeasure();
      };

      document.addEventListener('pointermove', handleResizePointerMove);
      document.addEventListener('pointerup', handleResizePointerUp);
    }, [activeGroupId, element, deviceProps, touchOptimization, containerRef, normalize180, onUpdate, reportBounds, schedulePostCommitMeasure]);

  // Clipboard Handlers
  const handleCopy = useCallback((elementToCopy: any) => {
    setClipboard({ type: 'element', payload: elementToCopy });
  }, [setClipboard]);

  const handlePaste = useCallback(() => {
    if (clipboard && clipboard.type === 'element' && onAddElement) {
      // Deep clone to avoid reference bugs
      const newElement = {
        ...clipboard.payload,
        id: `text-${Date.now()}`,
        x: (deviceProps.x || 0) + 20,
        y: (deviceProps.y || 0) + 20
      };
      onAddElement(newElement);
      // Optionally clear clipboard or keep for multi-paste
      // clearClipboard();
    }
  }, [clipboard, onAddElement, deviceProps]);

  const handleDuplicate = useCallback((elementToDuplicate: any) => {
    if (onAddElement) {
      const deviceProps = getPropertiesForDevice(elementToDuplicate, selectedDevice);
      const duplicatedElement = {
        ...elementToDuplicate,
        id: `text-${Date.now()}`,
        x: (deviceProps.x || 0) + 20,
        y: (deviceProps.y || 0) + 20
      };
      onAddElement(duplicatedElement);
    }
  }, [onAddElement, getPropertiesForDevice, selectedDevice]);

  // ---- Layer ordering helpers (z-index based) ----
  const getZ = (el: any) => (typeof el?.zIndex === 'number' ? el.zIndex : 1);
  const allEls = React.useMemo(() => (Array.isArray(elements) ? elements : []), [elements]);
  const maxZ = React.useMemo(() => (allEls.length ? Math.max(...allEls.map(getZ)) : getZ(element)), [allEls, element]);
  const minZ = React.useMemo(() => (allEls.length ? Math.min(...allEls.map(getZ)) : getZ(element)), [allEls, element]);

  const bringToFront = useCallback(() => {
    console.log('🔝 bringToFront called for element:', element.id, 'current zIndex:', element.zIndex, 'maxZ:', maxZ);
    onUpdate(element.id, { zIndex: (maxZ || 1) + 1 });
  }, [onUpdate, element.id, maxZ]);

  const bringForward = useCallback(() => {
    const current = getZ(element);
    console.log('⬆️ bringForward called for element:', element.id, 'current zIndex:', current, 'new zIndex:', current + 1);
    onUpdate(element.id, { zIndex: current + 1 });
  }, [onUpdate, element]);

  const sendBackward = useCallback(() => {
    const current = getZ(element);
    const newZ = Math.max(1, current - 1);
    console.log('⬇️ sendBackward called for element:', element.id, 'current zIndex:', current, 'new zIndex:', newZ);
    onUpdate(element.id, { zIndex: newZ });
  }, [onUpdate, element]);

  const sendToBack = useCallback(() => {
    const target = (minZ || 1) - 1;
    const newZ = Math.max(0, target);
    console.log('🔻 sendToBack called for element:', element.id, 'current zIndex:', element.zIndex, 'minZ:', minZ, 'new zIndex:', newZ);
    onUpdate(element.id, { zIndex: newZ });
  }, [onUpdate, element.id, minZ]);

  // --- Remove any previous/old handleCopy, handlePaste, handleDuplicate below this line ---

  // Drag-to-rotate handler (Shift = snap to 15°)
  const handleRotatePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!elementRef.current) return;
    // Block rotation when this element belongs to the active (selected) group
    if (activeGroupId && (element as any)?.parentGroupId === activeGroupId) {
      return;
    }

    setIsRotating(true);

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startAngle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
    const initialRotation = normalize180(typeof element.rotation === 'number' ? element.rotation : 0);

    const onMove = (ev: PointerEvent) => {
      const curr = (Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * 180) / Math.PI;
      let next = initialRotation + (curr - startAngle);
      if (ev.shiftKey) {
        next = Math.round(next / 15) * 15;
      }
      next = normalize180(next);
      if (elementRef.current) {
        const baseX = deviceProps.x || 0;
        const baseY = deviceProps.y || 0;
        elementRef.current.style.transform = `translate3d(${baseX}px, ${baseY}px, 0) rotate(${next}deg)`;
      }
      setTempRotation(next);

      // Show alignment guides while rotating (use element center vs canvas center in canvas units)
      const canvasElNow = containerRef?.current as HTMLElement | null;
      if (canvasElNow) {
        // Use new alignment system for rotation guides
        if (alignmentSystem) {
          alignmentSystem.startDragging();
        }
      }
    };

    const onUp = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);

      const curr = (Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * 180) / Math.PI;
      let finalRotation = initialRotation + (curr - startAngle);
      if (ev.shiftKey) {
        finalRotation = Math.round(finalRotation / 15) * 15;
      }
      finalRotation = normalize180(finalRotation);
      onUpdate(element.id, { rotation: Math.round(finalRotation * 100) / 100 });
      setIsRotating(false);
      setTempRotation(null);

      // Stop dragging in new alignment system
      if (alignmentSystem) {
        alignmentSystem.stopDragging();
      }
      // Ensure measured bounds are refreshed after commit
      schedulePostCommitMeasure();
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [element.id, element.rotation, onUpdate, deviceProps.x, deviceProps.y, normalize180, activeGroupId, element, schedulePostCommitMeasure]);

  // Memoized element rendering for performance
  const renderElement = useMemo(() => {
    // For text elements, only apply dimensions if they were set by edge handles (not corner scaling)
    const shouldApplyDimensions = element.type !== 'text' || (element.width && element.height && !element.isCornerScaled);
    
    const elementStyle = shouldApplyDimensions ? {
      width: element.width ? `${element.width}px` : 'auto',
      height: element.height ? `${element.height}px` : 'auto',
      minWidth: element.type === 'image' ? `${element.width || 100}px` : 'auto',
      minHeight: element.type === 'image' ? `${element.height || 100}px` : 'auto'
    } : {};

    const defaultRender: React.ReactNode = (() => {
      switch (element.type) {
      case 'text': {
        const getTextStyle = (): React.CSSProperties => {
          const customCSS = (element as any)?.customCSS || {};
          const parsePx = (v: any, fallback: number = 0) => {
            if (v == null) return fallback;
            if (typeof v === 'number') return v;
            const m = String(v).match(/([-+]?[0-9]*\.?[0-9]+)/);
            return m ? parseFloat(m[1]) : fallback;
          };

          // Prefer per-element font size; fall back to device-specific only if missing
          const baseFontSize = (element.fontSize ?? element.style?.fontSize ?? (element.type === 'text' ? (deviceProps as any).fontSize : undefined) ?? 16);
          // Do not scale per-element font size here; the whole canvas is already scaled via container transform
          const scaledFontSize = parsePx(baseFontSize, 16);

          const baseStyle: React.CSSProperties = {
            fontSize: scaledFontSize,
            fontFamily: element.fontFamily || element.style?.fontFamily || 'Open Sans',
            color: element.color || element.style?.color || '#000000',
            fontWeight: element.fontWeight || element.style?.fontWeight || 'normal',
            fontStyle: element.fontStyle || element.style?.fontStyle || 'normal',
            textDecoration: element.textDecoration || element.style?.textDecoration || 'none',
            textAlign: element.textAlign || (element.type === 'text' ? (deviceProps as any).textAlign : undefined) || element.style?.textAlign || 'left',
            lineHeight: '1.2',
            ...elementStyle
          };

          // Add background styling
          if (element.backgroundColor) {
            const opacity = element.backgroundOpacity !== undefined ? element.backgroundOpacity : 1;
            const rgb = hexToRgb(element.backgroundColor);
            baseStyle.backgroundColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : element.backgroundColor;
          }

          // Add border radius
          if (element.borderRadius) {
            // Keep original value; container zoom will scale visually
            baseStyle.borderRadius = `${parsePx(element.borderRadius, 0)}px`;
          }

          // Add padding
          if (element.padding) {
            const p = element.padding;
            // Keep original values; container zoom will scale visually
            baseStyle.padding = `${parsePx(p.top, 0)}px ${parsePx(p.right, 0)}px ${parsePx(p.bottom, 0)}px ${parsePx(p.left, 0)}px`;
          }

          // Add text shadow
          if (element.textShadow && (element.textShadow.blur > 0 || element.textShadow.offsetX !== 0 || element.textShadow.offsetY !== 0)) {
            const ts = element.textShadow;
            // Keep original values; container zoom will scale visually
            baseStyle.textShadow = `${parsePx(ts.offsetX, 0)}px ${parsePx(ts.offsetY, 0)}px ${parsePx(ts.blur, 0)}px ${ts.color}`;
          }

          // Add custom CSS from effects
          if (customCSS) {
            // Allow gradient backgrounds and flex alignment from customCSS
            Object.assign(baseStyle, customCSS);
          }

          return baseStyle;
        };

        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : null;
        };

        return (isEditing && !readOnly) ? (
          <div
            ref={textRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentEditableInput}
            onKeyDown={handleTextKeyDown}
            onBlur={handleTextBlur}
            className="outline-none bg-transparent border-none whitespace-pre-wrap break-words select-text cursor-text"
            style={{
              ...getTextStyle(),
              boxSizing: 'border-box',
              display: 'inline-block',
              touchAction: 'auto',
              userSelect: 'text'
            }}
            onPointerDown={(ev) => { ev.stopPropagation(); }}
            onPointerMove={(ev) => { ev.stopPropagation(); }}
            onMouseDown={(ev) => { ev.stopPropagation(); }}
            onMouseMove={(ev) => { ev.stopPropagation(); }}
            onTouchStart={(ev) => { ev.stopPropagation(); }}
            onTouchMove={(ev) => { ev.stopPropagation(); }}
            draggable={false}
            data-element-type="text"
          >
            {element.content || 'Texte'}
          </div>
        ) : (
          <div
            ref={textRef}
            className={`${readOnly ? '' : 'cursor-move'} select-text whitespace-pre-wrap break-words`
            }
            style={getTextStyle()}
            data-element-type="text"
          >
            {element.content || 'Texte'}
          </div>
        );
      }
      case 'image':
        return (
          <img
            src={element.src}
            alt={element.alt || 'Image'}
            className={`${readOnly ? '' : 'cursor-move'} object-cover`}
            draggable={false}
            loading="lazy"
            style={elementStyle}
          />
        );
      case 'wheel':
        return (
          <div 
            className={`${readOnly ? '' : 'cursor-move'}`}
            style={{ 
              ...elementStyle,
              pointerEvents: 'none' // Empêche l'interaction directe avec la roue
            }}
          >
            <SmartWheel
              key={(() => {
                try {
                  // Use campaign segments instead of element segments
                  const segs = campaignSegments.length > 0 ? campaignSegments : (element.segments || []);
                  const parts = segs.map((s: any, idx: number) => 
                    `${s.id ?? idx}:${s.label ?? ''}:${s.color ?? ''}:${s.textColor ?? ''}:${s.contentType ?? 'text'}:${s.imageUrl ?? ''}`
                  ).join('|');
                  const size = Math.min(element.width || 300, element.height || 300);
                  return `${segs.length}-${parts}-${size}`;
                } catch {
                  return `${campaignSegments.length || (element.segments || []).length}-${Math.min(element.width || 300, element.height || 300)}`;
                }
              })()}
              segments={campaignSegments.length > 0 ? campaignSegments : (element.segments || [])}
              size={Math.min(element.width || 300, element.height || 300)}
              disabled={true}
              disablePointerAnimation={true}
              theme="modern"
              brandColors={{
                primary: extractedColors?.[0] || (campaign as any)?.design?.customColors?.primary || '#841b60',
                secondary: extractedColors?.[1] || (campaign as any)?.design?.customColors?.secondary || '#ffffff',
                accent: extractedColors?.[2] || (campaign as any)?.design?.customColors?.accent || '#4ecdc4'
              }}
            />
          </div>
        );
      case 'quiz-template':
        return (
          <div className={`${readOnly ? '' : 'cursor-move'}`} style={elementStyle} data-element-type="quiz-template">
            {/* Quiz supprimé - élément vide */}
            <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
              Quiz supprimé
            </div>
          </div>
        );
      case 'shape':
        return (
          <div className={`${readOnly ? '' : 'cursor-move'}`} style={elementStyle}>
            <ShapeRenderer
              shapeType={element.shapeType || 'rectangle'}
              width={element.width || 100}
              height={element.height || 100}
              color={element.backgroundColor || element.style?.backgroundColor || '#3B82F6'}
              borderRadius={element.borderRadius || element.style?.borderRadius}
              borderStyle={element.borderStyle || 'none'}
              borderWidth={element.borderWidth || '0px'}
              borderColor={element.borderColor || '#000000'}
              isEditing={isEditing}
              content={element.content || ''}
              onContentChange={(content: string) => {
                editingTextRef.current = content;
              }}
              onKeyDown={handleTextKeyDown}
              onBlur={handleTextBlur}
              textRef={textRef}
              fontSize={element.fontSize || 16}
              fontFamily={element.fontFamily || 'Inter'}
              fontWeight={element.fontWeight || 'normal'}
              fontStyle={element.fontStyle || 'normal'}
              textDecoration={element.textDecoration || 'none'}
              textAlign={element.textAlign || 'center'}
              textColor={element.textColor || element.color || '#000000'}
            />
          </div>
        );
      default:
        return <div className={`w-20 h-20 bg-gray-300 ${readOnly ? '' : 'cursor-move'}`} style={elementStyle} />;
      }
    })();

    if (customRenderers && typeof customRenderers[element.type] === 'function') {
      try {
        return customRenderers[element.type]({
          element,
          selectedDevice,
          readOnly: Boolean(readOnly),
          elementStyle,
          deviceProps
        });
      } catch (error) {
        console.warn('Custom renderer threw an error for element', element.id, error);
      }
    }

    return defaultRender;
  }, [element, deviceProps, isEditing, handleContentEditableInput, handleTextKeyDown, handleTextBlur, readOnly, customRenderers, selectedDevice]);

  return (
    <div
      ref={elementRef}
      className={`absolute ${
        isSelected && !readOnly && !isLaunchButton
          ? (hideControls
              ? ''
              : 'ring-2 ring-[hsl(var(--primary))]')
          : ''
      }`}
      data-element-id={element.id}
      style={{
        transform: `translate(${Number(deviceProps.x) || 0}px, ${Number(deviceProps.y) || 0}px) rotate(${typeof element.rotation === 'number' ? element.rotation : 0}deg)`,
        transformOrigin: 'center center',
        opacity: isDragging ? 0.8 : 1,
        zIndex: element.zIndex || 1,
        transition: (isDragging || isRotating || isResizing) ? 'none' : 'transform 0.1s linear',
        touchAction: 'none',
        cursor: readOnly ? 'default' : (isLaunchButton ? 'default' : (isEditing ? 'text' : (isDragging ? 'grabbing' : 'grab'))),
        pointerEvents: readOnly ? 'none' : 'auto',
      }}
      onPointerDown={readOnly ? undefined : handlePointerDown}
      onDoubleClick={readOnly ? undefined : handleDoubleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Canvas element right-click detected:', element.id);
      }}
    >
      {renderElement}

      {/* Selection handles - masqués pendant le drag */}
      {isSelected && !isDragging && !isResizing && !readOnly && !hideControls && !isEditing && !isLaunchButton && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1000 }}>
          {/* Corner handles - for proportional scaling */}
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            style={{ zIndex: 1001 }}
          />
          
          {/* Edge handles - for all elements */}
          <div 
            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-w-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'w')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-e-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-n-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'n')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-s-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 's')}
            style={{ zIndex: 1001 }}
          />
          
          {/* Delete button */}
          <button
            onClick={() => onDelete(element.id)}
            className="absolute -top-8 -right-8 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 shadow-lg"
            style={{ zIndex: 1001 }}
          >
            ×
          </button>

          {/* Rotate handle button - positioned below the shape */}
          <button
            onPointerDown={handleRotatePointerDown}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white text-gray-800 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50"
            style={{ zIndex: 1001 }}
            aria-label="Rotate"
            title="Rotate (hold Shift to snap)"
          >
            <RotateCw className="w-3 h-3" />
          </button>
          {isRotating && (
            <div
              className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded shadow-lg"
              style={{ zIndex: 1002 }}
            >
              {Math.round((tempRotation ?? (typeof element.rotation === 'number' ? normalize180(element.rotation) : 0)))}°
            </div>
          )}
          
          {/* Context Menu for all element types (text, shape, image, etc.) */}
          <TextContextMenu
            element={element}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onDuplicate={handleDuplicate}
            onDelete={onDelete}
            onAlign={handleAlign}
            onBringToFront={bringToFront}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            onSendToBack={sendToBack}
            canPaste={canPaste()}
          />
        </div>
      )}
    </div>
  );
});

CanvasElement.displayName = 'CanvasElement';

export default CanvasElement;
