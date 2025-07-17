
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
    e.preventDefault();
    setIsResizing(true);
    setShowToolbar(false);
    
    const rect = imageRef.current?.getBoundingClientRect();
    if (rect) {
      setResizeStartData({
        startX: e.clientX,
        startY: e.clientY,
        startWidth: image.width || 150,
        startHeight: image.height || 150,
        startLeft: image.x || 0,
        startTop: image.y || 0,
        corner,
        aspectRatio: (image.width || 150) / (image.height || 150)
      });
    }
  }, [image.width, image.height, image.x, image.y]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeStartData) return;

    e.preventDefault();
    const deltaX = e.clientX - resizeStartData.startX;
    const deltaY = e.clientY - resizeStartData.startY;
    
    let newWidth = resizeStartData.startWidth;
    let newHeight = resizeStartData.startHeight;
    let newX = resizeStartData.startLeft;
    let newY = resizeStartData.startTop;

    // Maintenir les proportions si Shift est pressé
    const maintainAspectRatio = e.shiftKey;

    switch (resizeStartData.corner) {
      case 'top-left':
        newWidth = Math.max(20, resizeStartData.startWidth - deltaX);
        newHeight = Math.max(20, resizeStartData.startHeight - deltaY);
        if (maintainAspectRatio) {
          const ratio = Math.min(newWidth / resizeStartData.startWidth, newHeight / resizeStartData.startHeight);
          newWidth = resizeStartData.startWidth * ratio;
          newHeight = resizeStartData.startHeight * ratio;
        }
        newX = resizeStartData.startLeft + (resizeStartData.startWidth - newWidth);
        newY = resizeStartData.startTop + (resizeStartData.startHeight - newHeight);
        break;
      case 'top-right':
        newWidth = Math.max(20, resizeStartData.startWidth + deltaX);
        newHeight = Math.max(20, resizeStartData.startHeight - deltaY);
        if (maintainAspectRatio) {
          const ratio = Math.max(newWidth / resizeStartData.startWidth, newHeight / resizeStartData.startHeight);
          newWidth = resizeStartData.startWidth * ratio;
          newHeight = resizeStartData.startHeight * ratio;
        }
        newY = resizeStartData.startTop + (resizeStartData.startHeight - newHeight);
        break;
      case 'bottom-left':
        newWidth = Math.max(20, resizeStartData.startWidth - deltaX);
        newHeight = Math.max(20, resizeStartData.startHeight + deltaY);
        if (maintainAspectRatio) {
          const ratio = Math.max(newWidth / resizeStartData.startWidth, newHeight / resizeStartData.startHeight);
          newWidth = resizeStartData.startWidth * ratio;
          newHeight = resizeStartData.startHeight * ratio;
        }
        newX = resizeStartData.startLeft + (resizeStartData.startWidth - newWidth);
        break;
      case 'bottom-right':
        newWidth = Math.max(20, resizeStartData.startWidth + deltaX);
        newHeight = Math.max(20, resizeStartData.startHeight + deltaY);
        if (maintainAspectRatio) {
          const ratio = Math.max(newWidth / resizeStartData.startWidth, newHeight / resizeStartData.startHeight);
          newWidth = resizeStartData.startWidth * ratio;
          newHeight = resizeStartData.startHeight * ratio;
        }
        break;
      case 'top':
        newHeight = Math.max(20, resizeStartData.startHeight - deltaY);
        newY = resizeStartData.startTop + (resizeStartData.startHeight - newHeight);
        break;
      case 'bottom':
        newHeight = Math.max(20, resizeStartData.startHeight + deltaY);
        break;
      case 'left':
        newWidth = Math.max(20, resizeStartData.startWidth - deltaX);
        newX = resizeStartData.startLeft + (resizeStartData.startWidth - newWidth);
        break;
      case 'right':
        newWidth = Math.max(20, resizeStartData.startWidth + deltaX);
        break;
    }

    onUpdate({
      ...image,
      width: Math.round(newWidth),
      height: Math.round(newHeight),
      x: Math.round(newX),
      y: Math.round(newY)
    });
  }, [isResizing, resizeStartData, image, onUpdate]);

  const handleResizeEnd = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(false);
    setResizeStartData(null);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove, { passive: false });
      document.addEventListener('mouseup', handleResizeEnd, { passive: false });
      document.body.style.cursor = resizeStartData?.corner?.includes('right') && resizeStartData?.corner?.includes('bottom') ? 'nw-resize' :
                                   resizeStartData?.corner?.includes('left') && resizeStartData?.corner?.includes('bottom') ? 'ne-resize' :
                                   resizeStartData?.corner?.includes('right') && resizeStartData?.corner?.includes('top') ? 'sw-resize' :
                                   resizeStartData?.corner?.includes('left') && resizeStartData?.corner?.includes('top') ? 'se-resize' :
                                   resizeStartData?.corner === 'top' || resizeStartData?.corner === 'bottom' ? 'ns-resize' :
                                   'ew-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd, resizeStartData]);

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
    cursor: isDragging ? 'grabbing' : isResizing ? 'crosshair' : 'grab',
    position: 'relative',
    boxShadow: isSelected ? '0 0 0 1px rgba(59, 130, 246, 0.3)' : 'none',
    userSelect: 'none',
    objectFit: 'cover' as const,
    opacity: image.opacity || 1,
    zIndex: image.zIndex || 0,
    transition: isDragging || isResizing ? 'none' : 'all 0.1s ease'
  };

  if (!image.src) {
    return null;
  }

  const getResizeHandleStyle = (position: string) => {
    const baseStyle = "absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg z-20 hover:bg-blue-600 transition-colors";
    
    switch (position) {
      case 'top-left':
        return `${baseStyle} -top-1.5 -left-1.5 cursor-nw-resize`;
      case 'top-right':
        return `${baseStyle} -top-1.5 -right-1.5 cursor-ne-resize`;
      case 'bottom-left':
        return `${baseStyle} -bottom-1.5 -left-1.5 cursor-sw-resize`;
      case 'bottom-right':
        return `${baseStyle} -bottom-1.5 -right-1.5 cursor-se-resize`;
      case 'top':
        return `${baseStyle} -top-1.5 left-1/2 transform -translate-x-1/2 cursor-n-resize`;
      case 'bottom':
        return `${baseStyle} -bottom-1.5 left-1/2 transform -translate-x-1/2 cursor-s-resize`;
      case 'left':
        return `${baseStyle} -left-1.5 top-1/2 transform -translate-y-1/2 cursor-w-resize`;
      case 'right':
        return `${baseStyle} -right-1.5 top-1/2 transform -translate-y-1/2 cursor-e-resize`;
      default:
        return baseStyle;
    }
  };

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
            height: `${image.height || 150}px`,
            zIndex: image.zIndex || 0
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
          
          {/* Poignées de redimensionnement améliorées */}
          {isSelected && !isDragging && (
            <>
              {/* Coins */}
              <div
                className={getResizeHandleStyle('top-left')}
                onMouseDown={(e) => handleResizeStart(e, 'top-left')}
              />
              <div
                className={getResizeHandleStyle('top-right')}
                onMouseDown={(e) => handleResizeStart(e, 'top-right')}
              />
              <div
                className={getResizeHandleStyle('bottom-left')}
                onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
              />
              <div
                className={getResizeHandleStyle('bottom-right')}
                onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
              />
              
              {/* Milieux des côtés */}
              <div
                className={getResizeHandleStyle('top')}
                onMouseDown={(e) => handleResizeStart(e, 'top')}
              />
              <div
                className={getResizeHandleStyle('bottom')}
                onMouseDown={(e) => handleResizeStart(e, 'bottom')}
              />
              <div
                className={getResizeHandleStyle('left')}
                onMouseDown={(e) => handleResizeStart(e, 'left')}
              />
              <div
                className={getResizeHandleStyle('right')}
                onMouseDown={(e) => handleResizeStart(e, 'right')}
              />

              {/* Indicateur pour maintenir les proportions */}
              {isResizing && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Maintenez Shift pour garder les proportions
                </div>
              )}
            </>
          )}
        </div>
      </Draggable>

      {/* Toolbar */}
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
