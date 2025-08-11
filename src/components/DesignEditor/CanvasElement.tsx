import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useDesignEditor } from '../hooks/useDesignEditor';
import { DragPreviewImage } from 'react-dnd';

interface CanvasElementProps {
  element: any;
  elementType: 'text' | 'image';
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  zoom: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (updates: any) => void;
  isDragging?: boolean;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  elementType,
  selectedDevice,
  zoom,
  isSelected,
  onSelect,
  onUpdate,
  isDragging
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [localPosition, setLocalPosition] = useState({ x: element.x, y: element.y });
  const { dragState } = useDesignEditor();

  const [{ isDragging: dragging }, drag, preview] = useDrag({
    type: 'CANVAS_ELEMENT',
    item: { id: element.id, type: elementType, initialX: element.x, initialY: element.y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    begin: () => {
      return {
        id: element.id,
        type: elementType,
        initialX: element.x,
        initialY: element.y
      };
    },
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        return;
      }

      const delta = monitor.getDifferenceFromInitialOffset() as { x: number, y: number } | null;

      if (delta) {
        const x = Math.round(item.initialX + delta.x / zoom);
        const y = Math.round(item.initialY + delta.y / zoom);

        setLocalPosition({ x, y });

        onUpdate({
          x: x,
          y: y
        });
      }
    },
  });

  useEffect(() => {
    if (elementRef.current && elementType === 'image') {
      preview(getEmptyImage(), { captureDraggingState: true });
    }
  }, [preview, elementType]);

  useEffect(() => {
    if (dragging) {
      onSelect(element.id.toString());
    }
  }, [dragging, element.id, onSelect]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(element.id.toString());
  }, [element.id, onSelect]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(element.id.toString());
  }, [element.id, onSelect]);

  // Get responsive properties
  const getElementProperties = () => {
    const deviceProps = selectedDevice !== 'desktop' && element[selectedDevice] 
      ? element[selectedDevice] 
      : element;

    return {
      x: dragState.isDragging && dragState.draggedElementId === element.id.toString() 
        ? localPosition.x 
        : (deviceProps.x || element.x || 0),
      y: dragState.isDragging && dragState.draggedElementId === element.id.toString() 
        ? localPosition.y 
        : (deviceProps.y || element.y || 0),
      width: deviceProps.width || element.width,
      height: deviceProps.height || element.height,
      fontSize: deviceProps.fontSize || element.fontSize,
      color: deviceProps.color || element.color || '#000000',
      fontFamily: deviceProps.fontFamily || element.fontFamily || 'Arial',
      fontWeight: deviceProps.fontWeight || element.fontWeight || 'normal',
      textAlign: deviceProps.textAlign || element.textAlign || 'left',
      text: element.text || '',
      src: element.src || ''
    };
  };

  const props = getElementProperties();

  // Mobile optimized styles
  const getElementStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      left: `${props.x}px`,
      top: `${props.y}px`,
      width: props.width ? `${props.width}px` : 'auto',
      height: props.height ? `${props.height}px` : 'auto',
      cursor: 'move',
      userSelect: 'none' as const,
      touchAction: 'none' as const,
      zIndex: isSelected ? 1000 : 1,
      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      transition: isDragging ? 'none' : 'all 0.1s ease-out',
      outline: isSelected ? '2px solid #3b82f6' : 'none',
      outlineOffset: '2px'
    };

    // Mobile specific optimizations
    if (selectedDevice === 'mobile') {
      return {
        ...baseStyles,
        minHeight: elementType === 'text' ? '32px' : '40px',
        minWidth: elementType === 'text' ? '60px' : '40px',
        touchAction: 'manipulation' as const,
        WebkitUserSelect: 'none' as const,
        WebkitTouchCallout: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      };
    }

    return baseStyles;
  };

  const textStyles = elementType === 'text' ? {
    fontSize: `${props.fontSize || 16}px`,
    color: props.color,
    fontFamily: props.fontFamily,
    fontWeight: props.fontWeight,
    textAlign: props.textAlign as 'left' | 'center' | 'right',
    lineHeight: '1.2',
    wordWrap: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const
  } : {};

  return (
    <div
      ref={elementRef}
      style={{...getElementStyles(), ...textStyles}}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      data-element-id={element.id}
      data-element-type={elementType}
      className={`canvas-element ${isSelected ? 'selected' : ''} ${selectedDevice === 'mobile' ? 'mobile-optimized' : ''}`}
    >
      {elementType === 'text' ? (
        <div style={{ width: '100%', height: '100%' }}>
          {props.text || 'Texte'}
        </div>
      ) : (
        <img
          src={props.src}
          alt="Element"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none'
          }}
          draggable={false}
        />
      )}
    </div>
  );
};

export default CanvasElement;
