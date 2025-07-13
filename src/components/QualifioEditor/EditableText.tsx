import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Trash2 } from 'lucide-react';
import type { CustomText } from './QualifioEditorLayout';

interface EditableTextProps {
  text: CustomText;
  onUpdate: (text: CustomText) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const EditableText: React.FC<EditableTextProps> = ({ 
  text, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(text.content);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditContent(text.content);
  }, [text.content]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    onSelect(text.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      onUpdate({ ...text, content: editContent });
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(text.content);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({ ...text, content: editContent });
  };

  const handleDrag = (_: any, data: any) => {
    onUpdate({
      ...text,
      x: data.x,
      y: data.y
    });
  };

  const textStyle: React.CSSProperties = {
    fontSize: `${text.fontSize}px`,
    fontFamily: text.fontFamily,
    color: text.color,
    fontWeight: text.fontWeight,
    fontStyle: text.fontStyle,
    textDecoration: text.textDecoration,
    backgroundColor: text.backgroundColor || 'transparent',
    width: text.width ? `${text.width}px` : 'auto',
    height: text.height ? `${text.height}px` : 'auto',
    minWidth: '50px',
    minHeight: '20px',
    padding: '4px',
    border: isSelected ? '2px dashed #3b82f6' : '2px solid transparent',
    borderRadius: '4px',
    cursor: isEditing ? 'text' : 'move',
    display: 'inline-block',
    position: 'relative'
  };

  return (
    <Draggable
      position={{ x: text.x, y: text.y }}
      onDrag={handleDrag}
      disabled={isEditing}
      bounds="parent"
    >
      <div
        ref={textRef}
        style={textStyle}
        onClick={() => onSelect(text.id)}
        onDoubleClick={handleDoubleClick}
        className="group"
      >
        {isEditing ? (
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            autoFocus
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              color: 'inherit',
              fontWeight: 'inherit',
              fontStyle: 'inherit',
              textDecoration: 'inherit'
            }}
          />
        ) : (
          <span>{text.content}</span>
        )}
        
        {isSelected && !isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(text.id);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            style={{ fontSize: '12px' }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
        
        {/* Resize handles */}
        {isSelected && !isEditing && (
          <>
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                // Handle resize logic here if needed
              }}
            />
          </>
        )}
      </div>
    </Draggable>
  );
};

export default EditableText;