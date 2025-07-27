import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Type, RotateCw, Layers, Copy, Scissors, Clipboard, Undo2, Redo2,
  ZoomIn, ZoomOut, Maximize, Grid, Ruler, Wand2, Group
} from 'lucide-react';

interface ProToolbarProps {
  selectedElements: any[];
  onElementUpdate: (id: string, updates: any) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
}

const ProToolbar: React.FC<ProToolbarProps> = ({
  selectedElements,
  onElementUpdate,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom
}) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const selectedElement = selectedElements[0];
  const isTextElement = selectedElement?.type === 'text';
  // const isImageElement = selectedElement?.type === 'image';
  const hasMultipleSelection = selectedElements.length > 1;

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96, 128];
  const fonts = [
    'Inter', 'Helvetica', 'Arial', 'Times New Roman', 'Georgia', 
    'Verdana', 'Montserrat', 'Roboto', 'Open Sans', 'Poppins'
  ];

  const togglePanel = (panel: string) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const updateSelectedElements = (updates: any) => {
    selectedElements.forEach(element => {
      onElementUpdate(element.id, updates);
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section - History & Basic Tools */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded hover:bg-gray-100 ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded hover:bg-gray-100 ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Rétablir (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
          <button className="p-2 rounded hover:bg-gray-100" title="Copier (Ctrl+C)">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100" title="Couper (Ctrl+X)">
            <Scissors className="w-4 h-4" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100" title="Coller (Ctrl+V)">
            <Clipboard className="w-4 h-4" />
          </button>
        </div>

        {/* Center Section - Text & Style Tools */}
        {selectedElements.length > 0 && (
          <div className="flex items-center space-x-1">
            {isTextElement && (
              <>
                {/* Font Family */}
                <select 
                  value={selectedElement.fontFamily || 'Inter'}
                  onChange={(e) => updateSelectedElements({ fontFamily: e.target.value })}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>

                {/* Font Size */}
                <div className="flex items-center border border-gray-300 rounded">
                  <button 
                    onClick={() => updateSelectedElements({ 
                      fontSize: Math.max(8, (selectedElement.fontSize || 16) - 2) 
                    })}
                    className="px-2 py-1 hover:bg-gray-100"
                  >
                    <span className="text-sm">−</span>
                  </button>
                  <select 
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => updateSelectedElements({ fontSize: parseInt(e.target.value) })}
                    className="px-2 py-1 text-sm border-none outline-none w-16 text-center"
                  >
                    {fontSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => updateSelectedElements({ 
                      fontSize: Math.min(128, (selectedElement.fontSize || 16) + 2) 
                    })}
                    className="px-2 py-1 hover:bg-gray-100"
                  >
                    <span className="text-sm">+</span>
                  </button>
                </div>

                <div className="h-6 w-px bg-gray-300 mx-2" />

                {/* Text Style */}
                <button 
                  onClick={() => updateSelectedElements({ 
                    fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
                  })}
                  className={`p-2 rounded hover:bg-gray-100 ${
                    selectedElement.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : ''
                  }`}
                  title="Gras (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => updateSelectedElements({ 
                    fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
                  })}
                  className={`p-2 rounded hover:bg-gray-100 ${
                    selectedElement.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : ''
                  }`}
                  title="Italique (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => updateSelectedElements({ 
                    textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
                  })}
                  className={`p-2 rounded hover:bg-gray-100 ${
                    selectedElement.textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : ''
                  }`}
                  title="Souligner (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-gray-300 mx-2" />

                {/* Text Alignment */}
                <button 
                  onClick={() => updateSelectedElements({ textAlign: 'left' })}
                  className={`p-2 rounded hover:bg-gray-100 ${
                    selectedElement.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : ''
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => updateSelectedElements({ textAlign: 'center' })}
                  className={`p-2 rounded hover:bg-gray-100 ${
                    selectedElement.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : ''
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => updateSelectedElements({ textAlign: 'right' })}
                  className={`p-2 rounded hover:bg-gray-100 ${
                    selectedElement.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : ''
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-gray-300 mx-2" />

                {/* Text Color */}
                <div className="flex items-center space-x-1">
                  <Type className="w-4 h-4 text-gray-600" />
                  <input
                    type="color"
                    value={selectedElement.color || '#000000'}
                    onChange={(e) => updateSelectedElements({ color: e.target.value })}
                    className="w-8 h-8 rounded border-none cursor-pointer"
                    title="Couleur du texte"
                  />
                </div>
              </>
            )}

            <div className="h-6 w-px bg-gray-300 mx-2" />

            {/* Advanced Effects */}
            <button
              onClick={() => togglePanel('effects')}
              className={`p-2 rounded hover:bg-gray-100 ${
                activePanel === 'effects' ? 'bg-blue-100 text-blue-600' : ''
              }`}
              title="Effets"
            >
              <Wand2 className="w-4 h-4" />
            </button>

            {/* Transform Tools */}
            <button className="p-2 rounded hover:bg-gray-100" title="Rotation">
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Layer Controls */}
            <button className="p-2 rounded hover:bg-gray-100" title="Organiser">
              <Layers className="w-4 h-4" />
            </button>

            {/* Grouping */}
            {hasMultipleSelection && (
              <button className="p-2 rounded hover:bg-gray-100" title="Grouper">
                <Group className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Right Section - View & Options */}
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 mr-2">{Math.round(zoom * 100)}%</span>
          
          <button className="p-2 rounded hover:bg-gray-100" title="Zoom -">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100" title="Zoom +">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100" title="Ajuster à l'écran">
            <Maximize className="w-4 h-4" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
          <button className="p-2 rounded hover:bg-gray-100" title="Grille">
            <Grid className="w-4 h-4" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100" title="Règles">
            <Ruler className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Effects Panel */}
      {activePanel === 'effects' && selectedElements.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-medium text-gray-700">Effets visuels</h3>
            
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600">Ombre portée</label>
              <button className="p-1 rounded hover:bg-gray-200">
                <Wand2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600">Flou</label>
              <input 
                type="range" 
                min="0" 
                max="20" 
                className="w-20" 
                title="Intensité du flou"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600">Transparence</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="100"
                className="w-20" 
                title="Opacité"
              />
            </div>
            
            {isTextElement && (
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-600">Contour</label>
                <input
                  type="color"
                  className="w-6 h-6 rounded border-none cursor-pointer"
                  title="Couleur du contour"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProToolbar;