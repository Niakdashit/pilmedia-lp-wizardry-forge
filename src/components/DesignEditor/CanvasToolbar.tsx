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
        className="canvas-toolbar z-10 sticky top-0 bg-[#2c2c2c] text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 mb-4 overflow-x-auto"
        style={{ WebkitOverflowScrolling: 'touch' as const }}
      >
        {/* Font Family Dropdown */}
        <button 
          onClick={() => {
            if (onOpenElementsTab) {
              onOpenElementsTab();
            }
          }}
          className="bg-[#3a3a3a] text-white px-3 py-1.5 rounded text-sm border-none outline-none min-w-[110px] focus:bg-[#454545] transition-colors hover:bg-[#454545] flex items-center justify-between"
          title="Changer la police"
        >
          <span className="truncate">{fontFamilies.find(f => f.value === (selectedElement.fontFamily || 'Arial'))?.label || 'Open Sans'}</span>
          <ChevronDown className="w-3 h-3 ml-2 flex-shrink-0" />
        </button>

        {/* Font Size Controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              const newSize = Math.max(8, currentFontSize - 2);
              onElementUpdate({ fontSize: newSize });
            }}
            className="text-white hover:bg-[#454545] px-2 py-1 rounded transition-colors text-sm font-bold"
            title="Diminuer la taille"
          >
            −
          </button>
          <select 
            value={currentFontSize}
            onChange={(e) => onElementUpdate({ fontSize: parseInt(e.target.value) })}
            className="bg-[#3a3a3a] text-white px-2 py-1 rounded text-sm border-none outline-none w-14 focus:bg-[#454545] transition-colors"
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
            className="text-white hover:bg-[#454545] px-2 py-1 rounded transition-colors text-sm font-bold"
            title="Augmenter la taille"
          >
            +
          </button>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-[#555]" />

        {/* Text Formatting Buttons */}
        <button 
          onClick={() => onElementUpdate({ 
            fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
          })}
          className={`px-2 py-1.5 rounded transition-colors ${
            selectedElement.fontWeight === 'bold' 
              ? 'bg-[#6366f1] text-white' 
              : 'text-white hover:bg-[#454545]'
          }`}
          title="Gras (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button 
          onClick={() => onElementUpdate({ 
            fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
          })}
          className={`px-2 py-1.5 rounded transition-colors ${
            selectedElement.fontStyle === 'italic' 
              ? 'bg-[#6366f1] text-white' 
              : 'text-white hover:bg-[#454545]'
          }`}
          title="Italique (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <button 
          onClick={() => onElementUpdate({ 
            textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
          })}
          className={`px-2 py-1.5 rounded transition-colors ${
            selectedElement.textDecoration === 'underline' 
              ? 'bg-[#6366f1] text-white' 
              : 'text-white hover:bg-[#454545]'
          }`}
          title="Souligné (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>

        {/* Text Alignment Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowAlignmentMenu(!showAlignmentMenu)}
            className="px-2 py-1.5 rounded hover:bg-[#454545] transition-colors flex items-center gap-1 text-white"
            title={`Alignement: ${currentAlignmentOption.label}`}
          >
            <CurrentAlignIcon className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {showAlignmentMenu && (
            <div 
              ref={alignmentMenuRef}
              className="absolute top-full left-0 mt-1 bg-[#3a3a3a] border border-[#555] rounded-lg shadow-xl z-50 min-w-[120px]"
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
                    className={`w-full px-3 py-2 text-left hover:bg-[#454545] transition-colors flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${
                      currentAlignment === option.value ? 'bg-[#6366f1] text-white' : 'text-gray-200'
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

        {/* Separator */}
        <div className="h-6 w-px bg-[#555]" />

        {/* Advanced Tools */}
        <button 
          onClick={() => {
            if (onShowEffectsPanel) {
              onShowEffectsPanel();
            } else {
              setShowEffectsPanel(!showEffectsPanel);
            }
          }}
          className="px-3 py-1.5 rounded hover:bg-[#454545] transition-colors flex items-center gap-1 text-white"
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
          className="px-3 py-1.5 rounded hover:bg-[#454545] transition-colors flex items-center gap-1 text-white"
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
              setShowPositionPanel(!showPositionPanel);
            }
          }}
          className="px-3 py-1.5 rounded hover:bg-[#454545] transition-colors flex items-center gap-1 text-white"
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