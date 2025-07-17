import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import ImageToolbar from './ImageToolbar';

interface EditableImageProps {
  image: any;
  onUpdate: (image: any) => void;
  onDelete: (id: number) => void;
  isSelected: boolean;
  onSelect: (id: number) => void;
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
  const imageRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(image.id);
    
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setToolbarPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
      });
      setShowToolbar(true);
    }
  };

  const handleDrag = (_: any, data: any) => {
    setShowToolbar(false);
    onUpdate({
      ...image,
      x: data.x,
      y: data.y
    });
  };

  const handleToolbarUpdate = (updates: any) => {
    onUpdate({ ...image, ...updates });
  };

  const handleToolbarDelete = () => {
    setShowToolbar(false);
    onDelete(image.id);
  };

  const handleToolbarClose = () => {
    setShowToolbar(false);
  };

  const imageStyle: React.CSSProperties = {
    width: `${image.width || 100}px`,
    height: `${image.height || 100}px`,
    transform: `rotate(${image.rotation || 0}deg)`,
    border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
    borderRadius: '4px',
    cursor: 'move',
    position: 'relative',
    boxShadow: isSelected ? '0 0 0 1px rgba(59, 130, 246, 0.3)' : 'none',
    userSelect: 'none',
    objectFit: 'cover' as const
  };

  if (!image.src) {
    return null;
  }

  return (
    <>
      <Draggable
        position={{ x: image.x, y: image.y }}
        onDrag={handleDrag}
        bounds="parent"
        defaultClassName="absolute"
      >
        <div
          ref={imageRef}
          onClick={handleClick}
          className="group"
        >
          <img
            src={image.src}
            alt="Image personnalisée"
            style={imageStyle}
            onError={(e) => {
              console.warn('Image failed to load:', image.src);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </Draggable>

      {/* Toolbar Canva-style */}
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