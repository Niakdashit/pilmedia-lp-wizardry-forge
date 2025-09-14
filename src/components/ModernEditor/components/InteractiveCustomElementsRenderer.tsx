import React, { memo, useState, useRef } from 'react';
import { Move, Edit2 } from 'lucide-react';
import { useSimplePreciseDrag } from '../hooks/useSimplePreciseDrag';
import { STANDARD_DEVICE_DIMENSIONS } from '../../../utils/deviceDimensions';

interface InteractiveCustomElementsRendererProps {
  customTexts: any[];
  customImages: any[];
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  sizeMap: Record<string, string>;
  selectedElementId: string | null;
  onElementSelect: (elementId: string) => void;
  setCampaign?: (updater: (prev: any) => any) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const FluidTextElement: React.FC<{
  customText: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  sizeMap: Record<string, string>;
  selectedElementId: string | null;
  onElementSelect: (elementId: string) => void;
  setCampaign?: (updater: (prev: any) => any) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}> = memo(({ customText, previewDevice, sizeMap, selectedElementId, onElementSelect, setCampaign, containerRef }) => {
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const elementRef = useRef<HTMLDivElement>(null);
  const lastTapTimeRef = useRef<number>(0);

  const getElementDeviceConfig = (element: any) => {
    if (previewDevice === 'desktop') return element;
    const fromConfig = element.deviceConfig?.[previewDevice] || {};
    const fromDirect = element[previewDevice] || {};
    // Avoid inheriting desktop x/y so fallback can trigger on mobile/tablet
    const base = { ...element } as any;
    delete base.x;
    delete base.y;
    return { ...base, ...fromConfig, ...fromDirect };
  };

  const config = getElementDeviceConfig(customText);
  const isSelected = selectedElementId === customText.id.toString();
  const isEditing = editingTextId === customText.id.toString();

  // Update function for drag system
  const onUpdate = (updates: any) => {
    if (!setCampaign) return;
    
    setCampaign((prev: any) => {
      const design = prev.design || {};
      const customTexts = design.customTexts || [];
      
      const updatedTexts = customTexts.map((textElement: any) => {
        if (textElement.id === customText.id) {
          if (previewDevice !== 'desktop') {
            return {
              ...textElement,
              [previewDevice]: {
                ...textElement[previewDevice],
                ...updates
              }
            };
          } else {
            return {
              ...textElement,
              ...updates
            };
          }
        }
        return textElement;
      });

      return {
        ...prev,
        design: {
          ...design,
          customTexts: updatedTexts
        },
        _lastUpdate: Date.now()
      };
    });
  };

  // Use simple precise drag system
  const { isDragging, handleDragStart, cancelDrag } = useSimplePreciseDrag({
    elementRef,
    containerRef: containerRef || { current: null },
    deviceConfig: { x: config.x || 0, y: config.y || 0, width: 100, height: 30 },
    onUpdate,
    elementId: customText.id,
    previewDevice
  });

  const handleTextEdit = (textId: string, newText: string) => {
    window.dispatchEvent(new CustomEvent('updateTextElement', {
      detail: { id: textId, text: newText }
    }));
  };

  // Double-tap logic moved to onTouchEnd; desktop uses onDoubleClick.

  const handleTextEditSubmit = (textId: string) => {
    handleTextEdit(textId, editingText);
    setEditingTextId(null);
    setEditingText('');
  };

  if (!customText?.enabled) return null;

  // Compute top-center defaults for mobile if coordinates are not provided
  const usingMobileFallback = previewDevice === 'mobile' && (config.x == null || config.y == null);
  let defaultX = 0;
  let defaultY = 0;
  if (usingMobileFallback) {
    const container = STANDARD_DEVICE_DIMENSIONS.mobile;
    defaultX = 0; // full-width block, start at left 0
    defaultY = Math.round(container.height * 0.12); // ~12% from top
  }

  const textStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${(config.x ?? defaultX ?? 0)}px`,
    top: `${(config.y ?? defaultY ?? 0)}px`,
    fontSize: config.fontSize ? `${config.fontSize}px` : (sizeMap[config.size || 'base'] || '14px'),
    color: config.color || '#000000',
    fontFamily: config.fontFamily || 'Open Sans, sans-serif',
    fontWeight: config.bold ? 'bold' : (config.fontWeight || 'normal'),
    fontStyle: config.italic ? 'italic' : (config.fontStyle || 'normal'),
    textDecoration: config.underline ? 'underline' : (config.textDecoration || 'none'),
    textAlign: (previewDevice === 'mobile' ? (config.textAlign || 'center') : (config.textAlign || 'left')) as any,
    zIndex: isSelected ? 1000 : 200,
    cursor: isEditing ? 'text' : (isDragging ? 'grabbing' : 'grab'),
    userSelect: isEditing ? 'text' : 'none',
    whiteSpace: previewDevice === 'mobile' ? 'normal' : 'nowrap',
    touchAction: isEditing ? 'auto' : 'none',
    width: previewDevice === 'mobile'
      ? (config.width != null ? `${config.width}px` : '100%')
      : (config.width != null ? `${config.width}px` : undefined),
    maxWidth: previewDevice === 'mobile' ? '100%' : '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: isDragging ? 'none' : 'all 0.2s ease',
    outline: isSelected ? '2px solid #3b82f6' : 'none',
    outlineOffset: '2px',
    borderRadius: config.borderRadius ? `${config.borderRadius}px` : '4px'
  };

  // Advanced typography properties
  if (config.letterSpacing) textStyle.letterSpacing = config.letterSpacing;
  if (config.textTransform) textStyle.textTransform = config.textTransform as any;
  if (config.lineHeight) textStyle.lineHeight = config.lineHeight;
  if (config.textStroke) textStyle.WebkitTextStroke = `${config.textStroke.width}px ${config.textStroke.color}`;

  // Background and padding support
  if (config.backgroundColor && !config.showFrame) {
    const opacity = config.backgroundOpacity !== undefined ? config.backgroundOpacity : 1;
    if (config.backgroundColor.includes('rgba')) {
      textStyle.backgroundColor = config.backgroundColor;
    } else {
      const r = parseInt(config.backgroundColor.slice(1, 3), 16);
      const g = parseInt(config.backgroundColor.slice(3, 5), 16);
      const b = parseInt(config.backgroundColor.slice(5, 7), 16);
      textStyle.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  if (config.padding && !config.showFrame) {
    textStyle.padding = `${config.padding.top}px ${config.padding.right}px ${config.padding.bottom}px ${config.padding.left}px`;
    textStyle.whiteSpace = 'normal';
  }

  if (config.textShadow) {
    textStyle.textShadow = `${config.textShadow.offsetX}px ${config.textShadow.offsetY}px ${config.textShadow.blur}px ${config.textShadow.color}`;
  }

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

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isEditing) {
      // Sélectionner seulement si pas déjà sélectionné
      if (!isSelected) {
        onElementSelect(customText.id.toString());
      }
      handleDragStart(e);
    }
  };

  return (
    <div
      key={`fluid-text-${customText.id}-${previewDevice}`}
      ref={elementRef}
      data-element-id={customText.id}
      data-element-type="text"
      style={textStyle}
      onClick={(e) => {
        if (!isEditing) {
          // Single click/tap -> select only
          e.stopPropagation();
          if (!isSelected) onElementSelect(customText.id.toString());
        }
      }}
      onDoubleClick={(e) => {
        // Desktop: enter edit mode immediately on double click
        e.stopPropagation();
        if (!isEditing) {
          cancelDrag();
          setEditingTextId(customText.id.toString());
          setEditingText(config.text || 'Texte personnalisé');
        }
      }}
      onTouchEnd={(e) => {
        // Mobile: detect double tap to enter edit mode
        const now = Date.now();
        const timeSince = now - lastTapTimeRef.current;
        if (timeSince > 0 && timeSince < 300) {
          e.stopPropagation();
          if (!isEditing) {
            cancelDrag();
            setEditingTextId(customText.id.toString());
            setEditingText(config.text || 'Texte personnalisé');
          }
        }
        lastTapTimeRef.current = now;
      }}
      onPointerDown={handlePointerDown}
      className="group hover:shadow-lg"
    >
      {isEditing ? (
        <input
          type="text"
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onBlur={() => handleTextEditSubmit(customText.id.toString())}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleTextEditSubmit(customText.id.toString());
            }
          }}
          
          autoFocus
          className="canvas-text-editor bg-transparent border-none outline-none w-full"
          style={{
            color: config.color || '#000000',
            fontFamily: config.fontFamily || 'Open Sans, sans-serif',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontStyle: 'inherit',
            lineHeight: 'inherit',
            userSelect: 'text',
            WebkitUserSelect: 'text'
          }}
        />
      ) : (
        config.text || 'Texte personnalisé'
      )}
      
      {isSelected && !isEditing && (
        <>
          <div className="absolute -top-6 -right-6 bg-blue-500 text-white p-1.5 rounded-full shadow-lg opacity-100 transition-opacity touch-manipulation">
            <Move className="w-4 h-4" />
          </div>
          <button
            className="absolute -top-6 -left-6 bg-green-500 text-white p-1.5 rounded-full shadow-lg opacity-100 transition-opacity touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              cancelDrag();
              setEditingTextId(customText.id.toString());
              setEditingText(config.text || 'Texte personnalisé');
            }}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          {/* Resize handles for text */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize touch-manipulation"
               onPointerDown={(e) => {
                 e.stopPropagation();
                 // TODO: Implement resize logic
               }}
          ></div>
        </>
      )}
    </div>
  );
});

const FluidImageElement: React.FC<{
  customImage: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  selectedElementId: string | null;
  onElementSelect: (elementId: string) => void;
  setCampaign?: (updater: (prev: any) => any) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}> = memo(({ customImage, previewDevice, selectedElementId, onElementSelect, setCampaign, containerRef }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const getElementDeviceConfig = (element: any) => {
    if (previewDevice === 'desktop') return element;
    const fromConfig = element.deviceConfig?.[previewDevice] || {};
    const fromDirect = element[previewDevice] || {};
    return { ...element, ...fromConfig, ...fromDirect };
  };

  const config = getElementDeviceConfig(customImage);
  const isSelected = selectedElementId === customImage.id.toString();

  // Update function for drag system
  const onUpdate = (updates: any) => {
    if (!setCampaign) return;
    
    setCampaign((prev: any) => {
      const design = prev.design || {};
      const customImages = design.customImages || [];
      
      const updatedImages = customImages.map((imageElement: any) => {
        if (imageElement.id === customImage.id) {
          if (previewDevice !== 'desktop') {
            return {
              ...imageElement,
              [previewDevice]: {
                ...imageElement[previewDevice],
                ...updates
              }
            };
          } else {
            return {
              ...imageElement,
              ...updates
            };
          }
        }
        return imageElement;
      });

      return {
        ...prev,
        design: {
          ...design,
          customImages: updatedImages
        },
        _lastUpdate: Date.now()
      };
    });
  };

  // Use simple precise drag system
  const { isDragging, handleDragStart } = useSimplePreciseDrag({
    elementRef,
    containerRef: containerRef || { current: null },
    deviceConfig: { 
      x: config.x || 0, 
      y: config.y || 0, 
      width: config.width || 100, 
      height: config.height || 100 
    },
    onUpdate,
    elementId: customImage.id,
    previewDevice
  });

  if (!customImage?.src) return null;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${config.x || 0}px`,
    top: `${config.y || 0}px`,
    width: `${config.width || 100}px`,
    height: `${config.height || 100}px`,
    transform: `rotate(${config.rotation || 0}deg)`,
    zIndex: isSelected ? 1000 : 199,
    cursor: isDragging ? 'grabbing' : 'grab',
    borderRadius: '6px',
    touchAction: 'none',
    transition: isDragging ? 'none' : 'all 0.2s ease',
    outline: isSelected ? '2px solid #3b82f6' : 'none',
    outlineOffset: '2px'
  };

  if (isSelected) {
    containerStyle.boxShadow = '0 0 0 2px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.15)';
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    // Sélectionner seulement si pas déjà sélectionné
    if (!isSelected) {
      onElementSelect(customImage.id.toString());
    }
    handleDragStart(e);
  };

  return (
    <div
      key={`fluid-image-${customImage.id}-${previewDevice}`}
      ref={elementRef}
      data-element-id={customImage.id}
      data-element-type="image"
      style={containerStyle}
      onClick={(e) => {
        e.stopPropagation();
        onElementSelect(customImage.id.toString());
      }}
      onPointerDown={handlePointerDown}
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
      
      {isSelected && (
        <div className="absolute -top-6 -right-6 bg-blue-500 text-white p-1.5 rounded-full shadow-lg opacity-100 transition-opacity touch-manipulation">
          <Move className="w-4 h-4" />
        </div>
      )}

      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize touch-manipulation"
               onPointerDown={(e) => {
                 e.stopPropagation();
                 // TODO: Implement resize logic for images
               }}
          ></div>
        </>
      )}
    </div>
  );
});

