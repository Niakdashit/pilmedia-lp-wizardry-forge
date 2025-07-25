import React from 'react';
import { useDrag } from 'react-dnd';
import { SmartWheel } from '../SmartWheel';

interface CanvasElementProps {
  element: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
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

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return (
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
      className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element.x || 0,
        top: element.y || 0,
        opacity,
        zIndex: element.zIndex || 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {renderElement()}
      
      {/* Selection handles */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize" />
          
          {/* Delete button */}
          <button
            onClick={onDelete}
            className="absolute -top-8 -right-8 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
};

export default CanvasElement;