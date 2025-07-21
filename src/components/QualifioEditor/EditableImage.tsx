import React, { useState, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import ImageToolbar from './ImageToolbar';
import AnimatedImage from './animations/AnimatedImage';

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
  const dragRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isDragging || isResizing) return;
    
    console.log('Image clicked, selecting:', image.id);
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
    console.log('Drag start');
    setIsDragging(true);
    setShowToolbar(false);
  }, []);

  const handleDrag = useCallback((_: any, data: any) => {
    if (isResizing) return;
    
    onUpdate({
      ...image,
      x: data.x,
      y: data.y
    });
  }, [image, onUpdate, isResizing]);

  const handleDragStop = useCallback(() => {
    console.log('Drag stop');
    setIsDragging(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent, corner: string) => {
    console.log('Resize start:', corner);
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
    e.stopPropagation();
    
    const deltaX = e.clientX - resizeStartData.startX;
    const deltaY = e.clientY - resizeStartData.startY;
    
    let newWidth = resizeStartData.startWidth;
    let newHeight = resizeStartData.startHeight;
    let newX = resizeStartData.startLeft;
    let newY = resizeStartData.startTop;

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
    console.log('Resize end');
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(false);
    setResizeStartData(null);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        handleResizeMove(e);
      };
      
      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        handleResizeEnd(e);
      };

      document.addEventListener('mousemove', handleMouseMove, { passive: false, capture: true });
      document.addEventListener('mouseup', handleMouseUp, { passive: false, capture: true });
      
      document.body.style.cursor = resizeStartData?.corner?.includes('right') && resizeStartData?.corner?.includes('bottom') ? 'nw-resize' :
                                   resizeStartData?.corner?.includes('left') && resizeStartData?.corner?.includes('bottom') ? 'ne-resize' :
                                   resizeStartData?.corner?.includes('right') && resizeStartData?.corner?.includes('top') ? 'sw-resize' :
                                   resizeStartData?.corner?.includes('left') && resizeStartData?.corner?.includes('top') ? 'se-resize' :
                                   resizeStartData?.corner === 'top' || resizeStartData?.corner === 'bottom' ? 'ns-resize' :
                                   'ew-resize';
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove, { capture: true });
        document.removeEventListener('mouseup', handleMouseUp, { capture: true });
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd, resizeStartData]);

  const handleToolbarUpdate = useCallback((updates: any) => {
    onUpdate({ ...image, ...updates });
  }, [image, onUpdate]);

  const handleToolbarDelete = useCallback(() => {
    console.log('Deleting image:', image.id);
    setShowToolbar(false);
    onDelete(image.id);
  }, [image.id, onDelete]);

  const handleToolbarClose = useCallback(() => {
    setShowToolbar(false);
  }, []);

  if (!image.src) {
    return null;
  }

  const getResizeHandleStyle = (position: string) => {
    const baseStyle = "absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg hover:bg-blue-600 transition-colors";
    
    switch (position) {
      case 'top-left':
        return `${baseStyle} -top-2 -left-2 cursor-nw-resize`;
      case 'top-right':
        return `${baseStyle} -top-2 -right-2 cursor-ne-resize`;
      case 'bottom-left':
        return `${baseStyle} -bottom-2 -left-2 cursor-sw-resize`;
      case 'bottom-right':
        return `${baseStyle} -bottom-2 -right-2 cursor-se-resize`;
      case 'top':
        return `${baseStyle} -top-2 left-1/2 transform -translate-x-1/2 cursor-n-resize`;
      case 'bottom':
        return `${baseStyle} -bottom-2 left-1/2 transform -translate-x-1/2 cursor-s-resize`;
      case 'left':
        return `${baseStyle} -left-2 top-1/2 transform -translate-y-1/2 cursor-w-resize`;
      case 'right':
        return `${baseStyle} -right-2 top-1/2 transform -translate-y-1/2 cursor-e-resize`;
      default:
        return baseStyle;
    }
  };

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
    transition: isDragging || isResizing ? 'none' : 'all 0.1s ease',
    pointerEvents: 'auto'
  };

  const containerStyle: React.CSSProperties = {
    width: `${image.width || 150}px`, 
    height: `${image.height || 150}px`,
    zIndex: isSelected ? 1000 : (image.zIndex || 0) + 100,
    position: 'relative'
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
        nodeRef={dragRef}
      >
        <div
          ref={dragRef}
          style={containerStyle}
        >
          <AnimatedImage
            imageId={image.id}
            animationConfig={image.animationConfig}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              ref={imageRef}
              onClick={handleClick}
              className="group relative w-full h-full"
              style={{ pointerEvents: 'auto' }}
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
                    className={getResizeHandleStyle('top-left')}
                    onMouseDown={(e) => handleResizeStart(e, 'top-left')}
                    style={{ zIndex: 1001, pointerEvents: 'auto' }}
                  />
                  <div
                    className={getResizeHandleStyle('top-right')}
                    onMouseDown={(e) => handleResizeStart(e, 'top-right')}
                    style={{ zIndex: 1001, pointerEvents: 'auto' }}
                  />
                  <div
                    className={getResizeHandleStyle('bottom-left')}
                    onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
                    style={{ zIndex: 1001, pointerEvents: 'auto' }}
                  />
                  <div
                    className={getResizeHandleStyle('bottom-right')}
                    onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
                    style={{ zIndex: 1001, pointerEvents: 'auto' }}
                  />
                  
                  {/* Milieux des côtés */}
                  <div
                    className={getResizeHandleStyle('top')}
                    onMouseDown={(e) => handleResizeStart(e, 'top')}
                    style={{ zIndex: 1001, pointerEvents: 'auto' }}
                  />
                  <div
                    className={getResizeHandleStyle('bottom')}
                    onMouseDown={(e) => handleResizeStart(e, 'bottom')}
                    style={{ zIndex: 1001, pointerEvents: 'auto' }}
                  />
                  <div
                    className={getResizeHandleStyle('left')}
                    onMouseDown={(e) => handleResizeStart(e, 'left')}
                    style={{ zIndex: 1001, pointerEvents: 'auto' }}
                  />
                  <div
                    className={getResizeHandleStyle('right')}
                    onMouseDown={(e) => handleResizeStart(e, 'right')}
                    style={{ zIndex: 1001, pointerEvents: 'auto' }}
                  />

                  {/* Indicateur pour maintenir les proportions */}
                  {isResizing && (
                    <div 
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                      style={{ zIndex: 1002 }}
                    >
                      Maintenez Shift pour garder les proportions
                    </div>
                  )}
                </>
              )}
            </div>
          </AnimatedImage>
        </div>
      </Draggable>

      {/* Toolbar */}
      {showToolbar && !isResizing && (
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
