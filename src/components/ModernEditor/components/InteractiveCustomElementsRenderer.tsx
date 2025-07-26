import React, { memo, useState, useRef } from 'react';
import { Move, Edit2 } from 'lucide-react';

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
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);
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

  const handleTextEdit = (textId: string, newText: string) => {
    // Update the text in the campaign
    window.dispatchEvent(new CustomEvent('updateTextElement', {
      detail: { id: textId, text: newText }
    }));
  };

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent, textId: string, currentText: string) => {
    e.stopPropagation();
    const now = Date.now();
    const timeSince = now - lastTapTimeRef.current;
    
    if (timeSince < 300 && timeSince > 0) {
      // Double tap detected
      setEditingTextId(textId);
      setEditingText(currentText);
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
    } else {
      // Single tap
      lastTapTimeRef.current = now;
      tapTimeoutRef.current = setTimeout(() => {
        onElementSelect(textId);
        tapTimeoutRef.current = null;
      }, 300);
    }
  };

  const handleTextEditSubmit = (textId: string) => {
    handleTextEdit(textId, editingText);
    setEditingTextId(null);
    setEditingText('');
  };

  const renderInteractiveText = (customText: any) => {
    if (!customText?.enabled) return null;

    const config = getElementDeviceConfig(customText);
    const isSelected = selectedElementId === customText.id.toString();
    const isDragged = dragState.draggedElementId === customText.id.toString();
    const isEditing = editingTextId === customText.id.toString();
    
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
      touchAction: 'none', // Empêche le défilement natif
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
          if (!isEditing) {
            handleDoubleTap(e, customText.id.toString(), config.text || 'Texte personnalisé');
          }
        }}
        onMouseDown={(e) => {
          if (!isEditing) {
            e.preventDefault();
            onDragStart(e, customText.id.toString(), 'text');
          }
        }}
        onTouchStart={(e) => {
          if (!isEditing) {
            e.preventDefault();
            e.stopPropagation();
            // Handle touch for mobile editing and dragging
            const now = Date.now();
            const timeSince = now - lastTapTimeRef.current;
            
            if (timeSince < 300 && timeSince > 0) {
              // Double tap - start editing
              setEditingTextId(customText.id.toString());
              setEditingText(config.text || 'Texte personnalisé');
              return;
            }
            
            lastTapTimeRef.current = now;
            
            // Single tap - start drag after delay
            setTimeout(() => {
              if (lastTapTimeRef.current === now) {
                // Empêcher le défilement pendant le drag
                document.body.style.overflow = 'hidden';
                onDragStart(e, customText.id.toString(), 'text');
              }
            }, 150);
          }
        }}
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
            className="bg-transparent border-none outline-none w-full"
            style={{
              color: config.color || '#000000',
              fontFamily: config.fontFamily || 'Inter, sans-serif',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              fontStyle: 'inherit'
            }}
          />
        ) : (
          config.text || 'Texte personnalisé'
        )}
        
        {/* Mobile editing and drag handles */}
        {isSelected && !isEditing && (
          <>
            <div className="absolute -top-6 -right-6 bg-blue-500 text-white p-1.5 rounded-full shadow-lg opacity-100 transition-opacity touch-manipulation">
              <Move className="w-4 h-4" />
            </div>
            <button
              className="absolute -top-6 -left-6 bg-green-500 text-white p-1.5 rounded-full shadow-lg opacity-100 transition-opacity touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                setEditingTextId(customText.id.toString());
                setEditingText(config.text || 'Texte personnalisé');
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setEditingTextId(customText.id.toString());
                setEditingText(config.text || 'Texte personnalisé');
              }}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </>
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
      touchAction: 'none', // Empêche le défilement natif
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
          e.stopPropagation();
          // Better touch handling for images
          const now = Date.now();
          const timeSince = now - lastTapTimeRef.current;
          
          if (timeSince < 300 && timeSince > 0) {
            // Double tap - just select for now
            onElementSelect(customImage.id.toString());
            return;
          }
          
          lastTapTimeRef.current = now;
          
          // Single touch - start drag after brief delay
          setTimeout(() => {
            if (lastTapTimeRef.current === now) {
              // Empêcher le défilement pendant le drag
              document.body.style.overflow = 'hidden';
              onDragStart(e, customImage.id.toString(), 'image');
            }
          }, 100);
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
          <div className="absolute -top-6 -right-6 bg-blue-500 text-white p-1.5 rounded-full shadow-lg opacity-100 transition-opacity touch-manipulation">
            <Move className="w-4 h-4" />
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