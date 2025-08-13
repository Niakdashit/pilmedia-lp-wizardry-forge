
import React, { useState, useRef, useCallback } from 'react';
import { useUnifiedElementDrag } from './hooks/useUnifiedElementDrag';
import { useImageElementResize } from './hooks/useImageElementResize';
import ImageElementControls from './components/ImageElementControls';
import ImageElementResizeHandles from './components/ImageElementResizeHandles';

interface ImageElementProps {
  element: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  getElementDeviceConfig: (element: any) => any;
}

const ImageElement: React.FC<ImageElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  containerRef,
  getElementDeviceConfig
}) => {
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  // Get current device-specific position and size
  const deviceConfig = getElementDeviceConfig(element);

  const { isDragging, handleDragStart } = useUnifiedElementDrag(
    elementRef,
    containerRef,
    deviceConfig,
    onUpdate,
    element.id
  );

  const { isResizing, handleResizeStart } = useImageElementResize(
    containerRef,
    deviceConfig,
    onUpdate,
    aspectRatioLocked
  );

  const handleCenterElement = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const centerX = (containerRect.width - deviceConfig.width) / 2;
    const centerY = (containerRect.height - deviceConfig.height) / 2;
    
    onUpdate({ x: centerX, y: centerY });
  }, [onUpdate, containerRef, deviceConfig]);

  const toggleAspectRatio = useCallback(() => {
    setAspectRatioLocked(!aspectRatioLocked);
  }, [aspectRatioLocked]);

  const handleRotate = useCallback(() => {
    onUpdate({ rotation: (element.rotation || 0) + 15 });
  }, [onUpdate, element.rotation]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    console.log('Image element pointer down:', element.id);
    onSelect();
    handleDragStart(e);
  }, [onSelect, handleDragStart, element.id]);

  if (!element.src) {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${deviceConfig.x}px`,
          top: `${deviceConfig.y}px`,
          width: deviceConfig.width,
          height: deviceConfig.height,
          border: '2px dashed #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '12px',
          zIndex: isSelected ? 30 : 20
        }}
        onClick={onSelect}
        className="bg-gray-50 rounded"
      >
        Image vide
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: `${deviceConfig.x}px`,
        top: `${deviceConfig.y}px`,
        width: deviceConfig.width,
        height: deviceConfig.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isSelected ? 30 : 20,
        willChange: isDragging || isResizing ? 'transform' : 'auto',
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.1s ease'
      }}
      onPointerDown={handlePointerDown}
      className={`${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'}`}
    >
      <img
        src={element.src}
        alt="Custom element"
        className="w-full h-full object-cover rounded"
        draggable={false}
        style={{ pointerEvents: 'none' }}
      />
      
      {isSelected && (
        <>
          <ImageElementControls
            aspectRatioLocked={aspectRatioLocked}
            onCenter={handleCenterElement}
            onToggleAspectRatio={toggleAspectRatio}
            onRotate={handleRotate}
            onDelete={onDelete}
          />
          <ImageElementResizeHandles onResizeStart={handleResizeStart} />
        </>
      )}
    </div>
  );
};

export default ImageElement;
