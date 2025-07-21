
import React, { useState, useRef, useEffect } from 'react';

interface EditableImageProps {
  image: any;
  onUpdate: (updatedImage: any) => void;
  onDelete: (imageId: string) => void;
  isSelected: boolean;
  onSelect: (imageId: string | null) => void;
}

const EditableImage: React.FC<EditableImageProps> = ({
  image,
  onUpdate,
  onDelete,
  isSelected,
  onSelect
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelect(image.id);
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - image.x,
      y: e.clientY - image.y
    };
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    resizeStartSize.current = {
      width: image.width,
      height: image.height
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, e.clientX - dragStartPos.current.x);
      const newY = Math.max(0, e.clientY - dragStartPos.current.y);
      
      onUpdate({
        ...image,
        x: newX,
        y: newY
      });
    } else if (isResizing) {
      const newWidth = Math.max(50, resizeStartSize.current.width + (e.movementX * 2));
      const newHeight = Math.max(50, resizeStartSize.current.height + (e.movementY * 2));
      
      onUpdate({
        ...image,
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && isSelected) {
      onDelete(image.id);
    }
  };

  return (
    <div
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-brand-primary' : ''}`}
      style={{
        left: `${image.x}px`,
        top: `${image.y}px`,
        width: `${image.width}px`,
        height: `${image.height}px`,
        zIndex: isSelected ? 1000 : 90
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <img
        src={image.src}
        alt={image.alt || 'Image personnalisée'}
        className="w-full h-full object-cover rounded"
        draggable={false}
      />
      
      {isSelected && (
        <>
          <div className="absolute -top-6 left-0 right-0 bg-brand-primary text-white text-xs px-2 py-1 rounded text-center">
            Glisser pour déplacer • Suppr pour supprimer
          </div>
          
          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-brand-primary cursor-se-resize"
            onMouseDown={handleResizeStart}
          />
        </>
      )}
    </div>
  );
};

export default EditableImage;
