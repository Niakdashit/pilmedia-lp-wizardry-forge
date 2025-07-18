import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import type { CustomText } from './QualifioEditorLayout';
import TextToolbar from './TextToolbar';

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
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditContent(text.content);
  }, [text.content]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    onSelect(text.id);
    setShowToolbar(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(text.id);
    
    if (textRef.current && !isEditing) {
      const rect = textRef.current.getBoundingClientRect();
      setToolbarPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
      });
      setShowToolbar(true);
    }
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
    if (editContent !== text.content) {
      onUpdate({ ...text, content: editContent });
    }
  };

  const handleDrag = (_: any, data: any) => {
    setShowToolbar(false);
    onUpdate({
      ...text,
      x: data.x,
      y: data.y
    });
  };

  const handleToolbarUpdate = (updates: Partial<CustomText>) => {
    onUpdate({ ...text, ...updates });
  };

  const handleToolbarDelete = () => {
    setShowToolbar(false);
    onDelete(text.id);
  };

  const handleToolbarClose = () => {
    setShowToolbar(false);
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
    padding: '8px',
    border: isSelected && !isEditing ? '2px solid #3b82f6' : '2px solid transparent',
    borderRadius: '4px',
    cursor: isEditing ? 'text' : 'move',
    display: 'inline-block',
    position: 'relative',
    boxShadow: isSelected && !isEditing ? '0 0 0 1px rgba(59, 130, 246, 0.3)' : 'none',
    userSelect: isEditing ? 'text' : 'none'
  };

  return (
    <>
      <Draggable
        position={{ x: text.x, y: text.y }}
        onDrag={handleDrag}
        disabled={isEditing}
        bounds="parent"
        defaultClassName="absolute"
      >
        <div
          ref={textRef}
          style={textStyle}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className="group"
        >
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              autoFocus
              className="w-full h-full resize-none"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                color: 'inherit',
                fontWeight: 'inherit',
                fontStyle: 'inherit',
                textDecoration: 'inherit',
                padding: '0'
              }}
            />
          ) : (
            <span style={{ whiteSpace: 'pre-wrap' }}>{text.content}</span>
          )}
        </div>
      </Draggable>

      {/* Toolbar Canva-style */}
      {showToolbar && !isEditing && (
        <TextToolbar
          text={text}
          position={toolbarPosition}
          onUpdate={handleToolbarUpdate}
          onDelete={handleToolbarDelete}
          onClose={handleToolbarClose}
        />
      )}
    </>
  );
};

export default EditableText;