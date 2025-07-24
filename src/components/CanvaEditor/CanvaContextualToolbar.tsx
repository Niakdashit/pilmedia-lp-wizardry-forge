import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Minus,
  Plus,
  Palette,
  X
} from 'lucide-react';

interface CanvaContextualToolbarProps {
  selectedElement: any;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

const CanvaContextualToolbar: React.FC<CanvaContextualToolbarProps> = ({
  selectedElement,
  onUpdate,
  onClose
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fontSizes = [8, 10, 12, 14, 16, 18, 24, 32, 48, 64, 72, 96];
  const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'];

  const handleFontSizeChange = (delta: number) => {
    const currentSize = selectedElement.fontSize || 16;
    const newSize = Math.max(8, Math.min(96, currentSize + delta));
    onUpdate({ fontSize: newSize });
  };

  if (!selectedElement) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-[#2c2d30] text-white rounded-xl shadow-2xl p-2 flex items-center gap-2 min-w-max">
        {/* Font Family */}
        <select
          value={selectedElement.fontFamily || 'Arial'}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="bg-[#3d4043] text-white text-sm px-3 py-1 rounded border-none outline-none min-w-[120px]"
        >
          {fontFamilies.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>

        <div className="w-px h-6 bg-[#515356]"></div>

        {/* Font Size */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleFontSizeChange(-2)}
            className="p-1 hover:bg-[#515356] rounded transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <select
            value={selectedElement.fontSize || 16}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="bg-[#3d4043] text-white text-sm px-2 py-1 rounded border-none outline-none w-16 text-center"
          >
            {fontSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <button
            onClick={() => handleFontSizeChange(2)}
            className="p-1 hover:bg-[#515356] rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-[#515356]"></div>

        {/* Text Formatting */}
        <button
          onClick={() => onUpdate({ 
            fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
          })}
          className={`p-2 rounded transition-colors ${
            selectedElement.fontWeight === 'bold' ? 'bg-[#515356] text-white' : 'hover:bg-[#515356]'
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => onUpdate({ 
            fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
          })}
          className={`p-2 rounded transition-colors ${
            selectedElement.fontStyle === 'italic' ? 'bg-[#515356] text-white' : 'hover:bg-[#515356]'
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          onClick={() => onUpdate({ 
            textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
          })}
          className={`p-2 rounded transition-colors ${
            selectedElement.textDecoration === 'underline' ? 'bg-[#515356] text-white' : 'hover:bg-[#515356]'
          }`}
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[#515356]"></div>

        {/* Text Alignment */}
        <button
          onClick={() => onUpdate({ textAlign: 'left' })}
          className={`p-2 rounded transition-colors ${
            selectedElement.textAlign === 'left' ? 'bg-[#515356] text-white' : 'hover:bg-[#515356]'
          }`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => onUpdate({ textAlign: 'center' })}
          className={`p-2 rounded transition-colors ${
            selectedElement.textAlign === 'center' ? 'bg-[#515356] text-white' : 'hover:bg-[#515356]'
          }`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          onClick={() => onUpdate({ textAlign: 'right' })}
          className={`p-2 rounded transition-colors ${
            selectedElement.textAlign === 'right' ? 'bg-[#515356] text-white' : 'hover:bg-[#515356]'
          }`}
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[#515356]"></div>

        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 hover:bg-[#515356] rounded transition-colors flex items-center gap-1"
          >
            <Palette className="w-4 h-4" />
            <div 
              className="w-4 h-4 rounded border border-white/20"
              style={{ backgroundColor: selectedElement.color || '#000000' }}
            ></div>
          </button>

          {showColorPicker && (
            <div className="absolute top-full mt-2 bg-[#2c2d30] rounded-lg p-3 shadow-xl">
              <input
                type="color"
                value={selectedElement.color || '#000000'}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-32 h-8 rounded border-none cursor-pointer"
              />
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-[#515356]"></div>

        {/* Close */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#515356] rounded transition-colors text-[#9ca3af]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CanvaContextualToolbar;