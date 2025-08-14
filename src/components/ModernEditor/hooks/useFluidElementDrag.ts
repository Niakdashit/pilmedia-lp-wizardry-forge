import { useCallback, useRef } from 'react';
import { useUltraFluidDragDrop } from './useUltraFluidDragDrop';
import { getDeviceDimensions } from '../../../utils/deviceDimensions';

interface FluidElementDragOptions {
  elementRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  deviceConfig: { x: number; y: number; width?: number; height?: number };
  onUpdate: (updates: any) => void;
  elementId: string | number;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

export const useFluidElementDrag = ({
  elementRef,
  containerRef,
  deviceConfig,
  onUpdate,
  elementId,
  previewDevice = 'desktop'
}: FluidElementDragOptions) => {
  const elementPositionRef = useRef(deviceConfig);
  const deviceDims = useRef(getDeviceDimensions(previewDevice));

  // Mettre à jour les références quand les props changent
  elementPositionRef.current = deviceConfig;
  deviceDims.current = getDeviceDimensions(previewDevice);

  const handleDragStart = useCallback((_dragElementId: string, position: { x: number; y: number }) => {
    console.log('🚀 Fluid drag started:', { elementId, position });
  }, [elementId]);

  const handleDragMove = useCallback((_dragElementId: string, position: { x: number; y: number }, velocity: { x: number; y: number }) => {
    // Convertir la position du canvas vers les coordonnées logiques du device
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const scaleX = containerRect.width / deviceDims.current.width;
    const scaleY = containerRect.height / deviceDims.current.height;

    const logicalX = position.x / scaleX;
    const logicalY = position.y / scaleY;

    // Limites dans les coordonnées logiques du device
    const maxX = Math.max(0, deviceDims.current.width - (deviceConfig.width || 100));
    const maxY = Math.max(0, deviceDims.current.height - (deviceConfig.height || 30));
    
    // Appliquer les limites
    const constrainedX = Math.min(Math.max(0, logicalX), maxX);
    const constrainedY = Math.min(Math.max(0, logicalY), maxY);

    console.log('🎯 Fluid drag move:', {
      position,
      logicalPos: { x: logicalX, y: logicalY },
      constrainedPos: { x: constrainedX, y: constrainedY },
      velocity,
      scales: { scaleX, scaleY }
    });

    onUpdate({ x: Math.round(constrainedX), y: Math.round(constrainedY) });
  }, [onUpdate, containerRef, deviceConfig, previewDevice]);

  const handleDragEnd = useCallback((_dragElementId: string, position: { x: number; y: number }) => {
    console.log('✅ Fluid drag ended:', { elementId, position });
  }, [elementId]);

  const { isDragging, startDrag } = useUltraFluidDragDrop({
    containerRef,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    snapToGrid: true,
    gridSize: 1, // Précision au pixel
    enableInertia: true,
    dampingFactor: 0.92 // Léger effet d'inertie pour plus de fluidité
  });

  const handlePointerStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!elementRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = elementRef.current.getBoundingClientRect();

    // Calculer l'échelle pour la conversion entre coordonnées physiques et canvas
    const scaleX = containerRect.width / deviceDims.current.width;
    const scaleY = containerRect.height / deviceDims.current.height;

    // Position de l'élément dans le canvas physique
    const elementCanvasX = (elementRect.left - containerRect.left);
    const elementCanvasY = (elementRect.top - containerRect.top);

    const elementCanvasRect = {
      x: elementCanvasX,
      y: elementCanvasY,
      width: elementRect.width,
      height: elementRect.height
    };

    console.log('🎯 Starting fluid drag:', {
      elementId,
      clientPos: { x: e.clientX, y: e.clientY },
      elementCanvasRect,
      scales: { scaleX, scaleY },
      deviceConfig,
      deviceDims: deviceDims.current
    });

    startDrag(
      String(elementId),
      e.clientX,
      e.clientY,
      elementCanvasRect
    );
  }, [startDrag, elementId, elementRef, containerRef, deviceConfig]);

  return {
    isDragging,
    handleDragStart: handlePointerStart
  };
};