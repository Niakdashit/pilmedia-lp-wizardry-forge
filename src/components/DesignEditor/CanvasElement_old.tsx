import React, { useCallback, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { SmartWheel } from '../SmartWheel';
import { useUniversalResponsive } from '../../hooks/useUniversalResponsive';
// Removed complex touch optimization - using simple approach
import type { DeviceType } from '../../utils/deviceDimensions';

// Force cache invalidation - React DnD v14+ compliant

export interface CanvasElementProps {
  element: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  selectedDevice: DeviceType;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const CanvasElement: React.FC<CanvasElementProps> = React.memo(({
  element,
  isSelected,
  selectedDevice,
  onSelect,
  onUpdate,
  onDelete,
  containerRef
}) => {
  const { getPropertiesForDevice } = useUniversalResponsive('desktop');
  
  // 📱 Simple touch detection for mobile/tablet
  const isTouchDevice = selectedDevice === 'mobile' || selectedDevice === 'tablet';
  
  // Simple touch offset for better UX
  const getTouchOffset = () => {
    if (selectedDevice === 'mobile') return { x: 0, y: -20 };
    if (selectedDevice === 'tablet') return { x: 0, y: -25 };
    return { x: 0, y: 0 };
  };
  
  // Get device-specific properties with proper typing - memoized
  const deviceProps = useMemo(() => 
    getPropertiesForDevice(element, selectedDevice), 
    [element, selectedDevice, getPropertiesForDevice]
  );
  

  // Modern useDrag hook (v14+ compatible) - no deprecated begin/end callbacks
  const [{ opacity, isDragging }, drag] = useDrag(() => ({
    type: 'canvas-element',
    item: { id: element.id },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
      isDragging: monitor.isDragging(),
    }),
  }));

  const [isEditing, setIsEditing] = React.useState(false);

  // Optimized drag handlers with useCallback - Enhanced for mobile/tablet
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    onSelect(element.id);

    const currentProps = deviceProps;
    
    // Obtenir les informations du conteneur pour les calculs précis
    if (!containerRef?.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    // 📱 Simple and stable touch handling
    const isTouch = e.pointerType === 'touch';
    
    // Get zoom scale from transform
    const getZoomScale = () => {
      const style = getComputedStyle(containerRef.current!);
      const transform = style.transform;
      if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
          const values = matrix[1].split(',').map(v => parseFloat(v.trim()));
          return values[0]; // Scale X
        }
      }
      return 1;
    };
    
    // Calculate canvas coordinates with simple touch offset
    const zoomScale = getZoomScale();
    let canvasX = (e.clientX - containerRect.left) / zoomScale;
    let canvasY = (e.clientY - containerRect.top) / zoomScale;
    
    // Apply simple touch offset to avoid finger covering element
    if (isTouch) {
      const offset = getTouchOffset();
      canvasX += offset.x;
      canvasY += offset.y;
        const touchOffset = selectedDevice === 'mobile' ? 45 : 35;
        canvasY -= touchOffset;
        
        const precisionFactor = selectedDevice === 'mobile' ? 0.98 : 0.99;
        canvasX *= precisionFactor;
        canvasY *= precisionFactor;
      }
    }
    
    const startX = canvasX - currentProps.x;
    const startY = canvasY - currentProps.y;

    const handlePointerMove = (e: PointerEvent) => {
      // 📱 Détecter et optimiser pour les interactions tactiles
      const isTouchMove = touchOptimization.isTouchInteraction(e);
      
      // Convertir les coordonnées avec fallback robuste
      let newCanvasX: number, newCanvasY: number;
      
      try {
        const moveCoords = touchOptimization.convertToCanvasCoordinates(
          e.clientX, 
          e.clientY, 
          isTouchMove
        );
        newCanvasX = moveCoords.x;
        newCanvasY = moveCoords.y;
      } catch (error) {
        // Fallback : calcul manuel si le hook échoue
        const zoomScale = touchOptimization.calculateZoomScale(containerRef.current!) || 1;
        newCanvasX = (e.clientX - containerRect.left) / zoomScale;
        newCanvasY = (e.clientY - containerRect.top) / zoomScale;
        
        // Appliquer la compensation tactile manuellement si nécessaire
        if (isTouchMove && selectedDevice !== 'desktop') {
          const touchOffset = selectedDevice === 'mobile' ? 45 : 35;
          newCanvasY -= touchOffset;
          
          const precisionFactor = selectedDevice === 'mobile' ? 0.98 : 0.99;
          newCanvasX *= precisionFactor;
          newCanvasY *= precisionFactor;
        }
      }
      
      const newX = newCanvasX - startX;
      const newY = newCanvasY - startY;
      
      // Calculer les dimensions réelles de l'élément avec plus de précision
      const elementWidth = currentProps.width || (element.type === 'text' ? 100 : 100);
      const elementHeight = currentProps.height || (element.type === 'text' ? 30 : 100);
      
      // Pour les éléments de texte, utiliser les dimensions du contenu si disponibles
      let actualWidth = elementWidth;
      let actualHeight = elementHeight;
      
      if (element.type === 'text' && e.target instanceof HTMLElement) {
        const textElement = e.target.closest('[data-element-type="text"]');
        if (textElement) {
          const rect = textElement.getBoundingClientRect();
          const currentZoomScale = touchOptimization.calculateZoomScale(containerRef.current!) || 1;
          actualWidth = rect.width / currentZoomScale;
          actualHeight = rect.height / currentZoomScale;
        }
      }
      
      // 📱 Ajustement des dimensions pour les interactions tactiles
      if (isTouchMove) {
        const adjustedDimensions = touchOptimization.adjustDimensionsForTouch(
          actualWidth, 
          actualHeight, 
          isTouchMove
        );
        actualWidth = adjustedDimensions.width;
        actualHeight = adjustedDimensions.height;
      }
      
      // Calculer le centre précis de l'élément
      const elementCenterX = newX + actualWidth / 2;
      const elementCenterY = newY + actualHeight / 2;
      
      // Get canvas dimensions for alignment guides
      if (containerRef?.current) {
        // Obtenir les dimensions réelles du canvas
        const canvasElement = containerRef.current;
        const canvasRect = canvasElement.getBoundingClientRect();
        const currentZoomScale = touchOptimization.calculateZoomScale(containerRef.current!) || 1;
        const canvasWidth = canvasRect.width / currentZoomScale;
        const canvasHeight = canvasRect.height / currentZoomScale;
        
        // Le centre du canvas avec calculs précis
        const canvasCenterX = canvasWidth / 2;
        const canvasCenterY = canvasHeight / 2;
        
        // Tolérance adaptative pour l'alignement au centre
        const centerToleranceX = Math.max(2, actualWidth * 0.05);
        const centerToleranceY = Math.max(2, actualHeight * 0.05);
        
        // Déclencher les guides avec la position en temps réel et tolérance adaptative
        document.dispatchEvent(new CustomEvent('showAlignmentGuides', {
          detail: {
            elementId: element.id,
            x: newX,
            y: newY,
            width: currentProps.width || 100,
            height: currentProps.height || 30,
            elementCenterX,
            elementCenterY,
            canvasCenterX,
            canvasCenterY,
            elementWidth: actualWidth,
            elementHeight: actualHeight,
            newX,
            newY,
            centerToleranceX,
            centerToleranceY,
            isNearCenterX: Math.abs(elementCenterX - canvasCenterX) <= centerToleranceX,
            isNearCenterY: Math.abs(elementCenterY - canvasCenterY) <= centerToleranceY
          }
        }));
      }
      
      // Throttled updates for smooth 60fps movement
      requestAnimationFrame(() => {
        onUpdate(element.id, {
          x: newX,
          y: newY,
        });
      });
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      // Hide guides when drag ends
      document.dispatchEvent(new CustomEvent('hideAlignmentGuides'));
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [element.id, deviceProps, onSelect, onUpdate, containerRef]);

  // Optimized text editing handlers with useCallback
  const handleDoubleClick = useCallback(() => {
    if (element.type === 'text') {
      setIsEditing(true);
    }
  }, [element.type]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(element.id, { content: e.target.value });
  }, [element.id, onUpdate]);

  const handleTextKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  }, []);

  const handleTextBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Optimized resize handler with useCallback - Enhanced for mobile/tablet
  const handleResizePointerDown = useCallback((e: React.PointerEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();

    // 📱 Détection du type d'interaction pour le redimensionnement
    const isTouchResize = touchOptimization.isTouchInteraction(e);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width || 100;
    const startHeight = element.height || 100;
    const startPosX = element.x || 0;
    const startPosY = element.y || 0;
    const startFontSize = element.fontSize || element.style?.fontSize || 16;
    
    // Detect if it's a corner handle (for proportional scaling with font size change)
    const isCornerHandle = ['nw', 'ne', 'sw', 'se'].includes(direction);

      const handleResizePointerMove = (e: PointerEvent) => {
        // Throttled resize for smooth performance
        requestAnimationFrame(() => {
          // 📱 Appliquer la sensibilité tactile aux deltas
          const rawDeltaX = e.clientX - startX;
          const rawDeltaY = e.clientY - startY;
          
          const adjustedDeltas = touchOptimization.applyTouchSensitivity(
            rawDeltaX, 
            rawDeltaY, 
            isTouchResize
          );
          
          const deltaX = adjustedDeltas.deltaX;
          const deltaY = adjustedDeltas.deltaY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;
      let newFontSize = startFontSize;

      if (isCornerHandle && element.type === 'text') {
        // For corner handles on text: scale font size proportionally
        
        let scaleFactor = 1;
        
        switch (direction) {
          case 'se': // bottom-right
            scaleFactor = 1 + (deltaX + deltaY) / 150;
            break;
          case 'sw': // bottom-left
            scaleFactor = 1 + (-deltaX + deltaY) / 150;
            break;
          case 'ne': // top-right
            scaleFactor = 1 + (deltaX - deltaY) / 150;
            break;
          case 'nw': // top-left
            scaleFactor = 1 + (-deltaX - deltaY) / 150;
            break;
        }
        
        scaleFactor = Math.max(0.2, scaleFactor);
        newFontSize = Math.max(8, Math.round(startFontSize * scaleFactor));
        
        
        // Keep text box dimensions tight to content (remove width/height to make it auto)
        onUpdate(element.id, {
          fontSize: newFontSize,
          width: undefined,
          height: undefined,
          isCornerScaled: true,
        });
      } else {
        // For edge handles or non-text elements: change dimensions only
        switch (direction) {
          case 'n': // top
            newHeight = Math.max(20, startHeight - deltaY);
            newY = startPosY + (startHeight - newHeight);
            break;
          case 's': // bottom
            newHeight = Math.max(20, startHeight + deltaY);
            break;
          case 'w': // left
            newWidth = Math.max(20, startWidth - deltaX);
            newX = startPosX + (startWidth - newWidth);
            break;
          case 'e': // right
            newWidth = Math.max(20, startWidth + deltaX);
            break;
          case 'se': // bottom-right
            newWidth = Math.max(20, startWidth + deltaX);
            newHeight = Math.max(20, startHeight + deltaY);
            break;
          case 'sw': // bottom-left
            newWidth = Math.max(20, startWidth - deltaX);
            newHeight = Math.max(20, startHeight + deltaY);
            newX = startPosX + (startWidth - newWidth);
            break;
          case 'ne': // top-right
            newWidth = Math.max(20, startWidth + deltaX);
            newHeight = Math.max(20, startHeight - deltaY);
            newY = startPosY + (startHeight - newHeight);
            break;
          case 'nw': // top-left
            newWidth = Math.max(20, startWidth - deltaX);
            newHeight = Math.max(20, startHeight - deltaY);
            newX = startPosX + (startWidth - newWidth);
            newY = startPosY + (startHeight - newHeight);
            break;
        }

          onUpdate(element.id, {
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY,
            isCornerScaled: false,
          });
        }
        });
      };

    const handleResizePointerUp = () => {
      document.removeEventListener('pointermove', handleResizePointerMove);
      document.removeEventListener('pointerup', handleResizePointerUp);
    };

    document.addEventListener('pointermove', handleResizePointerMove);
    document.addEventListener('pointerup', handleResizePointerUp);
  }, [element.id, onUpdate]);

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

    switch (element.type) {
      case 'text':
        const getTextStyle = (): React.CSSProperties => {
          const baseStyle: React.CSSProperties = {
            fontSize: (element.type === 'text' ? (deviceProps as any).fontSize : undefined) || element.fontSize || element.style?.fontSize || 16,
            fontFamily: element.fontFamily || element.style?.fontFamily || 'Arial',
            color: element.color || element.style?.color || '#000000',
            fontWeight: element.fontWeight || element.style?.fontWeight || 'normal',
            fontStyle: element.fontStyle || element.style?.fontStyle || 'normal',
            textDecoration: element.textDecoration || element.style?.textDecoration || 'none',
            textAlign: (element.type === 'text' ? (deviceProps as any).textAlign : undefined) || element.textAlign || element.style?.textAlign || 'left',
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
            baseStyle.borderRadius = `${element.borderRadius}px`;
          }

          // Add padding
          if (element.padding) {
            baseStyle.padding = `${element.padding.top}px ${element.padding.right}px ${element.padding.bottom}px ${element.padding.left}px`;
          }

          // Add text shadow
          if (element.textShadow && (element.textShadow.blur > 0 || element.textShadow.offsetX !== 0 || element.textShadow.offsetY !== 0)) {
            baseStyle.textShadow = `${element.textShadow.offsetX}px ${element.textShadow.offsetY}px ${element.textShadow.blur}px ${element.textShadow.color}`;
          }

          // Add custom CSS from effects
          if (element.customCSS) {
            Object.assign(baseStyle, element.customCSS);
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

        return isEditing ? (
          <input
            type="text"
            value={element.content || 'Texte'}
            onChange={handleTextChange}
            onKeyDown={handleTextKeyDown}
            onBlur={handleTextBlur}
            className="bg-transparent border-none outline-none resize-none w-full"
            style={{
              ...getTextStyle(),
              minWidth: '50px'
            }}
            autoFocus
            data-element-type="text"
          />
        ) : (
          <div
            className="cursor-move select-none whitespace-pre-wrap break-words"
            style={getTextStyle()}
            data-element-type="text"
          >
            {element.content || 'Texte'}
          </div>
        );
      case 'image':
        return (
          <img
            src={element.src}
            alt={element.alt || 'Image'}
            className="cursor-move object-cover"
            draggable={false}
            loading="lazy"
            style={elementStyle}
          />
        );
      case 'wheel':
        return (
          <div 
            className="cursor-move"
            style={{ 
              ...elementStyle,
              pointerEvents: 'none' // Empêche l'interaction directe avec la roue
            }}
          >
            <SmartWheel
              segments={element.segments || []}
              size={Math.min(element.width || 300, element.height || 300)}
              disabled={true}
              brandColors={{
                primary: '#FF6B6B',
                secondary: '#4ECDC4'
              }}
            />
          </div>
        );
      case 'shape':
        return (
          <div
            className="cursor-move"
            style={{
              ...elementStyle,
              backgroundColor: element.backgroundColor || element.style?.backgroundColor || '#3B82F6',
              borderRadius: element.borderRadius || element.style?.borderRadius || (element.shapeType === 'circle' ? '50%' : '0'),
            }}
          />
        );
      default:
        return <div className="w-20 h-20 bg-gray-300 cursor-move" style={elementStyle} />;
    }
  }, [element, deviceProps, isEditing, handleTextChange, handleTextKeyDown, handleTextBlur]);

  return (
    <div
      ref={drag}
      className={`absolute ${isSelected ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`}
      style={{
        left: deviceProps.x || 0,
        top: deviceProps.y || 0,
        opacity,
        zIndex: element.zIndex || 1,
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      {renderElement}
      
      {/* Selection handles - masqués pendant le drag */}
      {isSelected && !isDragging && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1000 }}>
          {/* Corner handles - for proportional scaling */}
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-[hsl(var(--primary))] border border-white rounded-full cursor-nw-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-[hsl(var(--primary))] border border-white rounded-full cursor-ne-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-[hsl(var(--primary))] border border-white rounded-full cursor-sw-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-[hsl(var(--primary))] border border-white rounded-full cursor-se-resize shadow-lg" 
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            style={{ zIndex: 1001 }}
          />
          
          {/* Edge handles - only left and right (w, e) */}
          {element.type === 'text' && (
            <>
              <div 
                className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-[hsl(var(--primary))] border border-white rounded cursor-w-resize shadow-lg" 
                onPointerDown={(e) => handleResizePointerDown(e, 'w')}
                style={{ zIndex: 1001 }}
              />
              <div 
                className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-[hsl(var(--primary))] border border-white rounded cursor-e-resize shadow-lg" 
                onPointerDown={(e) => handleResizePointerDown(e, 'e')}
                style={{ zIndex: 1001 }}
              />
            </>
          )}
          
          {/* Delete button */}
          <button
            onClick={() => onDelete(element.id)}
            className="absolute -top-8 -right-8 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 shadow-lg"
            style={{ zIndex: 1001 }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
});

CanvasElement.displayName = 'CanvasElement';

export default CanvasElement;