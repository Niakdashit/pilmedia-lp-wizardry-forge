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

interface CanvasToolbarProps {
  selectedElement: any;
  onElementUpdate: (updates: any) => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  selectedElement,
  onElementUpdate
}) => {
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

  if (!selectedElement || selectedElement.type !== 'text') {
    return null;
  }

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96];

  const updateTextShadow = (property: string, value: any) => {
    const currentShadow = selectedElement.textShadow || { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 };
    onElementUpdate({
      textShadow: {
        ...currentShadow,
        [property]: value
      }
    });
  };

  const updatePadding = (property: string, value: number) => {
    const currentPadding = selectedElement.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    onElementUpdate({
      padding: {
        ...currentPadding,
        [property]: value
      }
    });
  };

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
          selectedElement.fontWeight === 'bold' ? 'bg-blue-600' : ''
        }`}
      >
        <Bold className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ 
          fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
        })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.fontStyle === 'italic' ? 'bg-blue-600' : ''
        }`}
      >
        <Italic className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ 
          textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
        })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.textDecoration === 'underline' ? 'bg-blue-600' : ''
        }`}
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="h-6 w-px bg-gray-600 mx-2" />

      {/* Text Alignment */}
      <button 
        onClick={() => onElementUpdate({ textAlign: 'left' })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.textAlign === 'left' ? 'bg-blue-600' : ''
        }`}
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ textAlign: 'center' })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.textAlign === 'center' ? 'bg-blue-600' : ''
        }`}
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ textAlign: 'right' })}
        className={`p-1 rounded hover:bg-gray-700 ${
          selectedElement.textAlign === 'right' ? 'bg-blue-600' : ''
        }`}
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <div className="h-6 w-px bg-gray-600 mx-2" />

      {/* Advanced Tools */}
      <button 
        onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
        className={`p-1 rounded hover:bg-gray-700 flex items-center space-x-1 ${showAdvancedPanel ? 'bg-blue-600' : ''}`}
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

      {/* Advanced Panel */}
      {showAdvancedPanel && (
        <div className="absolute top-full left-0 mt-2 bg-gray-800 text-white p-4 rounded-lg shadow-lg min-w-[400px] z-50">
          <div className="grid grid-cols-2 gap-4">
            {/* Background Color */}
            <div>
              <label className="block text-xs font-medium mb-1">Arrière-plan</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedElement.backgroundColor || '#ffffff'}
                  onChange={(e) => onElementUpdate({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedElement.backgroundOpacity || 1}
                  onChange={(e) => onElementUpdate({ backgroundOpacity: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-xs">{Math.round((selectedElement.backgroundOpacity || 1) * 100)}%</span>
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-xs font-medium mb-1">Coins arrondis</label>
              <input
                type="range"
                min="0"
                max="50"
                value={selectedElement.borderRadius || 0}
                onChange={(e) => onElementUpdate({ borderRadius: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs">{selectedElement.borderRadius || 0}px</span>
            </div>

            {/* Padding Controls */}
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-2">Espacement intérieur</label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs">Haut</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={selectedElement.padding?.top || 0}
                    onChange={(e) => updatePadding('top', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Droite</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={selectedElement.padding?.right || 0}
                    onChange={(e) => updatePadding('right', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Bas</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={selectedElement.padding?.bottom || 0}
                    onChange={(e) => updatePadding('bottom', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Gauche</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={selectedElement.padding?.left || 0}
                    onChange={(e) => updatePadding('left', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Text Shadow */}
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-2">Ombre du texte</label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs">Couleur</label>
                  <input
                    type="color"
                    value={selectedElement.textShadow?.color || '#000000'}
                    onChange={(e) => updateTextShadow('color', e.target.value)}
                    className="w-full h-8 rounded border-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs">Flou</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={selectedElement.textShadow?.blur || 0}
                    onChange={(e) => updateTextShadow('blur', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs">{selectedElement.textShadow?.blur || 0}px</span>
                </div>
                <div>
                  <label className="text-xs">Décalage X</label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={selectedElement.textShadow?.offsetX || 0}
                    onChange={(e) => updateTextShadow('offsetX', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs">{selectedElement.textShadow?.offsetX || 0}px</span>
                </div>
                <div>
                  <label className="text-xs">Décalage Y</label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={selectedElement.textShadow?.offsetY || 0}
                    onChange={(e) => updateTextShadow('offsetY', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs">{selectedElement.textShadow?.offsetY || 0}px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasToolbar;