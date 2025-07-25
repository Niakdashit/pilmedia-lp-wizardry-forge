import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Type,
  Palette,
  Sparkles,
  Move,
  RotateCcw
} from 'lucide-react';

interface FormatToolbarProps {
  selectedElements: string[];
}

const FormatToolbar: React.FC<FormatToolbarProps> = ({ selectedElements }) => {
  const hasTextSelection = selectedElements.length > 0;

  return (
    <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-2 text-white">
      {/* Font Selection */}
      <div className="flex items-center gap-2 border-r border-gray-600 pr-3">
        <select className="bg-transparent text-white text-sm border-none outline-none">
          <option>Canva Sans</option>
          <option>Arial</option>
          <option>Helvetica</option>
        </select>
        <div className="w-px h-4 bg-gray-600" />
        <button className="text-gray-300 hover:text-white">-</button>
        <span className="text-sm">92</span>
        <button className="text-gray-300 hover:text-white">+</button>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-r border-gray-600 pr-3">
        <button 
          className={`p-1.5 rounded transition-colors ${
            hasTextSelection ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
          }`}
          disabled={!hasTextSelection}
        >
          <Type className="w-4 h-4" />
        </button>
        <button 
          className={`p-1.5 rounded transition-colors ${
            hasTextSelection ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
          }`}
          disabled={!hasTextSelection}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button 
          className={`p-1.5 rounded transition-colors ${
            hasTextSelection ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
          }`}
          disabled={!hasTextSelection}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button 
          className={`p-1.5 rounded transition-colors ${
            hasTextSelection ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
          }`}
          disabled={!hasTextSelection}
        >
          <Underline className="w-4 h-4" />
        </button>
        <button 
          className={`p-1.5 rounded transition-colors ${
            hasTextSelection ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
          }`}
          disabled={!hasTextSelection}
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1 border-r border-gray-600 pr-3">
        <button 
          className={`p-1.5 rounded transition-colors ${
            hasTextSelection ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
          }`}
          disabled={!hasTextSelection}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button 
          className={`p-1.5 rounded transition-colors ${
            hasTextSelection ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
          }`}
          disabled={!hasTextSelection}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button 
          className={`p-1.5 rounded transition-colors ${
            hasTextSelection ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
          }`}
          disabled={!hasTextSelection}
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 border-r border-gray-600 pr-3">
        <button 
          className={`p-1.5 rounded transition-colors ${
            hasTextSelection ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
          }`}
          disabled={!hasTextSelection}
        >
          <List className="w-4 h-4" />
        </button>
        <button 
          className={`p-1.5 rounded transition-colors ${
            hasTextSelection ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
          }`}
          disabled={!hasTextSelection}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Advanced Tools */}
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded hover:bg-gray-700 text-white">
          <Palette className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded hover:bg-gray-700 text-white">
          <Sparkles className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded hover:bg-gray-700 text-white">
          <Move className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded hover:bg-gray-700 text-white">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FormatToolbar;