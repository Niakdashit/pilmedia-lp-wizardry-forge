
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
    onUpdate
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

  const getTextStyles = useCallback((): React.CSSProperties => ({
    color: element.color || '#000000',
    fontSize: sizeMap[element.size || 'base'] || '14px',
    fontWeight: element.bold ? 'bold' : 'normal',
    fontStyle: element.italic ? 'italic' : 'normal',
    textDecoration: element.underline ? 'underline' : 'none',
    fontFamily: element.fontFamily || 'Inter, sans-serif',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    willChange: isDragging ? 'transform' : 'auto',
    transition: isDragging ? 'none' : 'box-shadow 0.1s ease',
    ...(element.showFrame
      ? {
          backgroundColor: element.frameColor || '#ffffff',
          border: `1px solid ${element.frameBorderColor || '#e5e7eb'}`,
          padding: '4px 8px',
          borderRadius: '4px'
        }
      : {})
  }), [element, sizeMap, isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    console.log('Text element mouse down:', element.id);
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
        ...getTextStyles()
      }}
      onMouseDown={handleMouseDown}
      className={`${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:ring-2 hover:ring-gray-300'
      }`}
    >
      {element.text}
      
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
