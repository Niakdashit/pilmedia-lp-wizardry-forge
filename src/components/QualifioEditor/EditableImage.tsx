import React, { useState, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import ImageToolbar from './ImageToolbar';

interface EditableImageProps {
  image: any;
  onUpdate: (image: any) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const EditableImage: React.FC<EditableImageProps> = ({ 
  image, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect 
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartData, setResizeStartData] = useState<any>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging || isResizing) return;
    
    onSelect(image.id);
    
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setToolbarPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY - 60
      });
      setShowToolbar(true);
    }
  }, [image.id, onSelect, isDragging, isResizing]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setShowToolbar(false);
  }, []);

  const handleDrag = useCallback((_: any, data: any) => {
    onUpdate({
      ...image,
      x: data.x,
      y: data.y
    });
  }, [image, onUpdate]);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setShowToolbar(false);
    
    const rect = imageRef.current?.getBoundingClientRect();
    if (rect) {
      setResizeStartData({
        startX: e.clientX,
        startY: e.clientY,
        startWidth: image.width || 150,
        startHeight: image.height || 150,
        corner
      });
    }
  }, [image.width, image.height]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeStartData) return;

    const deltaX = e.clientX - resizeStartData.startX;
    const deltaY = e.clientY - resizeStartData.startY;
    
    let newWidth = resizeStartData.startWidth;
    let newHeight = resizeStartData.startHeight;

    if (resizeStartData.corner.includes('right')) {
      newWidth = Math.max(20, resizeStartData.startWidth + deltaX);
    }
    if (resizeStartData.corner.includes('left')) {
      newWidth = Math.max(20, resizeStartData.startWidth - deltaX);
    }
    if (resizeStartData.corner.includes('bottom')) {
      newHeight = Math.max(20, resizeStartData.startHeight + deltaY);
    }
    if (resizeStartData.corner.includes('top')) {
      newHeight = Math.max(20, resizeStartData.startHeight - deltaY);
    }

    onUpdate({
      ...image,
      width: newWidth,
      height: newHeight
    });
  }, [isResizing, resizeStartData, image, onUpdate]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeStartData(null);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const handleToolbarUpdate = useCallback((updates: any) => {
    onUpdate({ ...image, ...updates });
  }, [image, onUpdate]);

  const handleToolbarDelete = useCallback(() => {
    setShowToolbar(false);
    onDelete(image.id);
  }, [image.id, onDelete]);

  const handleToolbarClose = useCallback(() => {
    setShowToolbar(false);
  }, []);

  const imageStyle: React.CSSProperties = {
    width: `${image.width || 150}px`,
    height: `${image.height || 150}px`,
    transform: `rotate(${image.rotation || 0}deg)`,
    border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
    borderRadius: '4px',
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative',
    boxShadow: isSelected ? '0 0 0 1px rgba(59, 130, 246, 0.3)' : 'none',
    userSelect: 'none',
    objectFit: 'cover' as const,
    transition: isDragging || isResizing ? 'none' : 'all 0.1s ease'
  };

  if (!image.src) {
    return null;
  }

  return (
    <>
      <Draggable
        position={{ x: image.x, y: image.y }}
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragStop}
        bounds="parent"
        disabled={isResizing}
        defaultClassName="absolute"
        scale={1}
      >
        <div
          ref={imageRef}
          onClick={handleClick}
          className="group relative"
          style={{ 
            width: `${image.width || 150}px`, 
            height: `${image.height || 150}px` 
          }}
        >
          <img
            src={image.src}
            alt="Image personnalisée"
            style={imageStyle}
            draggable={false}
            onError={(e) => {
              console.warn('Image failed to load:', image.src);
              e.currentTarget.style.display = 'none';
            }}
          />
          
          {/* Poignées de redimensionnement */}
          {isSelected && !isDragging && (
            <>
              {/* Coins */}
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-nw-resize -top-1 -left-1"
                onMouseDown={(e) => handleResizeStart(e, 'top-left')}
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-ne-resize -top-1 -right-1"
                onMouseDown={(e) => handleResizeStart(e, 'top-right')}
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-sw-resize -bottom-1 -left-1"
                onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-se-resize -bottom-1 -right-1"
                onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
              />
              
              {/* Milieux des côtés */}
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-n-resize -top-1 left-1/2 transform -translate-x-1/2"
                onMouseDown={(e) => handleResizeStart(e, 'top')}
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-s-resize -bottom-1 left-1/2 transform -translate-x-1/2"
                onMouseDown={(e) => handleResizeStart(e, 'bottom')}
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-w-resize -left-1 top-1/2 transform -translate-y-1/2"
                onMouseDown={(e) => handleResizeStart(e, 'left')}
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-e-resize -right-1 top-1/2 transform -translate-y-1/2"
                onMouseDown={(e) => handleResizeStart(e, 'right')}
              />
            </>
          )}
        </div>
      </Draggable>

      {/* Toolbar Canva-style améliorée */}
      {showToolbar && (
        <ImageToolbar
          image={image}
          position={toolbarPosition}
          onUpdate={handleToolbarUpdate}
          onDelete={handleToolbarDelete}
          onClose={handleToolbarClose}
        />
      )}
    </>
  );
};

export default EditableImage;