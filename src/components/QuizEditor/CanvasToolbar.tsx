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
  Type
} from 'lucide-react';

interface CanvasToolbarProps {
  selectedElement: any;
  onElementUpdate: (updates: any) => void;
  onShowDesignPanel?: (context?: 'fill' | 'border' | 'text') => void;
  onOpenElementsTab?: () => void;
  onEffectsPanelChange?: (show: boolean) => void;
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
  onShowPositionPanel?: () => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = React.memo(({
  selectedElement,
  onElementUpdate,
  onShowDesignPanel,
  onOpenElementsTab,
  canvasRef
}) => {
  const [showBorderModal, setShowBorderModal] = useState(false);
  const [showBorderRadiusDropdown, setShowBorderRadiusDropdown] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const borderRadiusRef = useRef<HTMLDivElement>(null);
  const borderModalRef = useRef<HTMLDivElement>(null);

  // Helper to broadcast UI selection hide/show while adjusting values
  const dispatchAdjustingSelection = (hide: boolean, reason: 'borderRadius' | 'border' | 'generic' = 'generic') => {
    const evt = new CustomEvent('uiAdjustingSelection', {
      detail: { hide, reason }
    });
    document.dispatchEvent(evt);
  };

  // Send inline format event to the active text editor; fallback to element-level if nothing handles it
  const applyInlineOrElement = (action: 'bold' | 'italic' | 'underline', elementToggle: () => void) => {
    try {
      const maybeModuleId = typeof selectedElement?.id === 'string' && selectedElement.id.startsWith('modular-text-')
        ? selectedElement.id.replace('modular-text-', '')
        : null;
      const moduleContainer = maybeModuleId
        ? (document.querySelector(`[data-module-id="${maybeModuleId}"][data-module-role="body"]`) as HTMLElement | null)
        : null;
      const container = moduleContainer || (document.querySelector(`[data-element-id="${selectedElement?.id}"] [data-element-type="text"]`) as HTMLElement | null);
      const sel = window.getSelection();
      if (container && sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (container.contains(range.commonAncestorContainer)) {
          // Ensure editor keeps focus and use execCommand to toggle formatting
          container.focus();
          document.execCommand(action);
          const html = container.innerHTML;
          onElementUpdate({ richHtml: html, content: container.textContent || selectedElement.content || '' });
          return;
        }
      }
    } catch {}
    elementToggle();
  };

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideToolbar = !!toolbarRef.current?.contains(target);
      const insideBorderRadius = !!borderRadiusRef.current?.contains(target);
      const insideBorderModal = !!borderModalRef.current?.contains(target);

      const clickedInsideAny = insideToolbar || insideBorderRadius || insideBorderModal;

      if (!clickedInsideAny) {
        setShowBorderRadiusDropdown(false);
        setShowBorderModal(false);
        // Always restore selection visibility when dropdowns close due to outside click
        dispatchAdjustingSelection(false, 'borderRadius');
        dispatchAdjustingSelection(false, 'border');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedElement || (selectedElement.type !== 'text' && selectedElement.type !== 'shape')) {
    return null;
  }

  // Même interface pour texte et formes
  const isShape = selectedElement.type === 'shape';

  // Barre d'outils pour le texte
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
    
    return fontSize;
  };

  const handleFontSizeChange = (newSize: number) => {
    onElementUpdate({ 
      fontSize: newSize,
      style: {
        ...selectedElement.style,
        fontSize: `${newSize}px`
      }
    });
  };

  const increaseFontSize = () => {
    const currentSize = getCurrentFontSize();
    const currentIndex = fontSizes.indexOf(currentSize);
    if (currentIndex < fontSizes.length - 1) {
      handleFontSizeChange(fontSizes[currentIndex + 1]);
    } else if (currentSize < 200) {
      // Si on dépasse les tailles prédéfinies, augmenter de 4
      handleFontSizeChange(currentSize + 4);
    }
  };

  const decreaseFontSize = () => {
    const currentSize = getCurrentFontSize();
    const currentIndex = fontSizes.indexOf(currentSize);
    if (currentIndex > 0) {
      handleFontSizeChange(fontSizes[currentIndex - 1]);
    } else if (currentSize > 8) {
      // Si on est en dessous des tailles prédéfinies, diminuer de 4
      handleFontSizeChange(Math.max(8, currentSize - 4));
    }
  };

  const fontFamilies = [
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Canva Sans', label: 'Canva Sans' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' }
  ];

  const alignmentOptions = [
    { value: 'left', label: 'Gauche', icon: AlignLeft },
    { value: 'center', label: 'Centre', icon: AlignCenter },
    { value: 'right', label: 'Droite', icon: AlignRight },
    { value: 'justify', label: 'Justifié', icon: AlignJustify }
  ];

