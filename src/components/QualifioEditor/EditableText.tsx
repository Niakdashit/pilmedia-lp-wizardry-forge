import React, { useState, useRef, useEffect } from 'react';
import { X, Move } from 'lucide-react';
import type { CustomText, DeviceType } from './QualifioEditorLayout';

interface EditableTextProps {
  text: CustomText;
  onUpdate: (text: CustomText) => void;
  onDelete: (id: string) => void;
  deviceConfig?: {
    fontSize: number;
    backgroundImage?: string;
  };
}

const EditableText: React.FC<EditableTextProps> = ({
  text,
  onUpdate,
  onDelete,
  deviceConfig
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Apply device-specific font size
  const deviceFontSize = deviceConfig?.fontSize || text.fontSize;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - text.x,
      y: e.clientY - text.y
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: text.width || 200,
      height: text.height || 50,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onUpdate({
        ...text,
        x: Math.max(0, e.clientX - dragStart.x),
        y: Math.max(0, e.clientY - dragStart.y)
      });
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      onUpdate({
        ...text,
        width: Math.max(100, resizeStart.width + deltaX),
        height: Math.max(30, resizeStart.height + deltaY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const handleContentChange = (content: string) => {
    onUpdate({ ...text, content });
  };

  const handleStyleChange = (property: keyof CustomText, value: any) => {
    onUpdate({ ...text, [property]: value });
  };

  if (isEditing) {
    return (
      <div
        ref={textRef}
        className="absolute border-2 border-blue-500 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg z-50"
        style={{
          left: text.x,
          top: text.y,
          width: text.width || 250,
          minHeight: text.height || 120
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Édition du texte</span>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <textarea
          ref={inputRef}
          value={text.content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            fontSize: deviceFontSize,
            fontFamily: text.fontFamily,
            fontWeight: text.fontWeight,
            fontStyle: text.fontStyle,
            color: text.color,
            minHeight: '80px'
          }}
          placeholder="Saisir le texte..."
        />
        
        <div className="mt-3 space-y-3">
          <div className="flex gap-3 items-center">
            <label className="text-xs font-medium text-gray-600">Couleur:</label>
            <input
              type="color"
              value={text.color}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={text.fontWeight}
              onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="bold">Gras</option>
            </select>
            
            <select
              value={text.fontStyle}
              onChange={(e) => handleStyleChange('fontStyle', e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="italic">Italique</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={textRef}
      className="absolute group cursor-move select-none hover:outline hover:outline-2 hover:outline-blue-400 transition-all"
      style={{
        left: text.x,
        top: text.y,
        width: text.width || 'auto',
        minHeight: text.height || 'auto'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => setIsEditing(true)}
    >
      <div
        className="relative p-2 rounded transition-all"
        style={{
          fontSize: deviceFontSize,
          fontFamily: text.fontFamily,
          fontWeight: text.fontWeight,
          fontStyle: text.fontStyle,
          color: text.color,
          backgroundColor: text.backgroundColor || 'transparent',
          textDecoration: text.textDecoration,
          minWidth: '100px',
          wordWrap: 'break-word'
        }}
      >
        {text.content || 'Double-cliquez pour éditer'}
        
        {/* Control buttons */}
        <div className="absolute -top-10 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-lg p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="w-7 h-7 bg-blue-500 text-white rounded flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
            title="Éditer"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(text.id);
            }}
            className="w-7 h-7 bg-red-500 text-white rounded flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            title="Supprimer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Resize handle */}
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white shadow-lg"
          onMouseDown={handleResizeMouseDown}
          title="Redimensionner"
        />
        
        {/* Move handle */}
        <div
          className="absolute -top-2 -left-2 w-4 h-4 bg-green-500 rounded-full cursor-move opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white shadow-lg flex items-center justify-center"
          title="Déplacer"
        >
          <Move className="w-2 h-2 text-white" />
        </div>
      </div>
    </div>
  );
};

export default EditableText;