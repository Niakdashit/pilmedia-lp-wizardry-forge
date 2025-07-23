import React, { useState, useRef, useEffect } from 'react';
import { Move, Edit2, Trash2, Type, Palette, Frame } from 'lucide-react';
import type { CustomText, DeviceType } from './GameEditorLayout';

interface EditableTextProps {
  text: CustomText;
  onUpdate: (updatedText: CustomText) => void;
  onDelete: (textId: string) => void;
  isSelected: boolean;
  onSelect: (textId: string) => void;
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
  // Debug: Log text props
  useEffect(() => {
    console.log('📝 EditableText rendering:', {
      id: text.id,
      content: text.content,
      x: text.x,
      y: text.y,
      color: text.color,
      enabled: text.enabled
    });
  }, [text]);

  // Return null if text is not enabled or has no content
  if (!text.enabled || !text.content) {
    console.log('📝 EditableText: text disabled or no content:', text);
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text.content || '');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);

  const getFontSize = (size: string): string => {
    const sizeMap: Record<string, string> = {
      'xs': '12px',
      'sm': '14px',
      'base': '16px',
      'lg': '18px',
      'xl': '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px'
    };
    return sizeMap[size] || '16px';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(text.id);
    
    if (e.detail === 2) { // Double click
      setIsEditing(true);
      setEditValue(text.content || '');
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - text.x, y: e.clientY - text.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onUpdate({ ...text, x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      triggerAutoSync?.();
    }
  };

  const handleSaveEdit = () => {
    onUpdate({ ...text, content: editValue });
    setIsEditing(false);
    triggerAutoSync?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(text.content || '');
    }
  };

  // Safe fallback values
  const safeText = text.content || 'Texte';
  const safeX = text.x || 0;
  const safeY = text.y || 0;
  const safeColor = text.color || '#000000';
  const safeSize = text.size || 'base';
  const safeFontFamily = text.fontFamily || 'Inter, sans-serif';

  const textStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${safeX}px`,
    top: `${safeY}px`,
    fontSize: getFontSize(safeSize),
    color: safeColor,
    fontFamily: safeFontFamily,
    fontWeight: text.bold ? 'bold' : 'normal',
    fontStyle: text.italic ? 'italic' : 'normal',
    textDecoration: text.underline ? 'underline' : 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    zIndex: isSelected ? 1000 : 100,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    maxWidth: '400px',
    lineHeight: '1.4',
    transition: isDragging ? 'none' : 'all 0.2s ease'
  };

  // Add frame styling if enabled
  if (text.showFrame) {
    textStyle.backgroundColor = text.frameColor || '#ffffff';
    textStyle.border = `1px solid ${text.frameBorderColor || '#e5e7eb'}`;
    textStyle.padding = '8px 12px';
    textStyle.borderRadius = '6px';
    textStyle.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  }

  // Add selection styling
  if (isSelected) {
    textStyle.outline = '2px solid #3b82f6';
    textStyle.outlineOffset = '2px';
    textStyle.borderRadius = '4px';
  }

  return (
    <div
      ref={textRef}
      style={textStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="group relative"
    >
      {isEditing ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          className="bg-white border border-blue-500 rounded px-2 py-1 resize-none"
          style={{
            fontSize: getFontSize(safeSize),
            fontFamily: safeFontFamily,
            color: safeColor,
            width: '100%',
            minHeight: '40px'
          }}
          autoFocus
        />
      ) : (
        <div className="relative">
          {safeText}
          
          {/* Selection controls */}
          {isSelected && (
            <div className="absolute -top-8 -right-2 flex items-center space-x-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setEditValue(safeText);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Modifier"
              >
                <Edit2 className="w-3 h-3 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(text.id);
                }}
                className="p-1 hover:bg-red-100 rounded"
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableText;
