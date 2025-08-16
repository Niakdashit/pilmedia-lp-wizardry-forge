import React, { useCallback, useState, useRef } from 'react';
import { Move } from 'lucide-react';

interface GroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GroupSelectionFrameProps {
  groupId: string;
  bounds: GroupBounds;
  zoom: number;
  onMove?: (deltaX: number, deltaY: number) => void;
  onResize?: (newBounds: GroupBounds, handle: string) => void;
  onResizeStart?: (originBounds: GroupBounds, handle: string) => void;
  onResizeEnd?: () => void;
  onDoubleClick?: () => void;
  isVisible?: boolean;
}

const GroupSelectionFrame: React.FC<GroupSelectionFrameProps> = ({
  groupId,
  bounds,
  zoom,
  onMove,
  onResize,
  onResizeStart,
  onResizeEnd,
  onDoubleClick,
  isVisible = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  // Canvas-space pointers tracking
  const startCanvasRef = useRef<{ x: number; y: number } | null>(null);
  const lastCanvasRef = useRef<{ x: number; y: number } | null>(null);
  const originBoundsRef = useRef<GroupBounds | null>(null);
  // Throttle pointer moves to once per frame
  const rafIdRef = useRef<number | null>(null);
  const pendingPtRef = useRef<{ cx: number; cy: number } | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const captureElRef = useRef<HTMLElement | null>(null);
  const isPreDragRef = useRef<boolean>(false);

  // Utiliser les coordonnées en espace canvas directement.
  // Le parent (canvas) est déjà transformé avec scale(zoom),
  // donc re-multiplier ici provoquerait un double scaling.
  const scaledBounds = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  };

  // Gérer le début du drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.detail === 2) {
      // Double-clic : éditer le groupe
      onDoubleClick?.();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Pointer capture to avoid losing events when leaving the frame
    try {
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      pointerIdRef.current = e.pointerId;
      captureElRef.current = target;
    } catch {}

    const container = (frameRef.current?.offsetParent as HTMLElement) || null;
    const rect = container?.getBoundingClientRect();
    if (!rect) return;

    // Convertir en coordonnées canvas (indépendantes du zoom CSS)
    const cx = (e.clientX - rect.left) / zoom;
    const cy = (e.clientY - rect.top) / zoom;

    startCanvasRef.current = { x: cx, y: cy };
    lastCanvasRef.current = { x: cx, y: cy };
    originBoundsRef.current = { ...bounds };
    isPreDragRef.current = true; // 5px threshold before starting actual drag
    setIsDragging(false);

    console.log('🎯 Group pointer down (pre-drag):', groupId);
  }, [groupId, onDoubleClick, zoom, bounds]);

  // Gérer le début du resize
  const handleResizeStart = useCallback((e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    const container = (frameRef.current?.offsetParent as HTMLElement) || null;
    const rect = container?.getBoundingClientRect();
    if (!rect) return;

    // Point de départ en espace canvas
    const cx = (e.clientX - rect.left) / zoom;
    const cy = (e.clientY - rect.top) / zoom;
    startCanvasRef.current = { x: cx, y: cy };
    originBoundsRef.current = { ...bounds };
    // Notify consumer about resize start with stable origin bounds
    if (originBoundsRef.current) onResizeStart?.(originBoundsRef.current, handle);
    setIsResizing(true);
    setResizeHandle(handle);

    // Pointer capture for handle
    try {
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      pointerIdRef.current = e.pointerId;
      captureElRef.current = target;
    } catch {}

    console.log('🎯 Group resize started:', { groupId, handle });
  }, [groupId, zoom, bounds]);

  // Gérer le déplacement
  const handlePointerMove = useCallback((e: PointerEvent) => {
    const container = (frameRef.current?.offsetParent as HTMLElement) || null;
    const rect = container?.getBoundingClientRect();
    if (!rect) return;

    const cx = (e.clientX - rect.left) / zoom;
    const cy = (e.clientY - rect.top) / zoom;
    pendingPtRef.current = { cx, cy };

    if (rafIdRef.current == null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const pt = pendingPtRef.current;
        if (!pt) return;
        const { cx, cy } = pt;

        // 5px threshold (viewport px) before starting actual drag
        const thresholdCanvas = 5 / Math.max(zoom, 0.0001);
        if (!isResizing && !isDragging && isPreDragRef.current && startCanvasRef.current) {
          const dx0 = cx - startCanvasRef.current.x;
          const dy0 = cy - startCanvasRef.current.y;
          if (Math.hypot(dx0, dy0) >= thresholdCanvas) {
            // Start actual drag now
            isPreDragRef.current = false;
            lastCanvasRef.current = { x: cx, y: cy };
            setIsDragging(true);
          } else {
            return; // still within threshold
          }
        }

        if (isDragging && onMove) {
          // Déplacement incrémental en espace canvas (indépendant du zoom)
          const last = lastCanvasRef.current ?? { x: cx, y: cy };
          const deltaX = cx - last.x;
          const deltaY = cy - last.y;
          lastCanvasRef.current = { x: cx, y: cy };
          if (deltaX !== 0 || deltaY !== 0) onMove(deltaX, deltaY);
        } else if (isResizing && onResize && resizeHandle && startCanvasRef.current && originBoundsRef.current) {
          const start = startCanvasRef.current;
          const orig = originBoundsRef.current;
          // Pointer delta in canvas space
          let dX = cx - start.x;
          let dY = cy - start.y;

          let newBounds: GroupBounds = { ...orig };

          if (['nw','ne','sw','se'].includes(resizeHandle)) {
            // Uniform scaling for corner handles without forcing diagonal-only pointer projection
            const MIN_W = 10; const MIN_H = 10;
            // Determine how dX/dY affect width/height for this handle
            const signX = (resizeHandle === 'se' || resizeHandle === 'ne') ? 1 : -1; // east = +, west = -
            const signY = (resizeHandle === 'se' || resizeHandle === 'sw') ? 1 : -1; // south = +, north = -
            const widthCandidate = orig.width + signX * dX;
            const heightCandidate = orig.height + signY * dY;
            // Compute desired scale per axis, then take the limiting factor to stay anchored
            const scaleX = widthCandidate / Math.max(orig.width, 1e-6);
            const scaleY = heightCandidate / Math.max(orig.height, 1e-6);
            let s = Math.min(scaleX, scaleY);
            // Enforce minimum size uniformly
            const minScale = Math.max(MIN_W / Math.max(orig.width, 1e-6), MIN_H / Math.max(orig.height, 1e-6));
            s = Math.max(s, minScale);
            // Prevent negative or zero scale (no flipping)
            s = Math.max(s, 0.001);

            const width = Math.max(MIN_W, orig.width * s);
            const height = Math.max(MIN_H, orig.height * s);

            // Anchor opposite corner based on handle
            switch (resizeHandle) {
              case 'se':
                newBounds = { x: orig.x, y: orig.y, width, height };
                break;
              case 'sw':
                newBounds = { x: orig.x + (orig.width - width), y: orig.y, width, height };
                break;
              case 'ne':
                newBounds = { x: orig.x, y: orig.y + (orig.height - height), width, height };
                break;
              case 'nw':
                newBounds = { x: orig.x + (orig.width - width), y: orig.y + (orig.height - height), width, height };
                break;
            }
          } else {
            // Edge handles (should not appear in UI anymore, kept for safety)
            switch (resizeHandle) {
              case 'n':
                newBounds = { x: orig.x, y: orig.y + dY, width: orig.width, height: orig.height - dY };
                break;
              case 's':
                newBounds = { x: orig.x, y: orig.y, width: orig.width, height: orig.height + dY };
                break;
              case 'w':
                newBounds = { x: orig.x + dX, y: orig.y, width: orig.width - dX, height: orig.height };
                break;
              case 'e':
                newBounds = { x: orig.x, y: orig.y, width: orig.width + dX, height: orig.height };
                break;
            }
          }

          // Clamp to minimum size while keeping opposite edges anchored
          const MIN_W = 10; const MIN_H = 10;
          let { x, y, width, height } = newBounds;
          if (width < MIN_W) {
            if (['w', 'nw', 'sw'].includes(resizeHandle)) {
              x = orig.x + (orig.width - MIN_W);
            }
            width = MIN_W;
          }
          if (height < MIN_H) {
            if (['n', 'nw', 'ne'].includes(resizeHandle)) {
              y = orig.y + (orig.height - MIN_H);
            }
            height = MIN_H;
          }

          // Modifier keys: Shift = aspect ratio lock (corner handles), Alt = center scaling
          const ratio = orig.height !== 0 ? (orig.width / orig.height) : 1;
          const isCorner = ['nw','ne','sw','se'].includes(resizeHandle);
          if (e.shiftKey && isCorner) {
            // Enforce aspect ratio by adjusting the dimension that deviates most
            const w1 = Math.max(MIN_W, width);
            const h1 = Math.max(MIN_H, height);
            const ratioNow = w1 / h1;
            let w2 = w1, h2 = h1;
            if (Math.abs(ratioNow - ratio) > 1e-6) {
              if (ratioNow > ratio) {
                // too wide -> increase height
                h2 = Math.max(MIN_H, w1 / Math.max(ratio, 1e-6));
              } else {
                // too tall -> increase width
                w2 = Math.max(MIN_W, h1 * ratio);
              }
            }
            // Re-anchor based on handle
            switch (resizeHandle) {
              case 'se':
                x = orig.x; y = orig.y; width = w2; height = h2; break;
              case 'sw':
                x = orig.x + (orig.width - w2); y = orig.y; width = w2; height = h2; break;
              case 'ne':
                x = orig.x; y = orig.y + (orig.height - h2); width = w2; height = h2; break;
              case 'nw':
                x = orig.x + (orig.width - w2); y = orig.y + (orig.height - h2); width = w2; height = h2; break;
            }
          }

          if (e.altKey && isCorner) {
            // Center scaling: keep center fixed
            const w1 = Math.max(MIN_W, width);
            const h1 = Math.max(MIN_H, height);
            const cx0 = orig.x + orig.width / 2;
            const cy0 = orig.y + orig.height / 2;
            x = cx0 - w1 / 2;
            y = cy0 - h1 / 2;
            width = w1;
            height = h1;
          }

          onResize({ x, y, width, height }, resizeHandle);
        }
      });
    }
  }, [isDragging, isResizing, zoom, onMove, onResize, resizeHandle]);

  // Gérer la fin du drag/resize
  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      console.log('🎯 Group drag ended:', groupId);
    }
    if (isResizing) {
      console.log('🎯 Group resize ended:', groupId);
    }
    // Notify consumer about resize end to clear any refs
    onResizeEnd?.();
    
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    startCanvasRef.current = null;
    lastCanvasRef.current = null;
    originBoundsRef.current = null;
    isPreDragRef.current = false;
    // Cancel any pending RAF
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    pendingPtRef.current = null;
    // Release pointer capture if held
    try {
      if (pointerIdRef.current != null && captureElRef.current) {
        captureElRef.current.releasePointerCapture(pointerIdRef.current);
      }
    } catch {}
    captureElRef.current = null;
    pointerIdRef.current = null;
  }, [isDragging, isResizing, groupId, onResizeEnd]);

  // Ajouter les event listeners globaux
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);

      return () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, isResizing, handlePointerMove, handlePointerUp]);

  if (!isVisible) return null;

  return (
    <div
      ref={frameRef}
      className="absolute pointer-events-auto"
      style={{
        left: scaledBounds.x,
        top: scaledBounds.y,
        width: scaledBounds.width,
        height: scaledBounds.height,
        zIndex: 1000
      }}
    >
      {/* Cadre principal du groupe */}
      <div
        className="absolute inset-0 border-2 border-gray-700 bg-white/10 cursor-move"
        onPointerDown={handlePointerDown}
        style={{
          borderStyle: 'dashed',
          borderRadius: '4px'
        }}
      >
        {/* Label du groupe */}
        <div className="absolute -top-6 left-0 bg-gray-700 text-white text-xs px-2 py-1 rounded text-nowrap">
          Groupe
        </div>
        
        {/* Icône de déplacement */}
        <div className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded opacity-75">
          <Move className="w-3 h-3" />
        </div>
      </div>

      {/* Poignées de redimensionnement (diagonales uniquement) */}
      {[
        { handle: 'nw', className: 'top-0 left-0 cursor-nw-resize' },
        { handle: 'ne', className: 'top-0 right-0 cursor-ne-resize' },
        { handle: 'se', className: 'bottom-0 right-0 cursor-se-resize' },
        { handle: 'sw', className: 'bottom-0 left-0 cursor-sw-resize' }
      ].map(({ handle, className }) => (
        <div
          key={handle}
          className={`absolute w-3 h-3 bg-white border border-gray-700 rounded-sm ${className}`}
          onPointerDown={(e) => handleResizeStart(e, handle)}
          style={{ marginTop: '-6px', marginLeft: '-6px' }}
        />
      ))}
    </div>
  );
};

export default GroupSelectionFrame;
