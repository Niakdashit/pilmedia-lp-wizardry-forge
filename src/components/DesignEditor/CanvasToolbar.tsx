import React, { useState, useRef, useEffect } from 'react';
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
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = React.memo(({
  selectedElement,
  onElementUpdate,
  onShowEffectsPanel,
  onShowAnimationsPanel
}) => {
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const effectsPanelRef = useRef<HTMLDivElement>(null);

  // Fermer le panneau quand on clique ailleurs (comme sur Canva)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEffectsPanel && 
          toolbarRef.current && 
          effectsPanelRef.current &&
          !toolbarRef.current.contains(event.target as Node) &&
          !effectsPanelRef.current.contains(event.target as Node)) {
        setShowEffectsPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEffectsPanel]);

  if (!selectedElement || selectedElement.type !== 'text') {
    return null;
  }

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96];

  return (
    <div className="relative">
      <div ref={toolbarRef} className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-1 mb-4">
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

      <div className="h-6 w-px bg-gray-500 mx-3" />

      {/* Font Size */}
      <button 
        onClick={() => {
          const currentSize = selectedElement.fontSize || 16;
          const currentIndex = fontSizes.indexOf(currentSize);
          const newIndex = Math.max(0, currentIndex - 1);
          onElementUpdate({ fontSize: fontSizes[newIndex] });
        }}
        className="text-white hover:bg-gray-700 p-1.5 rounded transition-colors duration-150"
        title="Diminuer la taille de police"
      >
        −
      </button>
      <select 
        value={selectedElement.fontSize || 16}
        onChange={(e) => onElementUpdate({ fontSize: parseInt(e.target.value) })}
        className="bg-gray-700 text-white px-2 py-1 rounded text-sm border-none outline-none w-16 focus:bg-gray-600 transition-colors duration-150"
      >
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      <button 
        onClick={() => {
          const currentSize = selectedElement.fontSize || 16;
          const currentIndex = fontSizes.indexOf(currentSize);
          const newIndex = Math.min(fontSizes.length - 1, currentIndex + 1);
          onElementUpdate({ fontSize: fontSizes[newIndex] });
        }}
        className="text-white hover:bg-gray-700 p-1.5 rounded transition-colors duration-150"
        title="Augmenter la taille de police"
      >
        +
      </button>

      <div className="h-6 w-px bg-gray-500 mx-3" />

      {/* Text Color */}
      <div className="flex items-center space-x-2">
        <Type className="w-4 h-4" />
        <div className="relative">
          <input
            type="color"
            value={selectedElement.color || '#000000'}
            onChange={(e) => onElementUpdate({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-2 border-gray-500 hover:border-gray-400 transition-colors duration-150"
            title="Couleur du texte"
          />
          <div 
            className="absolute inset-0 rounded pointer-events-none border border-gray-400"
            style={{ backgroundColor: selectedElement.color || '#000000' }}
          />
        </div>
      </div>

      <div className="h-6 w-px bg-gray-500 mx-3" />

      {/* Text Formatting */}
      <button 
        onClick={() => onElementUpdate({ 
          fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
        })}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.fontWeight === 'bold' ? 'bg-blue-600 text-white' : ''
        }`}
        title="Gras (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ 
          fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
        })}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.fontStyle === 'italic' ? 'bg-blue-600 text-white' : ''
        }`}
        title="Italique (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ 
          textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
        })}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.textDecoration === 'underline' ? 'bg-blue-600 text-white' : ''
        }`}
        title="Souligné (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="h-6 w-px bg-gray-500 mx-3" />

      {/* Text Alignment */}
      <button 
        onClick={() => onElementUpdate({ textAlign: 'left' })}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.textAlign === 'left' || !selectedElement.textAlign ? 'bg-blue-600 text-white' : ''
        }`}
        title="Aligner à gauche"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ textAlign: 'center' })}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.textAlign === 'center' ? 'bg-blue-600 text-white' : ''
        }`}
        title="Centrer"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ textAlign: 'right' })}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.textAlign === 'right' ? 'bg-blue-600 text-white' : ''
        }`}
        title="Aligner à droite"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <div className="h-6 w-px bg-gray-500 mx-3" />

      {/* Advanced Tools */}
      <button 
        onClick={() => {
          if (onShowEffectsPanel) {
            onShowEffectsPanel();
          } else {
            // Fallback pour compatibilité
            setShowEffectsPanel(!showEffectsPanel);
          }
        }}
        className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-1"
        title="Effets de texte"
      >
        <Wand2 className="w-4 h-4" />
        <span className="text-sm">Effets</span>
      </button>
      
      <button 
        onClick={() => {
          if (onShowAnimationsPanel) {
            onShowAnimationsPanel();
          }
        }}
        className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-1"
        title="Animations de texte"
      >
        <Play className="w-4 h-4" />
        <span className="text-sm">Animer</span>
      </button>
      
      <button 
        className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-1"
        title="Position et transformation"
      >
        <Move3D className="w-4 h-4" />
        <span className="text-sm">Position</span>
      </button>

      </div>
      
      {/* Panneau flottant de fallback - Seulement si onShowEffectsPanel n'est pas disponible */}
      {!onShowEffectsPanel && showEffectsPanel && (
        <div 
          ref={effectsPanelRef}
          className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-80 max-h-96 overflow-y-auto animate-in slide-in-from-top-2 duration-200"
          style={{
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <TextEffectsPanel 
            onBack={() => setShowEffectsPanel(false)}
            selectedElement={selectedElement}
            onElementUpdate={(updates) => {
              onElementUpdate(updates);
            }}
          />
        </div>
      )}
    </div>
  );
});

CanvasToolbar.displayName = 'CanvasToolbar';

export default CanvasToolbar;