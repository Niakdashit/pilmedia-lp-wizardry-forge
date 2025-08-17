
import React, { useState, useRef, useCallback } from 'react';
import { useFluidElementDrag } from './hooks/useFluidElementDrag';
import { useImageElementResize } from './hooks/useImageElementResize';
import ImageElementControls from './components/ImageElementControls';
import ImageElementResizeHandles from './components/ImageElementResizeHandles';
import { getDeviceDimensions } from '../../utils/deviceDimensions';

interface ImageElementProps {
  element: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  getElementDeviceConfig: (element: any) => any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

const ImageElement: React.FC<ImageElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  containerRef,
  getElementDeviceConfig,
  previewDevice
}) => {
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  // Get current device-specific position and size
  const deviceConfig = getElementDeviceConfig(element);

  const { isDragging, handleDragStart } = useFluidElementDrag({
    elementRef,
    containerRef,
    deviceConfig,
    onUpdate,
    elementId: element.id,
    previewDevice
  });

  const { isResizing, handleResizeStart } = useImageElementResize(
    containerRef,
    deviceConfig,
    onUpdate,
    aspectRatioLocked,
    previewDevice
  );

  const handleCenterElement = useCallback(() => {
    // Center using logical device dimensions to match drag/resize coordinate system
    const dims = getDeviceDimensions(previewDevice);
    const centerX = (dims.width - deviceConfig.width) / 2;
    const centerY = (dims.height - deviceConfig.height) / 2;
    onUpdate({ x: centerX, y: centerY });
  }, [onUpdate, deviceConfig, previewDevice]);

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