const InteractiveCustomElementsRenderer: React.FC<InteractiveCustomElementsRendererProps> = memo(({
  customTexts,
  customImages,
  previewDevice,
  sizeMap,
  selectedElementId,
  onElementSelect,
  setCampaign,
  containerRef
}) => {
  return (
    <>
      {/* Render images first (lower z-index) */}
      {customImages.map(customImage => (
        <FluidImageElement
          key={`fluid-image-${customImage.id}-${previewDevice}`}
          customImage={customImage}
          previewDevice={previewDevice}
          selectedElementId={selectedElementId}
          onElementSelect={onElementSelect}
          setCampaign={setCampaign}
          containerRef={containerRef}
        />
      ))}
      
      {/* Render texts on top (higher z-index) */}
      {customTexts.map(customText => (
        <FluidTextElement
          key={`fluid-text-${customText.id}-${previewDevice}`}
          customText={customText}
          previewDevice={previewDevice}
          sizeMap={sizeMap}
          selectedElementId={selectedElementId}
          onElementSelect={onElementSelect}
          setCampaign={setCampaign}
          containerRef={containerRef}
        />
      ))}
    </>
  );
});

InteractiveCustomElementsRenderer.displayName = 'InteractiveCustomElementsRenderer';
FluidTextElement.displayName = 'FluidTextElement';
FluidImageElement.displayName = 'FluidImageElement';

export default InteractiveCustomElementsRenderer;