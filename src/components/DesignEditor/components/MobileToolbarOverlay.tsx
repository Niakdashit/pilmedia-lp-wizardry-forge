import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Sparkles, Move3D, Palette } from 'lucide-react';

interface MobileToolbarOverlayProps {
  selectedElement: any;
  onElementUpdate: (updates: any) => void;
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
  onShowPositionPanel?: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  zoom: number;
}

const MobileToolbarOverlay: React.FC<MobileToolbarOverlayProps> = ({
  selectedElement,
  onElementUpdate,
  onShowEffectsPanel,
  onShowAnimationsPanel,
  onShowPositionPanel,
  canvasRef,
  zoom
}) => {
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Calculer la position de la toolbar au-dessus de l'élément sélectionné
  useEffect(() => {
    if (selectedElement && canvasRef.current) {
      const elementDOM = canvasRef.current.querySelector(`[data-element-id="${selectedElement.id}"]`);
      if (elementDOM) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const elementRect = elementDOM.getBoundingClientRect();
        
        // Position relative au canvas
        const relativeX = (elementRect.left - canvasRect.left) / zoom;
        const relativeY = (elementRect.top - canvasRect.top) / zoom;
        
        // Centrer la toolbar au-dessus de l'élément
        const toolbarWidth = 280; // Largeur approximative de la toolbar
        const toolbarHeight = 50;
        
        let x = relativeX + (elementRect.width / zoom / 2) - (toolbarWidth / 2);
        let y = relativeY - toolbarHeight - 10; // 10px au-dessus
        
        // Ajustements pour rester dans les limites du canvas
        const canvasWidth = canvasRect.width / zoom;
        
        if (x < 10) x = 10;
        if (x + toolbarWidth > canvasWidth - 10) x = canvasWidth - toolbarWidth - 10;
        if (y < 10) y = relativeY + (elementRect.height / zoom) + 10; // En dessous si pas de place au-dessus
        
        setToolbarPosition({ x, y });
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [selectedElement, canvasRef, zoom]);

  // Masquer la toolbar si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        const elementDOM = canvasRef.current?.querySelector(`[data-element-id="${selectedElement?.id}"]`);
        if (elementDOM && !elementDOM.contains(event.target as Node)) {
          setIsVisible(false);
        }
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible, selectedElement, canvasRef]);

  if (!selectedElement || !isVisible) {
    return null;
  }

  const isTextElement = selectedElement.type === 'text';

  // Handlers pour les actions de formatage
  const handleBold = () => {
    const currentWeight = selectedElement.fontWeight || 'normal';
    onElementUpdate({
      fontWeight: currentWeight === 'bold' ? 'normal' : 'bold'
    });
  };

  const handleItalic = () => {
    const currentStyle = selectedElement.fontStyle || 'normal';
    onElementUpdate({
      fontStyle: currentStyle === 'italic' ? 'normal' : 'italic'
    });
  };

  const handleUnderline = () => {
    const currentDecoration = selectedElement.textDecoration || 'none';
    onElementUpdate({
      textDecoration: currentDecoration === 'underline' ? 'none' : 'underline'
    });
  };

  const handleAlignment = (align: 'left' | 'center' | 'right') => {
    onElementUpdate({ textAlign: align });
  };

  const handleFontSizeChange = (delta: number) => {
    const currentSize = parseInt(selectedElement.fontSize) || 16;
    const newSize = Math.max(8, Math.min(72, currentSize + delta));
    onElementUpdate({ fontSize: `${newSize}px` });
  };

  const handleColorChange = (color: string) => {
    onElementUpdate({ color });
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-2"
      style={{
        left: `${toolbarPosition.x}px`,
        top: `${toolbarPosition.y}px`,
        transform: `scale(${1 / zoom})`,
        transformOrigin: 'top left'
      }}
    >
      <div className="flex items-center gap-1">
        {isTextElement && (
          <>
            {/* Taille de police */}
            <div className="flex items-center bg-gray-800 rounded px-2 py-1">
              <button
                onClick={() => handleFontSizeChange(-2)}
                className="text-white hover:bg-gray-700 px-1 py-0.5 rounded text-sm"
              >
                −
              </button>
              <span className="text-white text-xs mx-2 min-w-[24px] text-center">
                {parseInt(selectedElement.fontSize) || 16}
              </span>
              <button
                onClick={() => handleFontSizeChange(2)}
                className="text-white hover:bg-gray-700 px-1 py-0.5 rounded text-sm"
              >
                +
              </button>
            </div>

            {/* Séparateur */}
            <div className="w-px h-6 bg-gray-600 mx-1"></div>

            {/* Formatage */}
            <button
              onClick={handleBold}
              className={`p-1.5 rounded transition-colors ${
                selectedElement.fontWeight === 'bold'
                  ? 'bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Gras"
            >
              <Bold size={16} />
            </button>

            <button
              onClick={handleItalic}
              className={`p-1.5 rounded transition-colors ${
                selectedElement.fontStyle === 'italic'
                  ? 'bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Italique"
            >
              <Italic size={16} />
            </button>

            <button
              onClick={handleUnderline}
              className={`p-1.5 rounded transition-colors ${
                selectedElement.textDecoration === 'underline'
                  ? 'bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Souligné"
            >
              <Underline size={16} />
            </button>

            {/* Séparateur */}
            <div className="w-px h-6 bg-gray-600 mx-1"></div>

            {/* Alignement */}
            <button
              onClick={() => handleAlignment('left')}
              className={`p-1.5 rounded transition-colors ${
                selectedElement.textAlign === 'left'
                  ? 'bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Aligner à gauche"
            >
              <AlignLeft size={16} />
            </button>

            <button
              onClick={() => handleAlignment('center')}
              className={`p-1.5 rounded transition-colors ${
                selectedElement.textAlign === 'center'
                  ? 'bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Centrer"
            >
              <AlignCenter size={16} />
            </button>

            <button
              onClick={() => handleAlignment('right')}
              className={`p-1.5 rounded transition-colors ${
                selectedElement.textAlign === 'right'
                  ? 'bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Aligner à droite"
            >
              <AlignRight size={16} />
            </button>

            {/* Séparateur */}
            <div className="w-px h-6 bg-gray-600 mx-1"></div>

            {/* Couleur de texte */}
            <div className="relative">
              <input
                type="color"
                value={selectedElement.color || '#000000'}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                title="Couleur du texte"
              />
              <Type size={12} className="absolute top-1 left-1 text-white pointer-events-none" />
            </div>

            {/* Séparateur */}
            <div className="w-px h-6 bg-gray-600 mx-1"></div>
          </>
        )}

        {/* Actions communes */}
        <button
          onClick={onShowEffectsPanel}
          className="p-1.5 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          title="Effets"
        >
          <Sparkles size={16} />
        </button>

        <button
          onClick={onShowAnimationsPanel}
          className="p-1.5 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          title="Animations"
        >
          <Palette size={16} />
        </button>

        <button
          onClick={onShowPositionPanel}
          className="p-1.5 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          title="Position"
        >
          <Move3D size={16} />
        </button>
      </div>

      {/* Indicateur de flèche pointant vers l'élément */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default MobileToolbarOverlay;
