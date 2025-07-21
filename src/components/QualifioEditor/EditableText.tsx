
import React, { useState, useRef, useEffect } from 'react';
import type { CustomText, DeviceType } from './QualifioEditorLayout';

interface EditableTextProps {
  text: CustomText;
  onUpdate: (updatedText: CustomText) => void;
  onDelete: (textId: string) => void;
  isSelected: boolean;
  onSelect: (textId: string | null) => void;
  device: DeviceType;
  triggerAutoSync?: () => void;
}

const EditableText: React.FC<EditableTextProps> = ({
  text,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  device,
  triggerAutoSync
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(text.content);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Get device-specific properties
  const deviceConfig = text.deviceConfig?.[device];
  const actualX = deviceConfig?.x ?? text.x;
  const actualY = deviceConfig?.y ?? text.y;
  const actualFontSize = deviceConfig?.fontSize ?? text.fontSize;
  const actualWidth = deviceConfig?.width ?? text.width;
  const actualHeight = deviceConfig?.height ?? text.height;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelect(text.id);
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - actualX,
      y: e.clientY - actualY
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, e.clientX - dragStartPos.current.x);
    const newY = Math.max(0, e.clientY - dragStartPos.current.y);
    
    // Update device-specific position
    const updatedText = {
      ...text,
      deviceConfig: {
        ...text.deviceConfig,
        [device]: {
          ...text.deviceConfig?.[device],
          x: newX,
          y: newY
        }
      }
    };
    
    // If this is the base device, also update main properties
    if (device === 'desktop') {
      updatedText.x = newX;
      updatedText.y = newY;
    }
    
    onUpdate(updatedText);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Trigger auto-sync after drag
      if (triggerAutoSync) {
        setTimeout(triggerAutoSync, 100);
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditContent(text.content);
  };

  const handleEditSave = () => {
    onUpdate({ ...text, content: editContent });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(text.content);
    } else if (e.key === 'Delete' && isSelected && !isEditing) {
      onDelete(text.id);
    }
  };

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none ${isSelected ? 'ring-2 ring-brand-primary ring-opacity-50' : ''}`}
      style={{
        left: `${actualX}px`,
        top: `${actualY}px`,
        width: actualWidth ? `${actualWidth}px` : 'auto',
        height: actualHeight ? `${actualHeight}px` : 'auto',
        fontSize: `${actualFontSize}px`,
        fontFamily: text.fontFamily,
        color: text.color,
        fontWeight: text.fontWeight,
        fontStyle: text.fontStyle,
        textDecoration: text.textDecoration,
        textAlign: text.textAlign,
        backgroundColor: text.backgroundColor || 'transparent',
        zIndex: isSelected ? 1000 : 100,
        minWidth: '50px',
        minHeight: '20px'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {isEditing ? (
        <input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleEditSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full h-full bg-transparent border-none outline-none"
          style={{
            fontSize: `${actualFontSize}px`,
            fontFamily: text.fontFamily,
            color: text.color,
            fontWeight: text.fontWeight,
            fontStyle: text.fontStyle,
            textAlign: text.textAlign
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center">
          {text.content}
        </div>
      )}
      
      {isSelected && (
        <div className="absolute -top-6 left-0 right-0 bg-brand-primary text-white text-xs px-2 py-1 rounded text-center">
          Double-clic pour éditer • Suppr pour supprimer
        </div>
      )}
    </div>
  );
};

export default EditableText;
