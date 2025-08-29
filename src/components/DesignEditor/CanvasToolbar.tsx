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
  onOpenElementsTab?: () => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = React.memo(({
  selectedElement,
  onElementUpdate,
  onShowEffectsPanel,
  onShowAnimationsPanel,
  onShowPositionPanel,
  onOpenElementsTab,
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
  
  // Fonction pour obtenir la vraie taille de police actuelle
  const getCurrentFontSize = () => {
    // Priorité : fontSize direct > style.fontSize > défaut 16
    const directFontSize = selectedElement.fontSize;
    const styleFontSize = selectedElement.style?.fontSize;
    
    // Convertir en nombre si c'est une string (ex: "16px" -> 16)
    let fontSize = directFontSize || styleFontSize || 16;
    if (typeof fontSize === 'string') {
      fontSize = parseInt(fontSize.replace('px', ''));
    }
    
    return Number(fontSize) || 16;
  };
  
  const currentFontSize = getCurrentFontSize();
  
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
    <div className="relative" data-canvas-ui="1">
      <div
        ref={toolbarRef}
        className="canvas-toolbar z-10 sticky top-0 bg-gray-800 text-white px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg flex items-center space-x-1 mb-2 sm:mb-3 md:mb-4 overflow-x-auto whitespace-nowrap"
        style={{ WebkitOverflowScrolling: 'touch' as const }}
      >
      {/* Font Family - Button to open Elements tab */}
      <button 
        onClick={() => {
          if (onOpenElementsTab) {
            onOpenElementsTab();
          }
        }}
        className="bg-gray-700 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm border-none outline-none min-w-[100px] sm:min-w-[120px] focus:bg-gray-600 transition-colors duration-150 hover:bg-gray-600 flex items-center justify-between whitespace-nowrap"
        title="Changer la police - Ouvre l'onglet Éléments"
      >
        <span className="truncate">{fontFamilies.find(f => f.value === (selectedElement.fontFamily || 'Open Sans'))?.label || 'Open Sans'}</span>
        <ChevronDown className="w-3 h-3 ml-2 flex-shrink-0" />
      </button>

      <div className="h-5 sm:h-6 w-px bg-gray-500 mx-2 sm:mx-3" />

      {/* Font Size */}
      <button 
        onClick={() => {
          const newSize = Math.max(8, currentFontSize - 2);
          onElementUpdate({ fontSize: newSize });
        }}
        className="text-white hover:bg-gray-700 p-1 rounded transition-colors duration-150 w-6 h-6 flex items-center justify-center text-xs sm:text-sm font-bold"
        title="Diminuer la taille"
      >
        −
      </button>
      <select 
        value={currentFontSize}
        onChange={(e) => onElementUpdate({ fontSize: parseInt(e.target.value) })}
        className="bg-gray-700 text-white px-2 py-1 rounded text-xs sm:text-sm border-none outline-none w-14 sm:w-16 focus:bg-gray-600 transition-colors duration-150"
      >
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      <button 
        onClick={() => {
          const newSize = Math.min(96, currentFontSize + 2);
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
        <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <div className="relative">
          <input
            type="color"
            value={selectedElement.color || '#000000'}
            onChange={(e) => onElementUpdate({ color: e.target.value })}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded cursor-pointer border-2 border-gray-500 hover:border-gray-400 transition-colors duration-150"
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
        className={`p-1 rounded sm:p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.fontWeight === 'bold' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''
        }`}
        title="Gras (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ 
          fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
        })}
        className={`p-1 rounded sm:p-1.5 hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.fontStyle === 'italic' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''
        }`}
        title="Italique (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      
      <button 
        onClick={() => onElementUpdate({ 
          textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
        })}
        className={`p-1 rounded sm:p-1.5 hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.textDecoration === 'underline' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''
        }`}
        title="Souligné (Ctrl+U)"
      >
        <Underline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      <div className="h-6 w-px bg-gray-500 mx-3" />

      {/* Text Alignment - Single Button with Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setShowAlignmentMenu(!showAlignmentMenu)}
          className="p-1 sm:p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          title={`Alignement: ${currentAlignmentOption.label}`}
        >
          <CurrentAlignIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                    currentAlignment === option.value ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">{option.label}</span>
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
        className="p-1 sm:p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-1"
        title="Effets de texte"
      >
        <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline text-sm">Effets</span>
      </button>
      
      <button 
        onClick={() => {
          if (onShowAnimationsPanel) {
            onShowAnimationsPanel();
          }
        }}
        className="p-1 sm:p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-1"
        title="Animations de texte"
      >
        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline text-sm">Animer</span>
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
        className="p-1 sm:p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-1"
        title="Position et transformation"
      >
        <Move3D className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline text-sm">Position</span>
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