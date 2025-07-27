import React, { useState, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import ResizeHandles from './ResizeHandles';
import { useElementResize } from './hooks/useElementResize';
import { useElementEdit } from './hooks/useElementEdit';

interface ProElementProps {
  element: any;
  isSelected: boolean;
  isMultiSelected: boolean;
  onSelect: (id: string, isMultiSelect: boolean) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, element: any) => void;
  onDragStart: (e: React.MouseEvent, element: any) => void;
  snapGuides: any[];
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

const ProElement: React.FC<ProElementProps> = ({
  element,
  isSelected,
  isMultiSelected,
  onSelect,
  onUpdate,
  onDelete,
  onContextMenu,
  onDragStart,
  // snapGuides,
  isDragging,
  dragOffset
}) => {
  // const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const { 
    isResizing, 
    handleResizeStart
    // resizeHandles 
  } = useElementResize(element, onUpdate);
  
  const { 
    isEditing, 
    editValue, 
    setEditValue, 
    handleEditStart, 
    handleEditEnd 
  } = useElementEdit(element, onUpdate);

  const [{ isDraggingDnd }, drag] = useDrag({
    type: 'element',
    item: { id: element.id, type: element.type },
    collect: (monitor) => ({
      isDraggingDnd: monitor.isDragging(),
    }),
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isMultiSelect = e.metaKey || e.ctrlKey || e.shiftKey;
    onSelect(element.id, isMultiSelect);
    
    if (!isResizing && !isEditing) {
      onDragStart(e, element);
    }
  }, [element.id, isResizing, isEditing, onSelect, onDragStart]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === 'text') {
      handleEditStart();
    }
  }, [element.type, handleEditStart]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditEnd();
    } else if (e.key === 'Escape') {
      handleEditEnd();
    }
  }, [handleEditEnd]);

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        if (isEditing) {
          return (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditEnd}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-transparent border-none outline-none resize-none"
              style={{
                fontSize: `${element.fontSize || 16}px`,
                fontFamily: element.fontFamily || 'Inter',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                textDecoration: element.textDecoration || 'none',
                color: element.color || '#000000',
                textAlign: element.textAlign || 'left',
                lineHeight: 1.2
              }}
              autoFocus
            />
          );
        }
        
        return (
          <div
            className="whitespace-pre-wrap break-words cursor-text select-none"
            style={{
              fontSize: `${element.fontSize || 16}px`,
              fontFamily: element.fontFamily || 'Inter',
              fontWeight: element.fontWeight || 'normal',
              fontStyle: element.fontStyle || 'normal',
              textDecoration: element.textDecoration || 'none',
              color: element.color || '#000000',
              textAlign: element.textAlign || 'left',
              lineHeight: 1.2,
              textShadow: element.textShadow || 'none',
              WebkitTextStroke: element.stroke || 'none'
            }}
          >
            {element.content || 'Texte'}
          </div>
        );
        
      case 'image':
        return (
          <img
            src={element.src}
            alt={element.alt || 'Image'}
            className="w-full h-full object-cover select-none"
            style={{
              borderRadius: element.borderRadius || '0px',
              filter: element.filter || 'none',
              opacity: element.opacity || 1,
              transform: element.transform || 'none'
            }}
            draggable={false}
          />
        );
        
      case 'shape':
        return (
          <div
            className="w-full h-full select-none"
            style={{
              backgroundColor: element.backgroundColor || '#cccccc',
              borderRadius: element.borderRadius || '0px',
              border: element.border || 'none',
              filter: element.filter || 'none',
              opacity: element.opacity || 1,
              transform: element.transform || 'none'
            }}
          />
        );
        
      default:
        return <div className="w-full h-full bg-gray-200" />;
    }
  };

  const currentX = isDragging && isSelected ? element.x + dragOffset.x : element.x;
  const currentY = isDragging && isSelected ? element.y + dragOffset.y : element.y;

  return (
    <div
      ref={drag}
      className={`absolute cursor-move select-none transition-all duration-100 ${
        isDraggingDnd ? 'opacity-50' : ''
      } ${isSelected ? 'z-10' : ''}`}
      style={{
        left: `${currentX}px`,
        top: `${currentY}px`,
        width: `${element.width || 100}px`,
        height: `${element.height || 50}px`,
        zIndex: element.zIndex || 1,
        transform: element.transform || 'none',
        filter: element.filter || 'none',
        opacity: element.opacity || 1
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => onContextMenu(e, element)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Element Content */}
      {renderElement()}
      
      {/* Selection Outline */}
      {(isSelected || isHovered) && !isEditing && (
        <div 
          className={`absolute inset-0 pointer-events-none ${
            isSelected 
              ? 'border-2 border-blue-500 shadow-lg' 
              : 'border border-blue-300'
          }`}
          style={{
            borderRadius: element.borderRadius || '0px'
          }}
        />
      )}
      
      {/* Multi-selection Indicator */}
      {isSelected && isMultiSelected && (
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">•</span>
        </div>
      )}
      
      {/* Resize Handles */}
      {isSelected && !isEditing && !isMultiSelected && (
        <ResizeHandles
          element={element}
          onResizeStart={handleResizeStart}
          isResizing={isResizing}
        />
      )}
      
      {/* Delete Button */}
      {isSelected && !isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Supprimer"
        >
          ×
        </button>
      )}
      
      {/* Rotation Handle */}
      {isSelected && !isEditing && !isMultiSelected && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-6 bg-blue-500 mx-auto"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full cursor-grab" title="Faire tourner"></div>
        </div>
      )}
    </div>
  );
};

export default ProElement;