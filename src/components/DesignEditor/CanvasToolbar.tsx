import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  ChevronDown,
  Type,
  Wand2,
  Play,
  Move3D
} from 'lucide-react';
import TextEffectsPanel from './panels/TextEffectsPanel';
import PositionPanel from './panels/PositionPanel';

interface CanvasToolbarProps {
  selectedElement: any;
  onElementUpdate: (updates: any) => void;
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
  onShowPositionPanel?: () => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = React.memo(({
  selectedElement,
  onElementUpdate,
  onShowEffectsPanel,
  onShowAnimationsPanel,
  onShowPositionPanel,
  canvasRef
}) => {
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [showAlignmentMenu, setShowAlignmentMenu] = useState(false);
  const [showPositionPanel, setShowPositionPanel] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const effectsPanelRef = useRef<HTMLDivElement>(null);
  const alignmentMenuRef = useRef<HTMLDivElement>(null);

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
      // Fermer le menu d'alignement si on clique ailleurs
      if (alignmentMenuRef.current && !alignmentMenuRef.current.contains(event.target as Node)) {
        setShowAlignmentMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEffectsPanel]);

  if (!selectedElement || selectedElement.type !== 'text') {
    return null;
  }

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96];
  
  // Liste complète des polices disponibles
  const fontFamilies = [
    { value: 'Arial', label: 'Canva Sans' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Calibri', label: 'Calibri' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
    { value: 'Oswald', label: 'Oswald' },
    { value: 'Raleway', label: 'Raleway' },
    { value: 'Ubuntu', label: 'Ubuntu' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'PT Sans', label: 'PT Sans' },
    { value: 'Noto Sans', label: 'Noto Sans' }
  ];

  // Options d'alignement
  const alignmentOptions = [
    { value: 'left', label: 'Gauche', icon: AlignLeft },
    { value: 'center', label: 'Centre', icon: AlignCenter },
    { value: 'right', label: 'Droite', icon: AlignRight },
    { value: 'justify', label: 'Justifié', icon: AlignJustify }
  ];

  const currentAlignment = selectedElement.textAlign || 'left';
  const currentAlignmentOption = alignmentOptions.find(opt => opt.value === currentAlignment) || alignmentOptions[0];
  const CurrentAlignIcon = currentAlignmentOption.icon;

  return (
    <div className="relative">
      <div ref={toolbarRef} className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-1 mb-4">
      {/* Font Family */}
      <select 
        value={selectedElement.fontFamily || 'Arial'}
        onChange={(e) => onElementUpdate({ fontFamily: e.target.value })}
        className="bg-gray-700 text-white px-2 py-1 rounded text-sm border-none outline-none"
      >
        {fontFamilies.map(font => (
          <option key={font.value} value={font.value}>{font.label}</option>
        ))}
      </select>

      <div className="h-6 w-px bg-gray-500 mx-3" />

      {/* Font Size */}
      <button 
        onClick={() => {
          const currentSize = selectedElement.fontSize || selectedElement.style?.fontSize || 16;
          const newSize = Math.max(8, currentSize - 2);
          onElementUpdate({ fontSize: newSize });
        }}
        className="text-white hover:bg-gray-700 p-1 rounded transition-colors duration-150 w-6 h-6 flex items-center justify-center text-sm font-bold"
        title="Diminuer la taille"
      >
        −
      </button>
      <select 
        value={selectedElement.fontSize || selectedElement.style?.fontSize || 16}
        onChange={(e) => onElementUpdate({ fontSize: parseInt(e.target.value) })}
        className="bg-gray-700 text-white px-2 py-1 rounded text-sm border-none outline-none w-16 focus:bg-gray-600 transition-colors duration-150"
      >
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      <button 
        onClick={() => {
          const currentSize = selectedElement.fontSize || selectedElement.style?.fontSize || 16;
          const newSize = Math.min(96, currentSize + 2);
          onElementUpdate({ fontSize: newSize });
        }}
        className="text-white hover:bg-gray-700 p-1 rounded transition-colors duration-150 w-6 h-6 flex items-center justify-center text-sm font-bold"
        title="Augmenter la taille"
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

      {/* Text Alignment - Single Button with Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setShowAlignmentMenu(!showAlignmentMenu)}
          className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-1 bg-blue-600 text-white"
          title={`Alignement: ${currentAlignmentOption.label}`}
        >
          <CurrentAlignIcon className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </button>
        
        {showAlignmentMenu && (
          <div 
            ref={alignmentMenuRef}
            className="absolute top-full left-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[120px] animate-in slide-in-from-top-2 duration-200"
          >
            {alignmentOptions.map(option => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onElementUpdate({ textAlign: option.value });
                    setShowAlignmentMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-600 transition-colors duration-150 flex items-center space-x-2 first:rounded-t-lg last:rounded-b-lg ${
                    currentAlignment === option.value ? 'bg-blue-600 text-white' : 'text-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

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
        onClick={() => {
          if (onShowPositionPanel) {
            onShowPositionPanel();
          } else {
            // Fallback pour compatibilité
            setShowPositionPanel(!showPositionPanel);
          }
        }}
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
      
      {/* Panneau de position - Fallback pour compatibilité */}
      {!onShowPositionPanel && showPositionPanel && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-80 max-h-96 overflow-y-auto animate-in slide-in-from-top-2 duration-200"
          style={{
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <PositionPanel 
            onBack={() => setShowPositionPanel(false)}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
            canvasRef={canvasRef}
          />
        </div>
      )}
    </div>
  );
});

CanvasToolbar.displayName = 'CanvasToolbar';

export default CanvasToolbar;