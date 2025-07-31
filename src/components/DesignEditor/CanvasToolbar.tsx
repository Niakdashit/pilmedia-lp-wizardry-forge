import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  Wand2,
  Play,
  Move3D
} from 'lucide-react';
import TextEffectsPanel from './panels/TextEffectsPanel';

interface CanvasToolbarProps {
  selectedElement: any;
  onElementUpdate: (updates: any) => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = React.memo(({
  selectedElement,
  onElementUpdate
}) => {
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);

  if (!selectedElement || selectedElement.type !== 'text') {
    return null;
  }

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96];

  return (
    <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-1 mb-4">
      {/* Font Family */}
      <select 
        value={selectedElement.fontFamily || 'Arial'}
        onChange={(e) => onElementUpdate({ fontFamily: e.target.value })}
        className="bg-gray-700 text-white px-2 py-1 rounded text-sm border-none outline-none"
      >
        <option value="Arial">Canva Sans</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
      </select>

      <div className="h-6 w-px bg-gray-600 mx-2" />

      {/* Font Size */}
      <button className="text-white hover:bg-gray-700 p-1 rounded">−</button>
      <select 
        value={selectedElement.fontSize || 16}
        onChange={(e) => onElementUpdate({ fontSize: parseInt(e.target.value) })}
        className="bg-gray-700 text-white px-2 py-1 rounded text-sm border-none outline-none w-16"
      >
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      <button className="text-white hover:bg-gray-700 p-1 rounded">+</button>

      <div className="h-6 w-px bg-gray-600 mx-2" />

      {/* Text Color */}
      <div className="flex items-center">
        <Type className="w-4 h-4 mr-1" />
        <input
          type="color"
          value={selectedElement.color || '#000000'}
          onChange={(e) => onElementUpdate({ color: e.target.value })}
          className="w-6 h-6 rounded border-none cursor-pointer"
        />
      </div>

      <div className="h-6 w-px bg-gray-600 mx-2" />

      {/* Text Formatting */}
      <button 
        onClick={() => onElementUpdate({ 
          fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
        })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.fontWeight === 'bold' ? 'bg-[hsl(var(--primary))]' : ''
        }`}
      >
        <Bold className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ 
          fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
        })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.fontStyle === 'italic' ? 'bg-[hsl(var(--primary))]' : ''
        }`}
      >
        <Italic className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ 
          textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
        })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.textDecoration === 'underline' ? 'bg-[hsl(var(--primary))]' : ''
        }`}
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="h-6 w-px bg-gray-600 mx-2" />

      {/* Text Alignment */}
      <button 
        onClick={() => onElementUpdate({ textAlign: 'left' })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.textAlign === 'left' ? 'bg-[hsl(var(--primary))]' : ''
        }`}
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ textAlign: 'center' })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.textAlign === 'center' ? 'bg-[hsl(var(--primary))]' : ''
        }`}
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ textAlign: 'right' })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.textAlign === 'right' ? 'bg-[hsl(var(--primary))]' : ''
        }`}
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <div className="h-6 w-px bg-gray-600 mx-2" />

      {/* Advanced Tools */}
      <button 
        onClick={() => setShowEffectsPanel(!showEffectsPanel)}
        className={`p-1 rounded hover:bg-gray-700 flex items-center space-x-1 ${showEffectsPanel ? 'bg-[hsl(var(--primary))]' : ''}`}
      >
        <Wand2 className="w-4 h-4" />
        <span className="text-sm">Effets</span>
      </button>
      
      <button className="p-1 rounded hover:bg-gray-700 flex items-center space-x-1">
        <Play className="w-4 h-4" />
        <span className="text-sm">Animer</span>
      </button>
      
      <button className="p-1 rounded hover:bg-gray-700 flex items-center space-x-1">
        <Move3D className="w-4 h-4" />
        <span className="text-sm">Position</span>
      </button>

      {/* Effects Panel */}
      {showEffectsPanel && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-96 max-h-96 overflow-y-auto">
          <TextEffectsPanel 
            onAddElement={() => {}}
            onBack={() => setShowEffectsPanel(false)}
            isToolbarMode={true}
            selectedElement={selectedElement}
            onElementUpdate={(updates) => {
              onElementUpdate(updates);
              setShowEffectsPanel(false);
            }}
          />
        </div>
      )}
    </div>
  );
});

CanvasToolbar.displayName = 'CanvasToolbar';

export default CanvasToolbar;