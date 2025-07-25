import React from 'react';
import { 
  Bold, Italic, Underline, Trash2, Minus, Plus, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Move, Sparkles
} from 'lucide-react';
import type { CustomText } from './GameEditorLayout';
import { simpleFontSizes, getFontsByCategory, fontCategories } from '../../config/fonts';

interface TextToolbarProps {
  text: CustomText;
  position: { x: number; y: number };
  onUpdate: (updates: Partial<CustomText>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const TextToolbar: React.FC<TextToolbarProps> = ({
  text,
  onUpdate,
  onDelete
}) => {
  const handleFontSizeChange = (delta: number) => {
    const currentSize = text.fontSize || 16;
    const newSize = Math.max(8, Math.min(128, currentSize + delta));
    onUpdate({ fontSize: newSize });
  };

  return (
    <div 
      className="bg-gray-900 text-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-gray-700"
      style={{
        minWidth: '600px'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Font Family */}
      <select
        value={text.fontFamily}
        onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        className="bg-gray-800 text-white text-sm px-2 py-1 rounded border-none outline-none max-w-32"
      >
        <optgroup label="Populaires">
          {getFontsByCategory('sans-serif').slice(0, 5).map(font => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </optgroup>
        {Object.entries(fontCategories).map(([category, label]) => (
          <optgroup key={category} label={label}>
            {getFontsByCategory(category as any).slice(0, 5).map(font => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Font Size Controls */}
      <button
        onClick={() => handleFontSizeChange(-2)}
        className="p-1 rounded hover:bg-gray-700 text-gray-300"
      >
        <Minus className="w-4 h-4" />
      </button>
      
      <select
        value={text.fontSize}
        onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
        className="bg-gray-800 text-white text-sm px-1 py-1 rounded border-none outline-none w-14 text-center"
      >
        {simpleFontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      
      <button
        onClick={() => handleFontSizeChange(2)}
        className="p-1 rounded hover:bg-gray-700 text-gray-300"
      >
        <Plus className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Text Color */}
      <input
        type="color"
        value={text.color || '#000000'}
        onChange={(e) => onUpdate({ color: e.target.value })}
        className="w-7 h-6 rounded border-none cursor-pointer"
        title="Couleur du texte"
      />

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Bold */}
      <button
        onClick={() => onUpdate({ fontWeight: text.fontWeight === 'bold' ? 'normal' : 'bold' })}
        className={`p-1 rounded hover:bg-gray-700 ${text.fontWeight === 'bold' ? 'bg-blue-600' : ''}`}
      >
        <Bold className="w-4 h-4" />
      </button>

      {/* Italic */}
      <button
        onClick={() => onUpdate({ fontStyle: text.fontStyle === 'italic' ? 'normal' : 'italic' })}
        className={`p-1 rounded hover:bg-gray-700 ${text.fontStyle === 'italic' ? 'bg-blue-600' : ''}`}
      >
        <Italic className="w-4 h-4" />
      </button>

      {/* Underline */}
      <button
        onClick={() => onUpdate({ 
          textDecoration: text.textDecoration?.includes('underline') 
            ? text.textDecoration.replace('underline', '').trim() || 'none'
            : (text.textDecoration === 'none' || !text.textDecoration) ? 'underline' : `${text.textDecoration} underline`
        })}
        className={`p-1 rounded hover:bg-gray-700 ${text.textDecoration?.includes('underline') ? 'bg-blue-600' : ''}`}
      >
        <Underline className="w-4 h-4" />
      </button>

      {/* Strikethrough */}
      <button
        onClick={() => onUpdate({ 
          textDecoration: text.textDecoration?.includes('line-through') 
            ? text.textDecoration.replace('line-through', '').trim() || 'none'
            : (text.textDecoration === 'none' || !text.textDecoration) ? 'line-through' : `${text.textDecoration} line-through`
        })}
        className={`p-1 rounded hover:bg-gray-700 ${text.textDecoration?.includes('line-through') ? 'bg-blue-600' : ''}`}
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Text Alignment */}
      <button
        onClick={() => onUpdate({ textAlign: text.textAlign === 'left' ? 'center' : 'left' })}
        className={`p-1 rounded hover:bg-gray-700 ${text.textAlign === 'left' || !text.textAlign ? 'bg-blue-600' : ''}`}
      >
        <AlignLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() => onUpdate({ textAlign: 'center' })}
        className={`p-1 rounded hover:bg-gray-700 ${text.textAlign === 'center' ? 'bg-blue-600' : ''}`}
      >
        <AlignCenter className="w-4 h-4" />
      </button>

      <button
        onClick={() => onUpdate({ textAlign: 'right' })}
        className={`p-1 rounded hover:bg-gray-700 ${text.textAlign === 'right' ? 'bg-blue-600' : ''}`}
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <button
        onClick={() => onUpdate({ textAlign: 'justify' })}
        className={`p-1 rounded hover:bg-gray-700 ${text.textAlign === 'justify' ? 'bg-blue-600' : ''}`}
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Lists */}
      <button
        onClick={() => onUpdate({ listType: text.listType === 'bullet' ? 'none' : 'bullet' })}
        className={`p-1 rounded hover:bg-gray-700 ${text.listType === 'bullet' ? 'bg-blue-600' : ''}`}
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={() => onUpdate({ listType: text.listType === 'numbered' ? 'none' : 'numbered' })}
        className={`p-1 rounded hover:bg-gray-700 ${text.listType === 'numbered' ? 'bg-blue-600' : ''}`}
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Effects */}
      <button
        onClick={() => onUpdate({ hasEffect: !text.hasEffect })}
        className={`p-1 rounded hover:bg-gray-700 ${text.hasEffect ? 'bg-purple-600' : ''}`}
        title="Effets"
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {/* Animate */}
      <button
        onClick={() => onUpdate({ isAnimated: !text.isAnimated })}
        className={`p-1 rounded hover:bg-gray-700 ${text.isAnimated ? 'bg-green-600' : ''}`}
        title="Animer"
      >
        <Move className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Background Color */}
      <input
        type="color"
        value={text.backgroundColor || '#ffffff'}
        onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
        className="w-7 h-6 rounded border-none cursor-pointer"
        title="Couleur de fond"
      />

      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Delete */}
      <button
        onClick={onDelete}
        className="p-1 rounded hover:bg-red-600 text-red-400"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TextToolbar;