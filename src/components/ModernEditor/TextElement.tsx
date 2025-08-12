
import React, { useRef, useCallback } from 'react';
import { Trash2, Target } from 'lucide-react';
import { useTextElementDrag } from './hooks/useTextElementDrag';

interface TextElementProps {
  element: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  sizeMap: Record<string, string>;
  getElementDeviceConfig: (element: any) => any;
}

const TextElement: React.FC<TextElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  containerRef,
  sizeMap,
  getElementDeviceConfig
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  // Get current device-specific position and size
  const deviceConfig = getElementDeviceConfig(element);

  const { isDragging, handleDragStart } = useTextElementDrag(
    elementRef,
    containerRef,
    deviceConfig,
    onUpdate,
    element.id
  );

  const handleCenterElement = useCallback(() => {
    if (!containerRef.current || !elementRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const elementWidth = elementRef.current.offsetWidth;
    const elementHeight = elementRef.current.offsetHeight;
    
    const centerX = (containerRect.width - elementWidth) / 2;
    const centerY = (containerRect.height - elementHeight) / 2;
    
    onUpdate({ x: centerX, y: centerY });
  }, [onUpdate, containerRef]);

  const hexToRgb = useCallback((hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }, []);

  const getTextStyles = useCallback((): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      color: element.color || '#000000',
      fontSize: element.fontSize ? `${element.fontSize}px` : (sizeMap[element.size || 'base'] || '14px'),
      fontWeight: element.bold ? 'bold' : (element.fontWeight || 'normal'),
      fontStyle: element.italic ? 'italic' : (element.fontStyle || 'normal'),
      textDecoration: element.underline ? 'underline' : (element.textDecoration || 'none'),
      fontFamily: element.fontFamily || 'Inter, sans-serif',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      willChange: isDragging ? 'transform' : 'auto',
      transition: isDragging ? 'none' : 'box-shadow 0.1s ease',
      textAlign: element.textAlign || 'left'
    };

    // Modern typography enhancements
    if (element.letterSpacing) {
      baseStyles.letterSpacing = element.letterSpacing;
    }

    if (element.textTransform) {
      baseStyles.textTransform = element.textTransform;
    }

    if (element.lineHeight) {
      baseStyles.lineHeight = element.lineHeight;
    }

    if (element.textStroke) {
      baseStyles.WebkitTextStroke = `${element.textStroke.width}px ${element.textStroke.color}`;
    }

    // Legacy frame support
    if (element.showFrame) {
      baseStyles.backgroundColor = element.frameColor || '#ffffff';
      baseStyles.border = `1px solid ${element.frameBorderColor || '#e5e7eb'}`;
      baseStyles.padding = '4px 8px';
      baseStyles.borderRadius = '4px';
    }

    // Advanced styling - background with opacity
    if (element.backgroundColor && !element.showFrame) {
      const opacity = element.backgroundOpacity !== undefined ? element.backgroundOpacity : 1;
      const rgb = hexToRgb(element.backgroundColor);
      baseStyles.backgroundColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : element.backgroundColor;
    }

    // Border radius (if not using legacy frame)
    if (element.borderRadius && !element.showFrame) {
      baseStyles.borderRadius = `${element.borderRadius}px`;
    }

    // Padding (if not using legacy frame)
    if (element.padding && !element.showFrame) {
      baseStyles.padding = `${element.padding.top}px ${element.padding.right}px ${element.padding.bottom}px ${element.padding.left}px`;
    }

    // Text shadow
    if (element.textShadow && (element.textShadow.blur > 0 || element.textShadow.offsetX !== 0 || element.textShadow.offsetY !== 0)) {
      baseStyles.textShadow = `${element.textShadow.offsetX}px ${element.textShadow.offsetY}px ${element.textShadow.blur}px ${element.textShadow.color}`;
    }

    // Appliquer les styles CSS avancés si disponibles
    if (element.customCSS) {
      Object.assign(baseStyles, element.customCSS);
    }

    return baseStyles;
  }, [element, sizeMap, isDragging, hexToRgb]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    console.log('Text element pointer down:', element.id);
    onSelect();
    handleDragStart(e);
  }, [onSelect, handleDragStart, element.id]);

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: `${deviceConfig.x}px`,
        top: `${deviceConfig.y}px`,
        zIndex: isSelected ? 30 : 20,
        ...(element.type === 'html' ? {
          minWidth: '200px',
          minHeight: '50px',
          border: isSelected ? '1px dashed #60a5fa' : 'none',
          borderRadius: '4px',
          backgroundColor: isSelected ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
          padding: '8px',
          overflow: 'hidden',
          wordWrap: 'break-word',
          cursor: isDragging ? 'grabbing' : 'grab'
        } : getTextStyles())
      }}
      onPointerDown={handlePointerDown}
      className={`${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:ring-2 hover:ring-gray-300'
      }`}
    >
      {element.type === 'html' ? (
        <div 
          dangerouslySetInnerHTML={{ __html: element.content }}
          style={{
            fontSize: `${element.fontSize}px`,
            color: element.color,
            fontFamily: element.fontFamily,
            width: '100%',
            height: '100%'
          }}
        />
      ) : (
        element.content || element.text
      )}
      
      {isSelected && (
        <div className="absolute -top-10 left-0 flex space-x-1 bg-white rounded shadow-lg px-2 py-1 border">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCenterElement();
            }}
            className="p-1 hover:bg-blue-100 text-blue-600 rounded"
            title="Centrer l'élément"
          >
            <Target className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TextElement;
