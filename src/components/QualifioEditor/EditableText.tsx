
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
  const [isResizing, setIsResizing] = useState(false);
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

  const handleResize = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = text.width || 200;
    const startHeight = text.height || 50;
    const startPosX = text.x;
    const startPosY = text.y;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;
      
      // Handle width changes
      if (direction.includes('right')) {
        newWidth = Math.max(50, startWidth + deltaX);
      }
      if (direction.includes('left')) {
        newWidth = Math.max(50, startWidth - deltaX);
        newX = startPosX + (startWidth - newWidth);
      }
      
      // Handle height changes
      if (direction.includes('bottom')) {
        newHeight = Math.max(20, startHeight + deltaY);
      }
      if (direction.includes('top')) {
        newHeight = Math.max(20, startHeight - deltaY);
        newY = startPosY + (startHeight - newHeight);
      }
      
      onUpdate({
        ...text,
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY
      });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
    cursor: isEditing ? 'text' : (isResizing ? 'resize' : 'move'),
    display: 'inline-block',
    position: 'relative',
    boxShadow: isSelected && !isEditing ? '0 0 0 1px rgba(59, 130, 246, 0.3)' : 'none',
    userSelect: isEditing ? 'text' : 'none',
    overflow: 'hidden',
    wordWrap: 'break-word'
  };

  return (
    <>
      <Draggable
        position={{ x: text.x, y: text.y }}
        onDrag={handleDrag}
        disabled={isEditing || isResizing}
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
          
          {/* Poignées de redimensionnement */}
          {isSelected && !isEditing && (
            <>
              {/* Coin supérieur gauche */}
              <div
                className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize hover:bg-blue-600 border border-white shadow-sm z-10"
                onMouseDown={(e) => handleResize(e, 'top-left')}
              />
              
              {/* Coin supérieur droit */}
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize hover:bg-blue-600 border border-white shadow-sm z-10"
                onMouseDown={(e) => handleResize(e, 'top-right')}
              />
              
              {/* Coin inférieur gauche */}
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize hover:bg-blue-600 border border-white shadow-sm z-10"
                onMouseDown={(e) => handleResize(e, 'bottom-left')}
              />
              
              {/* Coin inférieur droit */}
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 border border-white shadow-sm z-10"
                onMouseDown={(e) => handleResize(e, 'bottom-right')}
              />
              
              {/* Poignée droite */}
              <div
                className="absolute top-1/2 -right-1 w-3 h-6 bg-blue-500 rounded cursor-e-resize hover:bg-blue-600 border border-white shadow-sm transform -translate-y-1/2 z-10"
                onMouseDown={(e) => handleResize(e, 'right')}
              />
              
              {/* Poignée bas */}
              <div
                className="absolute -bottom-1 left-1/2 w-6 h-3 bg-blue-500 rounded cursor-s-resize hover:bg-blue-600 border border-white shadow-sm transform -translate-x-1/2 z-10"
                onMouseDown={(e) => handleResize(e, 'bottom')}
              />

              {/* Poignée gauche */}
              <div
                className="absolute top-1/2 -left-1 w-3 h-6 bg-blue-500 rounded cursor-w-resize hover:bg-blue-600 border border-white shadow-sm transform -translate-y-1/2 z-10"
                onMouseDown={(e) => handleResize(e, 'left')}
              />
              
              {/* Poignée haut */}
              <div
                className="absolute -top-1 left-1/2 w-6 h-3 bg-blue-500 rounded cursor-n-resize hover:bg-blue-600 border border-white shadow-sm transform -translate-x-1/2 z-10"
                onMouseDown={(e) => handleResize(e, 'top')}
              />
            </>
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
