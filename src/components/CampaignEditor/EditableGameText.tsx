import React, { useState, useRef, useEffect } from 'react';

interface EditableGameTextProps {
  text: string;
  onUpdate: (newText: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
  id?: string;
}

const EditableGameText: React.FC<EditableGameTextProps> = ({
  text,
  onUpdate,
  className = '',
  style = {},
  placeholder = 'Cliquez pour éditer...',
  multiline = false,
  id
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      } else if (inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(text);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editText !== text) {
      onUpdate(editText);
    }
  };

  const baseStyle = {
    cursor: isEditing ? 'text' : 'pointer',
    position: 'relative' as const,
    ...style
  };

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    return (
      <InputComponent
        ref={inputRef as any}
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`${className} bg-black/20 border-2 border-dashed border-white/50 focus:border-white focus:outline-none resize-none text-white`}
        style={{
          ...baseStyle,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          borderRadius: '4px',
          padding: '4px 8px',
          width: '100%',
          minHeight: multiline ? '60px' : 'auto'
        }}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
      />
    );
  }

  return (
    <div
      className={`${className} relative group`}
      style={baseStyle}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowHint(true)}
      onMouseLeave={() => setShowHint(false)}
      data-text-id={id}
    >
      {text || placeholder}
      
      {/* Hint pour indiquer que le texte est éditable */}
      {showHint && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50">
          Double-cliquez pour éditer
        </div>
      )}
      
      {/* Indicateur visuel d'édition */}
      <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-white/30 transition-colors duration-200 rounded pointer-events-none" />
    </div>
  );
};

export default EditableGameText;