  const currentAlignment = selectedElement.textAlign || 'left';
  const currentAlignmentOption = alignmentOptions.find(opt => opt.value === currentAlignment) || alignmentOptions[0];
  const CurrentAlignIcon = currentAlignmentOption.icon;

  // Cycle alignment on each click: left -> center -> right -> justify -> left
  const cycleAlignment = () => {
    if (isShape) return; // not applicable for shapes
    const order = ['left', 'center', 'right', 'justify'] as const;
    const idx = order.indexOf((currentAlignment as any) ?? 'left');
    const next = order[(idx + 1) % order.length];
    // Update selected element alignment (text element in canvas)
    onElementUpdate({ 
      textAlign: next,
      style: {
        ...selectedElement?.style,
        textAlign: next
      }
    });
    // Also broadcast to the quiz module so question/options align immediately
    try {
      const evt = new CustomEvent('quizStyleUpdate', {
        detail: {
          questionTextAlign: next,
          optionsTextAlign: next
        }
      } as any);
      window.dispatchEvent(evt);
    } catch {}
  };


  return (
    <div className="relative" data-canvas-ui="1">
      <div
        ref={toolbarRef}
        className="canvas-toolbar z-10 sticky top-0 bg-gray-800 text-white px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg flex items-center space-x-1 mb-2 sm:mb-3 md:mb-4 overflow-x-auto whitespace-nowrap"
        style={{ WebkitOverflowScrolling: 'touch' as const }}
      >
      {/* Shape Controls - Only for shapes */}
      {isShape && (
        <>
          {/* Fill Color Button - Circle */}
          <button 
            onClick={() => onShowDesignPanel && onShowDesignPanel('fill')}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center justify-center"
            title="Couleur de remplissage - Ouvre l'onglet Design"
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ 
                backgroundColor: selectedElement.backgroundColor || selectedElement.style?.backgroundColor || '#3B82F6'
              }}
            />
          </button>

          {/* Border Color Button - Only when a border is active */}
          {(() => {
            const bw = parseInt((selectedElement.borderWidth || selectedElement.style?.borderWidth || '0').toString().replace('px', '')) || 0;
            const hasBorder = bw > 0 && selectedElement.borderStyle && selectedElement.borderStyle !== 'none';
            if (!hasBorder) return null;
            const currentBorderColor = selectedElement.borderColor || '#000000';
            return (
              <div className="relative">
                <button 
                  onClick={() => onShowDesignPanel && onShowDesignPanel('border')}
                  className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center justify-center"
                  title="Couleur du contour - Ouvre l'onglet Design"
                >
                  {/* Ring preview using SVG */}
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                    <circle cx="8" cy="8" r="5" fill="none" stroke={currentBorderColor} strokeWidth="3" />
                  </svg>
                </button>
              </div>
            );
          })()}

          {/* Border/Stroke Button - Lines with different thickness */}
          <button 
            onClick={() => {
              setShowBorderRadiusDropdown(false);
              const next = !showBorderModal;
              setShowBorderModal(next);
              if (!next) {
                // Restoring selection if closing explicitly
                dispatchAdjustingSelection(false, 'border');
              }
            }}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center justify-center"
            title="Contours"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3.5" width="12" height="0.8" fill="currentColor"/>
              <rect x="2" y="7" width="12" height="1.8" fill="currentColor"/>
              <rect x="2" y="11" width="12" height="2.5" fill="currentColor"/>
            </svg>
          </button>

          {/* Border Radius Button - Corner with connected dot */}
          <button 
            onClick={() => {
              setShowBorderModal(false);
              const next = !showBorderRadiusDropdown;
              setShowBorderRadiusDropdown(next);
              // When explicitly closing, ensure selection is shown again
              if (!next) dispatchAdjustingSelection(false, 'borderRadius');
            }}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center justify-center"
            title="Arrondir les angles"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13V8C3 5.23858 5.23858 3 8 3H13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <line x1="11" y1="5" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="13" cy="3" r="1.5" fill="currentColor"/>
            </svg>
          </button>

          <div className="h-5 sm:h-6 w-px bg-gray-500 mx-2 sm:mx-3" />
        </>
      )}

      {/* Font Family Selector */}
      <button 
        onClick={() => onShowDesignPanel && onShowDesignPanel()}
        className="bg-gray-700 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm border-none outline-none min-w-[100px] sm:min-w-[120px] focus:bg-gray-600 transition-colors duration-150 hover:bg-gray-600 flex items-center justify-between whitespace-nowrap"
        title="Changer la police - Ouvre l'onglet Éléments"
      >
        <span className="truncate">
          {fontFamilies.find(f => f.value === (selectedElement.fontFamily || 'Open Sans'))?.label || 'Open Sans'}
        </span>
        <ChevronDown className="w-3 h-3 ml-2 flex-shrink-0" />
      </button>

      <div className="h-5 sm:h-6 w-px bg-gray-500 mx-2 sm:mx-3" />

      {/* Font Size */}
      <button 
        onClick={() => decreaseFontSize()}
        className="text-white hover:bg-gray-700 p-1 rounded transition-colors duration-150 w-6 h-6 flex items-center justify-center text-xs sm:text-sm font-bold"
        title="Diminuer la taille"
      >
        −
      </button>
      
      <select 
        value={getCurrentFontSize()}
        onChange={(e) => handleFontSizeChange(Number(e.target.value))}
        className="bg-gray-700 text-white px-1 py-1 rounded text-xs sm:text-sm border-none outline-none min-w-[50px] focus:bg-gray-600 transition-colors duration-150 hover:bg-gray-600"
        title="Taille de police"
      >
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      
      <button 
        onClick={() => increaseFontSize()}
        className="text-white hover:bg-gray-700 p-1 rounded transition-colors duration-150 w-6 h-6 flex items-center justify-center text-xs sm:text-sm font-bold"
        title="Augmenter la taille"
      >
        +
      </button>

      <div className="h-6 w-px bg-gray-500 mx-3" />

      {/* Color - For shapes, this edits the inner text color (context 'text'); for text elements, edits text fill */}
      <button 
        onClick={() => {
          if (onShowDesignPanel) {
            onShowDesignPanel(isShape ? 'text' : 'fill');
          }
        }}
        className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-1 hover:bg-gray-700 rounded transition-colors duration-150"
        title={isShape ? "Couleur du texte dans la forme - Ouvre l'onglet Design" : "Couleur du texte - Ouvre l'onglet Design"}
      >
        <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <div 
          className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-400"
          style={{ 
            backgroundColor: isShape 
              ? (selectedElement.textColor || '#000000')
              : (selectedElement.color || '#000000')
          }}
        />
      </button>

      <div className="h-6 w-px bg-gray-500 mx-3" />

      {/* Text Formatting */}
      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => applyInlineOrElement('bold', () => onElementUpdate({ 
          fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
        }))}
        className={`p-1 rounded sm:p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.fontWeight === 'bold' ? 'bg-[#d4dbe8] text-white' : ''
        }`}
        title="Gras (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      
      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => applyInlineOrElement('italic', () => onElementUpdate({ 
          fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
        }))}
        className={`p-1 rounded sm:p-1.5 hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.fontStyle === 'italic' ? 'bg-[#d4dbe8] text-white' : ''
        }`}
        title="Italique (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      
      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => applyInlineOrElement('underline', () => onElementUpdate({ 
          textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
        }))}
        className={`p-1 rounded sm:p-1.5 hover:bg-gray-700 transition-colors duration-150 ${
          selectedElement.textDecoration === 'underline' ? 'bg-[#d4dbe8] text-white' : ''
        }`}
        title="Souligné (Ctrl+U)"
      >
        <Underline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      <div className="h-6 w-px bg-gray-500 mx-3" />

      {/* Text Alignment: click to cycle (left -> center -> right -> justify) */}
      <div className="relative">
        <button 
          onClick={cycleAlignment}
          className="p-1 sm:p-1.5 rounded hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-1 bg-[#d4dbe8] text-white"
          title={`Alignement: ${currentAlignmentOption.label} (cliquer pour changer)`}
          disabled={isShape}
          style={{ opacity: isShape ? 0.5 : 1 }}
        >
          <CurrentAlignIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      </div>
      
      {/* Border Radius Modal */}
      {isShape && showBorderRadiusDropdown && (
        <div ref={borderRadiusRef} className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-lg p-3 z-20 min-w-[240px]">
          <label className="block text-xs text-gray-300 mb-1.5">Arrondir les angles</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              value={parseInt(selectedElement.borderRadius?.replace('px', '') || '0')}
              onChange={(e) => onElementUpdate({ borderRadius: `${e.target.value}px` })}
              onMouseDown={() => dispatchAdjustingSelection(true, 'borderRadius')}
              onTouchStart={() => dispatchAdjustingSelection(true, 'borderRadius')}
              onMouseUp={() => dispatchAdjustingSelection(false, 'borderRadius')}
              onTouchEnd={() => dispatchAdjustingSelection(false, 'borderRadius')}
              className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="bg-gray-700 px-1.5 py-0.5 rounded text-xs min-w-[24px] text-center">
              {parseInt(selectedElement.borderRadius?.replace('px', '') || '0')}
            </div>
          </div>
        </div>
      )}

      {/* Border Modal */}
      {isShape && showBorderModal && (
        <div ref={borderModalRef} className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-lg p-3 z-20 min-w-[240px]">
          {/* Border Style Options */}
          <div className="flex space-x-1.5 mb-3">
            <button 
              onClick={() => {
                onElementUpdate({ borderStyle: 'none' });
                setShowBorderModal(false);
              }}
              className={`p-2 rounded hover:bg-gray-700 transition-colors duration-150 ${
                (!selectedElement.borderStyle || selectedElement.borderStyle === 'none') ? 'bg-purple-600' : 'bg-gray-700'
              }`}
              title="Aucun contour"
            >
              <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center relative">
                <div className="w-4 h-4 bg-gray-600 rounded" />
                <div className="absolute w-4 h-0.5 bg-red-500 rotate-45" />
              </div>
            </button>
            
            <button 
              onClick={() => {
                onElementUpdate({ borderStyle: 'solid', borderColor: selectedElement.borderColor || '#000000' });
              }}
              className={`p-2 rounded hover:bg-gray-700 transition-colors duration-150 ${
                selectedElement.borderStyle === 'solid' ? 'bg-purple-600' : 'bg-gray-700'
              }`}
              title="Contour continu"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-4 h-0.5 bg-white" />
              </div>
            </button>
            
            <button 
              onClick={() => {
                onElementUpdate({ borderStyle: 'dashed', borderColor: selectedElement.borderColor || '#000000' });
              }}
              className={`p-2 rounded hover:bg-gray-700 transition-colors duration-150 ${
                selectedElement.borderStyle === 'dashed' ? 'bg-purple-600' : 'bg-gray-700'
              }`}
              title="Contour tirets"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-0.5 bg-white" />
                  <div className="w-1 h-0.5 bg-white" />
                  <div className="w-1 h-0.5 bg-white" />
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => {
                onElementUpdate({ borderStyle: 'dotted', borderColor: selectedElement.borderColor || '#000000' });
              }}
              className={`p-2 rounded hover:bg-gray-700 transition-colors duration-150 ${
                selectedElement.borderStyle === 'dotted' ? 'bg-purple-600' : 'bg-gray-700'
              }`}
              title="Contour pointillés"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="flex space-x-0.5">
                  <div className="w-0.5 h-0.5 bg-white rounded-full" />
                  <div className="w-0.5 h-0.5 bg-white rounded-full" />
                  <div className="w-0.5 h-0.5 bg-white rounded-full" />
                  <div className="w-0.5 h-0.5 bg-white rounded-full" />
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => {
                onElementUpdate({ borderStyle: 'dotted', borderColor: selectedElement.borderColor || '#000000' });
              }}
              className={`p-2 rounded hover:bg-gray-700 transition-colors duration-150 ${
                selectedElement.borderStyle === 'dotted' ? 'bg-purple-600' : 'bg-gray-700'
              }`}
              title="Points fins"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="flex space-x-0.5">
                  <div className="w-0.5 h-0.5 bg-white rounded-full" />
                  <div className="w-0.5 h-0.5 bg-white rounded-full" />
                  <div className="w-0.5 h-0.5 bg-white rounded-full" />
                  <div className="w-0.5 h-0.5 bg-white rounded-full" />
                  <div className="w-0.5 h-0.5 bg-white rounded-full" />
                </div>
              </div>
            </button>
          </div>

          {/* Border Width Slider */}
          {selectedElement.borderStyle && selectedElement.borderStyle !== 'none' && (
            <div className="mb-3">
              <label className="block text-xs text-gray-300 mb-1.5">Épaisseur du trait</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={parseInt(selectedElement.borderWidth?.replace('px', '') || '2')}
                  onChange={(e) => onElementUpdate({ borderWidth: `${e.target.value}px` })}
                  onMouseDown={() => dispatchAdjustingSelection(true, 'border')}
                  onTouchStart={() => dispatchAdjustingSelection(true, 'border')}
                  onMouseUp={() => dispatchAdjustingSelection(false, 'border')}
                  onTouchEnd={() => dispatchAdjustingSelection(false, 'border')}
                  className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="bg-gray-700 px-1.5 py-0.5 rounded text-xs min-w-[24px] text-center">
                  {parseInt(selectedElement.borderWidth?.replace('px', '') || '2')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
});

CanvasToolbar.displayName = 'CanvasToolbar';

export default CanvasToolbar;