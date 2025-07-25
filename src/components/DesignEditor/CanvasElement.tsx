import React from 'react';
import { useDrag } from 'react-dnd';
import { SmartWheel } from '../SmartWheel';

interface CanvasElementProps {
  element: any;
  isSelected: boolean;
  isMultiSelected?: boolean;
  onSelect: (isCtrlPressed?: boolean) => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  isMultiSelected = false,
  onSelect,
  onUpdate,
  onDelete
}) => {
  

  const [{ opacity }, drag] = useDrag(() => ({
    type: 'canvas-element',
    item: { id: element.id },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  }));

  const [isEditing, setIsEditing] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't allow interaction with locked elements
    if (element.locked) return;
    
    onSelect(e.ctrlKey || e.metaKey);

    const startX = e.clientX - element.x;
    const startY = e.clientY - element.y;

    const handleMouseMove = (e: MouseEvent) => {
      onUpdate({
        x: e.clientX - startX,
        y: e.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = () => {
    if (element.type === 'text') {
      setIsEditing(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ content: e.target.value });
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  const handleTextBlur = () => {
    setIsEditing(false);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width || 100;
    const startHeight = element.height || 100;
    const startPosX = element.x || 0;
    const startPosY = element.y || 0;

    const handleResizeMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      switch (direction) {
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

      onUpdate({
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
      });
    };

    const handleResizeMouseUp = () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };

    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
  };

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return isEditing ? (
          <input
            type="text"
            value={element.content || 'Texte'}
            onChange={handleTextChange}
            onKeyDown={handleTextKeyDown}
            onBlur={handleTextBlur}
            autoFocus
            className="bg-transparent border-none outline-none"
            style={{
              fontSize: element.fontSize || 16,
              fontFamily: element.fontFamily || 'Arial',
              color: element.color || '#000000',
              fontWeight: element.fontWeight || 'normal',
              textAlign: element.textAlign || 'left',
            }}
          />
        ) : (
          <div
            className="cursor-move select-none"
            style={{
              fontSize: element.fontSize || 16,
              fontFamily: element.fontFamily || 'Arial',
              color: element.color || '#000000',
              fontWeight: element.fontWeight || 'normal',
              textAlign: element.textAlign || 'left',
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
            className="max-w-full max-h-full object-contain cursor-move"
            draggable={false}
          />
        );
      case 'wheel':
        return (
          <div 
            className="cursor-move"
            style={{ 
              width: element.width || 300, 
              height: element.height || 300,
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
              width: element.width || 100,
              height: element.height || 100,
              backgroundColor: element.backgroundColor || '#3B82F6',
              borderRadius: element.borderRadius || 0,
            }}
          />
        );
      default:
        return <div className="w-20 h-20 bg-gray-300 cursor-move" />;
    }
  };

  return (
    <div
      ref={drag}
      className={`absolute ${
        isSelected 
          ? isMultiSelected 
            ? 'ring-2 ring-orange-500' 
            : 'ring-2 ring-blue-500' 
          : ''
      } ${element.locked ? 'cursor-not-allowed opacity-75' : ''}`}
      style={{
        left: element.x || 0,
        top: element.y || 0,
        opacity: element.visible === false ? 0.3 : opacity,
        zIndex: element.zIndex || 1,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {renderElement()}
      
      {/* Selection handles */}
      {isSelected && !element.locked && (
        <>
          <div 
            className={`absolute -top-1 -left-1 w-3 h-3 border border-white rounded-full cursor-nw-resize ${
              isMultiSelected ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div 
            className={`absolute -top-1 -right-1 w-3 h-3 border border-white rounded-full cursor-ne-resize ${
              isMultiSelected ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div 
            className={`absolute -bottom-1 -left-1 w-3 h-3 border border-white rounded-full cursor-sw-resize ${
              isMultiSelected ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div 
            className={`absolute -bottom-1 -right-1 w-3 h-3 border border-white rounded-full cursor-se-resize ${
              isMultiSelected ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          
          {/* Delete button - only show for single selection */}
          {!isMultiSelected && (
            <button
              onClick={onDelete}
              className="absolute -top-8 -right-8 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
            >
              ×
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CanvasElement;