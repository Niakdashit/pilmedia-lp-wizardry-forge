import React, { useCallback, useMemo, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { SmartWheel } from '../SmartWheel';
import { useUniversalResponsive } from '../../hooks/useUniversalResponsive';
import { useTouchOptimization } from './hooks/useTouchOptimization';
import TextContextMenu from './components/TextContextMenu';
import { useEditorStore } from '../../stores/editorStore';
import type { DeviceType } from '../../utils/deviceDimensions';

// Force cache invalidation - React DnD v14+ compliant

export interface CanvasElementProps {
  element: any;
  isSelected: boolean;
  onSelect: (id: string, isMultiSelect?: boolean) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  selectedDevice: DeviceType;
  containerRef?: React.RefObject<HTMLDivElement>;
  zoom?: number;
  onAddElement?: (element: any) => void;
  elements?: any[];
}

const CanvasElement: React.FC<CanvasElementProps> = React.memo(({
  element,
  isSelected,
  selectedDevice,
  onSelect,
  onUpdate,
  onDelete,
  containerRef,
  zoom = 1,
  onAddElement
}) => {
  const { getPropertiesForDevice } = useUniversalResponsive('desktop');
  
  // 📱 Hook d'optimisation tactile pour mobile/tablette
  const touchOptimization = useTouchOptimization({ 
    selectedDevice, 
    containerRef,
    zoom 
  });
  
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
  const textRef = React.useRef<HTMLDivElement>(null);
  const elementRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      // Connect the drag source to the element ref
      drag(elementRef);
    }
  }, [drag]);

  // Global clipboard from store
  const clipboard = useEditorStore(state => state.clipboard);
  const setClipboard = useEditorStore(state => state.setClipboard);
  const canPaste = useEditorStore(state => state.canPaste);

  // Optimized drag handlers with useCallback - precise cursor tracking
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelect(element.id, isMultiSelect);
    e.preventDefault();

    const el = elementRef.current;
    const canvasEl = containerRef?.current;
    if (!el || !canvasEl) return;

    el.setPointerCapture?.(e.pointerId);
    el.style.transition = 'none';

    const rect = canvasEl.getBoundingClientRect();
    const zoomScale = touchOptimization.calculateZoomScale(canvasEl);

    const initialCoords = touchOptimization.convertToCanvasCoordinates(
      e.clientX,
      e.clientY,
      touchOptimization.isTouchInteraction(e)
    );

    const offsetX = initialCoords.x - (deviceProps.x || 0);
    const offsetY = initialCoords.y - (deviceProps.y || 0);

    const lastPos = { x: deviceProps.x || 0, y: deviceProps.y || 0 };
    let rafId = 0;

    const update = () => {
      rafId = 0;
      if (elementRef.current) {
        elementRef.current.style.transform = `translate3d(${lastPos.x}px, ${lastPos.y}px, 0)`;
      }
      const width = deviceProps.width || 100;
      const height = deviceProps.height || 30;
      const elementCenterX = lastPos.x + width / 2;
      const elementCenterY = lastPos.y + height / 2;
      const canvasCenterX = (rect.width / zoomScale) / 2;
      const canvasCenterY = (rect.height / zoomScale) / 2;
      document.dispatchEvent(new CustomEvent('showAlignmentGuides', {
        detail: {
          elementId: element.id,
          x: lastPos.x,
          y: lastPos.y,
          width,
          height,
          elementCenterX,
          elementCenterY,
          canvasCenterX,
          canvasCenterY,
          newX: lastPos.x,
          newY: lastPos.y,
        }
      }));
    };

    const move = (evt: PointerEvent) => {
      const coords = touchOptimization.convertToCanvasCoordinates(
        evt.clientX,
        evt.clientY,
        touchOptimization.isTouchInteraction(evt)
      );

      lastPos.x = coords.x - offsetX;
      lastPos.y = coords.y - offsetY;

      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    };

    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.dispatchEvent(new CustomEvent('hideAlignmentGuides'));
      el.releasePointerCapture?.(e.pointerId);
      el.style.transition = '';
      onUpdate(element.id, { x: lastPos.x, y: lastPos.y });
    };

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }, [element.id, onSelect, containerRef, onUpdate, deviceProps.x, deviceProps.y, deviceProps.width, deviceProps.height, touchOptimization]);

  // Optimized text editing handlers with useCallback - MOVED BEFORE renderElement
  const handleDoubleClick = useCallback(() => {
    if (element.type === 'text') {
      setIsEditing(true);
    }
  }, [element.type]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    onUpdate(element.id, { content: newContent });
  }, [element.id, onUpdate]);

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
      setIsEditing(false);
    }
  }, [element, onUpdate]);

  const handleTextBlur = useCallback(() => {
    setIsEditing(false);
  }, []);



  const handleAlign = useCallback((alignment: string) => {
    // Logique d'alignement basée sur le conteneur
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

// --- Remove any previous/old handleCopy, handlePaste, handleDuplicate below this line ---


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
            className="bg-transparent border-none outline-none"
            style={{
              ...getTextStyle(),
              width: `${Math.max((element.content || 'Texte').length * 0.5 + 0.5, 2)}em`,
              height: 'auto',
              boxSizing: 'border-box',
              display: 'inline-block',
              padding: '0',
              margin: '0',
              border: 'none',
              minWidth: '2em'
            }}
            autoFocus
            data-element-type="text"
          />
        ) : (
          <div
            ref={textRef}
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
        ref={elementRef}
        className={`absolute ${isSelected ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`}
        style={{
          transform: `translate3d(${deviceProps.x || 0}px, ${deviceProps.y || 0}px, 0)`,
          opacity,
          zIndex: element.zIndex || 1,
          transition: 'transform 0.1s linear',
          touchAction: 'none',
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
          
          {/* Context Menu for Text Elements */}
          {element.type === 'text' && (
            <TextContextMenu
              element={element}
              onCopy={handleCopy}
              onPaste={handlePaste}
              onDuplicate={handleDuplicate}
              onDelete={onDelete}
              onAlign={handleAlign}
              canPaste={canPaste()}
            />
          )}
        </div>
      )}
    </div>
  );
});

CanvasElement.displayName = 'CanvasElement';

export default CanvasElement;