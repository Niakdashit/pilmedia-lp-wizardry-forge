import { useCallback, useRef, useState } from 'react';
import { getDeviceDimensions } from '../../../utils/deviceDimensions';
import { useSmartSnapping } from './useSmartSnapping';

interface SimpleDragOptions {
  elementRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  deviceConfig: { x: number; y: number; width?: number; height?: number };
  onUpdate: (updates: any) => void;
  elementId: string | number;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

export const useSimplePreciseDrag = ({
  elementRef,
  containerRef,
  deviceConfig,
  onUpdate,
  elementId,
  previewDevice = 'desktop'
}: SimpleDragOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{
    offsetX: number;
    offsetY: number;
    startClientX: number;
    startClientY: number;
    started: boolean;
    elementLogicalW: number;
    elementLogicalH: number;
  } | null>(null);

  const rafRef = useRef<number | null>(null);
  const pendingPosRef = useRef<{ x: number; y: number } | null>(null);
  const deviceDims = getDeviceDimensions(previewDevice);
  const { applySnapping } = useSmartSnapping({ containerRef });

  const commitUpdate = useCallback((x: number, y: number, elW: number, elH: number) => {
    // Clamp within logical device bounds
    const maxX = Math.max(0, deviceDims.width - elW);
    const maxY = Math.max(0, deviceDims.height - elH);
    const cx = Math.min(Math.max(0, x), maxX);
    const cy = Math.min(Math.max(0, y), maxY);

    // Snap in logical space
    const snapped = applySnapping(cx, cy, elW, elH, String(elementId));
    const sx = Math.round(snapped.x);
    const sy = Math.round(snapped.y);

    // Alignment guides payload (centers in logical units)
    const elementCenterX = sx + elW / 2;
    const elementCenterY = sy + elH / 2;
    const canvasCenterX = deviceDims.width / 2;
    const canvasCenterY = deviceDims.height / 2;

    const alignmentEvent = new CustomEvent('showAlignmentGuides', {
      detail: {
        elementId,
        x: sx,
        y: sy,
        width: elW,
        height: elH,
        elementCenterX,
        elementCenterY,
        canvasCenterX,
        canvasCenterY,
        isDragging: true
      }
    });
    document.dispatchEvent(alignmentEvent);

    onUpdate({ x: sx, y: sy });
  }, [applySnapping, deviceDims.width, deviceDims.height, elementId, onUpdate]);

  const scheduleUpdate = useCallback((x: number, y: number, elW: number, elH: number) => {
    pendingPosRef.current = { x, y };
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!pendingPosRef.current) return;
      const { x, y } = pendingPosRef.current;
      pendingPosRef.current = null;
      commitUpdate(x, y, elW, elH);
    });
  }, [commitUpdate]);

  const handlePointerStart = useCallback((e: React.PointerEvent) => {
    if (!elementRef.current || !containerRef.current) return;

    const el = elementRef.current;
    try { el.setPointerCapture(e.pointerId); } catch {}

    // DO NOT preventDefault immediately to allow simple clicks; we'll prevent after drag starts
    e.stopPropagation();

    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = el.getBoundingClientRect();

    const scaleX = containerRect.width / deviceDims.width;
    const scaleY = containerRect.height / deviceDims.height;

    // Element logical position derived from DOM for precision
    const elLeftLogical = (elementRect.left - containerRect.left) / scaleX;
    const elTopLogical = (elementRect.top - containerRect.top) / scaleY;

    const cursorLogicalX = (e.clientX - containerRect.left) / scaleX;
    const cursorLogicalY = (e.clientY - containerRect.top) / scaleY;

    const offsetX = cursorLogicalX - elLeftLogical;
    const offsetY = cursorLogicalY - elTopLogical;

    const elementLogicalW = (deviceConfig.width != null)
      ? deviceConfig.width
      : Math.max(1, elementRect.width / scaleX);
    const elementLogicalH = (deviceConfig.height != null)
      ? deviceConfig.height
      : Math.max(1, elementRect.height / scaleY);

    dragStateRef.current = {
      offsetX,
      offsetY,
      startClientX: e.clientX,
      startClientY: e.clientY,
      started: false,
      elementLogicalW,
      elementLogicalH
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!containerRef.current || !dragStateRef.current) return;

      const dx = moveEvent.clientX - dragStateRef.current.startClientX;
      const dy = moveEvent.clientY - dragStateRef.current.startClientY;
      const dist2 = dx * dx + dy * dy;
      const threshold = 5; // px

      if (!dragStateRef.current.started) {
        if (dist2 < threshold * threshold) {
          return; // still pre-drag
        }
        // Start real drag now
        dragStateRef.current.started = true;
        setIsDragging(true);
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        moveEvent.preventDefault();
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const scaleX = containerRect.width / deviceDims.width;
      const scaleY = containerRect.height / deviceDims.height;

      const cursorLogicalX = (moveEvent.clientX - containerRect.left) / scaleX;
      const cursorLogicalY = (moveEvent.clientY - containerRect.top) / scaleY;

      const nextX = cursorLogicalX - dragStateRef.current.offsetX;
      const nextY = cursorLogicalY - dragStateRef.current.offsetY;

      scheduleUpdate(nextX, nextY, dragStateRef.current.elementLogicalW, dragStateRef.current.elementLogicalH);
    };

    const handlePointerUp = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const wasDragging = !!dragStateRef.current?.started;
      dragStateRef.current = null;
      if (wasDragging) {
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        const hideGuidesEvent = new CustomEvent('hideAlignmentGuides');
        document.dispatchEvent(hideGuidesEvent);
      }

      try { el.releasePointerCapture(e.pointerId); } catch {}

      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  }, [elementRef, containerRef, deviceConfig.width, deviceConfig.height, deviceDims.width, deviceDims.height, scheduleUpdate]);

  return {
    isDragging,
    handleDragStart: handlePointerStart
  };
};