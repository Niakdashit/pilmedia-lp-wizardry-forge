import React from 'react';
import { useDrag } from 'react-dnd';
import { SmartWheel } from '../SmartWheel';

interface CanvasElementProps {
  element: any;
  originalElement?: any;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  originalElement,
  selectedDevice,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}) => {
  // Utiliser les props passées pour éviter les warnings TypeScript
  console.debug('CanvasElement device:', selectedDevice, 'hasOriginal:', !!originalElement);
  

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
    onSelect();

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
    const startFontSize = element.fontSize || element.style?.fontSize || 16;
    
    // Detect if it's a corner handle (for proportional scaling with font size change)
    const isCornerHandle = ['nw', 'ne', 'sw', 'se'].includes(direction);

    const handleResizeMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;
      let newFontSize = startFontSize;

      if (isCornerHandle && element.type === 'text') {
        // For corner handles on text: scale font size proportionally
        console.log('Text resize - deltaX:', deltaX, 'deltaY:', deltaY, 'startFontSize:', startFontSize);
        
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
        
        console.log('Text resize - scaleFactor:', scaleFactor, 'newFontSize:', newFontSize);
        
        // Keep text box dimensions tight to content (remove width/height to make it auto)
        onUpdate({
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

        onUpdate({
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
          isCornerScaled: false,
        });
      }
    };

    const handleResizeMouseUp = () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };

    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
  };

  const renderElement = () => {
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
        return isEditing ? (
          <input
            type="text"
            value={element.content || 'Texte'}
            onChange={handleTextChange}
            onKeyDown={handleTextKeyDown}
            onBlur={handleTextBlur}
            autoFocus
            className="bg-transparent border-none outline-none w-full"
            style={{
              fontSize: element.fontSize || element.style?.fontSize || 16,
              fontFamily: element.fontFamily || element.style?.fontFamily || 'Arial',
              color: element.color || element.style?.color || '#000000',
              fontWeight: element.fontWeight || element.style?.fontWeight || 'normal',
              textAlign: element.textAlign || element.style?.textAlign || 'left',
              ...elementStyle
            }}
          />
        ) : (
          <div
            className="cursor-move select-none"
            style={{
              fontSize: element.fontSize || element.style?.fontSize || 16,
              fontFamily: element.fontFamily || element.style?.fontFamily || 'Arial',
              color: element.color || element.style?.color || '#000000',
              fontWeight: element.fontWeight || element.style?.fontWeight || 'normal',
              textAlign: element.textAlign || element.style?.textAlign || 'left',
              ...elementStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.style?.textAlign === 'center' ? 'center' : element.style?.textAlign === 'right' ? 'flex-end' : 'flex-start'
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
            className="cursor-move object-cover"
            draggable={false}
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
  };

  return (
    <div
      ref={drag}
      className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element.x || 0,
        top: element.y || 0,
        opacity,
        zIndex: element.zIndex || 1,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {renderElement()}
      
      {/* Selection handles */}
      {isSelected && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1000 }}>
          {/* Corner handles - for proportional scaling */}
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize shadow-lg" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize shadow-lg" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize shadow-lg" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            style={{ zIndex: 1001 }}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize shadow-lg" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            style={{ zIndex: 1001 }}
          />
          
          {/* Edge handles - for stretching shape only */}
          {element.type === 'text' && (
            <>
              <div 
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-blue-500 border border-white rounded cursor-n-resize shadow-lg" 
                onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                style={{ zIndex: 1001 }}
              />
              <div 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-blue-500 border border-white rounded cursor-s-resize shadow-lg" 
                onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                style={{ zIndex: 1001 }}
              />
              <div 
                className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-blue-500 border border-white rounded cursor-w-resize shadow-lg" 
                onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                style={{ zIndex: 1001 }}
              />
              <div 
                className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-blue-500 border border-white rounded cursor-e-resize shadow-lg" 
                onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                style={{ zIndex: 1001 }}
              />
            </>
          )}
          
          {/* Delete button */}
          <button
            onClick={onDelete}
            className="absolute -top-8 -right-8 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 shadow-lg"
            style={{ zIndex: 1001 }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default CanvasElement;