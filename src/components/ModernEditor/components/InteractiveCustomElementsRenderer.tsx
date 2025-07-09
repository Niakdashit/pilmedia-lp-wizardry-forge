import React, { memo } from 'react';
import { Move } from 'lucide-react';

interface InteractiveCustomElementsRendererProps {
  customTexts: any[];
  customImages: any[];
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  sizeMap: Record<string, string>;
  selectedElementId: string | null;
  onElementSelect: (elementId: string) => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, elementId: string, elementType: 'text' | 'image') => void;
  dragState: {
    isDragging: boolean;
    draggedElementId: string | null;
    draggedElementType: 'text' | 'image' | null;
    currentOffset: { x: number; y: number };
  };
}

const InteractiveCustomElementsRenderer: React.FC<InteractiveCustomElementsRendererProps> = memo(({
  customTexts,
  customImages,
  previewDevice,
  sizeMap,
  selectedElementId,
  onElementSelect,
  onDragStart,
  dragState
}) => {
  const getElementDeviceConfig = (element: any) => {
    if (previewDevice !== 'desktop' && element[previewDevice]) {
      return { ...element, ...element[previewDevice] };
    }
    return element;
  };

  const getDragTransform = (elementId: string) => {
    if (dragState.isDragging && dragState.draggedElementId === elementId) {
      return `translate(${dragState.currentOffset.x}px, ${dragState.currentOffset.y}px)`;
    }
    return 'none';
  };

  const renderInteractiveText = (customText: any) => {
    if (!customText?.enabled) return null;

    const config = getElementDeviceConfig(customText);
    const isSelected = selectedElementId === customText.id.toString();
    const isDragged = dragState.draggedElementId === customText.id.toString();
    
    const textStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${config.x || 0}px`,
      top: `${config.y || 0}px`,
      fontSize: sizeMap[config.size || 'base'] || '14px',
      color: config.color || '#000000',
      fontFamily: config.fontFamily || 'Inter, sans-serif',
      fontWeight: config.bold ? 'bold' : 'normal',
      fontStyle: config.italic ? 'italic' : 'normal',
      textDecoration: config.underline ? 'underline' : 'none',
      zIndex: isSelected ? 1000 : (isDragged ? 999 : 200),
      cursor: 'grab',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      maxWidth: '400px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transform: getDragTransform(customText.id.toString()),
      transition: isDragged ? 'none' : 'all 0.2s ease',
      outline: isSelected ? '2px solid #3b82f6' : 'none',
      outlineOffset: '2px',
      borderRadius: '4px'
    };

    if (config.showFrame) {
      textStyle.backgroundColor = config.frameColor || '#ffffff';
      textStyle.border = `1px solid ${config.frameBorderColor || '#e5e7eb'}`;
      textStyle.padding = '8px 12px';
      textStyle.borderRadius = '6px';
      textStyle.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }

    if (isSelected) {
      textStyle.boxShadow = '0 0 0 2px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.15)';
    }

    return (
      <div
        key={`interactive-text-${customText.id}-${previewDevice}`}
        data-element-id={customText.id}
        style={textStyle}
        onClick={(e) => {
          e.stopPropagation();
          onElementSelect(customText.id.toString());
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onDragStart(e, customText.id.toString(), 'text');
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          onDragStart(e, customText.id.toString(), 'text');
        }}
        className="group hover:shadow-lg"
      >
        {config.text || 'Texte personnalisé'}
        
        {/* Drag handle */}
        {isSelected && (
          <div className="absolute -top-6 -right-6 bg-blue-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Move className="w-3 h-3" />
          </div>
        )}
      </div>
    );
  };

  const renderInteractiveImage = (customImage: any) => {
    if (!customImage?.src) return null;

    const config = getElementDeviceConfig(customImage);
    const isSelected = selectedElementId === customImage.id.toString();
    const isDragged = dragState.draggedElementId === customImage.id.toString();
    
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${config.x || 0}px`,
      top: `${config.y || 0}px`,
      width: `${config.width || 100}px`,
      height: `${config.height || 100}px`,
      transform: `rotate(${config.rotation || 0}deg) ${getDragTransform(customImage.id.toString())}`,
      zIndex: isSelected ? 1000 : (isDragged ? 999 : 199),
      cursor: 'grab',
      borderRadius: '6px',
      transition: isDragged ? 'none' : 'all 0.2s ease',
      outline: isSelected ? '2px solid #3b82f6' : 'none',
      outlineOffset: '2px'
    };

    if (isSelected) {
      containerStyle.boxShadow = '0 0 0 2px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.15)';
    }

    return (
      <div
        key={`interactive-image-${customImage.id}-${previewDevice}`}
        data-element-id={customImage.id}
        style={containerStyle}
        onClick={(e) => {
          e.stopPropagation();
          onElementSelect(customImage.id.toString());
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onDragStart(e, customImage.id.toString(), 'image');
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          onDragStart(e, customImage.id.toString(), 'image');
        }}
        className="group hover:shadow-lg"
      >
        <img
          src={customImage.src}
          alt="Image personnalisée"
          className="w-full h-full object-cover rounded-md"
          draggable={false}
          onError={(e) => {
            console.warn('Image failed to load:', customImage.src);
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* Drag handle */}
        {isSelected && (
          <div className="absolute -top-6 -right-6 bg-blue-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Move className="w-3 h-3" />
          </div>
        )}

        {/* Selection corners */}
        {isSelected && (
          <>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Render images first (lower z-index) */}
      {customImages.map(renderInteractiveImage)}
      
      {/* Render texts on top (higher z-index) */}
      {customTexts.map(renderInteractiveText)}
    </>
  );
});

InteractiveCustomElementsRenderer.displayName = 'InteractiveCustomElementsRenderer';

export default InteractiveCustomElementsRenderer;